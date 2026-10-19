import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { GradeLevel } from '@/types/reading';
import type { UserProgress } from '@/types/user';
import type { AnyGameDef, GameApi, GameContext } from '../types';
import type { Difficulty } from '../content';
import { lunaSay, moonSay, type LunaMood } from '../luna';
import { lessonStates } from '../lessons';
import { milestoneId, milestoneReached } from '../milestones';
import { nextSticker, type Sticker } from '../stickers';
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
  lessons
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
  const [award, setAward] = useState<{ sticker: Sticker | null; stars: number; points: number } | null>(null);
  // a big milestone's visit on the done screen: the moon's line (DES-17)
  const [moon, setMoon] = useState<string | null>(null);
  const wonRef = useRef(0);
  const cleanRef = useRef(0);
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
   * joining the bubble: a hint, or a sticker's line. Speaking it as its own
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
    setRoundIndex(0);
    setAttempts(0);
    setHintLevel(0);
    setHint(null);
    setRoundsWon(0);
    setDoneBefore(progress.completedLessons);
    setWinStreak(0);
    setPetalFalls(0);
    wonRef.current = 0;
    cleanRef.current = 0;
    recorded.current = false;
    setAward(null);
    setMoon(null);
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
      const perfect = cleanRef.current === game.roundsPerPlay;
      setAward({
        sticker: nextSticker(progress.stickers, game.sticker),
        // a lesson is worth what the curriculum says, however it went
        stars: game.lesson?.stars ?? Math.max(1, wonRef.current) + (perfect ? 1 : 0),
        points: game.lesson?.points ?? wonRef.current * 15 + (perfect ? 25 : 0)
      });
      setPhase('reward');
    } else {
      setRoundIndex(roundIndex + 1);
    }
  }, [game.lesson, game.roundsPerPlay, game.sticker, progress.stickers, roundIndex]);

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

      const line =
        opts?.lunaLine ??
        (streakNow >= 3 && Math.random() < 0.5
          ? lunaSay('streak', game.id).text
          : lunaSay('correct', game.id).text);
      speak(line, 'cheer');

      later(goToNextRound, opts?.delay ?? 1750);
    },
    [attempts, game.id, goToNextRound, later, speak, winStreak]
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
      if (nextHintLevel === 2 && opts?.reveal) {
        opts.reveal();
        speak(lunaSay('reveal', game.id).text, 'surprise', spokenHint ?? []);
        return;
      }

      const line =
        opts?.lunaLine ??
        (attemptNumber >= 2 ? lunaSay('missAgain', game.id).text : lunaSay('missFirst', game.id).text);
      speak(line, attemptNumber >= 2 ? 'think' : 'oops', spokenHint ?? []);
    },
    [attempts, game.id, later, speak]
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
    }) =>
      sayThen(opts.say, opts.correct ? ANSWER_WATCHDOG_RIGHT_MS : ANSWER_WATCHDOG_WRONG_MS, () =>
        opts.correct
          ? handleWin({ lunaLine: opts.lunaLine, delay: opts.delay })
          : handleMiss({ lunaLine: opts.lunaLine, hint: opts.hint, reveal: opts.reveal })
      ),
    [sayThen, handleWin, handleMiss]
  );

  // a small good beat; its `say` (the word found) is said whole first (FB-1)
  const handleTick = useCallback(
    (opts?: { lunaLine?: string; say?: SpeechPart[] }) => {
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
      answer: handleAnswer,
      tick: handleTick,
      say: (text: string, m: LunaMood = 'happy') => speak(text, m)
    }),
    [ctx, attempts, hintLevel, flash, answering, handleAnswer, handleTick, speak]
  );

  // The done screen's side effects: save progress, the fanfare, Luna's
  // closing line.
  useEffect(() => {
    if (phase !== 'reward' || !award || recorded.current) return;
    recorded.current = true;

    // Luna's closing line, and the sticker's after it
    const closing = () =>
      speak(lunaSay('finish', game.id).text, 'cheer', award.sticker ? [{ text: award.sticker.line }] : []);

    if (game.lesson) {
      storageService.recordLessonCompletion(
        game.lesson.id,
        award.stars,
        award.points,
        game.lesson.skillId,
        award.sticker?.id ?? null
      );
      // a big milestone brings the moon, once per child; while she's here
      // only she talks, and Luna says her line once she's gone (DES-17)
      const reached = lessons?.length
        ? milestoneReached(lessons, doneBefore, storageService.getProgress().completedLessons)
        : null;
      if (reached && storageService.claimOnce(milestoneId(reached, grade))) {
        soundManager.playFanfare();
        const line = moonSay(reached);
        later(() => setMoon(line), 0);
        return;
      }
    } else {
      storageService.recordGameCompletion({
        gameId: game.id,
        starsEarned: award.stars,
        pointsEarned: award.points,
        stickerId: award.sticker?.id ?? null
      });
    }

    soundManager.playFanfare();
    later(closing, 700);
  }, [phase, award, game.id, game.lesson, later, speak, lessons, doneBefore, grade]);

  // the one header (DES-8): back to the library and the game's name; in play,
  // the rounds and Again too, as on the round 2 Round and Done boards
  const header = (inPlay = false, title = game.title) => (
    <AppHeader
      back="library"
      onBack={onExit}
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
          roundsWon={roundsWon}
          path={path}
          onPlayAgain={() => startPlay(difficulty)}
          onPlayAnother={onPlayAnother}
          playAnotherLabel={playAnotherLabel}
          onLuna={() => {
            // while the moon visits, only she talks
            if (!moon) speak(bubble, 'cheer');
          }}
          moon={moon}
          onMoonGone={() => {
            setMoon(null);
            speak(lunaSay('finish', game.id).text, 'cheer', award?.sticker ? [{ text: award.sticker.line }] : []);
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
