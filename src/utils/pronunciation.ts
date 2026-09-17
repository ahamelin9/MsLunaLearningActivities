// Ms. Luna's voice.
//
// Two engines sit behind one API:
//   1. Kokoro-82M, a neural voice that runs entirely on the device
//      (WebGPU when available, WASM otherwise). No API key, no server,
//      nothing about the child leaves the browser.
//   2. The browser's built-in speechSynthesis, used only if Kokoro cannot
//      load, so the app never goes silent.
//
// The API is deliberately split by educational intent rather than by string:
// speakLetterName('V') says "vee", speakLetterSound('V') makes the /v/ sound.
// Callers must choose; nothing here guesses.

import {
  carrierFor,
  COMMON_PHONICS_KEYS,
  ipaFor,
  letterNameOf,
  phonicsFor
} from './phonics';

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

const DB_NAME = 'ms-luna-audio';
const DB_STORE = 'clips';
const MEMORY_CACHE_LIMIT = 240;


/**
 * Ordinary sentences often carry a phoneme inside them:
 *   "What letter makes the mmmmm sound?"   "S says /s/."
 * Handing that whole string to a speech engine spells the letters out
 * ("m-m-m-m-m"), so those fragments are pulled out and spoken as real
 * phonemes instead. Everything else stays plain text.
 */
export function splitPhonics(text: string): SpeechPart[] {
  const tokens = text.split(/\s+/).filter(Boolean);
  const parts: SpeechPart[] = [];
  let buffer: string[] = [];

  const flush = () => {
    if (buffer.length) {
      parts.push({ text: buffer.join(' ') });
      buffer = [];
    }
  };

  for (const token of tokens) {
    const bare = token.replace(/^[^A-Za-z/]+|[^A-Za-z/]+$/g, '');
    const lower = bare.toLowerCase();
    const trailing = bare ? token.slice(token.indexOf(bare) + bare.length) : '';

    // a phoneme written out: /m/ or /sh/
    const slash = /^\/([a-z]{1,3})\/$/.exec(lower);
    // a held digraph: shhh, thhh  (checked before the single-letter run)
    const digraph = /^(sh|ch|th|wh|ng)[hz]*$/.exec(lower);
    // a held consonant: mmmm, Sssss, ffff
    const run = /^([a-z])\1{2,}$/.exec(lower);

    const key =
      (slash && phonicsFor(slash[1]) ? slash[1] : null) ??
      (digraph && lower.length > 2 && phonicsFor(digraph[1]) ? digraph[1] : null) ??
      (run && phonicsFor(run[1]) ? run[1] : null);

    if (key) {
      flush();
      parts.push({ sound: key });
      // keep any trailing punctuation with the words that follow
      if (trailing.trim()) buffer.push(trailing.trim());
    } else {
      buffer.push(token);
    }
  }

  flush();

  // a fragment of pure punctuation is not worth speaking
  return parts.filter(p => (p.sound ? true : /[A-Za-z0-9]/.test(p.text ?? '')));
}

/** One piece of speech, tagged with what kind of sound it is. */
export interface SpeechPart {
  text?: string;
  sound?: string;
  name?: string;
  word?: string;
}

type WorkerOut =
  | { id: number; type: 'progress'; progress: number }
  | { id: number; type: 'ready'; device: string; dtype: string }
  | { id: number; type: 'samples'; samples: Float32Array }
  | { id: number; type: 'error'; message: string };

interface ClipRequest {
  /** cache identity */
  key: string;
  /** the text is a phonics carrier the neural voice would spell out */
  neuralUnsafe?: boolean;
  /** IPA when we know the exact phonemes, otherwise plain text */
  ipa?: string;
  text: string;
  rate: number;
}

/** Small IndexedDB store so a sound is only ever generated once per device. */
class ClipStore {
  private dbPromise: Promise<IDBDatabase | null> | null = null;

  private open(): Promise<IDBDatabase | null> {
    if (this.dbPromise) return this.dbPromise;
    this.dbPromise = new Promise(resolve => {
      try {
        if (typeof indexedDB === 'undefined') return resolve(null);
        const request = indexedDB.open(DB_NAME, 1);
        request.onupgradeneeded = () => {
          const db = request.result;
          if (!db.objectStoreNames.contains(DB_STORE)) db.createObjectStore(DB_STORE);
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => resolve(null);
      } catch {
        resolve(null);
      }
    });
    return this.dbPromise;
  }

  async get(key: string): Promise<Float32Array | null> {
    const db = await this.open();
    if (!db) return null;
    return new Promise(resolve => {
      try {
        const tx = db.transaction(DB_STORE, 'readonly');
        const req = tx.objectStore(DB_STORE).get(key);
        req.onsuccess = () => {
          const value = req.result;
          resolve(value instanceof ArrayBuffer ? new Float32Array(value) : null);
        };
        req.onerror = () => resolve(null);
      } catch {
        resolve(null);
      }
    });
  }

  async put(key: string, samples: Float32Array) {
    const db = await this.open();
    if (!db) return;
    try {
      const tx = db.transaction(DB_STORE, 'readwrite');
      // store a copy so the underlying buffer is never detached
      tx.objectStore(DB_STORE).put(samples.slice().buffer, key);
    } catch {
      // storage full or blocked — the in-memory cache still applies
    }
  }

  async clear() {
    const db = await this.open();
    if (!db) return;
    try {
      const tx = db.transaction(DB_STORE, 'readwrite');
      tx.objectStore(DB_STORE).clear();
    } catch {
      // ignore
    }
  }
}

class PronunciationService {
  private worker: Worker | null = null;
  private ready = false;
  private loading: Promise<boolean> | null = null;
  private nextId = 1;
  private pending = new Map<number, { resolve: (s: Float32Array | null) => void }>();
  private status: VoiceStatus = { state: 'idle' };
  private listeners = new Set<(s: VoiceStatus) => void>();
  private busyListeners = new Set<(busy: boolean) => void>();

  private ctx: AudioContext | null = null;
  private currentSource: AudioBufferSourceNode | null = null;

  private memory = new Map<string, Float32Array>();
  private warmQueue: ClipRequest[] = [];
  private warmQueued = new Set<string>();
  private warming = false;
  private store = new ClipStore();
  private inflight = new Map<string, Promise<Float32Array | null>>();

  /** which model build produced the cached clips, e.g. "webgpu-fp32" */
  private buildId = '';
  /** bumped whenever speech is interrupted, so late clips stay silent */
  private generation = 0;
  /** real utterances currently being generated, so warm-up can yield to them */
  private liveRequests = 0;
  private voiceId: string = DEFAULT_VOICE_ID;
  private rate = 1;
  private muted = false;
  private quality: 'best' | 'compact' = 'best';
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

  setVoice(voiceId: string) {
    if (LUNA_VOICES.some(v => v.id === voiceId)) this.voiceId = voiceId;
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

  /**
   * 'best' uses the full-precision voice (clean, ~325 MB, fast on WebGPU).
   * 'compact' uses the small 8-bit voice (~92 MB, also clean, slower).
   */
  setQuality(quality: 'best' | 'compact') {
    if (this.quality === quality) return;
    this.quality = quality;
    this.worker?.terminate();
    this.worker = null;
    this.ready = false;
    this.loading = null;
    this.memory.clear();
    this.setStatus({ state: 'idle' });
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
   * Starts the voice worker and downloads the model. Safe to call repeatedly;
   * the app keeps working on the browser voice until this resolves.
   */
  async init(): Promise<boolean> {
    if (this.ready) return true;
    if (this.loading) return this.loading;

    this.loading = new Promise<boolean>(resolve => {
      this.setStatus({ state: 'loading', progress: 0, label: 'Waking Ms. Luna up…' });

      let worker: Worker;
      try {
        worker = new Worker(new URL('./voiceWorker.ts', import.meta.url), { type: 'module' });
      } catch {
        this.failed('This browser cannot run the natural voice.');
        return resolve(false);
      }

      const initId = this.nextId++;

      worker.onmessage = (event: MessageEvent<WorkerOut>) => {
        const message = event.data;

        if (message.type === 'progress') {
          this.setStatus({
            state: 'loading',
            progress: message.progress,
            label: 'Downloading Ms. Luna’s voice…'
          });
          return;
        }

        if (message.type === 'ready') {
          this.ready = true;
          this.buildId = `${message.device}-${message.dtype}`;
          void this.dropClipsFromOtherBuilds(this.buildId);
          this.setStatus({ state: 'ready', engine: 'neural', device: message.device });
          resolve(true);
          return;
        }

        if (message.type === 'samples') {
          this.pending.get(message.id)?.resolve(message.samples);
          this.pending.delete(message.id);
          return;
        }

        if (message.type === 'error') {
          const waiter = this.pending.get(message.id);
          if (waiter) {
            waiter.resolve(null);
            this.pending.delete(message.id);
            return;
          }
          if (message.id === initId) {
            this.failed(message.message);
            resolve(false);
          }
        }
      };

      worker.onerror = () => {
        this.failed('The voice worker stopped unexpectedly.');
        resolve(false);
      };

      this.worker = worker;
      worker.postMessage({ id: initId, type: 'init', quality: this.quality });
    });

    return this.loading;
  }

  /** Clips generated by a previous model build are thrown away, not reused. */
  private async dropClipsFromOtherBuilds(buildId: string) {
    const KEY = 'ms_luna_voice_build';
    try {
      const previous = localStorage.getItem(KEY);
      if (previous === buildId) return;
      this.memory.clear();
      await this.store.clear();
      localStorage.setItem(KEY, buildId);
    } catch {
      // private mode or full storage: the in-memory cache was cleared anyway
      this.memory.clear();
    }
  }

  private failed(reason: string) {
    this.ready = false;
    this.worker = null;
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

  private async generate(req: ClipRequest): Promise<Float32Array | null> {
    const cached = this.memory.get(req.key);
    if (cached) return cached;

    const stored = await this.store.get(req.key);
    if (stored) {
      this.remember(req.key, stored);
      return stored;
    }

    const existing = this.inflight.get(req.key);
    if (existing) return existing;

    const task = (async () => {
      const worker = this.worker;
      if (!worker || !this.ready) return null;

      const id = this.nextId++;
      const samples = await new Promise<Float32Array | null>(resolve => {
        this.pending.set(id, { resolve });
        worker.postMessage({
          id,
          type: 'generate',
          voice: this.voiceId,
          speed: req.rate,
          ipa: req.ipa,
          text: req.ipa ? undefined : req.text
        });
        // a wedged worker must not leave callers waiting forever
        window.setTimeout(() => {
          if (this.pending.delete(id)) resolve(null);
        }, 30000);
      });

      this.inflight.delete(req.key);
      if (!samples || samples.length === 0) return null;

      this.remember(req.key, samples);
      void this.store.put(req.key, samples);
      return samples;
    })();

    this.inflight.set(req.key, task);
    return task;
  }

  private remember(key: string, samples: Float32Array) {
    if (this.memory.size >= MEMORY_CACHE_LIMIT) {
      const oldest = this.memory.keys().next().value;
      if (oldest) this.memory.delete(oldest);
    }
    this.memory.set(key, samples);
  }

  private playSamples(samples: Float32Array, onEnd?: () => void): boolean {
    const ctx = this.getContext();
    if (!ctx) {
      onEnd?.();
      return false;
    }
    try {
      const buffer = ctx.createBuffer(1, samples.length, 24000);
      buffer.getChannelData(0).set(samples);
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

    if (!this.ready && this.status.state === 'idle') {
      void this.init();
    }

    if (this.ready && !req.neuralUnsafe) {
      this.liveRequests += 1;
      // only announce a wait if it is long enough to notice
      const busyTimer = window.setTimeout(() => {
        if (this.liveRequests > 0) this.setBusy(true);
      }, 350);

      let samples: Float32Array | null = null;
      try {
        samples = await this.generate(req);
      } finally {
        this.liveRequests -= 1;
        window.clearTimeout(busyTimer);
        if (this.liveRequests === 0) this.setBusy(false);
      }

      // While this was being generated the child tapped something else, so
      // this clip is no longer wanted: drop it rather than talk over them.
      if (generation !== this.generation) return;

      if (samples && samples.length > 0) {
        if (this.playSamples(samples, options?.onEnd)) return;
      }
    }

    if (generation !== this.generation) return;
    this.speakWithBrowser(fallbackText, { ...options, onStart: undefined });
  }

  private keyFor(kind: string, value: string, rate: number): string {
    // The build is part of the identity: clips made by a different model must
    // never be replayed, or an old voice leaks into a new one.
    return `${this.buildId}|${this.voiceId}|${kind}|${value}|${rate.toFixed(2)}`;
  }

  /** Build the clip request for a piece of speech, without saying it. */
  private request(part: SpeechPart, rate?: number): { req: ClipRequest; fallback: string } | null {
    if (part.sound) {
      const ipa = ipaFor(part.sound);
      const carrier = carrierFor(part.sound);
      const r = rate ?? Math.min(this.rate, 1);
      if (!ipa) {
        // No IPA for this chunk: a carrier like "mmmm" would be spelled out by
        // the neural voice, so leave it to the browser voice instead.
        return {
          req: { key: this.keyFor('sound', part.sound, r), text: carrier, rate: r, neuralUnsafe: true },
          fallback: carrier
        };
      }
      return { req: { key: this.keyFor('sound', part.sound, r), ipa, text: carrier, rate: r }, fallback: carrier };
    }
    if (part.name) {
      const name = letterNameOf(part.name);
      const r = rate ?? this.rate;
      return { req: { key: this.keyFor('name', part.name.toUpperCase(), r), text: name, rate: r }, fallback: name };
    }
    if (part.word) {
      const clean = part.word.replace(/[^a-zA-Z'’-]/g, '').trim();
      if (!clean) return null;
      const r = rate ?? Math.min(this.rate, 1);
      return { req: { key: this.keyFor('word', clean.toLowerCase(), r), text: clean, rate: r }, fallback: clean };
    }
    if (part.text) {
      const clean = part.text.replace(/[…]/g, '...').trim();
      if (!clean) return null;
      const r = rate ?? this.rate;
      return { req: { key: this.keyFor('text', clean, r), text: clean, rate: r }, fallback: clean };
    }
    return null;
  }

  /**
   * Generate clips ahead of time so a multi-part prompt plays without gaps
   * while each piece is synthesised.
   */
  prefetch(parts: SpeechPart[], rate?: number) {
    if (!this.ready) return;
    parts.forEach(part => {
      const built = this.request(part, rate);
      if (built) void this.generate(built.req);
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
    const parts = splitPhonics(text);
    if (parts.length <= 1) {
      this.speakPart({ text }, options);
      return;
    }
    this.speakSequence(parts, options);
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
      const rate = options.rate ?? Math.min(this.rate, 1);
      void this.say(
        {
          key: this.keyFor('sound', `${letter}+alt`, rate),
          ipa: entry.alternate.ipa,
          text: entry.alternate.carrier,
          rate
        },
        entry.alternate.carrier,
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
          this.speakWord(wholeWord, { onEnd: handlers?.onEnd, interrupt: false });
        }, gap);
        return;
      }
      const chunk = chunks[index];
      handlers?.onChunk?.(index);
      const guard = this.once(() => {
        index += 1;
        window.setTimeout(next, gap);
      });
      this.speakLetterSound(chunk, { interrupt: false, onEnd: guard.done });
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
      const guard = this.once(() => window.setTimeout(next, 120));
      const step: SpeakOptions = { interrupt: false, rate: options?.rate, onEnd: guard.done };

      if (part.sound) this.speakLetterSound(part.sound, step);
      else if (part.name) this.speakLetterName(part.name, step);
      else if (part.word) this.speakWord(part.word, step);
      else if (part.text) this.speakText(part.text, step);
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
   * Quietly generate the things Luna is about to say, so that by the time a
   * child taps something the clip is already waiting. The queue always yields
   * to real speech, so warming never delays an actual utterance.
   */
  warm(parts: SpeechPart[], rate?: number) {
    for (const part of parts) {
      const built = this.request(part, rate);
      if (!built) continue;
      if (this.memory.has(built.req.key)) continue;
      if (this.warmQueued.has(built.req.key)) continue;
      this.warmQueued.add(built.req.key);
      this.warmQueue.push(built.req);
    }
    void this.runWarmQueue();
  }

  private async runWarmQueue() {
    if (this.warming) return;
    this.warming = true;

    try {
      while (this.warmQueue.length > 0) {
        if (!this.ready || this.muted) break;

        // never compete with something the child is waiting to hear
        if (this.liveRequests > 0) {
          await new Promise(r => window.setTimeout(r, 250));
          continue;
        }

        const req = this.warmQueue.shift();
        if (!req) break;
        if (!this.memory.has(req.key)) await this.generate(req);
        await new Promise(r => window.setTimeout(r, 60));
      }
    } finally {
      this.warming = false;
    }
  }

  /** The sounds every phonics game needs, generated before they are needed. */
  async prewarmPhonics() {
    if (!this.ready) return;
    this.warm(COMMON_PHONICS_KEYS.map(key => ({ sound: key })));
  }

  async clearCache() {
    this.memory.clear();
    this.warmQueue = [];
    this.warmQueued.clear();
    await this.store.clear();
  }
}

export const pronunciation = new PronunciationService();
