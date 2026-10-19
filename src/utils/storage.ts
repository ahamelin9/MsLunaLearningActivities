import { useState, useEffect } from 'react';
import type { GradeLevel } from '../types/reading';
import type { UserProgress, UserSettings } from '../types/user';
import { soundManager } from './audio';
import { DEFAULT_VOICE_ID, pronunciation } from './pronunciation';

const STORAGE_KEY = 'ms_luna_learning_progress_v1';

/**
 * The date where the iPad is, as YYYY-MM-DD. The streak counted UTC dates,
 * which roll over at 7 or 8 pm on the East Coast (BUG-12).
 */
export function localDay(now: Date): string {
  const two = (n: number) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${two(now.getMonth() + 1)}-${two(now.getDate())}`;
}

export const DEFAULT_SETTINGS: UserSettings = {
  soundEnabled: true,
  speechEnabled: true,
  speechRate: 0.95,
  reducedMotion: false,
  theme: 'match',
  voiceId: DEFAULT_VOICE_ID,
};

export const DEFAULT_PROGRESS: UserProgress = {
  selectedGrade: null,
  totalStars: 0,
  totalPoints: 0,
  completedLessons: [],
  skillMastery: {},
  streakDays: 1,
  lastPlayedDate: null,
  unlockedAchievements: [],
  stickers: [],
  gamePlays: {},
  gameDifficulty: {},
  bestStars: {},
  settings: DEFAULT_SETTINGS
};

/**
 * A save from before PRG-1 has no best stars, and its stars were paid per
 * round (5 for a lesson, up to 6 a game): anything it finished counts as a
 * best of 3, so no child loses a star and a replay adds none.
 */
function bestStarsOf(parsed: Partial<UserProgress>): Record<string, number> {
  if (parsed.bestStars && typeof parsed.bestStars === 'object') return parsed.bestStars;
  const done = [...(Array.isArray(parsed.completedLessons) ? parsed.completedLessons : []), ...Object.keys(parsed.gamePlays ?? {})];
  return Object.fromEntries(done.map(id => [id, 3]));
}

type ProgressListener = (progress: UserProgress) => void;

class StorageService {
  private progress: UserProgress;
  private listeners: Set<ProgressListener> = new Set();

  constructor() {
    this.progress = this.loadFromStorage();
    this.applySettings(this.progress.settings);
  }

  private loadFromStorage(): UserProgress {
    if (typeof window === 'undefined') return { ...DEFAULT_PROGRESS };
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { ...DEFAULT_PROGRESS };
      const parsed = JSON.parse(raw);
      // an older save's accent setting is gone: the voice carries its accent (SET-3)
      const { voiceLanguage: _accent, ...savedSettings } = parsed.settings || {};
      void _accent;
      const loadedSettings = {
        ...DEFAULT_SETTINGS,
        ...savedSettings
      };
      return {
        ...DEFAULT_PROGRESS,
        ...parsed,
        selectedGrade: parsed.selectedGrade || null,
        stickers: Array.isArray(parsed.stickers) ? parsed.stickers : [],
        gamePlays: parsed.gamePlays && typeof parsed.gamePlays === 'object' ? parsed.gamePlays : {},
        gameDifficulty: parsed.gameDifficulty && typeof parsed.gameDifficulty === 'object' ? parsed.gameDifficulty : {},
        bestStars: bestStarsOf(parsed),
        settings: loadedSettings
      };
    } catch (e) {
      console.error('Failed to load user progress:', e);
      return { ...DEFAULT_PROGRESS };
    }
  }

  private persist() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.progress));
      this.notifyListeners();
    } catch (e) {
      console.error('Failed to save user progress:', e);
    }
  }

  private notifyListeners() {
    const copy = this.getProgress();
    this.listeners.forEach(listener => {
      try {
        listener(copy);
      } catch (err) {
        console.error('Listener error in StorageService:', err);
      }
    });
  }

  public subscribe(listener: ProgressListener): () => void {
    this.listeners.add(listener);
    // immediately call listener with current state
    listener(this.getProgress());
    return () => {
      this.listeners.delete(listener);
    };
  }

  public getProgress(): UserProgress {
    return JSON.parse(JSON.stringify(this.progress));
  }

  public setGrade(grade: GradeLevel | null) {
    this.progress = {
      ...this.progress,
      selectedGrade: grade
    };
    this.persist();
  }

  public updateSettings(partial: Partial<UserSettings>) {
    this.progress = {
      ...this.progress,
      settings: {
        ...this.progress.settings,
        ...partial
      }
    };
    this.applySettings(this.progress.settings);
    this.persist();
  }

  private applySettings(settings: UserSettings) {
    soundManager.setMuted(!settings.soundEnabled);
    soundManager.setSpeechMuted(!settings.speechEnabled);
    soundManager.setSpeechRate(settings.speechRate);
    pronunciation.setVoice(settings.voiceId || DEFAULT_VOICE_ID);
  }

  public recordLessonCompletion(
    lessonId: string,
    starsEarned: number,
    pointsEarned: number,
    skillId: string,
    /** lessons run in the game shell, so finishing one can peel a sticker too */
    stickerId?: string | null
  ): { isFirstCompletion: boolean; newAchievements: string[] } {
    const isFirstCompletion = !this.progress.completedLessons.includes(lessonId);

    const updatedCompleted = isFirstCompletion
      ? [...this.progress.completedLessons, lessonId]
      : this.progress.completedLessons;

    const currentSkillCount = this.progress.skillMastery[skillId] || 0;
    const updatedMastery = {
      ...this.progress.skillMastery,
      [skillId]: currentSkillCount + 1
    };

    const { streak, today } = this.computeStreak();

    const { gain, bestStars } = this.starsAbove(lessonId, starsEarned);
    const totalStars = this.progress.totalStars + gain;
    const totalPoints = this.progress.totalPoints + pointsEarned;

    const { updatedAchievements, newAchievements } = this.checkAchievements(
      updatedCompleted.length,
      totalStars
    );

    const stickers = stickerId && !this.progress.stickers.includes(stickerId)
      ? [...this.progress.stickers, stickerId]
      : this.progress.stickers;

    this.progress = {
      ...this.progress,
      completedLessons: updatedCompleted,
      stickers,
      totalStars,
      totalPoints,
      skillMastery: updatedMastery,
      bestStars,
      streakDays: streak,
      lastPlayedDate: today,
      unlockedAchievements: updatedAchievements
    };

    this.persist();
    return { isFirstCompletion, newAchievements };
  }

  /** What a play's stars add: only those above this game's or lesson's best (PRG-1). */
  private starsAbove(id: string, stars: number): { gain: number; bestStars: Record<string, number> } {
    const best = this.progress.bestStars[id] ?? 0;
    return {
      gain: Math.max(0, stars - best),
      bestStars: stars > best ? { ...this.progress.bestStars, [id]: stars } : this.progress.bestStars
    };
  }

  private computeStreak(): { streak: number; today: string } {
    let streak = this.progress.streakDays;
    const today = localDay(new Date());

    if (this.progress.lastPlayedDate && this.progress.lastPlayedDate !== today) {
      // both read as midnight UTC on their dates, so whole days apart
      const lastDate = new Date(this.progress.lastPlayedDate);
      const currentDate = new Date(today);
      const diffDays = Math.round(
        Math.abs(currentDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (diffDays === 1) {
        streak += 1;
      } else if (diffDays > 1) {
        streak = 1;
      }
    }

    return { streak, today };
  }

  private checkAchievements(
    completedCount: number,
    totalStars: number
  ): { updatedAchievements: string[]; newAchievements: string[] } {
    const updatedAchievements = [...this.progress.unlockedAchievements];
    const newAchievements: string[] = [];

    const unlock = (id: string, condition: boolean) => {
      if (condition && !updatedAchievements.includes(id)) {
        updatedAchievements.push(id);
        newAchievements.push(id);
      }
    };

    unlock('first_step', completedCount >= 1);
    unlock('star_collector', totalStars >= 10);
    unlock('super_star', totalStars >= 50);
    unlock('bookworm', completedCount >= 5);

    return { updatedAchievements, newAchievements };
  }

  /**
   * Records a finished mini-game: stars, points, play count and any
   * sticker peeled off Luna's sheet.
   */
  public recordGameCompletion(opts: {
    gameId: string;
    starsEarned: number;
    pointsEarned: number;
    stickerId?: string | null;
  }): { newAchievements: string[] } {
    const { gameId, starsEarned, pointsEarned, stickerId } = opts;
    const { streak, today } = this.computeStreak();

    const { gain, bestStars } = this.starsAbove(gameId, starsEarned);
    const totalStars = this.progress.totalStars + gain;
    const totalPoints = this.progress.totalPoints + pointsEarned;

    const stickers = stickerId && !this.progress.stickers.includes(stickerId)
      ? [...this.progress.stickers, stickerId]
      : this.progress.stickers;

    const gamePlays = {
      ...this.progress.gamePlays,
      [gameId]: (this.progress.gamePlays[gameId] || 0) + 1
    };

    const playedCount = Object.values(gamePlays).reduce((sum, n) => sum + n, 0);
    const { updatedAchievements, newAchievements } = this.checkAchievements(
      this.progress.completedLessons.length + playedCount,
      totalStars
    );

    this.progress = {
      ...this.progress,
      totalStars,
      totalPoints,
      stickers,
      gamePlays,
      bestStars,
      streakDays: streak,
      lastPlayedDate: today,
      unlockedAchievements: updatedAchievements
    };

    this.persist();
    return { newAchievements };
  }

  /** Remembers the dial picked on a game's start screen (LVL-2). */
  public setGameDifficulty(gameId: string, difficulty: 1 | 2 | 3) {
    if (this.progress.gameDifficulty[gameId] === difficulty) return;
    this.progress = {
      ...this.progress,
      gameDifficulty: { ...this.progress.gameDifficulty, [gameId]: difficulty }
    };
    this.persist();
  }

  /**
   * Records a one-time event in the achievements (the milestone moon's
   * visits, DES-17). True the first time, false once it's been claimed.
   */
  public claimOnce(id: string): boolean {
    if (this.progress.unlockedAchievements.includes(id)) return false;
    this.progress = {
      ...this.progress,
      unlockedAchievements: [...this.progress.unlockedAchievements, id]
    };
    this.persist();
    return true;
  }

  public resetProgress() {
    this.progress = {
      ...DEFAULT_PROGRESS,
      settings: { ...this.progress.settings }
    };
    this.persist();
  }
}

export const storageService = new StorageService();

/**
 * Custom React Hook for reactive, real-time sync with storageService
 */
export function useUserProgress(): UserProgress {
  const [progress, setProgress] = useState<UserProgress>(() => storageService.getProgress());

  useEffect(() => {
    const unsubscribe = storageService.subscribe(newProgress => {
      setProgress(newProgress);
    });
    return () => unsubscribe();
  }, []);

  return progress;
}
