// PaperCard on the Kit page (DES-7a): the three heights.

import { Specimen, Specimens } from '@/dev/KitPage/Specimen';
import { PaperCard } from './PaperCard';

const HEIGHTS = [
  { variant: 'flat', says: 'Wells, tracks, a dashed panel' },
  { variant: 'card', says: 'Cards, tiles, panels, bubbles' },
  { variant: 'lifted', says: 'Modals and the lesson-done panel' },
] as const;

export default function PaperCardKit() {
  return (
    <Specimens title="Heights">
      {HEIGHTS.map(h => (
        <Specimen key={h.variant} label={h.variant} wide>
          <PaperCard variant={h.variant} style={{ flex: 1 }}>{h.says}</PaperCard>
        </Specimen>
      ))}
    </Specimens>
  );
}
