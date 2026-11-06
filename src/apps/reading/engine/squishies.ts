// Luna's squishies (PRG-5a, PRG-5b): the collectible a finished lesson or game
// puts on the shelf, in place of the sticker tin. Alex's calls (2026-10-19,
// 2026-11-06): the board's 18 kinds, in its order; each kind in 3 colours, its
// own usual one, a rare tint and its super-rare look; the count is kinds found;
// old stickers become squishies so no child's count drops; odds below, in one
// place. Drawn by the kit's Squishy (components/kit/Squishy).

import type { SquishyColour, SquishyKind, SquishyLook } from '@/components/kit';
import { SQUISHY_LOOKS } from '../../../components/kit/Squishy/looks';

export interface SquishyKindDef {
  kind: SquishyKind;
  name: string;
  /** the colour it usually comes in, then its rare tint; every kind can also come super rare, in its look */
  usual: SquishyColour;
  rare: SquishyColour;
  /** Luna's line when it's won or squeezed on the shelf (pre-rendered) */
  line: string;
  /** what Luna says when it's tapped still to find: a clue, never a round's answer */
  hint: string;
  /** still to find, a hard one shows as a "?" slot, an easy one as a greyed shape (the Squishies board) */
  hard?: boolean;
}

/** In the Squishies board's order, six to a plank. */
export const SQUISHY_KINDS: SquishyKindDef[] = [
  { kind: 'ball', name: 'Squish Ball', usual: 'oat', rare: 'blush', line: 'A squish ball! Squeeze it and it pops right back.', hint: 'This one is round, and it bounces back.' },
  { kind: 'cat', name: 'Mochi Cat', usual: 'caramel', rare: 'butter', line: 'Mochi Cat is here. Purr, purr!', hint: 'This one has pointy ears and whiskers.' },
  { kind: 'butter', name: 'Butter Block', usual: 'cream', rare: 'butter', line: 'A butter block! It is squishy, not for toast.', hint: 'This one looks like something you put on toast.', hard: true },
  { kind: 'peach', name: 'Peach', usual: 'oat', rare: 'blush', line: 'A little peach with a leaf on top.', hint: 'This one is a fruit with a leaf.' },
  { kind: 'frog', name: 'Frog', usual: 'oat', rare: 'sage', line: 'A little frog! Ribbit, ribbit!', hint: 'This one hops and says ribbit.' },
  { kind: 'donut', name: 'Donut', usual: 'caramel', rare: 'blush', line: 'A soft donut with a hole in the middle.', hint: 'This one is round, with a hole in the middle.' },

  { kind: 'cloud', name: 'Cloud', usual: 'cream', rare: 'blush', line: 'A fluffy cloud. So soft!', hint: 'This one floats in the sky.' },
  { kind: 'moon', name: 'Little Moon', usual: 'oat', rare: 'butter', line: 'A little moon! It glows at bedtime.', hint: 'This one comes out at night.', hard: true },
  { kind: 'bear', name: 'Bear', usual: 'toffee', rare: 'butter', line: 'A cuddly bear for your shelf.', hint: 'This one likes honey.' },
  { kind: 'bunny', name: 'Bunny', usual: 'cream', rare: 'blush', line: 'A soft little bunny. Hop, hop!', hint: 'This one has long ears.' },
  { kind: 'mushroom', name: 'Mushroom', usual: 'toffee', rare: 'blush', line: 'A little mushroom. It pops up after the rain!', hint: 'This one grows in the forest, under the trees.' },
  { kind: 'toast', name: 'Toast', usual: 'caramel', rare: 'butter', line: 'Warm toast, just for you!', hint: 'This one is bread, and it pops up in the morning.', hard: true },

  { kind: 'dumpling', name: 'Dumpling', usual: 'cream', rare: 'butter', line: 'A warm little dumpling. Soft and squishy!', hint: 'This one is a soft food, folded on top.' },
  { kind: 'acorn', name: 'Acorn', usual: 'caramel', rare: 'sage', line: 'A little acorn. A big tree could grow from it!', hint: 'A squirrel would love this one.', hard: true },
  { kind: 'hamster', name: 'Hamster', usual: 'oat', rare: 'butter', line: 'A little hamster with big, round cheeks.', hint: 'This one has round cheeks and a tiny nose.' },
  { kind: 'heart', name: 'Heart', usual: 'cocoa', rare: 'blush', line: 'A big heart, full of love!', hint: 'This one means love.' },
  { kind: 'star', name: 'Star', usual: 'cream', rare: 'lilac', line: 'A little star! It twinkles all night.', hint: 'This one shines in the night sky.', hard: true },
  { kind: 'penguin', name: 'Penguin', usual: 'cocoa', rare: 'sky', line: 'A little penguin! It waddles on the ice.', hint: 'This one is a bird that swims, but it can’t fly.', hard: true }
];

/** What Luna says on the shelf (pre-rendered; scripts/voice/inventory.ts). */
export const SHELF_LINES = {
  hello: 'Tap a squishy to give it a squeeze!',
  top: 'Something special will live up here, once your shelf is full.',
  /** the play that puts the last kind on the shelf (PRG-4) */
  full: 'You found every squishy! There is a secret trophy waiting for you.',
  /** Pearl Moon, tapped at the top of a full shelf (PRG-5b) */
  pearl: 'You found me! I’m Pearl Moon, the rarest of them all.'
};

/**
 * How a super-rare squishy is saved, for every kind. It's drawn in that kind's
 * look (swirl, shimmer or glow: the kit's looks.ts), so saves from before
 * PRG-5b stay good and just wear the look.
 */
export const SUPER_RARE: SquishyColour = 'honey';

/** The look a kind wears when it's super rare. */
export const lookOf = (kind: SquishyKind): SquishyLook => SQUISHY_LOOKS[kind].look;

/** How often a squishy comes in its rare tint, and in super-rare honey (Alex OKed, 2026-10-19). */
export const ODDS = { rare: 1 / 8, superRare: 1 / 40 } as const;

export type Rarity = 'usual' | 'rare' | 'super-rare';

export interface SquishyAward {
  /** how it's saved: "kind:colour" */
  id: string;
  kind: SquishyKind;
  colour: SquishyColour;
  rarity: Rarity;
  /** the look it wears if it's super rare */
  look: SquishyLook;
  name: string;
  line: string;
}

export const squishyId = (kind: SquishyKind, colour: SquishyColour) => `${kind}:${colour}`;
export const kindDef = (kind: SquishyKind) => SQUISHY_KINDS.find(k => k.kind === kind)!;

/** A kind's 3 colours, usual first, as on the shelf's dots. */
export const coloursOf = (kind: SquishyKind): [SquishyColour, SquishyColour, SquishyColour] => {
  const def = kindDef(kind);
  return [def.usual, def.rare, SUPER_RARE];
};

const rarityOf = (kind: SquishyKind, colour: SquishyColour): Rarity =>
  colour === SUPER_RARE ? 'super-rare' : colour === kindDef(kind).rare ? 'rare' : 'usual';

/** Parse a saved id; anything that isn't one (an old sticker id) is null. */
export function parseSquishy(id: string): { kind: SquishyKind; colour: SquishyColour } | null {
  const [kind, colour] = id.split(':');
  const def = SQUISHY_KINDS.find(k => k.kind === kind);
  if (!def || !coloursOf(def.kind).includes(colour as SquishyColour)) return null;
  return { kind: def.kind, colour: colour as SquishyColour };
}

/**
 * The squishy a finished lesson or game puts on the shelf. Its own signature
 * kind first, while none of that kind is on the shelf; then a kind still to
 * find; then any kind. The colour by the odds.
 */
export function nextSquishy(owned: string[], signature: SquishyKind | undefined, rand: () => number = Math.random): SquishyAward {
  const kindsOwned = new Set(owned.map(parseSquishy).filter(Boolean).map(s => s!.kind));
  const toFind = SQUISHY_KINDS.filter(k => !kindsOwned.has(k.kind));
  const def =
    signature && !kindsOwned.has(signature)
      ? kindDef(signature)
      : toFind.length
        ? toFind[Math.floor(rand() * toFind.length)]
        : SQUISHY_KINDS[Math.floor(rand() * SQUISHY_KINDS.length)];
  const roll = rand();
  const colour = roll < ODDS.superRare ? SUPER_RARE : roll < ODDS.superRare + ODDS.rare ? def.rare : def.usual;
  return { id: squishyId(def.kind, colour), kind: def.kind, colour, rarity: rarityOf(def.kind, colour), look: lookOf(def.kind), name: def.name, line: def.line };
}

/** What a lesson's or game's signature reward (its `sticker`) brings first. */
export const SIGNATURE_KIND: Record<string, SquishyKind> = {
  bubble: 'ball',
  jar: 'butter',
  cookie: 'bear',
  cards: 'cat',
  quill: 'bunny',
  lamp: 'moon',
  chest: 'peach',
  book: 'cloud',
  headphones: 'bunny',
  magnifier: 'cat'
};

/**
 * Old saves (PRG-5a): each of the 18 stickers becomes a squishy, the first 8
 * kinds' usual colours first, then their rare tints, then honey, so a child's
 * count never drops (Alex OKed, 2026-10-19). Those 8 stay written out, not the
 * whole list, so a save still loads as it always has: with PRG-5b's 18 kinds, 18
 * stickers would otherwise fill the shelf at once.
 */
const FIRST_KINDS: SquishyKind[] = ['ball', 'cat', 'bunny', 'bear', 'butter', 'peach', 'cloud', 'moon'];
const OLD_STICKERS = [
  'magnifier', 'jar', 'bubble', 'cookie', 'cards', 'quill', 'lamp', 'headphones',
  'chest', 'basket', 'book', 'moon', 'star', 'leaf', 'cat', 'rainbow', 'cupcake', 'crown'
];
const UPGRADE: string[] = [
  ...FIRST_KINDS.map(k => squishyId(k, kindDef(k).usual)),
  ...FIRST_KINDS.map(k => squishyId(k, kindDef(k).rare)),
  ...FIRST_KINDS.map(k => squishyId(k, SUPER_RARE))
];

/** A saved collection with its old sticker ids turned into squishies, in order, none twice. */
export function upgradeStickers(saved: string[]): string[] {
  const out: string[] = [];
  for (const id of saved) {
    const squishy = parseSquishy(id) ? id : UPGRADE[OLD_STICKERS.indexOf(id)];
    // an old sticker whose squishy is already there takes the next free one
    const next = squishy && !out.includes(squishy) ? squishy : UPGRADE.find(u => !out.includes(u) && !saved.includes(u));
    if (next && !out.includes(next)) out.push(next);
  }
  return out;
}

/** The shelf's count: kinds found. */
export const kindsFound = (owned: string[]) => new Set(owned.map(parseSquishy).filter(Boolean).map(s => s!.kind)).size;
