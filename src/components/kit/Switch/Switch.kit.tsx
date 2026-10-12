// Switch on the Kit page (DES-9b): off, on and disabled, and one to flip.

import { useState } from 'react';
import { Specimen, Specimens } from '@/dev/KitPage/Specimen';
import { Switch } from './Switch';

function Flip() {
  const [on, setOn] = useState(false);
  return <Switch on={on} onChange={setOn} label="Try me" />;
}

export default function SwitchKit() {
  return (
    <Specimens title="States (tap the last one)" on="card">
      <Specimen label="off"><Switch on={false} onChange={() => {}} label="Off" /></Specimen>
      <Specimen label="on"><Switch on onChange={() => {}} label="On" /></Specimen>
      <Specimen label="disabled"><Switch on disabled onChange={() => {}} label="Disabled" /></Specimen>
      <Specimen label="tap to flip"><Flip /></Specimen>
    </Specimens>
  );
}
