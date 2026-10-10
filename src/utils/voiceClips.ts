// Playing Ms. Luna's pre-rendered voice.
//
// Every sound the app can make was generated once, at build time, by the same
// Kokoro model that used to run here in the browser (see scripts/voice/). What
// is left at runtime is a fetch and a decode, so a tap makes a sound in about
// as long as it takes to read a file off the edge cache — instead of the five
// to ten seconds it took to download a 325 MB model and run inference on a
// tablet.
//
// Anything the manifest does not have still falls through to the browser
// voice, so a string nobody thought to enumerate is merely robotic, not
// silent.

import { keyOf, type ClipKind, type RateBucket } from './voiceKeys';

const MEMORY_LIMIT = 320;

// How long a fresh copy of the index is trusted before a missing key may
// fetch it again.
const REFRESH_INTERVAL_MS = 5000;

/**
 * decodeAudioData both ways round.
 *
 * Older WebKit only implements the callback form and returns undefined rather
 * than a promise, which would otherwise leave every clip silent on an older
 * iPad — the exact device this app is most likely to run on.
 */
function decode(ctx: AudioContext, bytes: ArrayBuffer): Promise<AudioBuffer> {
  return new Promise((resolve, reject) => {
    const maybe = ctx.decodeAudioData(bytes, resolve, reject) as
      | Promise<AudioBuffer>
      | undefined;
    if (maybe && typeof maybe.then === 'function') maybe.then(resolve, reject);
  });
}

export interface ClipManifest {
  voice: string;
  format: string;
  sampleRate: number;
  generated: string;
  clips: Record<string, string>;
}

export class VoiceClipLibrary {
  private manifests = new Map<string, Promise<ClipManifest | null>>();
  private buffers = new Map<string, AudioBuffer>();
  private inflight = new Map<string, Promise<AudioBuffer | null>>();
  private fetchedAt = new Map<string, number>();
  private refreshing = new Map<string, Promise<ClipManifest | null>>();

  // optional chaining on purpose: import.meta.env does not exist outside
  // Vite, and this module is bundled by the build scripts too
  private base = `${import.meta.env?.BASE_URL ?? '/'}voice`;

  /**
   * The manifest for one voice, fetched once — but a *failure* is never
   * cached.
   *
   * Caching the failure was a trap: one bad fetch (offline for a moment, or
   * the app opened before the clips had been rendered) would poison the entry
   * for the lifetime of the page, and every later attempt would get the
   * remembered null back and fall through to the browser voice. Forgetting a
   * failure costs one small request and makes the voice recover on its own.
   */
  manifest(voice: string): Promise<ClipManifest | null> {
    const existing = this.manifests.get(voice);
    if (existing) return existing;

    const load = this.fetchManifest(voice).then(manifest => {
      if (!manifest) this.manifests.delete(voice);
      return manifest;
    });

    this.manifests.set(voice, load);
    return load;
  }

  private fetchManifest(voice: string): Promise<ClipManifest | null> {
    this.fetchedAt.set(voice, Date.now());
    // The index is checked with the server every time (a 304 when nothing
    // changed). force-cache here would keep a stale index forever: the
    // browser would go on playing clips from before the last re-render. The
    // clips themselves can be cached hard, because a clip's file name changes
    // whenever its audio does.
    return fetch(`${this.base}/${voice}/manifest.json`, { cache: 'no-cache' })
      .then(r => (r.ok ? (r.json() as Promise<ClipManifest>) : null))
      .catch(() => null);
  }

  /**
   * The index again, for a key the copy in hand does not have.
   *
   * A tab opened before a `voice:render` keeps the old index while Vite
   * hot-reloads the new lines into it, so without this every new line would
   * fall back to the browser voice until a reload. At most one fetch every
   * few seconds per voice, shared by every lookup waiting on it, so a line
   * that truly has no clip does not refetch on every tap. A failed refetch
   * keeps the copy that was already there.
   */
  private async refresh(voice: string, stale: ClipManifest): Promise<ClipManifest> {
    const pending = this.refreshing.get(voice);
    if (pending) return (await pending) ?? stale;
    if (Date.now() - (this.fetchedAt.get(voice) ?? 0) < REFRESH_INTERVAL_MS) return stale;

    const load = this.fetchManifest(voice).finally(() => this.refreshing.delete(voice));
    this.refreshing.set(voice, load);
    const fresh = await load;
    if (!fresh) return stale;
    this.manifests.set(voice, Promise.resolve(fresh));
    return fresh;
  }

  /** Which voices actually have audio on disk, so the picker can hide the rest. */
  async available(voices: string[]): Promise<Set<string>> {
    const found = await Promise.all(
      voices.map(async v => ((await this.manifest(v)) ? v : null))
    );
    return new Set(found.filter((v): v is string => v !== null));
  }

  has(manifest: ClipManifest | null, kind: ClipKind, value: string, bucket: RateBucket): boolean {
    if (!manifest) return false;
    return Boolean(manifest.clips[keyOf(kind, value, bucket)]);
  }

  /**
   * The decoded clip, or null when this utterance was never rendered.
   *
   * Decoded buffers are kept per file, not per key: a phonics sound is one
   * file shared by every key that makes it (C, K and CK; every speed), so it
   * is fetched and decoded once, and the second tap does no work at all.
   */
  async get(
    ctx: AudioContext,
    voice: string,
    kind: ClipKind,
    value: string,
    bucket: RateBucket
  ): Promise<AudioBuffer | null> {
    const key = keyOf(kind, value, bucket);

    // no index yet: the next tap tries again
    const manifest = await this.manifest(voice);
    if (!manifest) return null;

    // not in this copy of the index: it may be older than the clip
    const file = manifest.clips[key] ?? (await this.refresh(voice, manifest)).clips[key];
    if (!file) {
      if (import.meta.env?.DEV) console.warn(`[voice] not rendered: ${key}`);
      return null;
    }

    const url = `${this.base}/${voice}/${file}`;
    const cached = this.buffers.get(url);
    if (cached) return cached;

    const pending = this.inflight.get(url);
    if (pending) return pending;

    const task = (async () => {
      try {
        const response = await fetch(url, { cache: 'force-cache' });
        if (!response.ok) throw new Error(String(response.status));
        const bytes = await response.arrayBuffer();
        const buffer = await decode(ctx, bytes);
        this.remember(url, buffer);
        return buffer;
      } catch {
        // a failed fetch is worth retrying later (a flaky network), so this
        // is deliberately not recorded as missing
        return null;
      } finally {
        this.inflight.delete(url);
      }
    })();

    this.inflight.set(url, task);
    return task;
  }

  /**
   * Pull clips into the cache before they are needed. Used for the phoneme set
   * at startup, and for the words of a lesson as it opens.
   */
  async prefetch(
    ctx: AudioContext,
    voice: string,
    bucket: RateBucket,
    parts: Array<{ kind: ClipKind; value: string }>
  ): Promise<void> {
    // a handful at a time: enough to be quick, not enough to fight the
    // fetches the child is actually waiting on
    const queue = [...parts];
    const workers = Array.from({ length: 4 }, async () => {
      for (;;) {
        const next = queue.shift();
        if (!next) return;
        await this.get(ctx, voice, next.kind, next.value, bucket);
      }
    });
    await Promise.all(workers);
  }

  private remember(id: string, buffer: AudioBuffer) {
    if (this.buffers.size >= MEMORY_LIMIT) {
      const oldest = this.buffers.keys().next().value;
      if (oldest) this.buffers.delete(oldest);
    }
    this.buffers.set(id, buffer);
  }

  /** Every key the manifest holds, for warming a whole category. */
  async keysOfKind(voice: string, kind: ClipKind, bucket: RateBucket): Promise<string[]> {
    const manifest = await this.manifest(voice);
    if (!manifest) return [];
    const prefix = `${kind}|`;
    const suffix = `|${bucket}`;
    return Object.keys(manifest.clips)
      .filter(k => k.startsWith(prefix) && k.endsWith(suffix))
      .map(k => k.slice(prefix.length, k.length - suffix.length));
  }

  clear() {
    this.buffers.clear();
  }
}

export const voiceClips = new VoiceClipLibrary();
