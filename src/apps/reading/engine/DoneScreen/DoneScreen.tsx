import React, { useState } from 'react';
import type { AnyGameDef } from '../types';
import type { Sticker } from '../stickers';
import { soundManager } from '@/utils/audio';
import { Chip, ChunkyButton, Icon, Luna, PaperCard, ProgressBar, StarRow } from '@/components/kit';
import styles from './DoneScreen.module.scss';

/** A finished lesson's place on the path, as the result is saved. */
export interface LessonPath {
  /** lessons done in this grade, this one included once it's saved */
  done: number;
  total: number;
  /** the lesson that finishing this one opened, if any */
  opened?: number;
}

interface DoneScreenProps {
  game: AnyGameDef;
  award: { sticker: Sticker | null; stars: number; points: number } | null;
  roundsWon: number;
  /** a lesson's bar and the lesson it opened; left out for a game */
  path?: LessonPath;
  onPlayAgain: () => void;
  /** the second button; left out, it isn't shown */
  onPlayAnother?: () => void;
  /** what that button says: "Another game", or "Next lesson" */
  playAnotherLabel: string;
  /** Luna, tapped: her line again */
  onLuna: () => void;
}

/**
 * The screen at the end of a game or lesson (DES-22d), as on the round 2 Done
 * board, from the kit. On the left, the "Lesson done!" mark (tap it to see it
 * pop again), the stars and Luna cheering in the corner; on the right, a
 * lesson's bar moving on and the lesson it opened, the reward (today's
 * sticker, until PRG-5's squishies) and what next. The times (PRG-6) and
 * "See my shelf" (PRG-5) come with their tickets; the petals with DES-11.
 * GameShell saves the result and has Luna say her line; the header is the
 * shell's.
 */
export const DoneScreen: React.FC<DoneScreenProps> = ({
  game,
  award,
  roundsWon,
  path,
  onPlayAgain,
  onPlayAnother,
  playAnotherLabel,
  onLuna
}) => {
  // each tap on the mark pops it again
  const [pops, setPops] = useState(0);
  const stars = Math.max(0, Math.min(3, award?.stars ?? 1)) as 0 | 1 | 2 | 3;
  const sticker = award?.sticker ?? null;

  return (
    <div className={styles.screen} data-shot="shell-reward">
      <PaperCard variant="lifted" className={styles.panel}>
        {/* ---- the lesson is done ---- */}
        <div className={styles.done}>
          <span className={styles.arch} aria-hidden="true" />
          <button
            type="button"
            className={styles.mark}
            aria-label="See it again"
            onClick={() => {
              soundManager.playPop();
              setPops(n => n + 1);
            }}
          >
            <span key={pops} className={styles.medal}>
              <Icon name="check" size={96} />
            </span>
          </button>
          <h2 className={styles.title}>{game.lesson ? 'Lesson done!' : 'All done!'}</h2>
          <StarRow earned={stars} animate />
          <p className={styles.solved}>
            {roundsWon} of {game.roundsPerPlay} solved
          </p>
          <span className={styles.luna}>
            <Luna mood="cheer" size={96} onClick={onLuna} label="Hear Ms. Luna again" />
          </span>
        </div>

        {/* ---- the path, the reward, what next ---- */}
        <div className={styles.next}>
          {path && (
            <section className={styles.lessons}>
              <h3 className={styles.label}>Your lessons</h3>
              <ProgressBar done={path.done} total={path.total} />
              {path.opened && (
                <Chip variant="accent" icon="unlock" className={styles.opened}>
                  Lesson {path.opened} is open now
                </Chip>
              )}
            </section>
          )}

          {sticker && (
            <PaperCard variant="reward" className={styles.reward}>
              <ChunkyButton
                variant="icon"
                size={64}
                aria-label={sticker.name}
                onClick={() => {
                  soundManager.playLetterTap();
                  soundManager.speak(sticker.line);
                }}
              >
                <span className={styles.sticker}>{sticker.emoji}</span>
              </ChunkyButton>
              <span className={styles.rewardWords}>
                <span className={styles.rewardLabel}>New sticker for your tin</span>
                <strong className={styles.rewardName}>{sticker.name}</strong>
              </span>
            </PaperCard>
          )}

          <div className={styles.actions}>
            <ChunkyButton variant="action" size={64} icon="replay" onClick={onPlayAgain}>
              Play again
            </ChunkyButton>
            {onPlayAnother && (
              <ChunkyButton
                size={64}
                icon={game.lesson ? undefined : 'dice'}
                iconAfter={game.lesson ? 'arrow-right' : undefined}
                onClick={onPlayAnother}
              >
                {playAnotherLabel}
              </ChunkyButton>
            )}
            {/* back to the library is the header's Library (DES-8) */}
          </div>
        </div>
      </PaperCard>
    </div>
  );
};
