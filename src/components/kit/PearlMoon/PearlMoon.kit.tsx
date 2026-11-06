// PearlMoon on the Kit page (PRG-5b): the "?" before the shelf is full, and her
// in the niche once it is. Tap: the "?" wobbles, she squishes.

import { Specimen, Specimens } from '@/dev/KitPage/Specimen';
import { PearlMoon } from './PearlMoon';

export default function PearlMoonKit() {
  return (
    <Specimens title="The top of the shelf's arch" on="card">
      <Specimen label="before the shelf is full"><PearlMoon found={false} /></Specimen>
      <Specimen label="a full shelf"><PearlMoon found /></Specimen>
    </Specimens>
  );
}
