import type { Achievement } from '../types/user';
import { READING_CURRICULUM } from './readingCurriculum';
import { SQUISHY_KINDS, kindsFound } from '../apps/reading/engine/squishies';

/** The skills whose lessons sound out words: blend the sounds, find the picture. */
const SOUNDING_OUT = new Set(
  Object.values(READING_CURRICULUM)
    .flat()
    .filter(skill => skill.lessons.some(lesson => lesson.questions.some(q => q.type === 'blend-and-read')))
    .map(skill => skill.id)
);

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_step',
    title: 'First Word Wonder',
    description: 'Completed your very first reading lesson!',
    iconEmoji: '🌱',
    category: 'lessons',
    requirement: p => p.completedLessons.length >= 1
  },
  {
    id: 'star_collector',
    title: 'Star Collector',
    description: 'Collected 10 shiny golden stars!',
    iconEmoji: '⭐',
    category: 'stars',
    requirement: p => p.totalStars >= 10
  },
  {
    id: 'super_star',
    title: 'Super Star Champion',
    description: 'Collected 30 golden stars across your learning adventure!',
    iconEmoji: '🌟',
    category: 'stars',
    // 30 since stars count a game's or lesson's best only, 60 at most (PRG-1)
    requirement: p => p.totalStars >= 30
  },
  {
    id: 'bookworm',
    title: 'Master Reader',
    description: 'Completed 5 fun learning activities!',
    iconEmoji: '📚',
    category: 'lessons',
    requirement: p => p.completedLessons.length >= 5
  },
  {
    id: 'sound_explorer',
    title: 'Phonics Explorer',
    description: 'Practiced sounding out words with Ms. Luna!',
    iconEmoji: '🦉',
    category: 'skills',
    // a lesson that sounds out words, finished once; it counted 100 points
    // until points went (PRG-2)
    requirement: p => Object.entries(p.skillMastery).some(([skill, times]) => SOUNDING_OUT.has(skill) && times > 0)
  },
  {
    id: 'streak_champ',
    title: 'Daily Adventurer',
    description: 'Practiced learning on multiple days!',
    iconEmoji: '🔥',
    category: 'streak',
    requirement: p => p.streakDays >= 2
  },
  {
    id: 'full_shelf',
    title: 'Squishy Champion',
    description: 'Found every squishy for Luna’s shelf!',
    iconEmoji: '🏆',
    category: 'special',
    // the secret platinum trophy (PRG-4): every kind on the shelf, in any
    // colour; more kinds (PRG-5b) raise the bar for anyone who hasn't won it
    hidden: true,
    requirement: p => kindsFound(p.stickers) >= SQUISHY_KINDS.length
  }
];
