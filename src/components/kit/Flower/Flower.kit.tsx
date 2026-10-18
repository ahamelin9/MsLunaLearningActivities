// Flower on the Kit page (DES-11): the three kinds, the three sizes, and a
// row growing one after another as on the Round board's won round (Grow
// again replays it).

import { useState } from 'react';
import { Specimen, Specimens } from '@/dev/KitPage/Specimen';
import { ChunkyButton } from '../ChunkyButton/ChunkyButton';
import { Flower, type FlowerKind } from './Flower';

const KINDS: FlowerKind[] = ['daisy', 'rose-red', 'rose-blush'];

export default function FlowerKit() {
  const [round, setRound] = useState(0);
  return (
    <>
      <Specimens title="Kinds, still, on a card as on the stage" on="card">
        {KINDS.map(kind => (
          <Specimen key={kind} label={kind}><Flower kind={kind} size="large" /></Specimen>
        ))}
      </Specimens>
      <Specimens title="Sizes" on="card">
        {(['small', 'medium', 'large'] as const).map(size => (
          <Specimen key={size} label={size}><Flower kind="daisy" size={size} /></Specimen>
        ))}
      </Specimens>
      <Specimens title="Growing, one step after another, then swaying" on="card">
        <Specimen label="steps 0, 2, 4" wide>
          <span key={round} data-shot="kit-flower-row">
            <Flower kind="daisy" grow step={0} />
            <Flower kind="rose-red" size="large" grow step={2} />
            <Flower kind="daisy" size="small" grow step={4} />
          </span>
        </Specimen>
        <Specimen label="replay"><ChunkyButton variant="quiet" icon="replay" onClick={() => setRound(r => r + 1)}>Grow again</ChunkyButton></Specimen>
      </Specimens>
    </>
  );
}
