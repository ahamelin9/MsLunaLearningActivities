// StarRow on the Kit page (DES-7b): 0 to 3 stars at both sizes, and the
// stars landing (Land again replays it).

import { useState } from 'react';
import { Specimen, Specimens } from '@/dev/KitPage/Specimen';
import { ChunkyButton } from '../ChunkyButton/ChunkyButton';
import { StarRow } from './StarRow';

export default function StarRowKit() {
  const [round, setRound] = useState(0);
  return (
    <>
      {([48, 24] as const).map(size => (
        <Specimens key={size} title={`Earned · ${size}, on a card as on the Done board`} onCard>
          {([0, 1, 2, 3] as const).map(n => (
            <Specimen key={n} label={`${n} of 3`}><StarRow earned={n} size={size} /></Specimen>
          ))}
        </Specimens>
      ))}
      <Specimens title="Landing" onCard>
        <Specimen label="3 of 3, animate"><StarRow key={round} earned={3} animate /></Specimen>
        <Specimen label="2 of 3, animate"><StarRow key={round} earned={2} animate /></Specimen>
        <Specimen label="replay"><ChunkyButton variant="quiet" icon="replay" onClick={() => setRound(r => r + 1)}>Land again</ChunkyButton></Specimen>
      </Specimens>
    </>
  );
}
