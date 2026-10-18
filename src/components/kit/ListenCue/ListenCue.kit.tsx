// ListenCue on the Kit page (DES-7b): waiting, tapped (held) and found, for a
// letter and a word, and one to tap: each tap ripples, and "Found it" shows
// the answer with its burst of sparks (DES-22b).

import { useState } from 'react';
import { Specimen, Specimens } from '@/dev/KitPage/Specimen';
import { ChunkyButton } from '../ChunkyButton/ChunkyButton';
import { ListenCue } from './ListenCue';

function TryIt() {
  const [found, setFound] = useState(false);
  return (
    <Specimens title="Try it: tap the arch">
      <Specimen label={found ? 'found' : 'waiting'}>
        <ListenCue state={found ? 'found' : 'waiting'} answer="M" />
      </Specimen>
      <Specimen label={found ? 'again' : 'find it'}>
        <ChunkyButton variant={found ? 'quiet' : 'action'} onClick={() => setFound(f => !f)}>{found ? 'Again' : 'Found it'}</ChunkyButton>
      </Specimen>
    </Specimens>
  );
}

export default function ListenCueKit() {
  return (
    <>
      <Specimens title="States">
        <Specimen label="waiting (the answer stays hidden)"><ListenCue answer="M" /></Specimen>
        <Specimen label="tapped"><ListenCue answer="M" data-state="tapped" /></Specimen>
        <Specimen label="found, a letter"><ListenCue state="found" answer="M" /></Specimen>
        <Specimen label="found, a word"><ListenCue state="found" kind="word" answer="ship" /></Specimen>
        <Specimen label="waiting, a picture (DES-22b)"><ListenCue answer="c" picture="🐱" listenText="first letter?" /></Specimen>
      </Specimens>
      <TryIt />
    </>
  );
}
