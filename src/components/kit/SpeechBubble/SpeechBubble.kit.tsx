// SpeechBubble on the Kit page (DES-7b): the tail left and below, with and
// without the "Hear my clue" button; and no tail, its line a button that says
// it again, for a perch with no owl (DES-22a).

import { Specimen, Specimens } from '@/dev/KitPage/Specimen';
import { SpeechBubble } from './SpeechBubble';

const noop = () => {};

export default function SpeechBubbleKit() {
  return (
    <>
      <Specimens title="Tail left (Luna beside it)">
        <Specimen label="a line"><SpeechBubble>Which letter makes this sound?</SpeechBubble></Specimen>
        <Specimen label="with Hear my clue"><SpeechBubble onClue={noop}>Not that one. Listen again!</SpeechBubble></Specimen>
      </Specimens>
      <Specimens title="Tail below (Luna under it)">
        <Specimen label="a line"><SpeechBubble tail="bottom">Welcome back!</SpeechBubble></Specimen>
        <Specimen label="with Hear my clue"><SpeechBubble tail="bottom" onClue={noop}>Let's try one more.</SpeechBubble></Specimen>
      </Specimens>
      <Specimens title="No tail (Luna is on the stage): tap the line to hear it again">
        <Specimen label="a line">
          <SpeechBubble tail="none" onLine={noop}>I am SO hungry. Feed me the right letter cookie!</SpeechBubble>
        </Specimen>
        <Specimen label="with Hear my clue">
          <SpeechBubble tail="none" onLine={noop} onClue={noop}>Hmm, not that one.</SpeechBubble>
        </Specimen>
      </Specimens>
    </>
  );
}
