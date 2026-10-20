// Luna's squishies (PRG-5a): the collectible a finished lesson or game puts on
// the shelf, in place of the sticker tin. Alex's calls (2026-10-19): the kit's
// 8 kinds for now (more with PRG-5b); each kind in 3 colours, its own usual
// one, a rare tint and the super-rare honey; the count is kinds found; old
// stickers become squishies so no child's count drops; odds below, in one
// place. Drawn by the kit's Squishy (components/kit/Squishy).

import type { SquishyColour, SquishyKind } from '@/components/kit';

export interface SquishyKindDef {
  kind: SquishyKind;
  name: string;
  /** the colour it usually comes in, then its rare tint; every kind can come in super-rare honey */
  usual: SquishyColour;
  rare: SquishyColour;
  /** Luna's line when it's won or squeezed on the shelf (pre-rendered) */
  line: string;
  /** what Luna says when it's tapped still to find: a clue, never a round's answer */
  hint: string;
  /** still to find, a hard one shows as a "?" slot, an easy one as a greyed shape (the Squishies board) */
  hard?: boolean;
}

export const SQUISHY_KINDS: SquishyKindDef[] = [
  { kind: 'ball', name: 'Squish Ball', usual: 'oat', rare: 'blush', line: 'A squish ball! Squeeze it and it pops right back.', hint: 'This one is round, and it bounces back.' },
  { kind: 'cat', name: 'Mochi Cat', usual: 'caramel', rare: 'butter', line: 'Mochi Cat is here. Purr, purr!', hint: 'This one has pointy ears and whiskers.' },
  { kind: 'bunny', name: 'Bunny', usual: 'cream', rare: 'blush', line: 'A soft little bunny. Hop, hop!', hint: 'This one has long ears.' },
  { kind: 'bear', name: 'Bear', usual: 'toffee', rare: 'butter', line: 'A cuddly bear for your shelf.', hint: 'This one likes honey.' },
  { kind: 'butter', name: 'Butter Block', usual: 'cream', rare: 'butter', line: 'A butter block! It is squishy, not for toast.', hint: 'This one looks like something you put on toast.', hard: true },
  { kind: 'peach', name: 'Peach', usual: 'oat', rare: 'blush', line: 'A little peach with a leaf on top.', hint: 'This one is a fruit with a leaf.' },
  { kind: 'cloud', name: 'Cloud', usual: 'cream', rare: 'blush', line: 'A fluffy cloud. So soft!', hint: 'This one floats in the sky.' },
  { kind: 'moon', name: 'Little Moon', usual: 'oat', rare: 'butter', line: 'A little moon! It glows at bedtime.', hint: 'This one comes out at night.', hard: true }
];

/** What Luna says on the shelf (pre-rendered; scripts/voice/inventory.ts). */
export const SHELF_LINES = {
  hello: 'Tap a squishy to give it a squeeze!',
  top: 'Something special will live up here, once your shelf is full.',
  /** the play that puts the last kind on the shelf (PRG-4) */
  full: 'You found every squishy! There is a secret trophy waiting for you.'
};

/** The super-rare colour, for every kind (PRG-5b adds swirl, shimmer and glow). */
export const SUPER_RARE: SquishyColour = 'honey';

/** How often a squishy comes in its rare tint, and in super-rare honey (Alex OKed, 2026-10-19). */
export const ODDS = { rare: 1 / 8, superRare: 1 / 40 } as const;

export type Rarity = 'usual' | 'rare' | 'super-rare';

export interface SquishyAward {
  /** how it's saved: "kind:colour" */
  id: string;
  kind: SquishyKind;
  colour: SquishyColour;
  rarity: Rarity;
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
  return { id: squishyId(def.kind, colour), kind: def.kind, colour, rarity: rarityOf(def.kind, colour), name: def.name, line: def.line };
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
 * Old saves (PRG-5a): each of the 18 stickers becomes a squishy, the kinds'
 * usual colours first, then their rare tints, then honey, so a child's count
 * never drops (Alex OKed, 2026-10-19).
 */
const OLD_STICKERS = [
  'magnifier', 'jar', 'bubble', 'cookie', 'cards', 'quill', 'lamp', 'headphones',
  'chest', 'basket', 'book', 'moon', 'star', 'leaf', 'cat', 'rainbow', 'cupcake', 'crown'
];
const UPGRADE: string[] = [
  ...SQUISHY_KINDS.map(k => squishyId(k.kind, k.usual)),
  ...SQUISHY_KINDS.map(k => squishyId(k.kind, k.rare)),
  ...SQUISHY_KINDS.map(k => squishyId(k.kind, SUPER_RARE))
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
