// ChunkyButton on the Kit page (DES-7a): each variant at 48 and 64, idle,
// pressed (held with data-state) and disabled; the hold mode (SET-1) idle,
// held part-way, with its note, and one to try.

import { useState, type CSSProperties } from 'react';
import { Specimen, Specimens } from '@/dev/KitPage/Specimen';
import { ChunkyButton } from './ChunkyButton';

/** A hold to try: it counts the times it opened. */
function TryHold() {
  const [opened, setOpened] = useState(0);
  return (
    <Specimen label={opened ? `opened ${opened}×` : 'try it: hold'}>
      <ChunkyButton variant="icon" icon="gear" aria-label="Hold to try" data-shot="kit-hold" onHold={() => setOpened(n => n + 1)} />
    </Specimen>
  );
}

const noop = () => {};

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
          <Specimens title={`accent · ${size}`}>
            {STATES.map(s => (
              <Specimen key={s.label} label={s.label}>
                <ChunkyButton variant="accent" size={size} icon="ear" {...s.props}>Hear my clue</ChunkyButton>
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
          {size === 48 && (
            <Specimens title="prompt · 48: a game's pill, on the stage (DES-22b)" on="card">
              {STATES.map(s => (
                <Specimen key={s.label} label={s.label === 'disabled' ? 'disabled: try it first' : s.label}>
                  <ChunkyButton variant="prompt" icon="speaker" {...s.props}>Say it again</ChunkyButton>
                </Specimen>
              ))}
            </Specimens>
          )}
          <Specimens title={`icon · ${size}`}>
            {STATES.map(s => (
              <Specimen key={s.label} label={s.label}>
                <ChunkyButton variant="icon" size={size} icon="gear" aria-label="Grown-ups: settings" {...s.props} />
              </Specimen>
            ))}
          </Specimens>
        </div>
      ))}
      <Specimens title="a pick-one row: the picked one is aria-pressed (DES-9b)">
        {['Beginner', 'Normal', 'Quick'].map(label => (
          <Specimen key={label} label={label === 'Normal' ? 'selected' : 'not selected'}>
            <ChunkyButton aria-pressed={label === 'Normal'}>{label}</ChunkyButton>
          </Specimen>
        ))}
      </Specimens>
      <Specimens title="hold: the grown-up gate, a 2s press and hold (SET-1)">
        <Specimen label="idle">
          <ChunkyButton variant="icon" icon="gear" aria-label="Grown-ups: settings" onHold={noop} />
        </Specimen>
        <Specimen label="held part-way">
          <ChunkyButton variant="icon" icon="gear" aria-label="Grown-ups: settings" onHold={noop} style={{ '--hold-progress': 0.6 } as CSSProperties} />
        </Specimen>
        <Specimen label="a grade, held part-way">
          <ChunkyButton onHold={noop} style={{ '--hold-progress': 0.35 } as CSSProperties}>Kindergarten</ChunkyButton>
        </Specimen>
        <TryHold />
      </Specimens>
      <Specimens title="hold: after a quick tap, the note (SET-1)">
        <Specimen label="after a quick tap">
          {/* room for the note, which hangs left from the button's right edge, as under the header's gear */}
          <div style={{ paddingLeft: 'calc(var(--space-16) * 3)', paddingBottom: 'var(--space-10)' }}>
            <ChunkyButton variant="icon" icon="gear" aria-label="Grown-ups: settings" onHold={noop} holdNote />
          </div>
        </Specimen>
      </Specimens>
    </>
  );
}
