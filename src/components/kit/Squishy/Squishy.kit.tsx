// Squishy on the Kit page (DES-7c, PRG-5b): the 18 kinds, the colours (usual,
// rare), the super-rare looks, still and moving, ghost and "?" slot, the sizes,
// and the colour dots, on a card as on the shelf. Tap one: a found squishy
// squishes, the others wobble.

import { Specimen, Specimens } from '@/dev/KitPage/Specimen';
import { Chip } from '../Chip/Chip';
import { Squishy, SquishyDots, type SquishyColour, type SquishyKind } from './Squishy';

const KINDS: [SquishyKind, SquishyColour][] = [
  ['ball', 'oat'], ['cat', 'caramel'], ['butter', 'cream'], ['peach', 'oat'], ['frog', 'oat'], ['donut', 'caramel'],
  ['cloud', 'cream'], ['moon', 'oat'], ['bear', 'toffee'], ['bunny', 'cream'], ['mushroom', 'toffee'], ['toast', 'caramel'],
  ['dumpling', 'cream'], ['acorn', 'caramel'], ['hamster', 'oat'], ['heart', 'cocoa'], ['star', 'cream'], ['penguin', 'cocoa'],
];
const COLOURS: SquishyColour[] = ['oat', 'caramel', 'toffee', 'cream', 'cocoa', 'blush', 'butter', 'sage', 'sky', 'lilac'];
const GHOSTS: SquishyKind[] = ['frog', 'donut', 'mushroom', 'dumpling', 'hamster', 'heart', 'bear', 'moon', 'cloud'];

export default function SquishyKit() {
  return (
    <>
      <Specimens title="The kinds (tap one to squish it)" on="card">
        {KINDS.map(([kind, colour]) => (
          <Specimen key={kind} label={`${kind} · ${colour}`}><Squishy kind={kind} colour={colour} /></Specimen>
        ))}
      </Specimens>
      <Specimens title="Colours: usual, rare (a sparkle)" on="card">
        {COLOURS.map(c => (
          <Specimen key={c} label={c}><Squishy kind="bear" colour={c} /></Specimen>
        ))}
      </Specimens>
      <Specimens title="Super rare (a gold sparkle): each kind wears one look" on="card">
        <Specimen label="swirl, moving"><Squishy kind="moon" colour="honey" /></Specimen>
        <Specimen label="shimmer, moving"><Squishy kind="cloud" colour="honey" /></Specimen>
        <Specimen label="glow, moving"><Squishy kind="heart" colour="honey" /></Specimen>
        <Specimen label="swirl, still"><Squishy kind="ball" colour="honey" /></Specimen>
        <Specimen label="shimmer, still"><Squishy kind="donut" colour="honey" /></Specimen>
        <Specimen label="glow, still"><Squishy kind="bear" colour="honey" /></Specimen>
      </Specimens>
      <Specimens title="Not found yet" on="card">
        {GHOSTS.map(kind => (
          <Specimen key={kind} label={`ghost: ${kind}`}><Squishy kind={kind} state="ghost" /></Specimen>
        ))}
        <Specimen label="mystery: the ? slot"><Squishy kind="ball" state="mystery" /></Specimen>
      </Specimens>
      <Specimens title="Sizes" on="card">
        {([64, 96, 128] as const).map(s => (
          <Specimen key={s} label={String(s)}><Squishy kind="cat" colour="caramel" size={s} /></Specimen>
        ))}
        <Specimen label="64, the ? slot"><Squishy kind="ball" state="mystery" size={64} /></Specimen>
      </Specimens>
      <Specimens title="Colour dots, and the rarity tag (a Chip)" on="card">
        <Specimen label="oat found, rare and super still to find">
          <SquishyDots dots={['oat', '?', '?']} label="Colours: oat found, rare and super rare still to find" />
        </Specimen>
        <Specimen label="usual still to find, blush found">
          <SquishyDots dots={['grey', 'blush', '?']} label="Colours: usual still to find, rare blush found, super rare still to find" />
        </Specimen>
        <Specimen label="every colour">
          <SquishyDots dots={['oat', 'cream', 'caramel', 'toffee', 'cocoa', 'blush', 'sage', 'sky', 'butter', 'lilac', 'honey']} label="Every colour" />
        </Specimen>
        <Specimen label="tag, shimmering"><Chip variant="rare" icon="sparkle" shimmer>Rare colour: blush!</Chip></Specimen>
      </Specimens>
    </>
  );
}
