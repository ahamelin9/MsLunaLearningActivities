// LessonCard on the Kit page (DES-7c): done, up next (before and after it's
// started), locked, and pressed. Tap a locked card to see it wobble.

import type { ReactNode } from 'react';
import { Specimen, Specimens } from '@/dev/KitPage/Specimen';
import { LessonCard } from './LessonCard';

// a library grid column is about this wide (six across at 1180)
const Column = ({ children }: { children: ReactNode }) => (
  <div style={{ display: 'grid', width: 'calc(var(--space-16) * 2.75)' }}>{children}</div>
);

export default function LessonCardKit() {
  return (
    <>
      <Specimens title="States, as on the Library board">
        <Specimen label="done"><Column><LessonCard number={1} title="Sounds for M, S, B & T" state="done" minutes={4} /></Column></Specimen>
        <Specimen label="up next"><Column><LessonCard number={2} title="Find A, M, S & B" state="next" minutes={5} /></Column></Specimen>
        <Specimen label="up next, started (2 of 4 rounds)"><Column><LessonCard number={2} title="Find A, M, S & B" state="next" minutes={5} rounds={{ done: 2, total: 4 }} /></Column></Specimen>
        <Specimen label="locked (tap it)"><Column><LessonCard number={3} title="Pet & Animal Words" state="locked" minutes={4} /></Column></Specimen>
      </Specimens>
      <Specimens title="Pressed">
        <Specimen label="done, pressed"><Column><LessonCard number={1} title="Sounds for M, S, B & T" state="done" minutes={4} data-state="pressed" /></Column></Specimen>
        <Specimen label="up next, pressed"><Column><LessonCard number={2} title="Find A, M, S & B" state="next" minutes={5} data-state="pressed" /></Column></Specimen>
        <Specimen label="locked, pressed: doesn't sink"><Column><LessonCard number={3} title="Pet & Animal Words" state="locked" minutes={4} data-state="pressed" /></Column></Specimen>
      </Specimens>
    </>
  );
}
