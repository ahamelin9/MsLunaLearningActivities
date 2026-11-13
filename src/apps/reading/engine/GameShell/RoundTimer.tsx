// A round's countdown (CUR-16), at the end of the header beside Again. It
// keeps its own clock, so as it moves only the pie draws again, never the
// shell or the game under it (GAME-3). It starts with the round, while Luna
// still asks its question (CUR-18; Alex: "start right away and not after the
// owl is done talking"), and waits only while an answer is being said
// (`running` from the shell) and while the tab is hidden. Time is read from
// Date.now, so a check can move it (know-how, "Testing time").

import { useEffect, useRef, useState } from 'react';
import { CountdownPie } from '@/components/kit';
import { isReducedMotion } from '@/utils/motion';

/** How often the pie moves: smoothly, or once a second under reduced motion. */
const STEP_MS = 100;
const STEP_REDUCED_MS = 1000;

interface RoundTimerProps {
  /** the round's seconds (engine/timer.ts) */
  seconds: number;
  running: boolean;
  /** called once, as it runs out */
  onTimeUp: () => void;
}

export function RoundTimer({ seconds, running, onTimeUp }: RoundTimerProps) {
  const [left, setLeft] = useState(seconds * 1000);
  const leftRef = useRef(seconds * 1000);
  const over = useRef(false);
  const timeUp = useRef(onTimeUp);
  useEffect(() => {
    timeUp.current = onTimeUp;
  });

  useEffect(() => {
    if (!running || over.current) return;
    let last = Date.now();
    const id = window.setInterval(
      () => {
        const now = Date.now();
        // a hidden tab or a sleeping iPad doesn't count, as a play's time (PRG-6)
        if (!document.hidden) leftRef.current -= now - last;
        last = now;
        setLeft(Math.max(0, leftRef.current));
        if (leftRef.current <= 0) {
          over.current = true;
          window.clearInterval(id);
          timeUp.current();
        }
      },
      isReducedMotion() ? STEP_REDUCED_MS : STEP_MS
    );
    return () => window.clearInterval(id);
  }, [running]);

  return <CountdownPie left={left / 1000} total={seconds} />;
}
