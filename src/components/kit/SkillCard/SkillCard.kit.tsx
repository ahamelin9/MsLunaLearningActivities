// SkillCard on the Kit page (CUR-7): done, up next, started and waiting, each
// shut and open, and pressed.

import type { ReactNode } from 'react';
import { Specimen, Specimens } from '@/dev/KitPage/Specimen';
import { SkillCard } from './SkillCard';

// a library grid column is about this wide (six across at 1180)
const Column = ({ children }: { children: ReactNode }) => (
  <div style={{ display: 'grid', width: 'calc(var(--space-16) * 2.75)' }}>{children}</div>
);

export default function SkillCardKit() {
  return (
    <>
      <Specimens title="States, shut">
        <Specimen label="done"><Column><SkillCard icon="🔍" name="Letter shapes" done={3} total={3} state="done" open={false} /></Column></Specimen>
        <Specimen label="up next"><Column><SkillCard icon="⚡" name="Sight words" done={1} total={4} state="next" open={false} /></Column></Specimen>
        <Specimen label="started"><Column><SkillCard icon="👂" name="Letter sounds" done={2} total={5} state="started" open={false} /></Column></Specimen>
        <Specimen label="waiting"><Column><SkillCard icon="🎵" name="Rhymes" done={0} total={2} state="waiting" open={false} /></Column></Specimen>
      </Specimens>
      <Specimens title="Open: its lessons are the ones showing">
        <Specimen label="up next, open"><Column><SkillCard icon="⚡" name="Sight words" done={1} total={4} state="next" open /></Column></Specimen>
        <Specimen label="started, open"><Column><SkillCard icon="👂" name="Letter sounds" done={2} total={5} state="started" open /></Column></Specimen>
        <Specimen label="done, open"><Column><SkillCard icon="🔍" name="Letter shapes" done={3} total={3} state="done" open /></Column></Specimen>
        <Specimen label="waiting, open"><Column><SkillCard icon="🎵" name="Rhymes" done={0} total={2} state="waiting" open /></Column></Specimen>
      </Specimens>
      <Specimens title="Pressed">
        <Specimen label="started, pressed"><Column><SkillCard icon="👂" name="Letter sounds" done={2} total={5} state="started" open={false} data-state="pressed" /></Column></Specimen>
        <Specimen label="up next, pressed"><Column><SkillCard icon="⚡" name="Sight words" done={1} total={4} state="next" open={false} data-state="pressed" /></Column></Specimen>
      </Specimens>
    </>
  );
}
