import React, { useEffect, useRef, useState } from 'react';
import type { AnyGameDef } from '../types';
import type { Sticker } from '../stickers';
import { soundManager } from '@/utils/audio';
import { pronunciation } from '@/utils/pronunciation';
import { afterMotion } from '@/utils/motion';
import { Chip, ChunkyButton, Icon, Luna, MilestoneMoon, PaperCard, Petals, ProgressBar, StarRow } from '@/components/kit';
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
  /** `firstTry`: the rounds answered right the first time, which the stars count (PRG-1) */
  award: { sticker: Sticker | null; stars: number; points: number; firstTry: number } | null;
  /** a lesson's bar and the lesson it opened; left out for a game */
  path?: LessonPath;
  onPlayAgain: () => void;
  /** the second button; left out, it isn't shown */
  onPlayAnother?: () => void;
  /** what that button says: "Another game", or "Next lesson" */
  playAnotherLabel: string;
  /** Luna, tapped: her line again */
  onLuna: () => void;
  /** a milestone's visit (DES-17): the moon's line, while she's here */
  moon?: string | null;
  /** the moon has gone: Luna may talk again */
  onMoonGone?: () => void;
}

/** However her clip goes (the voice off, a slow start), she leaves by now. */
const MOON_WAIT_MS = 3000;
const MOON_STAY_MAX_MS = 9000;

/**
 * The milestone moon's visit (DES-17): she glides in from the top corner, says
 * her line, and glides back out once it ends, about 3 seconds in all. She
 * never takes a tap. Under reduced motion she appears and goes without
 * gliding.
 */
function MoonVisit({ line, onGone }: { line: string; onGone: () => void }) {
  const [leaving, setLeaving] = useState(false);
  const gone = useRef(onGone);
  useEffect(() => {
    gone.current = onGone;
  });

  useEffect(() => {
    const cancels: (() => void)[] = [];
    let left = false;
    let started = false;
    const leave = () => {
      if (left) return;
      left = true;
      setLeaving(true);
      cancels.push(afterMotion('enter', () => gone.current()));
    };
    // she speaks once she has arrived, and leaves a beat after her clip ends
    cancels.push(afterMotion('celebrate', () => soundManager.speak(line)));
    cancels.push(
      pronunciation.onSpeaking(on => {
        if (on) started = true;
        else if (started) cancels.push(afterMotion('emphasis', leave));
      })
    );
    const waited = window.setTimeout(() => {
      if (!started) leave();
    }, MOON_WAIT_MS);
    const most = window.setTimeout(leave, MOON_STAY_MAX_MS);
    return () => {
      cancels.forEach(cancel => cancel());
      window.clearTimeout(waited);
      window.clearTimeout(most);
    };
  }, [line]);

  return (
    <span className={styles.moon} data-shot="moon-visit" data-state={leaving ? 'leaving' : 'here'}>
      <MilestoneMoon mood="cheer" size={160} />
    </span>
  );
}

/**
 * The screen at the end of a game or lesson (DES-22d), as on the round 2 Done
 * board, from the kit. On the left, the "Lesson done!" mark (tap it to see it
 * pop again), the stars and Luna cheering in the corner; on the right, a
 * lesson's bar moving on and the lesson it opened, the reward (today's
 * sticker, until PRG-5's squishies) and what next. Petals drift down once it
 * has arrived, as after a won round (DES-11). For a big milestone the moon
 * visits (DES-17). The times (PRG-6) and "See my
 * shelf" (PRG-5) come with their tickets.
 * GameShell saves the result and has Luna say her line; the header is the
 * shell's.
 */
export const DoneScreen: React.FC<DoneScreenProps> = ({
  game,
  award,
  path,
  onPlayAgain,
  onPlayAnother,
  playAnotherLabel,
  onLuna,
  moon,
  onMoonGone
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
          {/* the mark and the title stand on the arch, which ends just under the title */}
          <div className={styles.crest}>
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
          </div>
          <StarRow earned={stars} animate />
          <p className={styles.solved}>
            {award?.firstTry ?? 0} of {game.roundsPerPlay} first try
          </p>
          {/* while the moon visits, only she talks: Luna watches, beak still (DES-17) */}
          <span className={styles.luna} data-shot="done-luna">
            <Luna mood="cheer" size={96} onClick={onLuna} label="Hear Ms. Luna again" talking={moon ? false : undefined} />
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

      {/* as on the Done board: the same petals as a won round, once the
          screen has arrived; they never take a tap */}
      <Petals delayed />

      {moon && <MoonVisit line={moon} onGone={() => onMoonGone?.()} />}
    </div>
  );
};
