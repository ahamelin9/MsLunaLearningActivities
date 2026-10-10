// Ms. Luna's voice.
//
// Two engines sit behind one API:
//   1. Clips rendered ahead of time by Kokoro-82M (see scripts/voice/) and
//      served as ordinary audio files. Nothing is synthesised on the child's
//      device, so a tap makes a sound immediately; no API key, no server,
//      nothing about the child leaves the browser.
//   2. The browser's built-in speechSynthesis, used only for an utterance
//      nobody thought to render, so the app never goes silent.
//
// The API is deliberately split by educational intent rather than by string:
// speakLetterName('V') says "vee", speakLetterSound('V') makes the /v/ sound.
// Callers must choose; nothing here guesses.

import { carrierFor, letterNameOf, phonicsFor } from './phonics';
import { splitPhonics, type SpeechPart } from './speechParts';
import { voiceClips } from './voiceClips';
import { bucketFor, type ClipKind, type RateBucket } from './voiceKeys';

// re-exported: warmup.ts and main.tsx have always imported these from here
export { splitPhonics };
export type { SpeechPart };

export type VoiceEngine = 'neural' | 'browser' | 'none';

export type VoiceStatus =
  | { state: 'idle' }
  | { state: 'loading'; progress: number; label: string }
  | { state: 'ready'; engine: VoiceEngine; device: string }
  | { state: 'unavailable'; reason: string };

export interface SpeakOptions {
  /** 0.6 slow … 1.4 quick. Defaults to the user's speech-rate setting. */
  rate?: number;
  onStart?: () => void;
  onEnd?: () => void;
  /** false lets the clip queue behind whatever is playing */
  interrupt?: boolean;
}

export interface LunaVoice {
  id: string;
  name: string;
  language: 'en-US' | 'en-GB';
  description: string;
}

/**
 * Kokoro's own published voice grades: af_heart is the only English voice
 * graded A overall, so it is Ms. Luna by default.
 */
export const LUNA_VOICES: LunaVoice[] = [
  { id: 'af_heart', name: 'Luna (warm)', language: 'en-US', description: 'Warm American teacher — highest rated' },
  { id: 'af_bella', name: 'Bella (bright)', language: 'en-US', description: 'Bright and lively American' },
  { id: 'af_nicole', name: 'Nicole (soft)', language: 'en-US', description: 'Soft, close-up American' },
  { id: 'af_sarah', name: 'Sarah (clear)', language: 'en-US', description: 'Clear, even American' },
  { id: 'am_michael', name: 'Michael (calm)', language: 'en-US', description: 'Calm American man' },
  { id: 'am_puck', name: 'Puck (playful)', language: 'en-US', description: 'Playful American man' },
  { id: 'bf_emma', name: 'Emma (British)', language: 'en-GB', description: 'Warm British woman' },
  { id: 'bf_isabella', name: 'Isabella (British)', language: 'en-GB', description: 'Gentle British woman' },
  { id: 'bm_george', name: 'George (British)', language: 'en-GB', description: 'Friendly British man' },
  { id: 'bm_fable', name: 'Fable (British)', language: 'en-GB', description: 'Storyteller British man' }
];

export const DEFAULT_VOICE_ID = 'af_heart';


/**
 * What to play, in the terms the rendered library is indexed by. The kind
 * carries the educational intent — a 'sound' and a 'name' for the same letter
 * are different recordings — and the bucket is the child's speed setting.
 */
interface ClipRequest {
  kind: ClipKind;
  value: string;
  /** handed to the browser voice if this clip was never rendered */
  text: string;
  bucket: RateBucket;
}

class PronunciationService {
  private ready = false;
  private loading: Promise<boolean> | null = null;
  private status: VoiceStatus = { state: 'idle' };
  private listeners = new Set<(s: VoiceStatus) => void>();
  private busyListeners = new Set<(busy: boolean) => void>();

  private ctx: AudioContext | null = null;
  private currentSource: AudioBufferSourceNode | null = null;

  /** bumped whenever speech is interrupted, so late clips stay silent */
  private generation = 0;
  /** utterances a child is waiting on, so warming can yield to them */
  private liveRequests = 0;
  /** when init was last tried, so a failed index is retried but not hammered */
  private lastInitAttempt = 0;
  private voiceId: string = DEFAULT_VOICE_ID;
  private rate = 1;
  private muted = false;
  /** the caller can replay whatever was said last */
  private lastRequest: (() => void) | null = null;
  private browserVoices: SpeechSynthesisVoice[] = [];

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const load = () => {
        this.browserVoices = window.speechSynthesis.getVoices();
      };
      load();
      window.speechSynthesis.onvoiceschanged = load;
    }
  }

  // ---------- configuration ----------

  /**
   * Each voice is a separate set of rendered clips, so switching means a
   * different manifest. A voice that was never rendered — a choice saved
   * before that voice existed, say — falls back to the default rather than
   * quietly dropping Luna to the robotic browser voice.
   */
  setVoice(voiceId: string) {
    if (!LUNA_VOICES.some(v => v.id === voiceId)) return;
    if (voiceId === this.voiceId) return;

    this.voiceId = voiceId;

    void voiceClips.manifest(voiceId).then(manifest => {
      if (!manifest && this.voiceId === voiceId) {
        this.voiceId = DEFAULT_VOICE_ID;
      }
      if (this.ready) void this.prewarmPhonics();
    });
  }

  getVoice(): string {
    return this.voiceId;
  }

  setRate(rate: number) {
    this.rate = Math.max(0.6, Math.min(1.4, rate));
  }

  setMuted(muted: boolean) {
    this.muted = muted;
    if (muted) this.stop();
  }

  onStatus(listener: (s: VoiceStatus) => void): () => void {
    this.listeners.add(listener);
    listener(this.status);
    return () => this.listeners.delete(listener);
  }

  getStatus(): VoiceStatus {
    return this.status;
  }

  /**
   * True while a clip is being generated and nothing is playing yet, so the
   * interface can show that Luna is about to speak instead of going quiet.
   */
  onBusy(listener: (busy: boolean) => void): () => void {
    this.busyListeners.add(listener);
    listener(this.liveRequests > 0);
    return () => this.busyListeners.delete(listener);
  }

  private setBusy(busy: boolean) {
    this.busyListeners.forEach(l => {
      try {
        l(busy);
      } catch {
        // a broken listener must not break speech
      }
    });
  }

  private setStatus(next: VoiceStatus) {
    this.status = next;
    this.listeners.forEach(l => {
      try {
        l(next);
      } catch {
        // a broken listener must not break speech
      }
    });
  }

  // ---------- engine ----------

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const Ctor =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return null;
      this.ctx = new Ctor();
    }
    if (this.ctx.state === 'suspended') void this.ctx.resume().catch(() => {});
    return this.ctx;
  }

  /**
   * Loads the index of rendered clips. This is one small JSON fetch, not a
   * model download, so it finishes in milliseconds — the progress states
   * survive only because the UI already knows how to show them.
   */
  async init(): Promise<boolean> {
    if (this.ready) return true;
    if (this.loading) return this.loading;

    this.loading = (async () => {
      this.setStatus({ state: 'loading', progress: 10, label: 'Waking Ms. Luna up…' });

      let manifest = await voiceClips.manifest(this.voiceId);
      // A voice saved before it stopped being shipped (every voice used to
      // run on-device) has no clips: start as Luna rather than failing, or
      // the child's first impression is the browser voice.
      if (!manifest && this.voiceId !== DEFAULT_VOICE_ID) {
        this.voiceId = DEFAULT_VOICE_ID;
        manifest = await voiceClips.manifest(this.voiceId);
      }
      if (!manifest) {
        this.failed(`No rendered voice for "${this.voiceId}".`);
        return false;
      }

      this.ready = true;
      this.setStatus({ state: 'ready', engine: 'neural', device: 'pre-rendered' });
      return true;
    })();

    return this.loading;
  }

  /** The voices that actually have audio on disk, so the picker can hide the rest. */
  async renderedVoices(): Promise<Set<string>> {
    return voiceClips.available(LUNA_VOICES.map(v => v.id));
  }

  private failed(reason: string) {
    this.ready = false;
    this.loading = null;
    this.setStatus({
      state: 'unavailable',
      reason: this.browserSpeechAvailable() ? 'Using the built-in voice for now.' : `No speech available: ${reason}`
    });
  }

  private browserSpeechAvailable(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  // ---------- generation & playback ----------

  /** The decoded clip for this request, or null if it was never rendered. */
  private async fetchClip(req: ClipRequest): Promise<AudioBuffer | null> {
    const ctx = this.getContext();
    if (!ctx) return null;
    return voiceClips.get(ctx, this.voiceId, req.kind, req.value, req.bucket);
  }

  private playBuffer(buffer: AudioBuffer, onEnd?: () => void): boolean {
    const ctx = this.getContext();
    if (!ctx) {
      onEnd?.();
      return false;
    }
    try {
      const source = ctx.createBufferSource();
      source.buffer = buffer;

      const gain = ctx.createGain();
      gain.gain.value = 1;
      source.connect(gain);
      gain.connect(ctx.destination);

      // `onended` is the normal signal, but a backup timer tied to the clip's
      // own length guarantees the caller is always released.
      let finished = false;
      const finish = () => {
        if (finished) return;
        finished = true;
        window.clearTimeout(backup);
        if (this.currentSource === source) this.currentSource = null;
        onEnd?.();
      };
      const backup = window.setTimeout(finish, buffer.duration * 1000 + 400);

      source.onended = finish;
      this.currentSource = source;
      source.start();
      return true;
    } catch {
      onEnd?.();
      return false;
    }
  }

  private speakWithBrowser(text: string, options?: SpeakOptions) {
    if (!this.browserSpeechAvailable() || this.muted) {
      options?.onEnd?.();
      return;
    }
    // Reaching the browser voice means a clip was missing. It is meant to be
    // unreachable in a finished build, so say so loudly in development: the
    // symptom otherwise is half a second of robot voice before the next
    // utterance cancels it, which is very hard to trace back to a cause.
    if (import.meta.env?.DEV) {
      console.warn(`[voice] FELL BACK to the browser voice for: ${JSON.stringify(text)}`);
    }
    try {
      if (options?.interrupt !== false) window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = options?.rate ?? this.rate;
      utterance.pitch = 1;
      utterance.lang = this.currentLanguage();

      const preferred = [
        'Samantha (Enhanced)', 'Ava (Premium)', 'Ava', 'Samantha', 'Google US English',
        'Microsoft Aria Online (Natural)', 'Victoria', 'Karen'
      ];
      const voices = this.browserVoices.length ? this.browserVoices : window.speechSynthesis.getVoices();
      const match =
        preferred.map(n => voices.find(v => v.name.includes(n) && v.lang.startsWith('en'))).find(Boolean) ??
        voices.find(v => v.lang === this.currentLanguage()) ??
        voices.find(v => v.lang.startsWith('en'));
      if (match) utterance.voice = match;

      utterance.onstart = () => options?.onStart?.();
      utterance.onend = () => options?.onEnd?.();
      utterance.onerror = () => options?.onEnd?.();

      window.speechSynthesis.speak(utterance);
    } catch {
      options?.onEnd?.();
    }
  }

  private currentLanguage(): 'en-US' | 'en-GB' {
    return LUNA_VOICES.find(v => v.id === this.voiceId)?.language ?? 'en-US';
  }

  /** Core path: try the neural clip, fall back to the browser voice. */
  private async say(req: ClipRequest, fallbackText: string, options?: SpeakOptions) {
    if (this.muted) {
      options?.onEnd?.();
      return;
    }
    if (options?.interrupt !== false) this.stop();
    const generation = this.generation;

    options?.onStart?.();

    // Loading the index is one small fetch, so it is worth waiting for rather
    // than letting the first utterance fall back to the browser voice. A
    // previous failure is retried rather than being final — the app may simply
    // have opened before the network was up — but not more than once every few
    // seconds, so a genuinely missing index does not retry on every tap.
    if (!this.ready) {
      const now = Date.now();
      if (this.status.state !== 'unavailable' || now - this.lastInitAttempt > 5000) {
        this.lastInitAttempt = now;
        await this.init();
      }
    }

    if (this.ready) {
      this.liveRequests += 1;
      // a cached clip plays instantly and a cold one is a short fetch, so
      // this only ever appears on a genuinely slow network
      const busyTimer = window.setTimeout(() => {
        if (this.liveRequests > 0) this.setBusy(true);
      }, 350);

      let buffer: AudioBuffer | null = null;
      try {
        buffer = await this.fetchClip(req);
      } finally {
        this.liveRequests -= 1;
        window.clearTimeout(busyTimer);
        if (this.liveRequests === 0) this.setBusy(false);
      }

      // While this was being fetched the child tapped something else, so
      // this clip is no longer wanted: drop it rather than talk over them.
      if (generation !== this.generation) return;

      if (buffer) {
        if (this.playBuffer(buffer, options?.onEnd)) return;
      }
    }

    if (generation !== this.generation) return;
    this.speakWithBrowser(fallbackText, { ...options, onStart: undefined });
  }

  /**
   * Which recording a piece of speech wants, without saying it.
   *
   * The rate is folded into one of three buckets because that is what the
   * settings screen offers and what was rendered; an exact float would name a
   * file that does not exist.
   */
  private request(part: SpeechPart, rate?: number): { req: ClipRequest; fallback: string } | null {
    const bucket = bucketFor(rate ?? this.rate);

    if (part.sound) {
      const carrier = carrierFor(part.sound);
      return {
        req: { kind: 'sound', value: part.sound, text: carrier, bucket },
        fallback: carrier
      };
    }
    if (part.name) {
      const name = letterNameOf(part.name);
      return {
        req: { kind: 'name', value: part.name, text: name, bucket },
        fallback: name
      };
    }
    if (part.word) {
      const clean = part.word.replace(/[^a-zA-Z'\u2019-]/g, '').trim();
      if (!clean) return null;
      return {
        req: { kind: 'word', value: clean, text: clean, bucket },
        fallback: clean
      };
    }
    if (part.text) {
      const clean = part.text.replace(/[\u2026]/g, '...').trim();
      if (!clean) return null;
      return {
        req: { kind: 'text', value: clean, text: clean, bucket },
        fallback: clean
      };
    }
    return null;
  }

  /**
   * Generate clips ahead of time so a multi-part prompt plays without gaps
   * while each piece is synthesised.
   */
  prefetch(parts: SpeechPart[], rate?: number) {
    if (!this.ready) return;
    this.spokenParts(parts).forEach(part => {
      const built = this.request(part, rate);
      if (built) void this.fetchClip(built.req);
    });
  }

  // ---------- public API ----------

  /** Ordinary narration: prompts, encouragement, instructions. */
  speakText(text: string, options?: SpeakOptions) {
    this.lastRequest = () => this.speakText(text, options);
    this.speakProse(text, options);
  }

  /**
   * Speaks a sentence, lifting out any phoneme written inside it so it is
   * sounded rather than spelled.
   */
  private speakProse(text: string, options?: SpeakOptions) {
    const parts = this.proseParts(text);
    if (parts.length === 1) this.speakPart(parts[0], options);
    else this.playSequence(parts, options);
  }

  /**
   * The pieces a line of prose is said in: a phoneme written inside it ("the
   * mmmm sound") is a clip of its own, and so is the text either side.
   * Speaking, prefetching and warming all split prose here, so they ask for
   * the same clips — and the same ones the renderer made.
   */
  private proseParts(text: string): SpeechPart[] {
    const parts = splitPhonics(text);
    if (parts.length > 1) return parts;
    // a line that is nothing but a phoneme ("Shhh!") is that sound
    return [parts[0]?.sound ? parts[0] : { text }];
  }

  /** Every part as it is actually said, with prose split into its pieces. */
  private spokenParts(parts: SpeechPart[]): SpeechPart[] {
    return parts.flatMap(part => (part.text ? this.proseParts(part.text) : [part]));
  }

  /** "V" → "vee". The name of the letter, never its sound. */
  speakLetterName(letter: string, options?: SpeakOptions) {
    this.lastRequest = () => this.speakLetterName(letter, options);
    this.speakPart({ name: letter }, options);
  }

  /** "V" → /v/, an actual isolated phoneme. */
  speakLetterSound(letter: string, options?: SpeakOptions & { alternate?: boolean }) {
    this.lastRequest = () => this.speakLetterSound(letter, options);

    const entry = phonicsFor(letter);
    if (options?.alternate && entry?.alternate) {
      const carrier = entry.alternate.carrier;
      void this.say(
        {
          kind: 'sound',
          value: `${letter}+alt`,
          text: carrier,
          bucket: bucketFor(options.rate ?? this.rate)
        },
        carrier,
        options
      );
      return;
    }

    this.speakPart({ sound: letter }, options);
  }

  /** "V is for van" — the sound, then the word that carries it. */
  speakLetterExample(letter: string, options?: SpeakOptions) {
    const entry = phonicsFor(letter);
    if (!entry) return this.speakText(letter, options);
    this.lastRequest = () => this.speakLetterExample(letter, options);
    this.speakSequence(
      [{ sound: letter }, { text: `${entry.letter} is for` }, { word: entry.exampleWord }],
      options
    );
  }

  /** A single vocabulary word, said a touch slower than a sentence. */
  speakWord(word: string, options?: SpeakOptions) {
    this.lastRequest = () => this.speakWord(word, options);
    this.speakPart({ word }, options);
  }

  speakSentence(sentence: string, options?: SpeakOptions) {
    this.lastRequest = () => this.speakSentence(sentence, options);
    this.speakProse(sentence, options);
  }

  /**
   * Sound out a word chunk by chunk, then blend it:  /k/ /a/ /t/ … cat.
   * onChunk lets the UI light up the letter currently being said.
   */
  soundOutWord(
    chunks: string[],
    wholeWord: string,
    handlers?: { onChunk?: (index: number) => void; onEnd?: () => void; gapMs?: number }
  ) {
    this.lastRequest = () => this.soundOutWord(chunks, wholeWord, handlers);
    const gap = handlers?.gapMs ?? 260;
    // generate the whole run up front so the blending is not stop-start
    this.prefetch([...chunks.map(c => ({ sound: c })), { word: wholeWord }]);

    this.stop();
    const generation = this.generation;

    let index = 0;
    const next = () => {
      if (generation !== this.generation) return;
      if (index >= chunks.length) {
        handlers?.onChunk?.(-1);
        window.setTimeout(() => {
          if (generation !== this.generation) return;
          this.speakPart({ word: wholeWord }, { onEnd: handlers?.onEnd, interrupt: false });
        }, gap);
        return;
      }
      const chunk = chunks[index];
      handlers?.onChunk?.(index);
      const guard = this.once(() => {
        index += 1;
        window.setTimeout(next, gap);
      });
      this.speakPart({ sound: chunk }, { interrupt: false, onEnd: guard.done });
    };

    next();
  }

  /**
   * Runs `fn` once, either when speech reports it finished or after a
   * watchdog delay — a voice that never reports completion must never
   * leave a game waiting.
   */
  private once(fn: () => void, watchdogMs = 25000): { done: () => void } {
    let fired = false;
    const run = () => {
      if (fired) return;
      fired = true;
      window.clearTimeout(timer);
      fn();
    };
    const timer = window.setTimeout(run, watchdogMs);
    return { done: run };
  }

  /** Shared path for every single-piece utterance. */
  private speakPart(part: SpeechPart, options?: SpeakOptions) {
    const built = this.request(part, options?.rate);
    if (!built) {
      options?.onEnd?.();
      return;
    }
    void this.say(built.req, built.fallback, options);
  }

  /**
   * Say several pieces in order, each with its own intent, e.g.
   *   [{text:'What letter says'}, {sound:'M'}, {text:'?'}]
   * This is how a prompt can contain a real phoneme instead of a letter name.
   */
  speakSequence(parts: SpeechPart[], options?: SpeakOptions) {
    this.lastRequest = () => this.speakSequence(parts, options);
    this.playSequence(parts, options);
  }

  /**
   * speakSequence without becoming what replayLast repeats, for the pieces of
   * a larger utterance: the replay button must say the whole of it.
   */
  private playSequence(input: SpeechPart[], options?: SpeakOptions) {
    const parts = this.spokenParts(input);
    // start every clip generating now, so the pieces run together
    this.prefetch(parts, options?.rate);
    let index = 0;

    if (options?.interrupt !== false) this.stop();
    const generation = this.generation;

    const next = () => {
      if (generation !== this.generation) return;
      if (index >= parts.length) {
        options?.onEnd?.();
        return;
      }
      const part = parts[index];
      index += 1;
      // sound after sound is a word being sounded out: give each one the
      // same room soundOutWord does, so /p/ /i/ /g/ does not run together
      const gap = part.sound && parts[index]?.sound ? 260 : 120;
      const guard = this.once(() => window.setTimeout(next, gap));
      const step: SpeakOptions = { interrupt: false, rate: options?.rate, onEnd: guard.done };

      // speakPart, not speak*(): those remember themselves for replayLast,
      // and the replay button must repeat the whole sequence rather than
      // only its last piece (prose is already split into its pieces)
      if (part.text || part.sound || part.name || part.word) this.speakPart(part, step);
      else if (part.pause) window.setTimeout(next, part.pause);
      else next();
    };

    options?.onStart?.();
    next();
  }

  /** Repeat whatever was said last — wired to the replay buttons. */
  replayLast() {
    this.lastRequest?.();
  }

  stop() {
    this.generation += 1;
    try {
      this.currentSource?.stop();
    } catch {
      // already finished
    }
    this.currentSource = null;
    if (this.browserSpeechAvailable()) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // ignore
      }
    }
  }

  /**
   * Quietly pull in the things Luna is about to say, so that by the time a
   * child taps something the clip is already decoded and waiting.
   */
  warm(parts: SpeechPart[], rate?: number) {
    if (!this.ready) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const bucket = bucketFor(rate ?? this.rate);
    const wanted: Array<{ kind: ClipKind; value: string }> = [];

    for (const part of this.spokenParts(parts)) {
      const built = this.request(part, rate);
      if (built) wanted.push({ kind: built.req.kind, value: built.req.value });
    }

    void voiceClips.prefetch(ctx, this.voiceId, bucket, wanted);
  }

  /**
   * Every phoneme and letter name, fetched up front.
   *
   * This used to be a slow, selective warm-up because each sound cost a neural
   * inference; now the whole set is a few hundred kilobytes of audio, so there
   * is no reason to be choosy — after this, no phonics tap ever waits.
   */
  async prewarmPhonics() {
    if (!this.ready) await this.init();
    if (!this.ready) return;

    const ctx = this.getContext();
    if (!ctx) return;

    const bucket = bucketFor(this.rate);
    const [sounds, names] = await Promise.all([
      voiceClips.keysOfKind(this.voiceId, 'sound', bucket),
      voiceClips.keysOfKind(this.voiceId, 'name', bucket)
    ]);

    await voiceClips.prefetch(ctx, this.voiceId, bucket, [
      ...sounds.map(value => ({ kind: 'sound' as ClipKind, value })),
      ...names.map(value => ({ kind: 'name' as ClipKind, value }))
    ]);
  }

  async clearCache() {
    voiceClips.clear();
  }
}

export const pronunciation = new PronunciationService();
