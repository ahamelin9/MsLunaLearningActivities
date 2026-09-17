// Sound effects, synthesised in the browser: pops, chimes, fanfares.
// Speech is NOT handled here — it belongs to the pronunciation service,
// which knows the difference between a letter's name and its sound.

import { pronunciation, type SpeakOptions } from './pronunciation';

class SoundManager {
  private audioCtx: AudioContext | null = null;
  private isMuted: boolean = false;

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {
        // audio context resume error
      });
    }
    return this.audioCtx;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  public setSpeechMuted(muted: boolean) {
    pronunciation.setMuted(muted);
  }

  public setSpeechRate(rate: number) {
    pronunciation.setRate(rate);
  }

  // --- Sound Effects Synthesis ---

  public playPop() {
    if (this.isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      const now = ctx.currentTime;
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(740, now + 0.08);

      gain.gain.setValueAtTime(0.28, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.08);
    } catch {
      // ignore
    }
  }

  public playLetterTap() {
    if (this.isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      const now = ctx.currentTime;
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.06);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.06);
    } catch {
      // ignore
    }
  }

  public playLetterSnap() {
    if (this.isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      const now = ctx.currentTime;
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(660, now + 0.05);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.05);
    } catch {
      // ignore
    }
  }

  public playCorrect() {
    if (this.isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      // Joyful 4-tone arpeggio: C5, E5, G5, C6
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const start = now + idx * 0.07;
        const dur = 0.22;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(0.22, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + dur);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(start);
        osc.stop(start + dur);
      });
    } catch {
      // ignore
    }
  }

  public playStarChime() {
    if (this.isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const freqs = [880, 1108.73, 1318.51, 1760];
      freqs.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const start = now + i * 0.05;
        const dur = 0.3;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(0.18, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + dur);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(start);
        osc.stop(start + dur);
      });
    } catch {
      // ignore
    }
  }

  public playFanfare() {
    if (this.isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const melody = [
        { freq: 523.25, start: 0.0, dur: 0.12 },
        { freq: 523.25, start: 0.14, dur: 0.12 },
        { freq: 523.25, start: 0.28, dur: 0.12 },
        { freq: 659.25, start: 0.42, dur: 0.24 },
        { freq: 783.99, start: 0.68, dur: 0.22 },
        { freq: 1046.5, start: 0.92, dur: 0.6 }
      ];

      melody.forEach(({ freq, start, dur }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const tStart = now + start;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, tStart);

        gain.gain.setValueAtTime(0.24, tStart);
        gain.gain.exponentialRampToValueAtTime(0.001, tStart + dur);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(tStart);
        osc.stop(tStart + dur);
      });
    } catch {
      // ignore
    }
  }

  public playTryAgain() {
    if (this.isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const tones = [
        { freq: 440, start: 0, dur: 0.12 },
        { freq: 392, start: 0.12, dur: 0.18 }
      ];

      tones.forEach(({ freq, start, dur }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const tStart = now + start;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, tStart);

        gain.gain.setValueAtTime(0.15, tStart);
        gain.gain.exponentialRampToValueAtTime(0.001, tStart + dur);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(tStart);
        osc.stop(tStart + dur);
      });
    } catch {
      // ignore
    }
  }

  public playAppLaunch() {
    if (this.isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.exponentialRampToValueAtTime(800, now + 0.2);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.2);
    } catch {
      // ignore
    }
  }

  // --- Narration: delegated to the pronunciation service ---
  //
  // Kept on soundManager so existing callers keep working, but anything
  // phonics-related should call the pronunciation service directly and say
  // which kind of sound it wants (speakLetterName vs speakLetterSound).

  public isSpeechAvailable(): boolean {
    return typeof window !== 'undefined';
  }

  /** General narration: prompts, praise, instructions. */
  public speak(text: string, options?: SpeakOptions & { pitch?: number }): void {
    pronunciation.speakText(text, options);
  }

  public stopSpeaking() {
    pronunciation.stop();
  }

  /**
   * The pure sound a letter makes: /m/ is "mmmm", never "em".
   * @deprecated prefer pronunciation.speakLetterSound for new code
   */
  public speakPhoneme(phoneme: string, onEnd?: () => void) {
    pronunciation.speakLetterSound(phoneme, { onEnd });
  }

  /** Sound out each chunk, then blend the whole word. */
  public soundOutSequence(
    letters: string[],
    wholeWord: string,
    onLetterActive: (index: number) => void,
    onComplete: () => void
  ) {
    pronunciation.soundOutWord(letters, wholeWord, {
      onChunk: onLetterActive,
      onEnd: onComplete
    });
  }
}

export const soundManager = new SoundManager();
