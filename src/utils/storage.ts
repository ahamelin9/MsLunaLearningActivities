import { useState, useEffect } from 'react';
import type { GradeLevel } from '../types/reading';
import type { UserProgress, UserSettings } from '../types/user';
import { soundManager } from './audio';
import { DEFAULT_VOICE_ID, pronunciation } from './pronunciation';
import { ACHIEVEMENTS } from '../data/achievements';
import { upgradeStickers } from '../apps/reading/engine/squishies';

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
  completedLessons: [],
  skillMastery: {},
  streakDays: 1,
  lastPlayedDate: null,
  unlockedAchievements: [],
  stickers: [],
  gamePlays: {},
  gameDifficulty: {},
  bestStars: {},
  times: {},
  partway: {},
  today: { day: '', minutes: 0 },
  settings: DEFAULT_SETTINGS
};

/**
 * Every achievement worked out in one place (PRG-3), from its own rule in
 * `data/achievements.ts`: each one met and not yet unlocked is added. Run on
 * every save and on load, so an older save gets what it has earned; the
 * Trophy room only reads `unlockedAchievements`.
 */
function withEarned(progress: UserProgress): UserProgress {
  const earned = ACHIEVEMENTS.filter(a => !progress.unlockedAchievements.includes(a.id) && a.requirement(progress)).map(a => a.id);
  return earned.length ? { ...progress, unlockedAchievements: [...progress.unlockedAchievements, ...earned] } : progress;
}

/** A time in whole minutes, as a child sees it: never under one (PRG-6). */
export const minutesOf = (seconds: number): number => Math.max(1, Math.round(seconds / 60));

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
      // and its points: stars carry the meaning (PRG-2)
      delete parsed.totalPoints;
      const loadedSettings = {
        ...DEFAULT_SETTINGS,
        ...savedSettings
      };
      // what an older save has already earned, unlocked now (PRG-3)
      return withEarned({
        ...DEFAULT_PROGRESS,
        ...parsed,
        selectedGrade: parsed.selectedGrade || null,
        // an older save's stickers come back as squishies, as many as before (PRG-5a)
        stickers: Array.isArray(parsed.stickers) ? upgradeStickers(parsed.stickers) : [],
        gamePlays: parsed.gamePlays && typeof parsed.gamePlays === 'object' ? parsed.gamePlays : {},
        gameDifficulty: parsed.gameDifficulty && typeof parsed.gameDifficulty === 'object' ? parsed.gameDifficulty : {},
        bestStars: bestStarsOf(parsed),
        // an older save has no times yet (PRG-6)
        times: parsed.times && typeof parsed.times === 'object' ? parsed.times : {},
        // an older save has nothing part-way (PRG-8)
        partway: parsed.partway && typeof parsed.partway === 'object' ? parsed.partway : {},
        today: parsed.today && typeof parsed.today.day === 'string' ? parsed.today : { day: '', minutes: 0 },
        settings: loadedSettings
      });
    } catch (e) {
      console.error('Failed to load user progress:', e);
      return { ...DEFAULT_PROGRESS };
    }
  }

  private persist() {
    this.progress = withEarned(this.progress);
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
    skillId: string,
    /** lessons run in the game shell, so finishing one can bring a squishy too (PRG-5a) */
    squishyId?: string | null
  ): { isFirstCompletion: boolean; newAchievements: string[] } {
    const unlockedBefore = this.progress.unlockedAchievements;
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
    const stickers = this.withSquishy(squishyId);

    this.progress = {
      ...this.progress,
      completedLessons: updatedCompleted,
      stickers,
      totalStars,
      skillMastery: updatedMastery,
      bestStars,
      // finished: nothing part-way any more (PRG-8)
      partway: Object.fromEntries(Object.entries(this.progress.partway).filter(([id]) => id !== lessonId)),
      streakDays: streak,
      lastPlayedDate: today
    };

    this.persist();
    return { isFirstCompletion, newAchievements: this.progress.unlockedAchievements.filter(id => !unlockedBefore.includes(id)) };
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

  /** The shelf with a new squishy on it, once ("kind:colour"; PRG-5a). */
  private withSquishy(squishyId?: string | null): string[] {
    return squishyId && !this.progress.stickers.includes(squishyId)
      ? [...this.progress.stickers, squishyId]
      : this.progress.stickers;
  }

  /**
   * Records a finished mini-game: stars, play count and any new squishy for
   * the shelf.
   */
  public recordGameCompletion(opts: {
    gameId: string;
    starsEarned: number;
    squishyId?: string | null;
  }): { newAchievements: string[] } {
    const { gameId, starsEarned, squishyId } = opts;
    const unlockedBefore = this.progress.unlockedAchievements;
    const { streak, today } = this.computeStreak();

    const { gain, bestStars } = this.starsAbove(gameId, starsEarned);
    const totalStars = this.progress.totalStars + gain;
    const stickers = this.withSquishy(squishyId);

    const gamePlays = {
      ...this.progress.gamePlays,
      [gameId]: (this.progress.gamePlays[gameId] || 0) + 1
    };

    this.progress = {
      ...this.progress,
      totalStars,
      stickers,
      gamePlays,
      bestStars,
      streakDays: streak,
      lastPlayedDate: today
    };

    this.persist();
    return { newAchievements: this.progress.unlockedAchievements.filter(id => !unlockedBefore.includes(id)) };
  }

  /**
   * Saves how long a play of a lesson or game took (PRG-6), and adds its
   * minutes, as the done screen shows them, to today's. A lesson picked up
   * part-way passes the minutes it already added when it was left (PRG-11),
   * so they aren't counted twice.
   */
  public recordTime(id: string, seconds: number, counted = 0) {
    const was = this.progress.times[id];
    const day = localDay(new Date());
    const today = this.progress.today.day === day ? this.progress.today.minutes : 0;
    this.progress = {
      ...this.progress,
      times: {
        ...this.progress.times,
        [id]: {
          last: seconds,
          best: was ? Math.min(was.best, seconds) : seconds,
          plays: (was?.plays ?? 0) + 1,
          total: (was?.total ?? 0) + seconds
        }
      },
      today: { day, minutes: today + Math.max(0, minutesOf(seconds) - counted) }
    };
    this.persist();
  }

  /**
   * Saves how far into the lesson up next a child is (PRG-8): its rounds won,
   * how many first time, and the time it carried in from before (PRG-11).
   */
  public setPartway(lessonId: string, won: number, clean: number, carried: { seconds: number; counted: number }) {
    this.progress = { ...this.progress, partway: { ...this.progress.partway, [lessonId]: { won, clean, ...carried } } };
    this.persist();
  }

  /**
   * A lesson left before its end (PRG-11): its minutes so far join Today.
   * `seconds` is its whole time so far and `counted` the minutes of it Today
   * already has. Once a round is won, the lesson up next keeps the time with
   * its rounds, so finishing it later shows the whole time.
   */
  public leaveLesson(lessonId: string, keep: { won: number; clean: number } | null, seconds: number, counted: number) {
    const minutes = Math.round(seconds / 60);
    this.progress = {
      ...this.progress,
      partway: keep && keep.won > 0
        ? { ...this.progress.partway, [lessonId]: { ...keep, seconds, counted: minutes } }
        : this.progress.partway,
      today: { day: localDay(new Date()), minutes: this.todayMinutes() + Math.max(0, minutes - counted) }
    };
    this.persist();
  }

  /** The minutes read today, on the iPad's own day (PRG-6). */
  public todayMinutes(): number {
    return this.progress.today.day === localDay(new Date()) ? this.progress.today.minutes : 0;
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
