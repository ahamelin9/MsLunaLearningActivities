import React, { useState } from 'react';
import type { UserProgress } from '@/types/user';
import { Chip, Luna, PaperCard, SpeechBubble, Squishy, SquishyDots, type LunaMood } from '@/components/kit';
import { AppHeader } from '@/components/os/AppHeader/AppHeader';
import { soundManager } from '@/utils/audio';
import { SHELF_LINES, SQUISHY_KINDS, kindsFound, parseSquishy } from '../../engine/squishies';
import { ShelfRows } from '../../engine/ShelfRows/ShelfRows';
import styles from './Shelf.module.scss';

/**
 * Luna's Squishy Shelf (PRG-5a), as on the round 2 Squishies board: an arched
 * cabinet with the kinds on planks, each in the rarest colour found and its
 * colour dots under it; one still to find is a greyed shape (easy) or a "?"
 * slot (hard), and the top of the arch keeps a "?" for something special
 * (PRG-4). Beside it Luna, and what the colours mean. A tap squishes a found
 * one and Luna says its line, or wobbles one still to find and she gives a
 * clue, never a round's answer.
 */
export const Shelf: React.FC<{ progress: UserProgress; onBack: () => void }> = ({ progress, onBack }) => {
  const [line, setLine] = useState(SHELF_LINES.hello);
  const [mood, setMood] = useState<LunaMood>('happy');
  const owned = progress.stickers;
  const newest = owned.length ? parseSquishy(owned[owned.length - 1])?.kind : undefined;

  const say = (text: string, m: LunaMood) => {
    setLine(text);
    setMood(m);
    soundManager.speak(text);
  };

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
            {/* the top of the arch: something special, once the shelf is full (PRG-4) */}
            <span className={styles.top}>
              <Squishy
                kind="moon"
                state="mystery"
                size={96}
                label="Something special"
                onClick={() => say(SHELF_LINES.top, 'surprise')}
              />
            </span>
            <ShelfRows
              owned={owned}
              size={96}
              picked={newest}
              dots
              onTap={(def, has) => (has ? say(def.line, 'cheer') : say(def.hint, 'think'))}
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
            <span className={styles.key}>
              <strong>Usual</strong>
              <SquishyDots dots={['oat', 'caramel', 'toffee', 'cream']} label="Usual colours" />
            </span>
            <span className={styles.key}>
              <strong>Rare</strong>
              <SquishyDots dots={['blush', 'butter']} label="Rare colours" />
            </span>
            <span className={styles.key}>
              <strong>Super rare</strong>
              <SquishyDots dots={['honey']} label="Super rare colour" />
            </span>
            <h3 className={styles.label}>Still to find</h3>
            <span className={styles.key}>
              <SquishyDots dots={['grey']} label="A usual colour" /> a usual colour
            </span>
            <span className={styles.key}>
              <SquishyDots dots={['?']} label="A rare colour" /> a rare colour
            </span>
          </PaperCard>
        </aside>
      </div>
    </>
  );
};
