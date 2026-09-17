import { useState, useEffect } from 'react';
import type { GradeLevel } from '../types/reading';
import type { UserProgress, UserSettings } from '../types/user';
import { soundManager } from './audio';
import { DEFAULT_VOICE_ID, pronunciation } from './pronunciation';

const STORAGE_KEY = 'ms_luna_learning_progress_v1';

export const DEFAULT_SETTINGS: UserSettings = {
  soundEnabled: true,
  speechEnabled: true,
  speechRate: 0.95,
  reducedMotion: false,
  theme: 'sunset',
  voiceId: DEFAULT_VOICE_ID,
  voiceLanguage: 'en-US',
  voiceQuality: 'best'
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
  settings: DEFAULT_SETTINGS
};

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
      const loadedSettings = {
        ...DEFAULT_SETTINGS,
        ...(parsed.settings || {})
      };
      return {
        ...DEFAULT_PROGRESS,
        ...parsed,
        selectedGrade: parsed.selectedGrade || null,
        stickers: Array.isArray(parsed.stickers) ? parsed.stickers : [],
        gamePlays: parsed.gamePlays && typeof parsed.gamePlays === 'object' ? parsed.gamePlays : {},
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

  public toggleMasterSound(): boolean {
    const isCurrentlyOn = this.progress.settings.soundEnabled || this.progress.settings.speechEnabled;
    const nextState = !isCurrentlyOn;
    this.updateSettings({
      soundEnabled: nextState,
      speechEnabled: nextState
    });
    return nextState;
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
    pronunciation.setQuality(settings.voiceQuality === 'compact' ? 'compact' : 'best');
  }

  public recordLessonCompletion(
    lessonId: string,
    starsEarned: number,
    pointsEarned: number,
    skillId: string
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

    const totalStars = this.progress.totalStars + starsEarned;
    const totalPoints = this.progress.totalPoints + pointsEarned;

    const { updatedAchievements, newAchievements } = this.checkAchievements(
      updatedCompleted.length,
      totalStars
    );

    this.progress = {
      ...this.progress,
      completedLessons: updatedCompleted,
      totalStars,
      totalPoints,
      skillMastery: updatedMastery,
      streakDays: streak,
      lastPlayedDate: today,
      unlockedAchievements: updatedAchievements
    };

    this.persist();
    return { isFirstCompletion, newAchievements };
  }

  private computeStreak(): { streak: number; today: string } {
    let streak = this.progress.streakDays;
    const today = new Date().toISOString().split('T')[0];

    if (this.progress.lastPlayedDate && this.progress.lastPlayedDate !== today) {
      const lastDate = new Date(this.progress.lastPlayedDate);
      const currentDate = new Date(today);
      const diffDays = Math.ceil(
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

    const totalStars = this.progress.totalStars + starsEarned;
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
      streakDays: streak,
      lastPlayedDate: today,
      unlockedAchievements: updatedAchievements
    };

    this.persist();
    return { newAchievements };
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
