// Chip on the Kit page (DES-7a): the four variants on the ground and on a card
// (where they sit on the boards), and the TimeChip preset.

import { Specimen, Specimens } from '@/dev/KitPage/Specimen';
import { Chip, TimeChip } from './Chip';

export default function ChipKit() {
  return (
    <>
      {[false, true].map(onCard => (
        <Specimens key={String(onCard)} title={onCard ? 'Variants, on a card' : 'Variants'} onCard={onCard}>
          <Specimen label="time"><Chip icon="clock">about 5 min</Chip></Specimen>
          <Specimen label="took"><Chip variant="took" icon="check">took 4 min</Chip></Specimen>
          <Specimen label="accent"><Chip variant="accent">Up next</Chip></Specimen>
          <Specimen label="accent, with an icon"><Chip variant="accent" icon="clock">12 min today</Chip></Specimen>
          <Specimen label="count"><Chip variant="count" icon="star">9</Chip></Specimen>
        </Specimens>
      ))}
      <Specimens title="TimeChip" onCard>
        <Specimen label="minutes={5}"><TimeChip minutes={5} /></Specimen>
        <Specimen label="minutes={5} highlight"><TimeChip minutes={5} highlight /></Specimen>
        <Specimen label="minutes={4} took"><TimeChip minutes={4} took /></Specimen>
      </Specimens>
    </>
  );
}
