// SpeechBubble on the Kit page (DES-7b): the tail left and below, with and
// without the "Hear my clue" button.

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
    </>
  );
}
