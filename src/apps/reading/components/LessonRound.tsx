import React from 'react';
import type { LessonQuestion } from '../../../types/reading';
import type { GameApi } from '../engine/types';
import { SoundToLetterMatch } from './SoundToLetterMatch';
import { LetterHunter } from './LetterHunter';
import { BlendAndRead } from './BlendAndRead';
import { ReadAndMatch } from './ReadAndMatch';
import { SightWordReader } from './SightWordReader';
import { RhymeMatch } from './RhymeMatch';
import { SentenceReader } from './SentenceReader';
import { StoryReader } from './StoryReader';

/** One question of a guided lesson, played as a round in the game shell. */
export const LessonRound: React.FC<{ round: LessonQuestion; api: GameApi }> = ({ round, api }) => {
  switch (round.type) {
    case 'sound-to-letter':
      return <SoundToLetterMatch question={round} api={api} />;
    case 'find-letter':
      return <LetterHunter question={round} api={api} />;
    case 'blend-and-read':
      return <BlendAndRead question={round} api={api} />;
    case 'read-and-match':
      return <ReadAndMatch question={round} api={api} />;
    case 'sight-word-reader':
      return <SightWordReader question={round} api={api} />;
    case 'rhyme-match':
      return <RhymeMatch question={round} api={api} />;
    case 'sentence-comprehension':
      return <SentenceReader question={round} api={api} />;
    case 'story-read':
      return <StoryReader question={round} api={api} />;
  }
};
