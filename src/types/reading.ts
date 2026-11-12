export type GradeLevel = 'kindergarten' | 'grade1' | 'grade2';

export interface GradeInfo {
  id: GradeLevel;
  title: string;
}

export type QuestionType =
  | 'sound-to-letter'
  | 'find-letter'
  | 'blend-and-read'
  | 'read-and-match'
  | 'sight-word-reader'
  | 'sentence-comprehension'
  | 'rhyme-match'
  | 'story-read';

export interface BaseQuestion {
  id: string;
  prompt: string;
  speechPrompt?: string;
  hint?: string;
}

export interface SoundToLetterQuestion extends BaseQuestion {
  type: 'sound-to-letter';
  targetLetter: string;
  targetSoundSpoken: string;
  targetSoundName: string;
  options: {
    id: string;
    letter: string;
    isCorrect: boolean;
  }[];
}

export interface FindLetterQuestion extends BaseQuestion {
  type: 'find-letter';
  targetLetter: string;
  caseType?: 'uppercase' | 'lowercase';
  options: {
    id: string;
    letter: string;
    isCorrect: boolean;
  }[];
}

export interface PhonemeChunk {
  text: string;
  spokenSound: string;
}

/** A picture to pick: a word from the bank, with its one picture (CNT-2). */
export interface PictureOption {
  id: string;
  word: string;
  imageEmoji: string;
  isCorrect: boolean;
}

export interface BlendAndReadQuestion extends BaseQuestion {
  type: 'blend-and-read';
  word: string;
  phonemes: PhonemeChunk[];
  options: PictureOption[];
}

export interface ReadAndMatchQuestion extends BaseQuestion {
  type: 'read-and-match';
  word: string;
  options: PictureOption[];
}

export interface SightWordReaderQuestion extends BaseQuestion {
  type: 'sight-word-reader';
  word: string;
  exampleSentence: string;
  options: {
    id: string;
    word: string;
    isCorrect: boolean;
  }[];
}

export interface SentenceComprehensionQuestion extends BaseQuestion {
  type: 'sentence-comprehension';
  sentence: string;
  highlightWords?: string[];
  options: {
    id: string;
    imageEmoji?: string;
    text: string;
    isCorrect: boolean;
  }[];
}

export interface RhymeMatchQuestion extends BaseQuestion {
  type: 'rhyme-match';
  targetWord: string;
  targetEmoji: string;
  options: {
    word: string;
    emoji: string;
    isRhyme: boolean;
  }[];
}

export interface StorySentence {
  id: string;
  text: string;
}

export interface StoryReadQuestion extends BaseQuestion {
  type: 'story-read';
  title: string;
  sentences: StorySentence[];
  imageEmoji: string;
  comprehensionQuestion: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
}

export type LessonQuestion =
  | SoundToLetterQuestion
  | FindLetterQuestion
  | BlendAndReadQuestion
  | ReadAndMatchQuestion
  | SightWordReaderQuestion
  | SentenceComprehensionQuestion
  | RhymeMatchQuestion
  | StoryReadQuestion;

/**
 * A skill: one of a grade's buckets of lessons. The teacher's cheat sheet
 * (CUR-8) shows each with its lessons and a progress bar.
 */
export interface ReadingSkill {
  id: string;
  /** the bucket's name, in plain words */
  name: string;
  /**
   * Its name as Luna says it when its card is tapped on the library (CUR-10):
   * most children can't read it yet. A whole `{ text }` part, so it is a
   * rendered clip (voice:audit).
   */
  said: { text: string };
  icon: string;
  /** what it teaches, in plain words for grown-ups (the lessons' objective) */
  description: string;
  lessons: Lesson[];
}

export interface Lesson {
  id: string;
  skillId: string;
  grade: GradeLevel;
  title: string;
  description: string;
  icon: string;
  difficulty: 1 | 2 | 3;
  /** the pool a play's rounds are dealt from (CUR-6) */
  questions: LessonQuestion[];
  /** rounds in one play, when not the usual `ROUNDS_PER_PLAY`: a story takes longer */
  perPlay?: number;
  /** the most a lesson can earn: 3, as every game; how many follows PRG-1's rule (`engine/stars.ts`) */
  starsToEarn: number;
}
