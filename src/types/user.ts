import type { GradeLevel } from './reading';

/** Light, dark, or whatever the iPad is set to (DES-16) */
export type ThemeChoice = 'match' | 'light' | 'dark';

export interface UserSettings {
  soundEnabled: boolean;
  speechEnabled: boolean;
  speechRate: number;
  reducedMotion: boolean;
  /** light or dark: "match" follows the iPad (DES-16) */
  theme: ThemeChoice;
  /** which Kokoro voice Ms. Luna speaks with; its accent comes with it (SET-3) */
  voiceId: string;
}

export interface UserProgress {
  selectedGrade: GradeLevel | null;
  totalStars: number;
  totalPoints: number;
  completedLessons: string[];
  skillMastery: Record<string, number>;
  streakDays: number;
  lastPlayedDate: string | null;
  unlockedAchievements: string[];
  /** Sticker ids collected in Luna's tin */
  stickers: string[];
  /** How many times each mini-game has been finished */
  gamePlays: Record<string, number>;
  /** the dial last picked on each game's start screen (LVL-2): 1 Warm up, 2 Just right, 3 Tricky */
  gameDifficulty: Record<string, 1 | 2 | 3>;
  /** the most stars each game and lesson has earned in one play (PRG-1): a replay adds only above it */
  bestStars: Record<string, number>;
  settings: UserSettings;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  iconEmoji: string;
  category: 'stars' | 'lessons' | 'streak' | 'skills' | 'special';
  requirement: (progress: UserProgress) => boolean;
}

