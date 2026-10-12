// Choice on the Kit page (DES-7b): each kind in every state, and a round to
// try: a wrong tap wobbles and clears when the wobble ends, the right one pops
// and the others fade.

import { useEffect, useRef, useState } from 'react';
import { Specimen, Specimens } from '@/dev/KitPage/Specimen';
import { afterMotion } from '@/utils/motion';
import { ChunkyButton } from '../ChunkyButton/ChunkyButton';
import { Choice, type ChoiceState } from './Choice';

const STATES: { label: string; state: ChoiceState; held?: string }[] = [
  { label: 'idle', state: 'idle' },
  { label: 'pressed', state: 'idle', held: 'pressed' },
  { label: 'wrong', state: 'wrong' },
  { label: 'right', state: 'right' },
  { label: 'revealed', state: 'revealed' },
  { label: 'faded', state: 'faded' },
];

const LETTERS = ['M', 'S', 'B', 'A'];
const ANSWER = 'M';

function TryIt() {
  const [states, setStates] = useState<Record<string, ChoiceState>>({});
  const cancels = useRef<(() => void)[]>([]);
  useEffect(() => () => cancels.current.forEach(c => c()), []);

  const pick = (letter: string) => {
    if (letter === ANSWER) {
      setStates(Object.fromEntries(LETTERS.map(l => [l, l === ANSWER ? 'right' : 'faded'])));
      return;
    }
    setStates(s => ({ ...s, [letter]: 'wrong' }));
    cancels.current.push(afterMotion('emphasis', () => setStates(s => (s[letter] === 'wrong' ? { ...s, [letter]: 'idle' } : s))));
  };

  return (
    <Specimens title="Try it: the answer is M">
      {LETTERS.map(l => (
        <Specimen key={l} label={states[l] ?? 'idle'}>
          <Choice state={states[l]} onClick={() => pick(l)} aria-label={`letter ${l}`}>{l}</Choice>
        </Specimen>
      ))}
      <Specimen label="again">
        <ChunkyButton variant="quiet" icon="replay" disabled={!Object.keys(states).length} onClick={() => setStates({})}>Again</ChunkyButton>
      </Specimen>
    </Specimens>
  );
}

export default function ChoiceKit() {
  return (
    <>
      <Specimens title="letter">
        {STATES.map(s => (
          <Specimen key={s.label} label={s.label}>
            <Choice state={s.state} data-state={s.held}>b</Choice>
          </Specimen>
        ))}
      </Specimens>
      <Specimens title="word">
        {STATES.map(s => (
          <Specimen key={s.label} label={s.label}>
            <Choice kind="word" state={s.state} data-state={s.held}>ship</Choice>
          </Specimen>
        ))}
      </Specimens>
      <Specimens title="picture (its word shows once it's right)">
        {STATES.map(s => (
          <Specimen key={s.label} label={s.label}>
            <Choice kind="picture" state={s.state} data-state={s.held} aria-label="cat" caption={s.state === 'right' ? 'cat' : undefined}>🐱</Choice>
          </Specimen>
        ))}
      </Specimens>
      <TryIt />
    </>
  );
}
