// A grade's lessons in buckets: one per skill, in the order the path first
// reaches it, each lesson keeping its number on the path. The teacher's cheat
// sheet shows them (CUR-8), and the library will too (CUR-7).

import type { GradeLevel, Lesson, LessonQuestion } from '../../../types/reading';
import { READING_CURRICULUM } from '../../../data/readingCurriculum';

export interface Bucket {
  /** the skill's id */
  id: string;
  name: string;
  icon: string;
  /** what it teaches, in plain words */
  description: string;
  /** its lessons in path order, each with its number on the path (from 1) */
  lessons: { number: number; lesson: Lesson }[];
}

/** A grade's buckets. The lesson numbers match `lessonsFor` (engine/lessons.ts). */
export function bucketsFor(grade: GradeLevel): Bucket[] {
  const buckets: Bucket[] = [];
  let number = 0;
  for (const skill of READING_CURRICULUM[grade] ?? []) {
    let bucket = buckets.find(b => b.id === skill.id);
    if (!bucket) {
      bucket = { id: skill.id, name: skill.name, icon: skill.icon, description: skill.description, lessons: [] };
      buckets.push(bucket);
    }
    for (const lesson of skill.lessons) bucket.lessons.push({ number: ++number, lesson });
  }
  return buckets;
}

// how many examples a list shows before "and N more": letters and sight words
// are short, so they're all shown
const EXAMPLES = { words: 5, rhymes: 3, stories: 3 };

// "and 6 more" stays on one line: no-break spaces
const NO_BREAK = String.fromCharCode(160);
const some = (items: string[], max = Infinity) => {
  const all = [...new Set(items)];
  if (all.length <= max) return all.join(', ');
  return `${all.slice(0, max).join(', ')} ${['and', all.length - max, 'more'].join(NO_BREAK)}`;
};

/**
 * What a lesson covers, for grown-ups, from its own rounds: its letters, sight
 * words, example words, rhymes, sentences or stories. Behind the grown-up gate
 * only: a child's screen never shows a target (heard, never shown).
 */
export function lessonCovers(lesson: Lesson): string {
  const letters: string[] = [];
  const sight: string[] = [];
  const words: string[] = [];
  const rhymes: string[] = [];
  const pairs = new Set<string>();
  const stories: string[] = [];
  let sentences = 0;
  const add = (q: LessonQuestion) => {
    switch (q.type) {
      case 'sound-to-letter':
      case 'find-letter':
        letters.push(q.targetLetter);
        break;
      case 'sight-word-reader':
        sight.push(q.word);
        break;
      case 'blend-and-read':
      case 'read-and-match':
        words.push(q.word);
        break;
      case 'rhyme-match': {
        // a pair once, whichever way round its rounds ask it (cake–snake, snake–cake)
        const rhyme = q.options.find(o => o.isRhyme);
        if (rhyme && !pairs.has([q.targetWord, rhyme.word].sort().join())) {
          pairs.add([q.targetWord, rhyme.word].sort().join());
          rhymes.push(`${q.targetWord}–${rhyme.word}`);
        }
        break;
      }
      case 'sentence-comprehension':
        sentences += 1;
        break;
      case 'story-read':
        stories.push(q.title);
        break;
    }
  };
  lesson.questions.forEach(add);
  return [
    letters.length ? some(letters) : '',
    sight.length ? some(sight) : '',
    words.length ? some(words, EXAMPLES.words) : '',
    rhymes.length ? some(rhymes, EXAMPLES.rhymes) : '',
    sentences ? `${sentences} sentences` : '',
    stories.length ? `${stories.length} stories: ${some(stories, EXAMPLES.stories)}` : ''
  ].filter(Boolean).join(' · ');
}
