// CountdownPie on the Kit page (CUR-16): full, part-way and nearly empty, at
// 1st grade's 15 seconds, and one to run.

import { useEffect, useState } from 'react';
import { Specimen, Specimens } from '@/dev/KitPage/Specimen';
import { ChunkyButton } from '../ChunkyButton/ChunkyButton';
import { CountdownPie } from './CountdownPie';

const TOTAL = 15;
const STEP_MS = 100;

export default function CountdownPieKit() {
  const [left, setLeft] = useState(TOTAL);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => setLeft(l => Math.max(0, l - STEP_MS / 1000)), STEP_MS);
    return () => window.clearInterval(id);
  }, [running]);

  return (
    <>
      <Specimens title="seconds left, of 15">
        {[15, 11.5, 7.5, 3.2, 0.4].map(n => (
          <Specimen key={n} label={`${Math.ceil(n)} of 15`}>
            <span data-shot={`kit-pie-${Math.ceil(n)}`}>
              <CountdownPie left={n} total={TOTAL} />
            </span>
          </Specimen>
        ))}
      </Specimens>
      <Specimens title="on a phone: the label is 1.3×, so the ring is thinner (DES-32a)">
        <Specimen label="44 of 45">
          {/* index.html marks the whole page on a real phone; here one wrapper stands in */}
          <div data-device="phone">
            <span data-shot="kit-pie-phone">
              <CountdownPie left={44} total={45} />
            </span>
          </div>
        </Specimen>
      </Specimens>
      <Specimens title="Try it">
        <Specimen label={running ? 'running' : 'stopped'}>
          <CountdownPie left={left} total={TOTAL} />
        </Specimen>
        <Specimen label="start again">
          <ChunkyButton
            variant="quiet"
            icon="replay"
            onClick={() => {
              setLeft(TOTAL);
              setRunning(true);
            }}
          >
            Start
          </ChunkyButton>
        </Specimen>
      </Specimens>
    </>
  );
}
