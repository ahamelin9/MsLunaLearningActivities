// Petals on the Kit page (DES-11): falling at once (a won round) and delayed
// (the done screen), each in a box of its own as a screen would hold them.
// They fall once; Drop again replays them. Their seven colours are on the
// Tokens tab, under the illustration palette.

import { useState } from 'react';
import { Specimen, Specimens } from '@/dev/KitPage/Specimen';
import { ChunkyButton } from '../ChunkyButton/ChunkyButton';
import { Petals } from './Petals';

export default function PetalsKit() {
  const [round, setRound] = useState(0);
  return (
    <Specimens title="Falling (they fall once; Drop again replays them)" on="card">
      <Specimen label="at once: a won round" frame><Petals key={round} /></Specimen>
      <Specimen label="delayed: the done screen" frame><Petals key={round} delayed /></Specimen>
      <Specimen label="replay"><ChunkyButton variant="quiet" icon="replay" onClick={() => setRound(r => r + 1)}>Drop again</ChunkyButton></Specimen>
    </Specimens>
  );
}
