// The one audio engine for Luna's voice and the sound effects (VOX-6).
//
// The teacher heard Luna "like a demon" on her classroom whiteboard: slowed,
// deep and shaky. Every clip is clean (`roughscan.py`), so it happens in
// playback. A Web Audio context keeps the sample rate the speakers had when it
// was made, and some browsers (Safari above all) go on rendering at that rate
// after the sound moves to another output (a whiteboard, a TV, AirPlay,
// Bluetooth) or comes back from an interruption: then everything plays slow,
// low and crackly. So:
//
// - one context for voice and effects, never two that can disagree;
// - none made until a sound is wanted: clips decode on an offline context, so
//   the one that plays is made at the first tap, on the speakers in use then;
// - a fresh one, at the next tap, after anything that can leave it at the
//   wrong rate: the system interrupting or suspending it, the output device
//   changing, the page coming back from the background, or its clock running
//   at the wrong speed against the page's own;
// - bigger buffers ('playback'), so a busy or slow machine doesn't stutter;
// - a limiter before the speakers, so voice and effects together never clip.

type Ctor = typeof AudioContext;

/** Below this long a clock comparison is mostly noise. */
const CLOCK_WINDOW_S = 3;
/** A context whose clock runs this far off the page's is at the wrong rate (44.1 against 48 kHz is 8%). */
const CLOCK_TOLERANCE = 0.04;
/**
 * A clock running under a quarter of the page's speed has stopped (the machine
 * slept, or a browser idled its audio while nothing played), not drifted to a
 * wrong rate: leave it.
 */
const CLOCK_STALLED = 0.25;
/** At most one fresh context for the clock this often, so a clock that is always off can't make one every tap. */
const CLOCK_RETRY_MS = 60000;
/** The rate clips are decoded at, before any context plays them. */
const DECODE_RATE = 48000;

/** What a sound needs: the context, and the node to connect to instead of `destination`. */
export interface AudioOut {
  ctx: AudioContext;
  out: AudioNode;
}

/** Why the engine was last made fresh, for the checks and a curious grown-up. */
export type FreshReason = 'first' | 'interrupted' | 'device' | 'returned' | 'clock' | 'closed';

class AudioEngine {
  private ctx: AudioContext | null = null;
  private out: AudioNode | null = null;
  private decoder: BaseAudioContext | null = null;
  /** something happened that can leave the context at the wrong rate: make a new one at the next tap */
  private suspect: FreshReason | null = null;
  /** contexts that have run, so a later suspension is the system's doing (nothing here suspends one) */
  private ran = new WeakSet<AudioContext>();
  /** a context-time / page-time pair to measure the clock from */
  private clock: { ctx: number; wall: number } | null = null;
  /** how many contexts this page has made, and why the last was made */
  made = 0;
  lastReason: FreshReason | null = null;
  /** when the clock last asked for a fresh context */
  private clockFreshAt = -Infinity;

  constructor() {
    if (typeof window === 'undefined') return;
    // pointerdown counts as a tap for a mouse; for a finger it's pointerup and touchend
    for (const type of ['pointerdown', 'pointerup', 'touchend', 'mousedown', 'keydown', 'click']) {
      window.addEventListener(type, this.onGesture, { capture: true, passive: true });
    }
    navigator.mediaDevices?.addEventListener?.('devicechange', () => this.markSuspect('device'));
    // (the voice audit loads this module in Node, with a window but no document)
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        this.clock = null;
        if (document.visibilityState === 'visible') this.markSuspect('returned');
      });
    }
    window.addEventListener('pageshow', event => {
      if (event.persisted) this.markSuspect('returned');
    });
  }

  /**
   * The context and output to play a sound on, made now if there's none. A
   * context made outside a tap may stay suspended until the next one, as
   * before. Every call also checks the clock.
   */
  get(): AudioOut | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx || this.ctx.state === 'closed') this.fresh(this.ctx ? 'closed' : 'first');
    const ctx = this.ctx;
    if (!ctx || !this.out) return null;
    if (ctx.state === 'suspended') void ctx.resume().catch(() => {});
    this.checkClock(ctx);
    return { ctx, out: this.out };
  }

  /**
   * Where clips are decoded: an offline context, so decoding never makes the
   * context that plays (and never fixes its rate) before a tap. An AudioBuffer
   * plays on any context, at its own rate.
   */
  decodeContext(): BaseAudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.decoder) {
      const Offline =
        window.OfflineAudioContext ||
        (window as unknown as { webkitOfflineAudioContext?: typeof OfflineAudioContext }).webkitOfflineAudioContext;
      try {
        if (Offline) this.decoder = new Offline(1, 1, DECODE_RATE);
      } catch {
        this.decoder = null;
      }
    }
    return this.decoder ?? this.get()?.ctx ?? null;
  }

  /** Something may have left the context at the wrong rate: the next tap makes a new one. */
  markSuspect(reason: FreshReason) {
    if (this.ctx) this.suspect = reason;
  }

  /** Inside a tap, the only time a browser lets a new context start. */
  private onGesture = () => {
    if (!this.ctx) return; // nothing has played yet: the first sound makes it
    if (this.suspect || this.ctx.state === 'closed') this.fresh(this.suspect ?? 'closed');
    else if (this.ctx.state !== 'running') void this.ctx.resume().catch(() => {});
  };

  private fresh(reason: FreshReason) {
    const old = this.ctx;
    this.clock = null;
    this.suspect = null;

    // the new one first: a browser that refuses another context (an iPad
    // allows only a few) keeps the old one playing rather than none
    const Context: Ctor | undefined =
      window.AudioContext || (window as unknown as { webkitAudioContext?: Ctor }).webkitAudioContext;
    if (!Context) return;
    let ctx: AudioContext;
    try {
      ctx = new Context({ latencyHint: 'playback' });
    } catch {
      try {
        ctx = new Context();
      } catch {
        return;
      }
    }
    if (old && old.state !== 'closed') void old.close().catch(() => {});
    if (reason === 'clock') this.clockFreshAt = performance.now();

    // a limiter in front of the speakers: catches the peaks only, so a cheer
    // over a line never clips into crackle on a loud room speaker
    let out: AudioNode = ctx.destination;
    try {
      const limiter = ctx.createDynamicsCompressor();
      limiter.threshold.value = -2;
      limiter.knee.value = 0;
      limiter.ratio.value = 20;
      limiter.attack.value = 0.003;
      limiter.release.value = 0.25;
      limiter.connect(ctx.destination);
      out = limiter;
    } catch {
      // no compressor: straight to the speakers, as before
    }

    ctx.onstatechange = () => {
      this.clock = null;
      const state = ctx.state as AudioContextState | 'interrupted';
      // Safari's "interrupted" (a call, Siri, another app's sound), or a
      // suspension nobody here asked for: it may come back at another rate
      if (state === 'interrupted' || (state === 'suspended' && this.ran.has(ctx))) {
        this.markSuspect('interrupted');
      }
      if (state === 'running') this.ran.add(ctx);
    };

    this.ctx = ctx;
    this.out = out;
    this.made += 1;
    this.lastReason = reason;
  }

  /**
   * A context at the wrong rate keeps the wrong time: its clock runs slow or
   * fast against the page's by the same factor its sound does. Measured over
   * a few seconds of running, between sounds.
   */
  private checkClock(ctx: AudioContext) {
    if (ctx.state !== 'running') {
      this.clock = null;
      return;
    }
    this.ran.add(ctx);
    const stamp = typeof ctx.getOutputTimestamp === 'function' ? ctx.getOutputTimestamp() : null;
    const now =
      stamp && stamp.performanceTime && stamp.contextTime
        ? { ctx: stamp.contextTime, wall: stamp.performanceTime }
        : { ctx: ctx.currentTime, wall: performance.now() };
    if (!this.clock) {
      this.clock = now;
      return;
    }
    const wall = (now.wall - this.clock.wall) / 1000;
    if (wall < CLOCK_WINDOW_S) return;
    const speed = (now.ctx - this.clock.ctx) / wall;
    this.clock = now;
    const off = Math.abs(speed - 1);
    if (off > CLOCK_TOLERANCE && speed > CLOCK_STALLED && performance.now() - this.clockFreshAt > CLOCK_RETRY_MS) {
      this.markSuspect('clock');
    }
  }
}

export const audioEngine = new AudioEngine();
