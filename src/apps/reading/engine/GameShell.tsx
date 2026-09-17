import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { GradeLevel } from '../../../types/reading';
import type { UserProgress } from '../../../types/user';
import type { AnyGameDef, GameApi, GameContext } from './types';
import type { Difficulty } from './content';
import { lunaSay, type LunaMood } from './luna';
import { LunaOwl } from './LunaOwl';
import { nextSticker, type Sticker } from './stickers';
import { soundManager } from '../../../utils/audio';
import { pronunciation } from '../../../utils/pronunciation';
import { warmGameIntro } from './warmup';
import { storageService } from '../../../utils/storage';
import { launchConfetti } from '../../../utils/confetti';
import { ArrowLeftIcon, StarIcon } from '../../../components/ui/Icons';
import './GameShell.scss';

type Phase = 'intro' | 'play' | 'reward';

interface GameShellProps {
  game: AnyGameDef;
  grade: GradeLevel;
  progress: UserProgress;
  onExit: () => void;
  onPlayAnother: () => void;
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
  autoStart = false,
  startDifficulty = 2,
  surpriseBanner
}) => {
  const [phase, setPhase] = useState<Phase>(autoStart ? 'play' : 'intro');
  const [difficulty, setDifficulty] = useState<Difficulty>(startDifficulty);
  const [roundIndex, setRoundIndex] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [hintLevel, setHintLevel] = useState<0 | 1 | 2>(0);
  const [hint, setHint] = useState<string | null>(null);
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

  const speak = useCallback(
    (text: string, nextMood: LunaMood = 'happy') => {
      setBubble(text);
      setMood(nextMood);
      setTalking(true);
      soundManager.speak(text.replace(/[…]/g, '...'), {
        onEnd: () => setTalking(false)
      });
      later(() => setTalking(false), 3600);
    },
    [later]
  );

  // The start screen is the moment to prepare what this game will say.
  useEffect(() => {
    warmGameIntro(game.mission, game.tagline);
  }, [game.mission, game.tagline]);

  // Luna introduces the game a beat after a play session starts.
  useEffect(() => {
    if (phase !== 'play') return;
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
        stars: Math.max(1, wonRef.current) + (perfect ? 1 : 0),
        points: wonRef.current * 15 + (perfect ? 25 : 0)
      });
      setPhase('reward');
    } else {
      setRoundIndex(roundIndex + 1);
    }
  }, [game.roundsPerPlay, game.sticker, progress.stickers, roundIndex]);

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
    (opts?: { lunaLine?: string; hint?: string }) => {
      const attemptNumber = attempts + 1;
      setAttempts(attemptNumber);
      setWinStreak(0);
      setFlash('miss');
      soundManager.playTryAgain();
      later(() => setFlash(null), 500);

      const nextHintLevel: 0 | 1 | 2 = attemptNumber >= 3 ? 2 : attemptNumber >= 2 ? 1 : 0;
      setHintLevel(nextHintLevel);
      if (nextHintLevel > 0 && opts?.hint) {
        setHint(opts.hint);
      }

      const line =
        opts?.lunaLine ??
        (attemptNumber >= 2 ? lunaSay('missAgain', game.id).text : lunaSay('missFirst', game.id).text);
      speak(line, attemptNumber >= 2 ? 'think' : 'oops');
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

    storageService.recordGameCompletion({
      gameId: game.id,
      starsEarned: award.stars,
      pointsEarned: award.points,
      stickerId: award.sticker?.id ?? null
    });

    soundManager.playFanfare();
    launchConfetti(canvasRef.current, 2800);
    later(() => {
      const closing = award.sticker
        ? `${lunaSay('finish', game.id).text} ${award.sticker.line}`
        : lunaSay('finish', game.id).text;
      speak(closing, 'cheer');
    }, 700);
  }, [phase, award, game.id, later, speak]);

  // ---------- START ----------
  if (phase === 'intro') {
    return (
      <div className={`game-shell phase-intro shape-${game.shape}`}>
        <button className="shell-back" onClick={onExit}>
          <ArrowLeftIcon size={14} />
          <span>Library</span>
        </button>

        <div className="intro-panel">
          <div className="intro-scene" aria-hidden="true">
            <span className="intro-emoji">{game.emoji}</span>
          </div>

          {surpriseBanner && <div className="surprise-banner">{surpriseBanner}</div>}

          <h2 className="intro-title">{game.title}</h2>
          <p className="intro-tagline">{game.tagline}</p>

          <div className="intro-luna">
            <LunaOwl mood="happy" size={78} onClick={() => speak(game.mission, 'happy')} />
            <p className="intro-mission">“{game.mission}”</p>
          </div>

          <div className="difficulty-row" role="group" aria-label="Choose how tricky">
            {DIFFICULTY_LABELS.map(level => (
              <button
                key={level.value}
                className={`difficulty-chip ${difficulty === level.value ? 'is-active' : ''}`}
                onClick={() => {
                  soundManager.playLetterTap();
                  setDifficulty(level.value);
                }}
              >
                <span className="chip-dots" aria-hidden="true">
                  {'●'.repeat(level.value)}
                  <span className="dim">{'●'.repeat(3 - level.value)}</span>
                </span>
                <span className="chip-label">{level.label}</span>
                <span className="chip-note">{level.note}</span>
              </button>
            ))}
          </div>

          <button className="play-button" onClick={() => startPlay(difficulty)}>
            Let’s play!
          </button>

          <p className="objective-line">
            <strong>Learning:</strong> {game.objective}
          </p>
        </div>
      </div>
    );
  }

  // ---------- REWARD ----------
  if (phase === 'reward') {
    return (
      <div className={`game-shell phase-reward shape-${game.shape}`}>
        <canvas ref={canvasRef} className="reward-confetti" />

        <div className="reward-panel">
          <div className="reward-luna">
            <LunaOwl mood="cheer" size={110} talking={talking} />
          </div>

          <h2 className="reward-title">{game.title} — done!</h2>

          <div className="reward-stars">
            {Array.from({ length: award?.stars ?? 1 }).map((_, i) => (
              <span key={i} className="reward-star" style={{ animationDelay: `${i * 140}ms` }}>
                <StarIcon size={40} color="#FFD166" filled />
              </span>
            ))}
          </div>

          <p className="reward-score">
            {roundsWon} of {game.roundsPerPlay} solved
            {cleanRounds === game.roundsPerPlay ? ' — no wobbles at all!' : ''}
          </p>

          {award?.sticker && (
            <div className="sticker-award">
              <span className="sticker-peel">{award.sticker.emoji}</span>
              <div className="sticker-copy">
                <span className="sticker-kicker">New sticker for your tin</span>
                <strong className="sticker-name">{award.sticker.name}</strong>
              </div>
            </div>
          )}

          <div className="reward-actions">
            <button className="reward-btn primary" onClick={() => startPlay(difficulty)}>
              Play again
            </button>
            <button className="reward-btn" onClick={onPlayAnother}>
              Another game
            </button>
            <button className="reward-btn ghost" onClick={onExit}>
              Back to the library
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ---------- PLAY ----------
  const PlayComponent = game.Play;
  const round = rounds[roundIndex];

  return (
    <div className={`game-shell phase-play shape-${game.shape} ${flash ? `flash-${flash}` : ''}`}>
      <header className="shell-bar">
        <button className="shell-back" onClick={onExit}>
          <ArrowLeftIcon size={14} />
          <span>Library</span>
        </button>

        <div className="round-pips" aria-label={`Round ${roundIndex + 1} of ${game.roundsPerPlay}`}>
          {Array.from({ length: game.roundsPerPlay }).map((_, i) => (
            <span
              key={i}
              className={`pip ${i < roundsWon ? 'done' : ''} ${i === roundIndex ? 'current' : ''}`}
            />
          ))}
        </div>

        <div className="shell-right">
          <button
            className="replay-btn"
            onClick={() => {
              soundManager.playLetterTap();
              pronunciation.replayLast();
            }}
            title="Hear that again"
          >
            <span aria-hidden="true">🔁</span>
            <span className="replay-label">Again</span>
          </button>

          <div className="shell-title">
            <span className="shell-emoji">{game.emoji}</span>
            <span>{game.title}</span>
          </div>
        </div>
      </header>

      <div className="shell-stage">
        {round !== undefined && <PlayComponent key={roundIndex} round={round} api={api} />}
      </div>

      <div className="luna-perch">
        <LunaOwl
          mood={mood}
          size={82}
          talking={talking}
          onClick={() => speak(bubble, mood)}
        />
        <div className="perch-bubble">
          <p>
            {bubble}
            {preparing && (
              <span className="thinking-dots" aria-label="Ms. Luna is getting ready to speak">
                <i /><i /><i />
              </span>
            )}
          </p>
          {hint && (
            <p className="perch-hint">
              <span aria-hidden="true">🔦</span> {hint}
            </p>
          )}
        </div>
      </div>

      {flash === 'win' && (
        <div className="win-veil" aria-hidden="true">
          <span className="win-burst">✦</span>
        </div>
      )}
    </div>
  );
};
