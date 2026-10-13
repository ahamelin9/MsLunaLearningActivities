// PaperCard on the Kit page (DES-7a): the three heights, and the done screen's
// dashed panel for a new reward (DES-22d).

import { Specimen, Specimens } from '@/dev/KitPage/Specimen';
import { PaperCard } from './PaperCard';

const HEIGHTS = [
  { variant: 'flat', says: 'Wells and tracks' },
  { variant: 'card', says: 'Cards, tiles, panels, bubbles' },
  { variant: 'lifted', says: 'Modals and the lesson-done panel' },
  { variant: 'reward', says: 'A new reward on the done screen' },
] as const;

export default function PaperCardKit() {
  return (
    <Specimens title="Heights, and the reward panel">
      {HEIGHTS.map(h => (
        <Specimen key={h.variant} label={h.variant} wide>
          <PaperCard variant={h.variant} style={{ flex: 1 }}>{h.says}</PaperCard>
        </Specimen>
      ))}
    </Specimens>
  );
}
