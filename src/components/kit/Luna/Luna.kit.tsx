// Luna on the Kit page (DES-15): her 8 moods, talking (held on here; in the app
// her beak follows the voice), the float, and her sizes. Tap one to see her sink.

import { Specimen, Specimens } from '@/dev/KitPage/Specimen';
import { Luna, type LunaMood } from './Luna';

const MOODS: [LunaMood, string][] = [
  ['idle', 'idle: as drawn, blinks'],
  ['happy', 'happy: smiling eyes, wings out'],
  ['cheer', 'cheer: wings up, happy eyes, a pop'],
  ['think', 'think: a tilt, a wing up, eyes up'],
  ['oops', 'oops: eyes down, a blush, a wobble'],
  ['surprise', 'surprise: wide eyes, beak open, a pop'],
  ['listen', 'listen: a tilt, a wing by her ear'],
  ['sleepy', 'sleepy: eyes closed, a z'],
];

export default function LunaKit() {
  return (
    <>
      <Specimens title="Her 8 moods (tap one)" on="card">
        {MOODS.map(([mood, label]) => (
          <Specimen key={mood} label={label}>
            <Luna mood={mood} size={128} talking={false} onClick={() => {}} label={`Ms. Luna, ${mood}`} />
          </Specimen>
        ))}
      </Specimens>
      <Specimens title="Talking and floating" on="card">
        <Specimen label="talking (only while a clip plays)"><Luna mood="happy" size={128} talking /></Specimen>
        <Specimen label="follows the voice (still: no clip plays here)"><Luna mood="listen" size={128} /></Specimen>
        <Specimen label="float (off-round screens)"><Luna mood="idle" size={128} talking={false} float /></Specimen>
      </Specimens>
      <Specimens title="Sizes" on="card">
        {[48, 82, 128, 160].map(s => (
          <Specimen key={s} label={String(s)}><Luna mood="idle" size={s} talking={false} /></Specimen>
        ))}
      </Specimens>
    </>
  );
}
