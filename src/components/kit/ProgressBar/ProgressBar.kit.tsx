// ProgressBar on the Kit page (DES-7c): the lessons and rounds sizes, empty to
// full, and one to step through (the fill grows with a soft spring).

import { useState } from 'react';
import { Specimen, Specimens } from '@/dev/KitPage/Specimen';
import { ChunkyButton } from '../ChunkyButton/ChunkyButton';
import { ProgressBar } from './ProgressBar';

export default function ProgressBarKit() {
  const [done, setDone] = useState(1);
  return (
    <>
      <Specimens title="lessons (from the data: 6 here)">
        {[0, 1, 3, 6].map(n => (
          <Specimen key={n} label={`${n} of 6`} wide><ProgressBar done={n} total={6} /></Specimen>
        ))}
      </Specimens>
      <Specimens title="rounds (a lesson's top bar: 4 here)">
        {[0, 1, 3, 4].map(n => (
          <Specimen key={n} label={`${n} of 4`} wide><ProgressBar size="rounds" done={n} total={4} /></Specimen>
        ))}
      </Specimens>
      <Specimens title="Try it">
        <Specimen label={`${done} of 5`} wide><ProgressBar done={done} total={5} /></Specimen>
        <Specimen label="one more">
          <ChunkyButton variant="quiet" icon="replay" onClick={() => setDone(d => (d + 1) % 6)}>One more</ChunkyButton>
        </Specimen>
      </Specimens>
    </>
  );
}
