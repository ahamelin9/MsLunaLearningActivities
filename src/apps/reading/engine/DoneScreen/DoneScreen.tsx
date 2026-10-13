import React, { useEffect, useRef } from 'react';
import type { AnyGameDef } from '../types';
import type { Sticker } from '../stickers';
import { launchConfetti } from '@/utils/confetti';
import { StarIcon } from '@/components/ui/Icons/Icons';
import { Luna } from '@/components/kit';
import { cx } from '@/utils/cx';
import styles from './DoneScreen.module.scss';

interface DoneScreenProps {
  game: AnyGameDef;
  award: { sticker: Sticker | null; stars: number; points: number } | null;
  roundsWon: number;
  cleanRounds: number;
  onPlayAgain: () => void;
  /** the second button; left out, it isn't shown */
  onPlayAnother?: () => void;
  /** what that button says: "Another game", or "Next lesson" */
  playAnotherLabel: string;
}

/**
 * The screen at the end of a game or lesson: the stars, the sticker won, and
 * play again or go on. Moved unchanged out of GameShell (DES-22a), so the
 * shell could go onto the kit; DES-22d rebuilds it on the round 2 Done board.
 * GameShell still saves the result and has Luna say her line; the header is
 * the shell's.
 */
export const DoneScreen: React.FC<DoneScreenProps> = ({
  game,
  award,
  roundsWon,
  cleanRounds,
  onPlayAgain,
  onPlayAnother,
  playAnotherLabel
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    launchConfetti(canvasRef.current, 2800);
  }, []);

  return (
    <div className={styles.doneScreen} data-shot="shell-reward">
      <canvas ref={canvasRef} className={styles.rewardConfetti} />

      <div className={styles.rewardPanel}>
        <div className={styles.rewardLuna}>
          <Luna mood="cheer" size={110} />
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
          <button className={cx(styles.rewardBtn, styles.primary)} onClick={onPlayAgain}>
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
  );
};
