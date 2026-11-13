// TextField on the Kit page (OPS-14): idle, filled, wrong, and one to type in.

import { Specimen, Specimens } from '@/dev/KitPage/Specimen';
import { TextField } from './TextField';

export default function TextFieldKit() {
  return (
    <Specimens title="States (type in the last one)" on="card">
      <Specimen label="idle"><TextField label="Class password" type="password" /></Specimen>
      <Specimen label="filled"><TextField label="Class password" type="password" defaultValue="owls" /></Specimen>
      <Specimen label="wrong">
        <TextField label="Class password" type="password" defaultValue="owl" wrong note="That’s not it. Try again." />
      </Specimen>
      <Specimen label="type here"><TextField label="Your name" /></Specimen>
    </Specimens>
  );
}
