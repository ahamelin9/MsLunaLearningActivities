import React, { useEffect, useRef, useState } from 'react';
import type { AnyGameDef } from '../types';
import { ODDS, SQUISHY_KINDS, kindsFound, type SquishyAward } from '../squishies';
import { ShelfRows } from '../ShelfRows/ShelfRows';
import type { TimeStar } from '../stars';
import { soundManager } from '@/utils/audio';
import { pronunciation } from '@/utils/pronunciation';
import { afterMotion } from '@/utils/motion';
import { Chip, ChunkyButton, Icon, Luna, MilestoneMoon, PaperCard, Petals, ProgressBar, Squishy, StarRow } from '@/components/kit';
import { minutesOf } from '@/utils/storage';
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
  award: { squishy: SquishyAward | null; stars: number; timeStar: TimeStar; firstTry: number; seconds: number; estimate: number } | null;
  /** a lesson's bar and the lesson it opened; left out for a game */
  path?: LessonPath;
  onPlayAgain: () => void;
  /** the second button; left out, it isn't shown */
  onPlayAnother?: () => void;
  /** what that button says: "Another game", or "Next lesson" */
  playAnotherLabel: string;
  /** "See my shelf" (PRG-5a); left out, it isn't shown */
  onSeeShelf?: () => void;
  /** the squishies on the shelf, this play's included: a game's done screen shows them (PRG-9) */
  owned?: string[];
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
 * pop again), the stars and Luna cheering in the corner; on the right, how
 * long it took (PRG-6), a lesson's bar moving on and the lesson it opened, a
 * new squishy for the shelf (PRG-5a) and what next. Petals drift down once it
 * has arrived, as after a won round (DES-11). For a big milestone the moon
 * visits (DES-17).
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
  onSeeShelf,
  owned,
  onLuna,
  moon,
  onMoonGone
}) => {
  // each tap on the mark pops it again
  const [pops, setPops] = useState(0);
  const stars = Math.max(0, Math.min(3, award?.stars ?? 1)) as 0 | 1 | 2 | 3;
  const squishy = award?.squishy ?? null;

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
          {/* what time did to the stars, in kid words (PRG-10) */}
          {award?.timeStar === 'quick' && (
            <span data-shot="done-time-star">
              <Chip variant="took" icon="sparkle">Quick and careful: a star!</Chip>
            </span>
          )}
          {award?.timeStar === 'slow' && (
            <span data-shot="done-time-star">
              <Chip variant="time" icon="clock">A very long time: one star less</Chip>
            </span>
          )}
          {/* while the moon visits, only she talks: Luna watches, beak still (DES-17) */}
          <span className={styles.luna} data-shot="done-luna">
            <Luna mood="cheer" size={96} onClick={onLuna} label="Hear Ms. Luna again" talking={moon ? false : undefined} />
          </span>
        </div>

        {/* ---- the path, the reward, what next ---- */}
        <div className={styles.next}>
          {/* how long it took, beside "about N min" from before (PRG-6, the Done board) */}
          {award && (
            <section className={styles.lessons} data-shot="done-time">
              <h3 className={styles.label}>Time</h3>
              <span className={styles.times}>
                <Chip variant="took" icon="clock">
                  You took {minutesOf(award.seconds)} {minutesOf(award.seconds) === 1 ? 'minute' : 'minutes'}
                </Chip>
                <Chip variant="time">
                  this {game.lesson ? 'lesson' : 'game'} is about {award.estimate} min
                </Chip>
              </span>
            </section>
          )}

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

          {/* as on the Done board: the new squishy, drawn, its name, and a
              rare or super-rare tag that shimmers (PRG-5a) */}
          {squishy && (
            <PaperCard variant="reward" className={styles.reward} data-shot="done-squishy">
              <Squishy
                kind={squishy.kind}
                colour={squishy.colour}
                size={96}
                label={`${squishy.name}: hear Ms. Luna`}
                onClick={() => soundManager.speak(squishy.line)}
              />
              <span className={styles.rewardWords}>
                <span className={styles.rewardLabel}>New squishy for your shelf</span>
                <strong className={styles.rewardName}>{squishy.name}</strong>
                {squishy.rarity !== 'usual' && (
                  <Chip variant={squishy.rarity} icon="sparkle" shimmer className={styles.rarity}>
                    {squishy.rarity === 'rare' ? 'Rare colour' : 'Super rare'}: {squishy.colour}!
                  </Chip>
                )}
                <span className={styles.rewardNote}>
                  {squishy.rarity === 'rare' && `Only about 1 in ${Math.round(1 / ODDS.rare)} squishies comes in a rare colour. `}
                  {squishy.rarity === 'super-rare' && `Only about 1 in ${Math.round(1 / ODDS.superRare)} squishies comes in super rare ${squishy.colour}. `}
                  Tap it to squish.
                </span>
              </span>
            </PaperCard>
          )}

          {/* a game has no lesson bar, so its right half shows the squishy
              shelf, with the one just won picked out (PRG-9) */}
          {!path && owned && (
            <section className={styles.lessons} data-shot="done-shelf">
              <h3 className={styles.label}>
                Your squishy shelf · {kindsFound(owned)} of {SQUISHY_KINDS.length}
              </h3>
              <div className={styles.shelf}>
                <ShelfRows
                  owned={owned}
                  size={64}
                  picked={squishy?.kind}
                  onTap={(def, found) => soundManager.speak(found ? def.line : def.hint)}
                />
              </div>
            </section>
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
            {onSeeShelf && (
              <ChunkyButton variant="quiet" size={64} onClick={onSeeShelf} data-shot="see-shelf">
                See my shelf
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
