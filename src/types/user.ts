import type { GradeLevel } from './reading';

export interface UserSettings {
  soundEnabled: boolean;
  speechEnabled: boolean;
  speechRate: number;
  reducedMotion: boolean;
  theme: 'day' | 'sunset' | 'cosmic';
  /** which Kokoro voice Ms. Luna speaks with */
  voiceId: string;
  /** accent the voices are drawn from */
  voiceLanguage: 'en-US' | 'en-GB';
  /** 'best' = full-precision voice, 'compact' = smaller download */
  voiceQuality: 'best' | 'compact';
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
  settings: UserSettings;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  iconEmoji: string;
  badgeColor: string;
  category: 'stars' | 'lessons' | 'streak' | 'skills' | 'special';
  requirement: (progress: UserProgress) => boolean;
}

