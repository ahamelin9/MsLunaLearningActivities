import React from 'react';
import type { LessonQuestion } from '@/types/reading';
import type { GameApi } from '../../engine/types';
import { SoundToLetterMatch } from '../SoundToLetterMatch/SoundToLetterMatch';
import { LetterHunter } from '../LetterHunter/LetterHunter';
import { BlendAndRead } from '../BlendAndRead/BlendAndRead';
import { ReadAndMatch } from '../ReadAndMatch/ReadAndMatch';
import { SightWordReader } from '../SightWordReader/SightWordReader';
import { RhymeMatch } from '../RhymeMatch/RhymeMatch';
import { SentenceReader } from '../SentenceReader/SentenceReader';
import { StoryReader } from '../StoryReader/StoryReader';

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
