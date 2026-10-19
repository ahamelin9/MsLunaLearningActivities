import type { Achievement } from '../types/user';

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
    requirement: p => p.totalPoints >= 100
  },
  {
    id: 'streak_champ',
    title: 'Daily Adventurer',
    description: 'Practiced learning on multiple days!',
    iconEmoji: '🔥',
    category: 'streak',
    requirement: p => p.streakDays >= 2
  }
];

