import React, { useState } from 'react';
import type { UserProgress } from '@/types/user';
import { Chip, Icon, Luna, PaperCard, PearlMoon, SpeechBubble, SquishyDots, type LunaMood } from '@/components/kit';
import { AppHeader } from '@/components/os/AppHeader/AppHeader';
import { soundManager } from '@/utils/audio';
import { SHELF_LINES, SQUISHY_KINDS, kindsFound, parseSquishy } from '../../engine/squishies';
import { ShelfRows } from '../../engine/ShelfRows/ShelfRows';
import { useFirstSqueeze } from '../../engine/firstSqueeze';
import styles from './Shelf.module.scss';

/**
 * Luna's Squishy Shelf (PRG-5a), as on the round 2 Squishies board: an arched
 * cabinet with the kinds on planks, each in the rarest colour found and its
 * colour dots under it; one still to find is a greyed shape (easy) or a "?"
 * slot (hard), with no dots, and the top of the arch keeps a "?" for something special,
 * Pearl Moon once the shelf is full (PRG-4, PRG-5b). Beside it Luna, and what
 * the colours mean. A tap squishes a found
 * one and Luna says its line, or wobbles one still to find and she gives a
 * clue, never a round's answer.
 */
export const Shelf: React.FC<{ progress: UserProgress; onBack: () => void }> = ({ progress, onBack }) => {
  const [line, setLine] = useState(SHELF_LINES.hello);
  const [mood, setMood] = useState<LunaMood>('happy');
  const owned = progress.stickers;
  const newest = owned.length ? parseSquishy(owned[owned.length - 1])?.kind : undefined;
  const full = kindsFound(owned) >= SQUISHY_KINDS.length;

  const say = (text: string, m: LunaMood) => {
    setLine(text);
    setMood(m);
    soundManager.speak(text);
  };
  // a squishy, a "?" or the Pearl Moon speaks on its first squeeze; later
  // ones only squish (BUG-30). Luna herself says her line again every tap.
  const firstSqueeze = useFirstSqueeze();
  const sayOnce = (text: string, m: LunaMood) => firstSqueeze(text, () => say(text, m));

  return (
    <>
      <AppHeader back="library" onBack={onBack} title="Luna’s Squishy Shelf">
        <span data-shot="shelf-count">
          <Chip variant="count">
            {kindsFound(owned)} of {SQUISHY_KINDS.length}
          </Chip>
        </span>
      </AppHeader>
      <div className={styles.page} data-shot="shelf">
        {/* the arch reads its width from the box it fills (DES-26) */}
        <div className={styles.cabinetBox}>
          <PaperCard variant="lifted" className={styles.cabinet}>
            {/* the top of the arch: a "?" until the shelf is full, then Pearl Moon (PRG-5b) */}
            <span className={styles.top}>
              <PearlMoon
                found={full}
                onClick={() => (full ? sayOnce(SHELF_LINES.pearl, 'cheer') : sayOnce(SHELF_LINES.top, 'surprise'))}
              />
            </span>
            <ShelfRows
              owned={owned}
              size={96}
              picked={newest}
              dots
              onTap={(def, has) => (has ? sayOnce(def.line, 'cheer') : sayOnce(def.hint, 'think'))}
            />
          </PaperCard>
        </div>

        <aside className={styles.side}>
          <span className={styles.luna}>
            {/* as on the board: her line across the top, Luna under it */}
            <SpeechBubble tail="bottom">{line}</SpeechBubble>
            <Luna mood={mood} size={128} onClick={() => say(line, mood)} label={`Hear Ms. Luna: ${line}`} />
          </span>

          <PaperCard className={styles.legend}>
            <h3 className={styles.label}>Colours</h3>
            <span className={styles.group}>
              <strong>Usual</strong>
              <SquishyDots dots={['oat', 'cream', 'caramel', 'toffee', 'cocoa']} label="Usual colours" />
            </span>
            <span className={styles.group}>
              <strong className={styles.sparkled}>
                <Icon name="sparkle" size={16} filled /> Rare
              </strong>
              <SquishyDots dots={['blush', 'sage', 'sky', 'butter', 'lilac']} label="Rare colours" />
            </span>
            <span className={styles.group}>
              <strong className={styles.sparkled} data-variant="super">
                <Icon name="sparkle" size={16} filled /> Super rare
              </strong>
              <span className={styles.looks}>swirl · shimmer · glow</span>
            </span>
            <div className={styles.still}>
              <h3 className={styles.label}>Still to find</h3>
              <span className={styles.key}>
                <SquishyDots dots={['grey']} label="A usual colour" /> a usual colour
              </span>
              <span className={styles.key}>
                <SquishyDots dots={['?']} label="A rare colour" /> a rare colour
              </span>
              <span className={styles.key}>
                <span className={styles.ghostMark} aria-hidden="true" /> an easy one, coming soon
              </span>
              <span className={styles.key}>
                <span className={styles.slotMark} aria-hidden="true">?</span> a hard one, a mystery
              </span>
            </div>
          </PaperCard>
        </aside>
      </div>
    </>
  );
};
