// The curriculum's guided lessons, run as games.
//
// A lesson used to have a player of its own beside the games: its own look,
// no Luna, no hints, no stickers. Each lesson is now handed to the same
// GameShell as a GameDef whose rounds are its fixed questions, so it gets all
// of that, while finishing it still marks the lesson done (GameDef.lesson).

import type { GradeLevel, Lesson, LessonQuestion, QuestionType, ReadingSkill } from '../../../types/reading';
import { READING_CURRICULUM } from '../../../data/readingCurriculum';
import { LessonRound } from '../components/LessonRound';
import type { AnyGameDef, GameDef, SkillArea } from './types';

/** Where a lesson sits among the library's skills, by what its questions ask. */
const SKILL_AREA: Record<QuestionType, SkillArea> = {
  'sound-to-letter': 'phonics',
  'find-letter': 'letters',
  'blend-and-read': 'phonics',
  'rhyme-match': 'phonics',
  'read-and-match': 'reading',
  'sight-word-reader': 'reading',
  'sentence-comprehension': 'reading',
  'story-read': 'reading'
};

/**
 * What Luna says on a lesson's start screen, to the child, the way each game
 * has a mission. The skill's own description is written for grown-ups, so it
 * is the lesson's "Learning:" line instead. None of these names an answer.
 */
const LUNA_LINES: Record<string, string> = {
  'k-match-sounds': 'Ears on! I make a sound, and you find the letter that makes it.',
  'k-letter-hunter': 'I say a letter, you spot it. Watch out for look-alikes!',
  'k-blend-words': 'Tap each sound, then smoosh them together into a word!',
  'k-sight-words': 'Some words we just know when we see them. Let’s find them!',
  'k-rhyming': 'Rhyming words end with the same sound. Listen closely!',
  'g1-digraphs': 'Some letters team up to make one sound. Let’s sound them out!',
  'g1-magic-e': 'A silent E at the end makes the vowel say its name. Watch it work!',
  'g1-sentences': 'Read the sentence, then find the picture that shows it.',
  'g2-vowel-teams': 'When two vowels go walking, the first one does the talking!',
  'g2-compounds': 'Two little words can join up to make one big word!',
  'g2-storybooks': 'Story time! Read along with me, then answer my question.'
};

/** The sticker a kind of lesson is known for; after it, the rest of the tin. */
const SIGNATURE_STICKER: Record<string, string> = {
  'k-match-sounds': 'headphones',
  'k-rhyming': 'headphones',
  'k-letter-hunter': 'magnifier'
};

export function lessonGame(lesson: Lesson, skill: ReadingSkill): GameDef<LessonQuestion> {
  return {
    id: lesson.id,
    title: lesson.title,
    emoji: lesson.icon,
    tagline: lesson.description,
    objective: skill.description,
    skill: SKILL_AREA[lesson.questions[0]?.type] ?? 'reading',
    mission: LUNA_LINES[skill.id] ?? lesson.description,
    roundsPerPlay: lesson.questions.length,
    shape: 'lesson',
    sticker: SIGNATURE_STICKER[skill.id] ?? 'book',
    makeRounds: () => lesson.questions,
    Play: LessonRound,
    lesson: {
      id: lesson.id,
      skillId: lesson.skillId,
      stars: lesson.starsToEarn,
      points: lesson.questions.length * 20
    }
  };
}

/** A grade's lessons, in the order the curriculum teaches them. */
export function lessonsFor(grade: GradeLevel): AnyGameDef[] {
  return (READING_CURRICULUM[grade] ?? []).flatMap(skill => skill.lessons.map(lesson => lessonGame(lesson, skill)));
}
