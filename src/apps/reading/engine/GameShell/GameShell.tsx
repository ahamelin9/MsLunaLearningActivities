import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { GradeLevel } from '@/types/reading';
import type { PartWay, UserProgress } from '@/types/user';
import type { AnyGameDef, GameApi, GameContext } from '../types';
import type { Difficulty } from '../content';
import { lunaSay, moonSay, type LunaMood, type Milestone } from '../luna';
import { lessonStates } from '../lessons';
import { gameMilestones, lessonMilestones, milestoneId } from '../milestones';
import { SHELF_LINES, SIGNATURE_KIND, SQUISHY_KINDS, kindsFound, nextSquishy, type SquishyAward } from '../squishies';
import { starsFor, starsWithTime, type TimeStar } from '../stars';
import { estimateMinutes } from '../times';
import { soundManager } from '@/utils/audio';
import { pronunciation, type SpeechPart } from '@/utils/pronunciation';
import { warmGameIntro } from '../warmup';
import { storageService } from '@/utils/storage';
import { Chip, ChunkyButton, Flower, Luna, Petals, SpeechBubble } from '@/components/kit';
import { AppHeader } from '@/components/os/AppHeader/AppHeader';
import { GAME_TINTS, GamePicture } from '../../games/shared/GamePicture/GamePicture';
import { DoneScreen, type LessonPath } from '../DoneScreen/DoneScreen';
import { cx } from '@/utils/cx';
import styles from './GameShell.module.scss';

type Phase = 'intro' | 'play' | 'reward';

interface GameShellProps {
  game: AnyGameDef;
  grade: GradeLevel;
  progress: UserProgress;
  onExit: () => void;
  /** the done screen's second button; left out, the button is not shown */
  onPlayAnother?: () => void;
  /** what that button says: "Another game", or "Next lesson" */
  playAnotherLabel?: string;
  /** Luna's Pick skips the start screen and drops straight into play. */
  autoStart?: boolean;
  startDifficulty?: Difficulty;
  /** a lesson's place on the path: its start screen shows the number */
  lessonNumber?: number;
  /** a lesson's grade's lessons, in order: its done screen shows the bar moving on */
  lessons?: AnyGameDef[];
  /**
   * The lesson up next, left part-way (PRG-8): its first start picks up after
   * the rounds already won, and its time so far counts on (PRG-11); "Again"
   * and "Play again" start from round 1
   */
  resume?: PartWay;
  /** the done screen's "See my shelf" (PRG-5a) */
  onSeeShelf?: () => void;
}

/**
 * How long an answer may take to be said before the shell reacts anyway
 * (FB-1): a miss's line is short; a right answer's read-back can be a sentence.
 */
const ANSWER_WATCHDOG_WRONG_MS = 2500;
const ANSWER_WATCHDOG_RIGHT_MS = 7000;

/** How tricky a game is, picked on its start screen: the words a child reads. */
const DIFFICULTY_LABELS: { value: Difficulty; label: string }[] = [
  { value: 1, label: 'Warm up' },
  { value: 2, label: 'Just right' },
  { value: 3, label: 'Tricky' }
];

/**
 * The squishy a finished play puts on the shelf (PRG-5a): its signature kind
 * first, the colour by the odds. One already on the shelf brings nothing new.
 */
function newSquishy(owned: string[], signature: string): SquishyAward | null {
  const squishy = nextSquishy(owned, SIGNATURE_KIND[signature]);
  return owned.includes(squishy.id) ? null : squishy;
}

/**
 * What Luna says after her closing line on the done screen: a new squishy's
 * line, and when it fills the shelf, the secret trophy (PRG-4). Each is its
 * own pre-rendered part.
 */
const closingParts = (award: { squishy: SquishyAward | null; fullShelf: boolean }): SpeechPart[] => [
  ...(award.squishy ? [{ text: award.squishy.line }] : []),
  ...(award.fullShelf ? [{ text: SHELF_LINES.full }] : [])
];

/**
 * The frame every game and lesson plays in (DES-22a), as on the round 2 Round
 * board: the stage, a card with two soft blobs in the game's picture tint, and
 * Luna's perch under it, where she says her line in a SpeechBubble. The start
 * screen uses the same frame: the game's picture, how tricky, and the big
 * button on the stage, while Luna says the mission from her perch. The done
 * screen is its own (DoneScreen).
 */
export const GameShell: React.FC<GameShellProps> = ({
  game,
  grade,
  progress,
  onExit,
  onPlayAnother,
  playAnotherLabel = 'Another game',
  autoStart = false,
  startDifficulty = 2,
  lessonNumber,
  lessons,
  resume,
  onSeeShelf
}) => {
  const [phase, setPhase] = useState<Phase>(autoStart ? 'play' : 'intro');
  const [difficulty, setDifficulty] = useState<Difficulty>(startDifficulty);
  const [roundIndex, setRoundIndex] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [hintLevel, setHintLevel] = useState<0 | 1 | 2>(0);
  const [hint, setHint] = useState<SpeechPart[] | null>(null);
  const [roundsWon, setRoundsWon] = useState(0);
  // the lessons done as this play began, to see what finishing it opened (DES-22d)
  const [doneBefore, setDoneBefore] = useState<string[]>(() => progress.completedLessons);
  const [flash, setFlash] = useState<'win' | 'miss' | null>(null);
  const [bubble, setBubble] = useState<string>(game.mission);
  const [mood, setMood] = useState<LunaMood>('happy');
  const [winStreak, setWinStreak] = useState(0);
  // counts this play's wins, so each one drops a fresh fall of petals that
  // keeps falling into the next round (DES-11)
  const [petalFalls, setPetalFalls] = useState(0);

  const [rounds, setRounds] = useState<unknown[]>(() =>
    game.makeRounds({ grade, difficulty: startDifficulty, count: game.roundsPerPlay })
  );

  const timers = useRef<number[]>([]);
  const [award, setAward] = useState<{
    squishy: SquishyAward | null;
    /** this play's squishy put the last kind on the shelf (PRG-4) */
    fullShelf: boolean;
    stars: number;
    /** what time did to the stars (PRG-10) */
    timeStar: TimeStar;
    firstTry: number;
    /** how long it took, on screen (PRG-6), and "about N min" from before this play */
    seconds: number;
    estimate: number;
  } | null>(null);

  // the time a play takes, counted only while the app is on screen (PRG-6):
  // it pauses while the tab is hidden or the iPad sleeps
  const clock = useRef<{ total: number; since: number | null }>({ total: 0, since: null });
  useEffect(() => {
    if (phase !== 'play') return;
    clock.current = { total: 0, since: document.hidden ? null : Date.now() };
    const onVisibility = () => {
      const c = clock.current;
      if (document.hidden && c.since !== null) {
        c.total += Date.now() - c.since;
        c.since = null;
      } else if (!document.hidden && c.since === null) {
        c.since = Date.now();
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [phase]);
  /** the seconds on screen in this play so far */
  const playSeconds = () => {
    const c = clock.current;
    return Math.round((c.total + (c.since !== null ? Date.now() - c.since : 0)) / 1000);
  };
  // a lesson picked up part-way brings its time so far, and the minutes of it
  // Today already has (PRG-11); a fresh play brings none
  const carried = useRef({ seconds: 0, counted: 0 });
  // a big milestone's visit on the done screen: the moon's line (DES-17)
  const [moon, setMoon] = useState<string | null>(null);
  const wonRef = useRef(0);
  const cleanRef = useRef(0);
  // this round has had an answer (BUG-28): its opening question then stays quiet
  const answeredRef = useRef(false);
  // stable, so a game's opening effect can depend on it without re-running
  const answered = useCallback(() => answeredRef.current, []);
  // a part-way lesson's place, used by its first start only (PRG-8)
  const resumeRef = useRef(
    game.lesson && resume && resume.won > 0 && resume.won < game.roundsPerPlay ? resume : undefined
  );
  const recorded = useRef(false);

  const later = useCallback((fn: () => void, ms: number) => {
    const id = window.setTimeout(fn, ms);
    timers.current.push(id);
  }, []);

  useEffect(
    () => () => {
      timers.current.forEach(id => window.clearTimeout(id));
      soundManager.stopSpeaking();
    },
    []
  );

  /**
   * Luna's line in the bubble, spoken. `then` follows it aloud without
   * joining the bubble: a hint, or a new squishy's line. Speaking it as its own
   * part also means it plays a clip that exists, where the two glued into one
   * string would be a sentence nobody rendered. Her beak follows the clips by
   * itself (the kit's Luna, DES-15).
   */
  const speak = useCallback((text: string, nextMood: LunaMood = 'happy', then: SpeechPart[] = []) => {
    setBubble(text);
    setMood(nextMood);
    const line = text.replace(/[…]/g, '...');
    if (then.length) pronunciation.speakSequence([{ text: line }, ...then]);
    else soundManager.speak(line);
  }, []);

  // The start screen is the moment to prepare what this game will say.
  useEffect(() => {
    warmGameIntro(game.mission);
  }, [game.mission]);

  // Luna says the mission on the start screen, where it is written. Said as
  // play began, it was cut off a moment later by the first round's own cue.
  useEffect(() => {
    if (phase !== 'intro') return;
    const id = window.setTimeout(() => speak(game.mission, 'happy'), 320);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const startPlay = (level: Difficulty) => {
    soundManager.playPop();
    setDifficulty(level);
    setRounds(game.makeRounds({ grade, difficulty: level, count: game.roundsPerPlay }));
    answeredRef.current = false;
    // a lesson left part-way picks up where it was, once (PRG-8)
    const from = resumeRef.current;
    resumeRef.current = undefined;
    setRoundIndex(from?.won ?? 0);
    setAttempts(0);
    setHintLevel(0);
    setHint(null);
    setRoundsWon(from?.won ?? 0);
    setDoneBefore(progress.completedLessons);
    setWinStreak(0);
    setPetalFalls(0);
    wonRef.current = from?.won ?? 0;
    cleanRef.current = from?.clean ?? 0;
    carried.current = { seconds: from?.seconds ?? 0, counted: from?.counted ?? 0 };
    recorded.current = false;
    setAward(null);
    setMoon(null);
    // a fresh play, timed from here (also "Again" mid-play)
    clock.current = { total: 0, since: document.hidden ? null : Date.now() };
    setPhase('play');
  };

  const goToNextRound = useCallback(() => {
    setFlash(null);
    setAttempts(0);
    setHintLevel(0);
    setHint(null);

    if (roundIndex + 1 >= game.roundsPerPlay) {
      // Work the reward out here, while the counters are settled, rather
      // than during a render pass.
      const c = clock.current;
      const ms = c.total + (c.since !== null ? Date.now() - c.since : 0);
      clock.current = { total: ms, since: null };
      // the whole lesson, with any time from before it was left (PRG-11)
      const seconds = carried.current.seconds + Math.round(ms / 1000);
      const estimate = estimateMinutes(game, progress.times?.[game.id]);
      // 1–3 by how it went, the same rule for games and lessons (PRG-1), then
      // moved a little by the time it took (PRG-10)
      const { stars, time } = starsWithTime(starsFor(cleanRef.current, game.roundsPerPlay), seconds, estimate);
      const squishy = newSquishy(progress.stickers, game.sticker);
      const all = SQUISHY_KINDS.length;
      setAward({
        seconds,
        estimate,
        squishy,
        fullShelf: Boolean(squishy) && kindsFound(progress.stickers) < all && kindsFound([...progress.stickers, squishy!.id]) === all,
        stars,
        timeStar: time,
        firstTry: cleanRef.current
      });
      setPhase('reward');
    } else {
      // the lesson up next remembers how far it got (PRG-8); a game, or a
      // lesson already done, starts from round 1 every time
      if (game.lesson && !progress.completedLessons.includes(game.lesson.id)) {
        storageService.setPartway(game.lesson.id, wonRef.current, cleanRef.current, carried.current);
      }
      answeredRef.current = false;
      setRoundIndex(roundIndex + 1);
    }
  }, [game, progress.completedLessons, progress.stickers, progress.times, roundIndex]);

  // the words Luna's line must not have (BUG-27): a round's heard-only word
  const hiddenAt = useCallback(
    (i: number): string[] => {
      const word = i < rounds.length ? game.hiddenWord?.(rounds[i]) : undefined;
      return word ? [word] : [];
    },
    [game, rounds]
  );

  const handleWin = useCallback(
    (opts?: { lunaLine?: string; delay?: number }) => {
      setFlash('win');
      setPetalFalls(n => n + 1);
      soundManager.playCorrect();
      wonRef.current += 1;
      setRoundsWon(wonRef.current);
      if (attempts === 0) cleanRef.current += 1;

      const streakNow = winStreak + 1;
      setWinStreak(streakNow);

      // her line stays on the perch into the next round: never its word
      const avoid = hiddenAt(roundIndex + 1);
      const line =
        opts?.lunaLine ??
        (streakNow >= 3 && Math.random() < 0.5
          ? lunaSay('streak', game.id, avoid).text
          : lunaSay('correct', game.id, avoid).text);
      speak(line, 'cheer');

      later(goToNextRound, opts?.delay ?? 1750);
    },
    [attempts, game.id, goToNextRound, hiddenAt, later, roundIndex, speak, winStreak]
  );

  const handleMiss = useCallback(
    (opts?: { lunaLine?: string; hint?: SpeechPart[]; reveal?: () => void }) => {
      const attemptNumber = attempts + 1;
      setAttempts(attemptNumber);
      setWinStreak(0);
      setFlash('miss');
      soundManager.playTryAgain();
      later(() => setFlash(null), 500);

      const nextHintLevel: 0 | 1 | 2 = attemptNumber >= 3 ? 2 : attemptNumber >= 2 ? 1 : 0;
      setHintLevel(nextHintLevel);
      // From the second miss Luna says the hint after her line. It is never
      // written out: a child who knows their letters would read the answer
      // straight off it.
      const spokenHint = nextHintLevel > 0 && opts?.hint?.length ? opts.hint : null;
      if (spokenHint) setHint(spokenHint);

      // "Show me" (FB-2): from the third miss the game points at the answer,
      // and Luna says so instead of another "try again"
      // the round is still unsolved: her line never has its word (BUG-27)
      const avoid = hiddenAt(roundIndex);
      if (nextHintLevel === 2 && opts?.reveal) {
        opts.reveal();
        speak(lunaSay('reveal', game.id, avoid).text, 'surprise', spokenHint ?? []);
        return;
      }

      const line =
        opts?.lunaLine ??
        (attemptNumber >= 2 ? lunaSay('missAgain', game.id, avoid).text : lunaSay('missFirst', game.id, avoid).text);
      speak(line, attemptNumber >= 2 ? 'think' : 'oops', spokenHint ?? []);
    },
    [attempts, game.id, hiddenAt, later, roundIndex, speak]
  );

  // An answer is being said (FB-1): input waits, and Luna with it.
  const [answering, setAnswering] = useState(false);
  // an answer is being said right now, before `answering` has re-rendered
  const saying = useRef(false);
  // set on every mount: StrictMode mounts twice in dev, running the cleanup between
  const alive = useRef(true);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  /**
   * The one answer path (FB-1): the game's own line first, whole, then the
   * shell's reaction. Speech that is cut short (the child taps Again while it
   * plays) never reports its end, so a watchdog settles the answer too: soon
   * for a miss, later for a right answer, whose read-back can run a few
   * seconds. Lessons' useAnswer goes through here as well.
   */
  const sayThen = useCallback((say: SpeechPart[] | undefined, watchdogMs: number, react: () => void) => {
    // a second answer in the same moment (a tap that is also a click) is
    // ignored: `api.locked` only reaches the game on its next render
    if (saying.current) return;
    if (!say?.length) {
      react();
      return;
    }
    saying.current = true;
    setAnswering(true);
    let settled = false;
    const settle = () => {
      if (settled || !alive.current) return;
      settled = true;
      saying.current = false;
      window.clearTimeout(watchdog);
      setAnswering(false);
      react();
    };
    const watchdog = window.setTimeout(settle, watchdogMs);
    timers.current.push(watchdog);
    pronunciation.speakSequence(say, { onEnd: settle });
  }, []);

  const handleAnswer = useCallback(
    (opts: {
      correct: boolean;
      say?: SpeechPart[];
      hint?: SpeechPart[];
      lunaLine?: string;
      delay?: number;
      reveal?: () => void;
    }) => {
      answeredRef.current = true;
      sayThen(opts.say, opts.correct ? ANSWER_WATCHDOG_RIGHT_MS : ANSWER_WATCHDOG_WRONG_MS, () =>
        opts.correct
          ? handleWin({ lunaLine: opts.lunaLine, delay: opts.delay })
          : handleMiss({ lunaLine: opts.lunaLine, hint: opts.hint, reveal: opts.reveal })
      );
    },
    [sayThen, handleWin, handleMiss]
  );

  // a small good beat; its `say` (the word found) is said whole first (FB-1)
  const handleTick = useCallback(
    (opts?: { lunaLine?: string; say?: SpeechPart[] }) => {
      answeredRef.current = true;
      soundManager.playLetterSnap();
      sayThen(opts?.say, ANSWER_WATCHDOG_WRONG_MS, () => {
        if (opts?.lunaLine) speak(opts.lunaLine, 'happy');
      });
    },
    [sayThen, speak]
  );

  const ctx: GameContext = useMemo(
    () => ({ grade, difficulty, roundIndex, totalRounds: game.roundsPerPlay }),
    [grade, difficulty, roundIndex, game.roundsPerPlay]
  );

  const api: GameApi = useMemo(
    () => ({
      ctx,
      attempts,
      hintLevel,
      locked: flash === 'win' || answering,
      answered,
      answer: handleAnswer,
      tick: handleTick,
      say: (text: string, m: LunaMood = 'happy') => speak(text, m)
    }),
    [ctx, attempts, hintLevel, flash, answering, answered, handleAnswer, handleTick, speak]
  );

  // The done screen's side effects: save progress, the fanfare, Luna's
  // closing line.
  useEffect(() => {
    if (phase !== 'reward' || !award || recorded.current) return;
    recorded.current = true;

    // Luna's closing line, and a new squishy's after it
    const closing = () => speak(lunaSay('finish', game.id).text, 'cheer', closingParts(award));

    // how long it took, and today's minutes with it (PRG-6), less those a
    // lesson left part-way already added (PRG-11)
    storageService.recordTime(game.id, award.seconds, carried.current.counted);

    let reached: Milestone[];
    if (game.lesson) {
      storageService.recordLessonCompletion(
        game.lesson.id,
        award.stars,
        game.lesson.skillId,
        award.squishy?.id ?? null
      );
      reached = lessons?.length
        ? lessonMilestones(lessons, doneBefore, storageService.getProgress().completedLessons, award.stars)
        : [];
    } else {
      storageService.recordGameCompletion({
        gameId: game.id,
        starsEarned: award.stars,
        squishyId: award.squishy?.id ?? null
      });
      reached = gameMilestones(award.stars);
    }
    // filling the shelf beats every other moment (PRG-4)
    if (award.fullShelf) reached.unshift('fullShelf');

    // the moon visits for the biggest moment this play reached that isn't
    // claimed yet (BUG-25); while she's here only she talks, and Luna says her
    // line once she's gone (DES-17)
    const visit = reached.find(m => {
      const once = milestoneId(m, grade, game.id);
      return once === null || storageService.claimOnce(once);
    });
    if (visit) {
      soundManager.playFanfare();
      const line = moonSay(visit);
      later(() => setMoon(line), 0);
      return;
    }

    soundManager.playFanfare();
    later(closing, 700);
  }, [phase, award, game.id, game.lesson, later, speak, lessons, doneBefore, grade]);

  // the one header (DES-8): back to the library and the game's name; in play,
  // the rounds and Again too, as on the round 2 Round and Done boards
  // back to the library: a lesson left mid-play still counts its minutes, and
  // the one up next keeps them with its rounds (PRG-11)
  const leave = () => {
    if (phase === 'play' && game.lesson) {
      const upNext = !progress.completedLessons.includes(game.lesson.id);
      storageService.leaveLesson(
        game.lesson.id,
        upNext ? { won: wonRef.current, clean: cleanRef.current } : null,
        carried.current.seconds + playSeconds(),
        carried.current.counted
      );
    }
    onExit();
  };

  const header = (inPlay = false, title = game.title) => (
    <AppHeader
      back="library"
      onBack={leave}
      title={title}
      rounds={inPlay ? { won: roundsWon, current: roundIndex + 1, total: game.roundsPerPlay } : undefined}
    >
      {inPlay && (
        <ChunkyButton
          icon="replay"
          onClick={() => {
            soundManager.playLetterTap();
            pronunciation.replayLast();
          }}
        >
          Again
        </ChunkyButton>
      )}
    </AppHeader>
  );

  // ---------- DONE ----------
  if (phase === 'reward') {
    // a finished lesson's path (DES-22d): its result is saved just after this
    // screen shows, so the bar moves on as it arrives, and the lesson that
    // opened is the one locked as this play began and open now
    let path: LessonPath | undefined;
    if (game.lesson && lessons?.length) {
      const before = lessonStates(lessons, doneBefore);
      const now = lessonStates(lessons, progress.completedLessons);
      const opened = now.findIndex((state, i) => state !== 'locked' && before[i] === 'locked');
      path = {
        done: now.filter(state => state === 'done').length,
        total: lessons.length,
        opened: opened >= 0 ? opened + 1 : undefined
      };
    }
    return (
      <>
        {/* as on the Done board: "Lesson 2 · Find A, M, S & B" */}
        {header(false, game.lesson && lessonNumber ? `Lesson ${lessonNumber} · ${game.title}` : game.title)}
        <DoneScreen
          game={game}
          award={award}
          path={path}
          onPlayAgain={() => startPlay(difficulty)}
          onPlayAnother={onPlayAnother}
          playAnotherLabel={playAnotherLabel}
          onSeeShelf={onSeeShelf}
          owned={progress.stickers}
          onLuna={() => {
            // while the moon visits, only she talks
            if (!moon) speak(bubble, 'cheer');
          }}
          moon={moon}
          onMoonGone={() => {
            setMoon(null);
            speak(lunaSay('finish', game.id).text, 'cheer', award ? closingParts(award) : []);
          }}
        />
      </>
    );
  }

  const inPlay = phase === 'play';
  // one Luna per screen (DES-12): a game with its own Luna on the stage gets
  // her line on the perch with no owl and no tail, and the line says itself
  // again. On the start screen she isn't on the stage yet, so she perches.
  const owlOnStage = inPlay && Boolean(game.ownLuna);
  const PlayComponent = game.Play;
  const round = rounds[roundIndex];

  return (
    <>
      {header(inPlay)}
      <div className={styles.shell} data-phase={phase} data-shot={inPlay ? 'shell-play' : 'shell-intro'}>
        {inPlay ? (
          <div
            className={styles.stage}
            data-tint={GAME_TINTS[game.shape]}
            data-shape={game.shape}
            data-flash={flash ?? undefined}
            data-shot="stage"
          >
            {flash === 'win' && (
              // the round is won: a little garden grows up both sides of the
              // stage, as on the Round board, behind the round's pieces so it
              // never covers an answer (DES-11). It leaves with the round.
              <span className={styles.garden} data-shot="win-garden" aria-hidden="true">
                <span className={styles.bed}>
                  <Flower kind="daisy" grow step={0} />
                  <Flower kind="rose-red" size="large" grow step={2} />
                  <Flower kind="daisy" size="small" grow step={4} />
                </span>
                <span className={styles.bed}>
                  <Flower kind="daisy" size="small" grow step={3} />
                  <Flower kind="rose-blush" size="large" grow step={1} />
                  <Flower kind="daisy" grow step={5} />
                </span>
              </span>
            )}

            <div className={styles.inside}>
              {round !== undefined && <PlayComponent key={roundIndex} round={round} api={api} />}
            </div>
          </div>
        ) : (
          // the start screen: no board, built from the kit (DES-22a)
          <div className={styles.stage} data-tint={GAME_TINTS[game.shape]}>
            <div className={cx(styles.inside, styles.start)}>
              <span className={styles.picture} aria-hidden="true">
                {game.lesson ? (
                  <span className={styles.lessonMark}>
                    <span className={styles.lessonWord}>Lesson</span>
                    <span className={styles.lessonNumber}>{lessonNumber}</span>
                  </span>
                ) : (
                  <GamePicture shape={game.shape} size="large" />
                )}
              </span>

              {/* a lesson's questions are fixed, so there is nothing to choose */}
              {!game.lesson && (
                <div className={styles.levels} role="group" aria-label="Choose how tricky">
                  {DIFFICULTY_LABELS.map(level => (
                    <ChunkyButton
                      key={level.value}
                      aria-pressed={difficulty === level.value}
                      onClick={() => {
                        soundManager.playLetterTap();
                        setDifficulty(level.value);
                        // the game opens on it next time, after a reload too (LVL-2)
                        storageService.setGameDifficulty(game.id, level.value);
                      }}
                    >
                      {level.label}
                    </ChunkyButton>
                  ))}
                </div>
              )}

              <ChunkyButton variant="action" size={64} icon="play" data-shot="play" onClick={() => startPlay(difficulty)}>
                {game.lesson ? 'Let’s learn!' : 'Let’s play!'}
              </ChunkyButton>
            </div>
          </div>
        )}

        {/* Luna's perch, as on the Round board: what she says; a clue is
            spoken, never written */}
        <div className={styles.perch}>
          {!owlOnStage && (
            <Luna mood={inPlay ? mood : 'happy'} size={124} float={!inPlay} onClick={() => speak(bubble, mood)} />
          )}
          <SpeechBubble
            className={styles.bubble}
            tail={owlOnStage ? 'none' : 'left'}
            onLine={owlOnStage ? () => speak(bubble, mood) : undefined}
            lineLabel={`Hear Ms. Luna again: ${bubble}`}
            // from the second miss until the round is won, as on the board
            onClue={
              inPlay && hint && flash !== 'win'
                ? () => {
                    soundManager.playLetterTap();
                    pronunciation.speakSequence(hint);
                  }
                : undefined
            }
          >
            {bubble}
          </SpeechBubble>
          {/* her voice is off, and the games need it: say so, and who can
              help; it names no target (SET-2) */}
          {!progress.settings.speechEnabled && (
            <span className={styles.resting} data-shot="luna-resting" role="status">
              <Chip variant="accent" icon="mute">
                Ms. Luna is resting. Ask a grown-up!
              </Chip>
            </span>
          )}
        </div>

        {/* each win's petals drift down over the stage and the perch, and
            keep falling into the next round; they never take a tap (DES-11) */}
        {inPlay && petalFalls > 0 && <Petals key={petalFalls} />}
      </div>
    </>
  );
};
