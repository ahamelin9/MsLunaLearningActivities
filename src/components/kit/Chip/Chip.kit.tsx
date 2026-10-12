// Chip on the Kit page (DES-7a, DES-7c): the variants on the ground and on a
// card (where they sit on the boards), the rarity tags with their shimmer, and
// the TimeChip preset, on a card and on a well (a locked lesson).

import { Specimen, Specimens } from '@/dev/KitPage/Specimen';
import { Chip, TimeChip } from './Chip';

export default function ChipKit() {
  return (
    <>
      {([undefined, 'card'] as const).map(on => (
        <Specimens key={on ?? 'ground'} title={on ? 'Variants, on a card' : 'Variants'} on={on}>
          <Specimen label="time"><Chip icon="clock">about 5 min</Chip></Specimen>
          <Specimen label="took"><Chip variant="took" icon="check">took 4 min</Chip></Specimen>
          <Specimen label="accent"><Chip variant="accent">Up next</Chip></Specimen>
          <Specimen label="accent, with an icon"><Chip variant="accent" icon="clock">12 min today</Chip></Specimen>
          <Specimen label="count"><Chip variant="count" icon="star">9</Chip></Specimen>
        </Specimens>
      ))}
      <Specimens title="Rarity tags (a squishy's colour)" on="card">
        <Specimen label="usual (time)"><Chip>oat</Chip></Specimen>
        <Specimen label="rare"><Chip variant="rare" icon="sparkle">Rare · blush</Chip></Specimen>
        <Specimen label="super-rare"><Chip variant="super-rare" icon="sparkle">Super rare · honey</Chip></Specimen>
        <Specimen label="rare, shimmer"><Chip variant="rare" icon="sparkle" shimmer>Rare colour: blush!</Chip></Specimen>
        <Specimen label="super-rare, shimmer"><Chip variant="super-rare" icon="sparkle" shimmer>Super rare!</Chip></Specimen>
      </Specimens>
      <Specimens title="TimeChip, on a card" on="card">
        <Specimen label="minutes={5}"><TimeChip minutes={5} /></Specimen>
        <Specimen label="minutes={5} highlight"><TimeChip minutes={5} highlight /></Specimen>
        <Specimen label="minutes={4} took"><TimeChip minutes={4} took /></Specimen>
      </Specimens>
      <Specimens title="TimeChip, on a well (a locked lesson)" on="well">
        <Specimen label="ground=well"><TimeChip minutes={4} ground="well" /></Specimen>
        <Specimen label="without ground: lost on the well"><TimeChip minutes={4} /></Specimen>
      </Specimens>
    </>
  );
}
