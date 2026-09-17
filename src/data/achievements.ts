import type { Achievement } from '../types/user';

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_step',
    title: 'First Word Wonder',
    description: 'Completed your very first reading lesson!',
    iconEmoji: '🌱',
    badgeColor: '#06D6A0',
    category: 'lessons',
    requirement: p => p.completedLessons.length >= 1
  },
  {
    id: 'star_collector',
    title: 'Star Collector',
    description: 'Collected 10 shiny golden stars!',
    iconEmoji: '⭐',
    badgeColor: '#FFD166',
    category: 'stars',
    requirement: p => p.totalStars >= 10
  },
  {
    id: 'super_star',
    title: 'Super Star Champion',
    description: 'Collected 50 golden stars across your learning adventure!',
    iconEmoji: '🌟',
    badgeColor: '#FF9F1C',
    category: 'stars',
    requirement: p => p.totalStars >= 50
  },
  {
    id: 'bookworm',
    title: 'Master Reader',
    description: 'Completed 5 fun learning activities!',
    iconEmoji: '📚',
    badgeColor: '#4D96FF',
    category: 'lessons',
    requirement: p => p.completedLessons.length >= 5
  },
  {
    id: 'sound_explorer',
    title: 'Phonics Explorer',
    description: 'Practiced sounding out words with Ms. Luna!',
    iconEmoji: '🦉',
    badgeColor: '#9D4EDD',
    category: 'skills',
    requirement: p => p.totalPoints >= 100
  },
  {
    id: 'streak_champ',
    title: 'Daily Adventurer',
    description: 'Practiced learning on multiple days!',
    iconEmoji: '🔥',
    badgeColor: '#FF5964',
    category: 'streak',
    requirement: p => p.streakDays >= 2
  }
];

