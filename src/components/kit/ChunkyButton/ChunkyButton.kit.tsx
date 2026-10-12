// ChunkyButton on the Kit page (DES-7a): each variant at 48 and 64, idle,
// pressed (held with data-state) and disabled.

import { Specimen, Specimens } from '@/dev/KitPage/Specimen';
import { ChunkyButton } from './ChunkyButton';

const STATES = [
  { label: 'idle', props: {} },
  { label: 'pressed', props: { 'data-state': 'pressed' } },
  { label: 'disabled', props: { disabled: true } },
];

export default function ChunkyButtonKit() {
  return (
    <>
      {([48, 64] as const).map(size => (
        <div key={size}>
          <Specimens title={`action · ${size}`}>
            {STATES.map(s => (
              <Specimen key={s.label} label={s.label}>
                <ChunkyButton variant="action" size={size} icon="replay" {...s.props}>Play again</ChunkyButton>
              </Specimen>
            ))}
          </Specimens>
          <Specimens title={`secondary · ${size}`}>
            {STATES.map(s => (
              <Specimen key={s.label} label={s.label}>
                <ChunkyButton size={size} {...(size === 48 ? { icon: 'home' as const } : { iconAfter: 'arrow-right' as const })} {...s.props}>
                  {size === 48 ? 'Home' : 'Next lesson'}
                </ChunkyButton>
              </Specimen>
            ))}
          </Specimens>
          <Specimens title={`quiet (dashed) · ${size}`}>
            {STATES.map(s => (
              <Specimen key={s.label} label={s.label}>
                <ChunkyButton variant="quiet" size={size} {...s.props}>{size === 48 ? 'Try again' : 'See my shelf'}</ChunkyButton>
              </Specimen>
            ))}
          </Specimens>
          <Specimens title={`icon · ${size}`}>
            {STATES.map(s => (
              <Specimen key={s.label} label={s.label}>
                <ChunkyButton variant="icon" size={size} icon="gear" aria-label="Grown-ups: settings" {...s.props} />
              </Specimen>
            ))}
          </Specimens>
        </div>
      ))}
    </>
  );
}
