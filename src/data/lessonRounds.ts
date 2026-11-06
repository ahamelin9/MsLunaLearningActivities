// Builders for a lesson's rounds (CUR-4): a round is one line of data, its word,
// spelling and picture from the bank, its clue from wordClues.ts, and its wrong
// choices picked by the rules in engine/distractors.ts. Everything is built as
// the app loads, so the voice inventory, the audit and the checks see each round
// whole. Lines are joined with +, not a template, and each ends up in the data
// the voice audit walks.

import type {
  BlendAndReadQuestion,
  FindLetterQuestion,
  LessonQuestion,
  ReadAndMatchQuestion,
  RhymeMatchQuestion,
  SentenceComprehensionQuestion,
  SightWordReaderQuestion,
  SoundToLetterQuestion,
  StoryReadQuestion
} from '../types/reading';
import { WORDS, wordsUpTo, type Difficulty, type WordItem } from '../apps/reading/engine/content';
import { pickWrong, textChoice, wordChoice } from '../apps/reading/engine/distractors';
import { bankWord, phraseChoice, pictureChoice, rhymeChoice } from './lessonChoices';
import { WORD_CLUES } from './wordClues';

function clueFor(word: string): string {
  const clue = WORD_CLUES[word];
  if (!clue) throw new Error('Lesson word "' + word + '" has no clue (data/wordClues.ts)');
  return clue;
}

/** How a tile's letters are said: C says /k/, and a double letter says one sound. */
const SAID_AS: Record<string, string> = { c: 'k', ck: 'k', ll: 'l', ss: 's', ff: 'f', se: 'z' };
/** What each tile plays when it's tapped. */
const TILE_SOUND: Record<string, string> = { ll: 'l', ss: 's', ff: 'f', se: 'z' };

const slashed = (chunk: string) => '/' + (SAID_AS[chunk] ?? chunk) + '/';

/**
 * The picture choices for a word the child has read: one starts with the same
 * letter, so the first letter alone doesn't give it away, and the rest come
 * from the words the lesson is teaching, then from the bank.
 */
function wrongPictures(target: WordItem, mates: WordItem[], bank: WordItem[], count: number): WordItem[] {
  const options = { as: wordChoice, targetKnown: true };
  const others = [...mates, ...bank].filter(w => w.word !== target.word);
  const start = target.word[0];
  const alike = others.filter(w => w.word[0] === start);
  // a rare letter may have no word yet at this tier: a picture from a later one still does it
  const [sameStart] = pickWrong(target, alike.length ? alike : WORDS.filter(w => w.word !== target.word && w.word[0] === start), 1, options);
  const picked = sameStart ? [sameStart] : [];
  const from = (pool: WordItem[]) =>
    picked.push(...pickWrong(target, pool.filter(w => w.word !== target.word), count - picked.length, { ...options, onScreen: picked }));
  from(mates);
  if (picked.length < count) from(bank);
  return picked;
}

interface WordRoundsOpts {
  /** the lesson's id, in each round's own id */
  lesson: string;
  /** which of the bank's tiers wrong pictures come from */
  tier: Difficulty;
  /** how many wrong pictures: a later lesson asks more of the child */
  wrong?: number;
}

/**
 * "Sound it out, find the picture." Each word is spelled with - between its
 * tiles ("sh-i-p"), and `lead` says how: "Sound out" or "S and H team up to
 * make /sh/. Blend the sounds:".
 */
export function blendRounds(spellings: string[], lead: string, { lesson, tier, wrong = 2 }: WordRoundsOpts): BlendAndReadQuestion[] {
  const words = spellings.map(s => bankWord(s.replace(/-/g, '')));
  const bank = wordsUpTo(tier);
  return spellings.map((spelled, i) => {
    const target = words[i];
    const chunks = spelled.split('-');
    return {
      id: 'q-' + lesson + '-' + target.word,
      type: 'blend-and-read',
      prompt: 'Blend the sounds to read the word!',
      speechPrompt: lead + ' ' + chunks.map(slashed).join(' ') + '! Which picture matches?',
      word: target.word,
      phonemes: chunks.map(chunk => ({ text: chunk, spokenSound: TILE_SOUND[chunk] ?? chunk })),
      hint: clueFor(target.word),
      options: [
        pictureChoice(target.word, true),
        ...wrongPictures(target, words, bank, wrong).map(w => pictureChoice(w.word, false))
      ]
    };
  });
}

/** "Read the word, find its picture." `say` is Luna's opening line. */
export function readRounds(wordList: string[], prompt: string, say: string, { lesson, tier, wrong = 2 }: WordRoundsOpts): ReadAndMatchQuestion[] {
  const words = wordList.map(bankWord);
  const bank = wordsUpTo(tier);
  return words.map(target => ({
    id: 'q-' + lesson + '-' + target.word,
    type: 'read-and-match',
    prompt,
    speechPrompt: say,
    word: target.word,
    hint: clueFor(target.word),
    options: [
      pictureChoice(target.word, true),
      ...wrongPictures(target, words, bank, wrong).map(w => pictureChoice(w.word, false))
    ]
  }));
}

/**
 * "Which picture rhymes?" `families` are words that rhyme, as they're said. Each
 * word is asked in turn, the next in its family is the answer, and the wrong
 * pictures come from the other families, so none can rhyme by accident.
 */
export function rhymeRounds(families: string[][], lesson: string, wrong = 2): RhymeMatchQuestion[] {
  return families.flatMap((family, f) => {
    const others = families.filter((_, i) => i !== f).flat().map(bankWord);
    return family.map((word, i) => {
      const target = bankWord(word);
      const right = bankWord(family[(i + 1) % family.length]);
      const said = word[0].toUpperCase() + word.slice(1);
      return {
        id: 'q-' + lesson + '-' + word,
        type: 'rhyme-match' as const,
        prompt: 'Which word rhymes with ' + word.toUpperCase() + '?',
        speechPrompt: said + '! Which picture rhymes with ' + word + '?',
        targetWord: word,
        targetEmoji: target.emoji,
        hint: 'Say each picture out loud. Which one ends just like ' + word + '?',
        options: [
          rhymeChoice(right.word, true),
          ...pickWrong(right, others, wrong, { as: wordChoice, onScreen: [target] }).map(w => rhymeChoice(w.word, false))
        ]
      };
    });
  });
}

/** The letters a sound lesson can offer as wrong; the audit keeps C and K apart, and W from WH. */
const ALL_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

/**
 * "What letter makes this sound?" One round per word that shows the sound, each
 * with its own wrong letters. The first sound in the word is the letter's own.
 */
export function soundRounds(letter: string, examples: string[], lesson: string, sound = letter.toLowerCase()): SoundToLetterQuestion[] {
  const said = '/' + sound + '/';
  return examples.map((example, i) => {
    const other = examples[(i + 1) % examples.length];
    return {
      id: 'q-' + lesson + '-' + letter.toLowerCase() + '-' + example,
      type: 'sound-to-letter',
      prompt: 'What letter makes this sound?',
      speechPrompt: 'What letter makes the ' + said + ' sound, like ' + example + '?',
      targetLetter: letter,
      targetSoundSpoken: letter.toLowerCase(),
      targetSoundName: said,
      hint: 'Listen: ' + said + ', like ' + example + ' and ' + other + '!',
      options: [
        { id: 'opt-' + letter.toLowerCase(), letter, isCorrect: true },
        ...pickWrong(letter, ALL_LETTERS, 3, { as: textChoice, letterBy: 'sound' }).map(l => ({
          id: 'opt-' + l.toLowerCase(),
          letter: l,
          isCorrect: false
        }))
      ]
    };
  });
}

/** "Which letter did Ms. Luna say?" Each round: the letter, how it looks, and look-alikes to tell it from. */
export function huntRounds(lesson: string, rows: [letter: string, looks: string, ...lookAlikes: string[]][]): FindLetterQuestion[] {
  return rows.map(([letter, looks, ...lookAlikes]) => {
    const little = letter === letter.toLowerCase();
    return {
      id: 'q-' + lesson + '-' + letter,
      type: 'find-letter',
      prompt: 'Which letter did Ms. Luna say?',
      speechPrompt: little
        ? 'Can you find the little letter ' + letter.toUpperCase() + '?'
        : 'Can you find the letter ' + letter + '?',
      targetLetter: letter,
      caseType: little ? 'lowercase' : 'uppercase',
      hint: looks,
      options: [letter, ...lookAlikes].map(l => ({ id: 'opt-' + l, letter: l, isCorrect: l === letter }))
    };
  });
}

/**
 * "Which word does Ms. Luna say?" A word, two look-alikes that never sound the
 * same, and sentences to hear it in: one round each, the picture at their end.
 * It isn't shown until it's found, and the sentence then marks it.
 */
export function sightRounds(lesson: string, word: string, lookAlikes: string[], sentences: [line: string, picture: string][]): SightWordReaderQuestion[] {
  return sentences.map(([line, picture], i) => {
    const inLine = line.split(/\s+/).some(token => token.replace(/[^a-zA-Z']/g, '').toLowerCase() === word.toLowerCase());
    if (!inLine) throw new Error('Sight word "' + word + '" is not in "' + line + '"');
    return {
      id: 'q-' + lesson + '-' + word.toLowerCase() + '-' + (i + 1),
      type: 'sight-word-reader',
      prompt: 'Which word does Ms. Luna say?',
      speechPrompt: 'Find the sight word ' + word.toUpperCase() + ': "' + line + '"',
      word,
      exampleSentence: line + ' ' + picture,
      hint: 'Listen closely: ' + word + '. ' + line,
      options: [word, ...lookAlikes].map(w => ({ id: 'opt-' + w.toLowerCase(), word: w, isCorrect: w === word }))
    };
  });
}

type Answer = [word: string, phrase: string];

/** "Read the sentence, find the picture." Each answer is a phrase in its own words, with a bank picture. */
export function sentenceRounds(lesson: string, rows: [sentence: string, hint: string, right: Answer, ...wrong: Answer[]][]): SentenceComprehensionQuestion[] {
  return rows.map(([sentence, hint, right, ...wrong], i) => ({
    id: 'q-' + lesson + '-' + (i + 1),
    type: 'sentence-comprehension',
    prompt: 'Read the sentence and find the matching picture!',
    speechPrompt: 'Read the sentence. Which picture shows it?',
    sentence,
    hint,
    options: [phraseChoice(right[0], right[1], true), ...wrong.map(([w, phrase]) => phraseChoice(w, phrase, false))]
  }));
}

export interface StoryRow {
  title: string;
  picture: string;
  lines: string[];
  question: string;
  /** the right answer first; the screen shuffles them */
  answers: [string, string, string];
  /** what Luna says when it's found */
  because: string;
}

/** "Read the story, then answer." */
export function storyRounds(lesson: string, stories: StoryRow[]): StoryReadQuestion[] {
  return stories.map((story, i) => ({
    id: 'q-' + lesson + '-' + (i + 1),
    type: 'story-read',
    prompt: 'Read the story, then answer the question!',
    speechPrompt: 'Read the story yourself first, then answer my question. If you get stuck, I can help!',
    title: story.title,
    imageEmoji: story.picture,
    sentences: story.lines.map((text, n) => ({ id: 's' + (n + 1), text })),
    comprehensionQuestion: {
      question: story.question,
      options: [...story.answers],
      correctIndex: 0,
      explanation: story.because
    }
  }));
}

/** What a round is about: a play doesn't ask the same thing twice while it can help it (CUR-6). */
export function aboutOf(q: LessonQuestion): string {
  switch (q.type) {
    case 'sound-to-letter':
    case 'find-letter':
      return q.targetLetter;
    case 'blend-and-read':
    case 'read-and-match':
    case 'sight-word-reader':
      return q.word;
    case 'rhyme-match':
      return q.targetWord;
    default:
      return q.id;
  }
}

/** Words from the bank at a tier, for a check or a sheet. */
export const bankWords = (tier: Difficulty) => WORDS.filter(w => w.tier === tier);
