// Squishy on the Kit page (DES-7c): the eight kinds, the colours (usual, rare,
// super rare), ghost and "?" slot, the sizes, and the colour dots, on a card
// as on the shelf. Tap one: a found squishy squishes, the others wobble.

import { Specimen, Specimens } from '@/dev/KitPage/Specimen';
import { Chip } from '../Chip/Chip';
import { Squishy, SquishyDots, type SquishyColour, type SquishyKind } from './Squishy';

const KINDS: [SquishyKind, SquishyColour][] = [
  ['ball', 'oat'], ['cat', 'caramel'], ['bunny', 'blush'], ['bear', 'toffee'],
  ['butter', 'butter'], ['peach', 'blush'], ['cloud', 'cream'], ['moon', 'honey'],
];
const COLOURS: SquishyColour[] = ['oat', 'caramel', 'toffee', 'cream', 'blush', 'butter', 'honey'];

export default function SquishyKit() {
  return (
    <>
      <Specimens title="The kinds (tap one to squish it)" on="card">
        {KINDS.map(([kind, colour]) => (
          <Specimen key={kind} label={`${kind} · ${colour}`}><Squishy kind={kind} colour={colour} /></Specimen>
        ))}
      </Specimens>
      <Specimens title="Colours: usual, rare (a sparkle), super rare (a gold sparkle)" on="card">
        {COLOURS.map(c => (
          <Specimen key={c} label={c}><Squishy kind="bear" colour={c} /></Specimen>
        ))}
      </Specimens>
      <Specimens title="Not found yet" on="card">
        <Specimen label="ghost: bear"><Squishy kind="bear" state="ghost" /></Specimen>
        <Specimen label="ghost: moon"><Squishy kind="moon" state="ghost" /></Specimen>
        <Specimen label="ghost: cloud"><Squishy kind="cloud" state="ghost" /></Specimen>
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
