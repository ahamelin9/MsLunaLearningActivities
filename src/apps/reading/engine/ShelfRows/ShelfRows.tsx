import React from 'react';
import { Chip, Squishy, SquishyDots, type SquishyColour } from '@/components/kit';
import { SQUISHY_KINDS, SUPER_RARE, coloursOf, type SquishyKindDef } from '../squishies';
import type { SquishyKind } from '@/components/kit';
import styles from './ShelfRows.module.scss';

/** The kinds four to a plank, as on the Squishies board. */
const ROWS = [SQUISHY_KINDS.slice(0, 4), SQUISHY_KINDS.slice(4)];

interface ShelfRowsProps {
  /** the squishies on the shelf, as saved ("kind:colour") */
  owned: string[];
  size: 64 | 96;
  /** the kind that wears "New" */
  picked?: SquishyKind;
  /** each kind's colour dots under it, found and still to find (the shelf page) */
  dots?: boolean;
  /** a squishy tapped: a found one squishes, one still to find wobbles */
  onTap: (def: SquishyKindDef, found: boolean) => void;
}

/**
 * The squishy shelf's planks (PRG-5a): each kind once, in the rarest colour
 * found; one still to find is a greyed shape, or a "?" slot when it's a hard
 * one. Luna's Squishy Shelf shows them big with their colour dots, and a
 * game's done screen small (PRG-9).
 */
export const ShelfRows: React.FC<ShelfRowsProps> = ({ owned, size, picked, dots = false, onTap }) => {
  /** the colours of a kind found, and the one it shows: the rarest */
  const found = (def: SquishyKindDef) => coloursOf(def.kind).filter(c => owned.includes(`${def.kind}:${c}`));
  const shown = (def: SquishyKindDef, colours: SquishyColour[]): SquishyColour =>
    colours.includes(SUPER_RARE) ? SUPER_RARE : colours.includes(def.rare) ? def.rare : def.usual;

  return (
    <>
      {ROWS.map((row, r) => (
        <div key={r} className={styles.row}>
          <div className={styles.kinds}>
            {row.map(def => {
              const colours = found(def);
              const has = colours.length > 0;
              return (
                <span key={def.kind} className={styles.kind} data-size={size} data-shot="shelf-kind">
                  {has && picked === def.kind && (
                    <Chip variant="accent" className={styles.new}>
                      New
                    </Chip>
                  )}
                  <Squishy
                    kind={def.kind}
                    colour={has ? shown(def, colours) : undefined}
                    state={has ? 'found' : def.hard ? 'mystery' : 'ghost'}
                    size={size}
                    onClick={() => onTap(def, has)}
                  />
                  {dots && (
                    <SquishyDots
                      dots={coloursOf(def.kind).map((c, i) => (colours.includes(c) ? c : i === 0 ? 'grey' : '?'))}
                      label={`${def.name}: ${colours.length} of 3 colours found`}
                    />
                  )}
                </span>
              );
            })}
          </div>
          <span className={styles.plank} aria-hidden="true" />
        </div>
      ))}
    </>
  );
};
