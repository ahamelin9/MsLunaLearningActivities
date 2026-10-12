import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { GradeLevel } from '@/types/reading';
import type { UserProgress } from '@/types/user';
import type { AnyGameDef, GameApi, GameContext } from '../types';
import type { Difficulty } from '../content';
import { lunaSay, type LunaMood } from '../luna';
import { LunaOwl } from '../LunaOwl/LunaOwl';
import { nextSticker, type Sticker } from '../stickers';
import { soundManager } from '@/utils/audio';
import { pronunciation, type SpeechPart } from '@/utils/pronunciation';
import { warmGameIntro } from '../warmup';
import { storageService } from '@/utils/storage';
import { launchConfetti } from '@/utils/confetti';
import { StarIcon } from '@/components/ui/Icons/Icons';
import { ChunkyButton } from '@/components/kit';
import { AppHeader } from '@/components/os/AppHeader/AppHeader';
import { cx } from '@/utils/cx';
import styles from './GameShell.module.scss';

type Phase = 'intro' | 'play' | 'reward';

interface GameShellProps {
  game: AnyGameDef;
  grade: GradeLevel;
  progress: UserProgress;
  onExit: () => void;
  /** the reward screen's second button; left out, the button is not shown */
  onPlayAnother?: () => void;
  /** what that button says: "Another game", or "Next lesson" */
  playAnotherLabel?: string;
  /** Surprise picks skip the start screen and drop straight into play. */
  autoStart?: boolean;
  startDifficulty?: Difficulty;
  /** Shown above the title when Luna chose the game herself. */
  surpriseBanner?: string;
}

const DIFFICULTY_LABELS: { value: Difficulty; label: string; note: string }[] = [
  { value: 1, label: 'Warm up', note: 'Short words, fewer choices' },
  { value: 2, label: 'Just right', note: 'A good challenge' },
  { value: 3, label: 'Tricky', note: 'Longer words, sneakier' }
];

export const GameShell: React.FC<GameShellProps> = ({
  game,
  grade,
  progress,
  onExit,
  onPlayAnother,
  playAnotherLabel = 'Another game',
  autoStart = false,
  startDifficulty = 2,
  surpriseBanner
}) => {
  const [phase, setPhase] = useState<Phase>(autoStart ? 'play' : 'intro');
  const [difficulty, setDifficulty] = useState<Difficulty>(startDifficulty);
  const [roundIndex, setRoundIndex] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [hintLevel, setHintLevel] = useState<0 | 1 | 2>(0);
  const [hint, setHint] = useState<SpeechPart[] | null>(null);
  const [roundsWon, setRoundsWon] = useState(0);
  const [cleanRounds, setCleanRounds] = useState(0);
  const [flash, setFlash] = useState<'win' | 'miss' | null>(null);
  const [bubble, setBubble] = useState<string>(game.mission);
  const [mood, setMood] = useState<LunaMood>('happy');
  const [talking, setTalking] = useState(false);
  const [preparing, setPreparing] = useState(false);
  const [winStreak, setWinStreak] = useState(0);

  const [rounds, setRounds] = useState<unknown[]>(() =>
    game.makeRounds({ grade, difficulty: startDifficulty, count: game.roundsPerPlay })
  );

  useEffect(() => pronunciation.onBusy(setPreparing), []);

  const timers = useRef<number[]>([]);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [award, setAward] = useState<{ sticker: Sticker | null; stars: number; points: number } | null>(null);
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
   * string would be a sentence nobody rendered.
   */
  const speak = useCallback(
    (text: string, nextMood: LunaMood = 'happy', then: SpeechPart[] = []) => {
      setBubble(text);
      setMood(nextMood);
      setTalking(true);
      const line = text.replace(/[…]/g, '...');
      const onEnd = () => setTalking(false);
      if (then.length) pronunciation.speakSequence([{ text: line }, ...then], { onEnd });
      else soundManager.speak(line, { onEnd });
      later(() => setTalking(false), 3600);
    },
    [later]
  );

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
    setCleanRounds(0);
    setWinStreak(0);
    wonRef.current = 0;
    cleanRef.current = 0;
    recorded.current = false;
    setAward(null);
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
      soundManager.playCorrect();
      wonRef.current += 1;
      setRoundsWon(wonRef.current);
      if (attempts === 0) cleanRef.current += 1;
      setCleanRounds(cleanRef.current);

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
    (opts?: { lunaLine?: string; hint?: SpeechPart[] }) => {
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

      const line =
        opts?.lunaLine ??
        (attemptNumber >= 2 ? lunaSay('missAgain', game.id).text : lunaSay('missFirst', game.id).text);
      speak(line, attemptNumber >= 2 ? 'think' : 'oops', spokenHint ?? []);
    },
    [attempts, game.id, later, speak]
  );

  const handleTick = useCallback(
    (opts?: { lunaLine?: string }) => {
      soundManager.playLetterSnap();
      if (opts?.lunaLine) {
        speak(opts.lunaLine, 'happy');
      }
    },
    [speak]
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
      locked: flash === 'win',
      win: handleWin,
      miss: handleMiss,
      tick: handleTick,
      say: (text: string, m: LunaMood = 'happy') => speak(text, m)
    }),
    [ctx, attempts, hintLevel, flash, handleWin, handleMiss, handleTick, speak]
  );

  // Reward side effects: save progress, fanfare, confetti, closing line.
  useEffect(() => {
    if (phase !== 'reward' || !award || recorded.current) return;
    recorded.current = true;

    if (game.lesson) {
      storageService.recordLessonCompletion(
        game.lesson.id,
        award.stars,
        award.points,
        game.lesson.skillId,
        award.sticker?.id ?? null
      );
    } else {
      storageService.recordGameCompletion({
        gameId: game.id,
        starsEarned: award.stars,
        pointsEarned: award.points,
        stickerId: award.sticker?.id ?? null
      });
    }

    soundManager.playFanfare();
    launchConfetti(canvasRef.current, 2800);
    later(() => {
      speak(lunaSay('finish', game.id).text, 'cheer', award.sticker ? [{ text: award.sticker.line }] : []);
    }, 700);
  }, [phase, award, game.id, game.lesson, later, speak]);

  // the one header (DES-8): back to the library and the game's name; in play,
  // the rounds and Again too, as on the round 2 Round and Done boards
  const header = (inPlay = false) => (
    <AppHeader
      back="library"
      onBack={onExit}
      title={game.title}
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

  // ---------- START ----------
  if (phase === 'intro') {
    return (
      <>
        {header()}
        <div className={styles.gameShell} data-phase="intro" data-shape={game.shape} data-shot="shell-intro">
          <div className={styles.introPanel}>
            <div className={styles.introScene} aria-hidden="true">
              <span className={styles.introEmoji}>{game.emoji}</span>
            </div>

            {surpriseBanner && <div className={styles.surpriseBanner}>{surpriseBanner}</div>}

            <h2 className={styles.introTitle}>{game.title}</h2>
            <p className={styles.introTagline}>{game.tagline}</p>

            <div className={styles.introLuna}>
              <LunaOwl mood="happy" size={78} onClick={() => speak(game.mission, 'happy')} />
              <p className={styles.introMission}>“{game.mission}”</p>
            </div>

            {/* a lesson's questions are fixed, so there is nothing to choose */}
            {!game.lesson && (
              <div className={styles.difficultyRow} role="group" aria-label="Choose how tricky">
                {DIFFICULTY_LABELS.map(level => (
                  <button
                    key={level.value}
                    className={styles.difficultyChip}
                    data-state={difficulty === level.value ? 'active' : undefined}
                    onClick={() => {
                      soundManager.playLetterTap();
                      setDifficulty(level.value);
                    }}
                  >
                    <span className={styles.chipDots} aria-hidden="true">
                      {'●'.repeat(level.value)}
                      <span className={styles.dim}>{'●'.repeat(3 - level.value)}</span>
                    </span>
                    <span className={styles.chipLabel}>{level.label}</span>
                    <span className={styles.chipNote}>{level.note}</span>
                  </button>
                ))}
              </div>
            )}

            <button className={styles.playButton} data-shot="play" onClick={() => startPlay(difficulty)}>
              {game.lesson ? 'Let’s learn!' : 'Let’s play!'}
            </button>

            <p className={styles.objectiveLine}>
              <strong>Learning:</strong> {game.objective}
            </p>
          </div>
        </div>
      </>
    );
  }

  // ---------- REWARD ----------
  if (phase === 'reward') {
    return (
      <>
        {header()}
        <div className={styles.gameShell} data-phase="reward" data-shape={game.shape} data-shot="shell-reward">
          <canvas ref={canvasRef} className={styles.rewardConfetti} />

          <div className={styles.rewardPanel}>
            <div className={styles.rewardLuna}>
              <LunaOwl mood="cheer" size={110} talking={talking} />
            </div>

            <h2 className={styles.rewardTitle}>{game.title} — done!</h2>

            <div className={styles.rewardStars}>
              {Array.from({ length: award?.stars ?? 1 }).map((_, i) => (
                <span key={i} className={styles.rewardStar} style={{ animationDelay: `${i * 140}ms` }}>
                  <StarIcon size={40} color="#FFD166" filled />
                </span>
              ))}
            </div>

            <p className={styles.rewardScore}>
              {roundsWon} of {game.roundsPerPlay} solved
              {cleanRounds === game.roundsPerPlay ? ' — no wobbles at all!' : ''}
            </p>

            {award?.sticker && (
              <div className={styles.stickerAward}>
                <span className={styles.stickerPeel}>{award.sticker.emoji}</span>
                <div>
                  <span className={styles.stickerKicker}>New sticker for your tin</span>
                  <strong className={styles.stickerName}>{award.sticker.name}</strong>
                </div>
              </div>
            )}

            <div className={styles.rewardActions}>
              <button className={cx(styles.rewardBtn, styles.primary)} onClick={() => startPlay(difficulty)}>
                Play again
              </button>
              {onPlayAnother && (
                <button className={styles.rewardBtn} onClick={onPlayAnother}>
                  {playAnotherLabel}
                </button>
              )}
              {/* back to the library is the header's Library (DES-8) */}
            </div>
          </div>
        </div>
      </>
    );
  }

  // ---------- PLAY ----------
  const PlayComponent = game.Play;
  const round = rounds[roundIndex];

  return (
    <>
      {header(true)}
      <div
        className={styles.gameShell}
        data-phase="play"
        data-shape={game.shape}
        data-flash={flash ?? undefined}
        data-shot="shell-play"
      >
        <div className={styles.shellStage} data-shot="stage">
          {round !== undefined && <PlayComponent key={roundIndex} round={round} api={api} />}
        </div>

        <div className={styles.lunaPerch}>
          <LunaOwl
            mood={mood}
            size={82}
            talking={talking}
            onClick={() => speak(bubble, mood)}
          />
          <div className={styles.perchBubble}>
            <p>
              {bubble}
              {preparing && (
                <span className={styles.thinkingDots} aria-label="Ms. Luna is getting ready to speak">
                  <i /><i /><i />
                </span>
              )}
            </p>
            {hint && (
              <button
                className={styles.perchHint}
                onClick={() => {
                  soundManager.playLetterTap();
                  pronunciation.speakSequence(hint);
                }}
              >
                <span aria-hidden="true">🔦</span> Hear my hint again
              </button>
            )}
          </div>
        </div>

        {flash === 'win' && (
          <div className={styles.winVeil} data-shot="win-veil" aria-hidden="true">
            <span className={styles.winBurst}>✦</span>
          </div>
        )}
      </div>
    </>
  );
};
