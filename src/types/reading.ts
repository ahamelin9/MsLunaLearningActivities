export type GradeLevel = 'kindergarten' | 'grade1' | 'grade2';

export interface GradeInfo {
  id: GradeLevel;
  title: string;
  subtitle: string;
  description: string;
  ageRange: string;
  badgeEmoji: string;
  color: string;
  gradient: string;
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

export interface BlendAndReadQuestion extends BaseQuestion {
  type: 'blend-and-read';
  word: string;
  phonemes: PhonemeChunk[];
  options: {
    id: string;
    text: string;
    imageEmoji: string;
    isCorrect: boolean;
  }[];
}

export interface ReadAndMatchQuestion extends BaseQuestion {
  type: 'read-and-match';
  word: string;
  options: {
    id: string;
    text: string;
    imageEmoji: string;
    isCorrect: boolean;
  }[];
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

export interface ReadingSkill {
  id: string;
  name: string;
  icon: string;
  color: string;
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
  questions: LessonQuestion[];
  starsToEarn: number;
}
