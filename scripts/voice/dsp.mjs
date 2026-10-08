// Signal processing for Ms. Luna's voice.
//
// Two jobs live here. Words and sentences only need trimming and levelling
// (shapeClip). Phonics sounds need real work, because a TTS model cannot say an
// isolated phoneme: asked for "f" alone Kokoro produces a voiced vowel, and
// asked for "m" it produces a short hum that trails into one. So
// scripts/voice/phonemes.mjs cuts each sound out of a real word Luna says
// well, and the tools below hold it for as long as a teacher would:
//
//   hisses (s, sh, f, th, h)   → fresh noise with the exact spectral colour
//                                of Luna's own sound, so there is no loop to hear
//   hums and vowels            → one pitch period at a time (TD-PSOLA), so the
//                                pitch stays smooth and nothing warbles
//   buzzes (z, v, voiced th)   → a held voice bar plus the hiss, pulsed at the
//                                voice's own pitch
//
// Everything works on mono Float32Array at SAMPLE_RATE, and every random choice
// is seeded, so re-rendering an unchanged sound gives the same file.

export const SAMPLE_RATE = 24000;
const SR = SAMPLE_RATE;

export const ms = n => Math.round((n / 1000) * SR);

// ---------- deterministic randomness ----------

export function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function seedOf(text) {
  let h = 2166136261;
  for (const c of text) h = Math.imul(h ^ c.codePointAt(0), 16777619);
  return h >>> 0;
}

// ---------- FFT ----------

/** In-place radix-2 FFT; `re.length` must be a power of two. */
export function fft(re, im, inverse = false) {
  const n = re.length;
  for (let i = 1, j = 0; i < n; i += 1) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) {
      [re[i], re[j]] = [re[j], re[i]];
      [im[i], im[j]] = [im[j], im[i]];
    }
  }
  for (let len = 2; len <= n; len <<= 1) {
    const ang = ((inverse ? 2 : -2) * Math.PI) / len;
    const wr = Math.cos(ang);
    const wi = Math.sin(ang);
    for (let i = 0; i < n; i += len) {
      let cr = 1;
      let ci = 0;
      for (let k = 0; k < len / 2; k += 1) {
        const a = i + k;
        const b = a + len / 2;
        const br = re[b] * cr - im[b] * ci;
        const bi = re[b] * ci + im[b] * cr;
        re[b] = re[a] - br;
        im[b] = im[a] - bi;
        re[a] += br;
        im[a] += bi;
        const t = cr * wr - ci * wi;
        ci = cr * wi + ci * wr;
        cr = t;
      }
    }
  }
  if (inverse) {
    for (let i = 0; i < n; i += 1) {
      re[i] /= n;
      im[i] /= n;
    }
  }
}

export const hann = n => Float32Array.from({ length: n }, (_, i) => 0.5 - 0.5 * Math.cos((2 * Math.PI * i) / n));

// ---------- measurement ----------

export function peak(samples) {
  let max = 0;
  for (let i = 0; i < samples.length; i += 1) max = Math.max(max, Math.abs(samples[i]));
  return max;
}

export function rms(samples, from = 0, to = samples.length) {
  let sum = 0;
  for (let i = from; i < to; i += 1) sum += samples[i] * samples[i];
  return Math.sqrt(sum / Math.max(1, to - from));
}

/** Normalised autocorrelation peak in the speaking pitch range: [score, lag]. */
function periodicity(x, from, to, minHz = 70, maxHz = 450) {
  let best = 0;
  let lag = 0;
  for (let L = Math.floor(SR / maxHz); L <= Math.floor(SR / minHz); L += 1) {
    let d = 0;
    let a = 0;
    let b = 0;
    for (let i = from; i < to - L; i += 1) {
      d += x[i] * x[i + L];
      a += x[i] * x[i];
      b += x[i + L] * x[i + L];
    }
    const r = d / (Math.sqrt(a * b) + 1e-12);
    // prefer the shortest lag that is nearly as good, so a period is never
    // mistaken for two of them
    if (r > best + 0.02) {
      best = r;
      lag = L;
    }
  }
  return [best, lag];
}

/**
 * Per 5 ms frame: level relative to the loudest frame, zero-crossing rate and
 * periodicity, plus three verdicts — live (not silence), voiced, noise.
 * Zero-crossings separate the classes surprisingly well in Luna's voice: a
 * vowel sits near 1–2k per second, a nasal murmur near 400, a hiss at 5–9k.
 */
export function analyze(x, { hopMs = 5, winMs = 30 } = {}) {
  const hop = ms(hopMs);
  const win = ms(winMs);
  const out = [];
  for (let s = 0; s + win <= x.length; s += hop) {
    let e = 0;
    let z = 0;
    for (let i = s; i < s + win; i += 1) {
      e += x[i] * x[i];
      if (i > s && (x[i] >= 0) !== (x[i - 1] >= 0)) z += 1;
    }
    const [per] = periodicity(x, s, s + win);
    out.push({ at: s, mid: s + (win >> 1), db: 10 * Math.log10(e / win + 1e-12), zc: (z / win) * SR, per });
  }
  const top = Math.max(...out.map(f => f.db));
  for (const f of out) {
    f.rel = f.db - top;
    f.live = f.rel > -38;
    f.voiced = f.live && f.per > 0.72;
    f.noise = f.live && !f.voiced && f.per < 0.6;
  }
  return out;
}

/** Contiguous runs of frames passing `test`, as [first, last] frame indices. */
export function runs(frames, test, minLen = 2) {
  const out = [];
  let start = -1;
  for (let i = 0; i <= frames.length; i += 1) {
    const ok = i < frames.length && test(frames[i], i);
    if (ok && start < 0) start = i;
    if (!ok && start >= 0) {
      if (i - start >= minLen) out.push([start, i - 1]);
      start = -1;
    }
  }
  return out;
}

/** Median pitch period of a voiced segment, in samples (0 if unvoiced). */
export function medianPeriod(x) {
  const win = ms(30);
  const hop = ms(10);
  const periods = [];
  for (let s = 0; s + win <= x.length; s += hop) {
    const [score, lag] = periodicity(x, s, s + win);
    if (score > 0.6) periods.push(lag);
  }
  periods.sort((a, b) => a - b);
  return periods[periods.length >> 1] ?? 0;
}

/**
 * The worst frame-to-frame change in spectral shape across the held part of a
 * sound, in dB. A seam, a click or a warble shows up here as a spike; a clean
 * held sound stays around 2–4 dB. Used to choose between candidate sources.
 */
export function worstSeam(x, { edgeMs = 60 } = {}) {
  const N = 512;
  const hop = ms(5);
  const w = hann(N);
  const seq = [];
  let top = 0;
  for (let s = 0; s + N <= x.length; s += hop) {
    const re = new Float64Array(N);
    const im = new Float64Array(N);
    let e = 0;
    for (let i = 0; i < N; i += 1) {
      re[i] = x[s + i] * w[i];
      e += x[s + i] * x[s + i];
    }
    fft(re, im);
    const bands = [];
    for (let b = 0; b < 18; b += 1) {
      const lo = Math.floor(2 + (b * b * 230) / 324);
      const hi = Math.floor(2 + ((b + 1) * (b + 1) * 230) / 324);
      let sum = 0;
      for (let k = lo; k <= Math.max(lo, hi); k += 1) sum += re[k] * re[k] + im[k] * im[k];
      bands.push(10 * Math.log10(sum + 1e-12));
    }
    seq.push({ e, bands });
    top = Math.max(top, e);
  }
  const skip = Math.round(ms(edgeMs) / hop);
  const held = seq.filter(f => f.e > top * 0.25).slice(skip, -skip || undefined);
  let worst = 0;
  for (let i = 1; i < held.length; i += 1) {
    const d = held[i].bands.map((v, k) => v - held[i - 1].bands[k]);
    const mean = d.reduce((a, b) => a + b, 0) / d.length;
    worst = Math.max(worst, Math.sqrt(d.reduce((a, v) => a + (v - mean) ** 2, 0) / d.length));
  }
  return worst;
}

// ---------- shaping ----------

export function fadeIn(samples, length) {
  const n = Math.min(length, samples.length);
  for (let i = 0; i < n; i += 1) samples[i] *= 0.5 - 0.5 * Math.cos((Math.PI * i) / n);
  return samples;
}

export function fadeOut(samples, length) {
  const n = Math.min(length, samples.length);
  for (let i = 0; i < n; i += 1) samples[samples.length - 1 - i] *= 0.5 - 0.5 * Math.cos((Math.PI * i) / n);
  return samples;
}

/** Drop leading and trailing near-silence, keeping a little air either side. */
export function trimSilence(samples, { floorDb = -42, padMs = 8 } = {}) {
  const limit = peak(samples) * 10 ** (floorDb / 20);
  if (limit <= 0) return samples;

  let start = 0;
  while (start < samples.length && Math.abs(samples[start]) < limit) start += 1;

  let end = samples.length - 1;
  while (end > start && Math.abs(samples[end]) < limit) end -= 1;

  if (end <= start) return samples;

  const pad = ms(padMs);
  return samples.slice(Math.max(0, start - pad), Math.min(samples.length, end + pad));
}

/**
 * Match loudness over the part that is actually sounding, ignoring silence —
 * a 90 ms /p/ and a 750 ms /sh/ would otherwise be levelled by how much
 * silence they carry rather than by how loud they are. Peak-limited.
 */
export function normalize(samples, { targetDb = -20, ceilingDb = -1.5 } = {}) {
  const p = peak(samples);
  if (p < 1e-6) return samples;
  const gate = p * 0.05;
  let sum = 0;
  let n = 0;
  for (let i = 0; i < samples.length; i += 1) {
    if (Math.abs(samples[i]) >= gate) {
      sum += samples[i] * samples[i];
      n += 1;
    }
  }
  const current = Math.sqrt(sum / Math.max(1, n));
  let gain = 10 ** (targetDb / 20) / current;
  const ceiling = 10 ** (ceilingDb / 20);
  if (p * gain > ceiling) gain = ceiling / p;
  for (let i = 0; i < samples.length; i += 1) samples[i] *= gain;
  return samples;
}

/** Even out slow level changes (an automatic gain over ~40 ms). */
export function flatten(x, winMs = 40) {
  const w = ms(winMs);
  const env = new Float32Array(x.length);
  let acc = 0;
  for (let i = 0; i < x.length; i += 1) {
    acc += x[i] * x[i] - (i >= w ? x[i - w] * x[i - w] : 0);
    env[i] = Math.sqrt(Math.max(acc, 0) / Math.min(i + 1, w));
  }
  const target = rms(x);
  return x.map((v, i) => (env[i] > target * 0.05 ? (v * target) / env[i] : v));
}

// ---------- hisses: spectral noise resynthesis ----------

/** Average magnitude spectrum of a noise segment, smoothed across frequency. */
function noiseSpectrum(seg, n = 512) {
  const w = hann(n);
  const acc = new Float64Array(n / 2 + 1);
  let frames = 0;
  for (let s = 0; s + n <= seg.length; s += n / 4) {
    const re = new Float64Array(n);
    const im = new Float64Array(n);
    for (let i = 0; i < n; i += 1) re[i] = seg[s + i] * w[i];
    fft(re, im);
    for (let k = 0; k <= n / 2; k += 1) acc[k] += re[k] * re[k] + im[k] * im[k];
    frames += 1;
  }
  if (!frames) throw new Error(`noise segment too short (${seg.length} samples)`);
  const mag = Array.from(acc, v => Math.sqrt(v / frames));
  return mag.map((_, k) => {
    let sum = 0;
    let count = 0;
    for (let j = Math.max(0, k - 3); j <= Math.min(mag.length - 1, k + 3); j += 1) {
      sum += mag[j];
      count += 1;
    }
    return sum / count;
  });
}

/** Linear-phase FIR with magnitude response `mag` (length n/2 + 1). */
function firFrom(mag) {
  const n = (mag.length - 1) * 2;
  const re = new Float64Array(n);
  const im = new Float64Array(n);
  for (let k = 0; k <= n / 2; k += 1) re[k] = mag[k];
  for (let k = 1; k < n / 2; k += 1) re[n - k] = mag[k];
  fft(re, im, true);
  const w = hann(n);
  return Float32Array.from({ length: n }, (_, i) => re[(i + n / 2) % n] * w[i]);
}

/** A slow ±depthDb drift, so a held hiss breathes a little instead of sounding like a test tone. */
function wander(len, rand, depthDb) {
  const parts = [0, 1, 2].map(() => ({ f: 1.5 + rand() * 3, p: rand() * Math.PI * 2, a: (0.5 + rand() * 0.5) / 3 }));
  return Float32Array.from({ length: len }, (_, i) => {
    const v = parts.reduce((s, c) => s + c.a * Math.sin(2 * Math.PI * c.f * (i / SR) + c.p), 0);
    return 10 ** ((depthDb * v) / 20);
  });
}

/**
 * A hiss of `lenMs` with the spectral colour of `seg` — Luna's own /s/, say —
 * made from fresh noise rather than by repeating the recording, so however
 * long it is held there is no seam anywhere in it.
 */
export function resynthNoise(seg, lenMs, { seed = 1, attackMs = 45, releaseMs = 130, wanderDb = 0.8 } = {}) {
  const rand = rng(seed);
  const h = firFrom(noiseSpectrum(seg));
  const len = ms(lenMs);
  const white = new Float32Array(len + h.length);
  for (let i = 0; i < white.length; i += 2) {
    const r = Math.sqrt(-2 * Math.log(Math.max(rand(), 1e-12)));
    const t = 2 * Math.PI * rand();
    white[i] = r * Math.cos(t);
    if (i + 1 < white.length) white[i + 1] = r * Math.sin(t);
  }
  const out = new Float32Array(len);
  for (let i = 0; i < len; i += 1) {
    let acc = 0;
    for (let j = 0; j < h.length; j += 1) acc += white[i + j] * h[j];
    out[i] = acc;
  }
  const gain = rms(seg) / (rms(out) || 1);
  const drift = wander(len, rand, wanderDb);
  for (let i = 0; i < len; i += 1) out[i] *= gain * drift[i];
  fadeIn(out, ms(attackMs));
  fadeOut(out, ms(releaseMs));
  return out;
}

// ---------- hums and vowels: TD-PSOLA ----------

/**
 * Pitch marks one period apart at a consistent phase: the first is the
 * biggest peak in the opening period, and each next one is wherever the
 * waveform best repeats the period before it.
 */
function pitchMarks(x, P) {
  let first = 0;
  let best = -Infinity;
  for (let i = P; i < 2 * P && i < x.length; i += 1) {
    if (x[i] > best) {
      best = x[i];
      first = i;
    }
  }
  const marks = [first];
  const half = P >> 1;
  for (;;) {
    const prev = marks[marks.length - 1];
    let bestLag = 0;
    let bestScore = -Infinity;
    for (let lag = Math.round(P * 0.85); lag <= Math.round(P * 1.15); lag += 1) {
      if (prev + lag + half >= x.length) break;
      let d = 0;
      let a = 0;
      let b = 0;
      for (let i = -half; i < half; i += 1) {
        const u = x[prev + i];
        const v = x[prev + lag + i];
        d += u * v;
        a += u * u;
        b += v * v;
      }
      const r = d / (Math.sqrt(a * b) + 1e-12);
      if (r > bestScore) {
        bestScore = r;
        bestLag = lag;
      }
    }
    if (!bestLag || prev + bestLag + P >= x.length) break;
    marks.push(prev + bestLag);
  }
  return marks;
}

/**
 * Drop the grains that would glitch: a period well off the median (a
 * misplaced mark) or a spectrum unlike the rest (a stray bit of transition).
 * Each grain is reused many times while a sound is held, so one bad one would
 * be heard over and over.
 */
function cleanMarks(src, marks, P) {
  if (marks.length < 6) return marks;
  const steady = marks.filter((m, i) => {
    const next = marks[i + 1] ?? m + P;
    const prev = marks[i - 1] ?? m - P;
    return Math.abs(next - m - P) < P * 0.08 && Math.abs(m - prev - P) < P * 0.08;
  });
  const N = 256;
  const shapes = steady.map(m => {
    const re = new Float64Array(N);
    const im = new Float64Array(N);
    for (let i = 0; i < N && m - P + i < src.length; i += 1) {
      re[i] = src[m - P + i] * (0.5 - 0.5 * Math.cos((2 * Math.PI * i) / N));
    }
    fft(re, im);
    const bands = [];
    for (let k = 0; k < 8; k += 1) {
      let e = 0;
      for (let j = 1 + k * 15; j < 1 + (k + 1) * 15; j += 1) e += re[j] * re[j] + im[j] * im[j];
      bands.push(10 * Math.log10(e + 1e-12));
    }
    const mean = bands.reduce((a, b) => a + b, 0) / bands.length;
    return bands.map(v => v - mean);
  });
  const median = shapes[0].map((_, k) => shapes.map(s => s[k]).sort((a, b) => a - b)[shapes.length >> 1]);
  const distance = shapes.map(s => Math.sqrt(s.reduce((a, v, k) => a + (v - median[k]) ** 2, 0) / s.length));
  const cut = [...distance].sort((a, b) => a - b)[Math.floor(distance.length * 0.8)];
  const good = new Set(steady.filter((_, i) => distance[i] <= Math.max(cut, 1.5)));

  // The walk steps between neighbouring grains, so a dropped grain would leave
  // a jump between two periods that never sat side by side — a click of its
  // own. Keep the longest unbroken run of good periods instead.
  let bestRun = [];
  let run = [];
  for (const m of marks) {
    if (good.has(m)) run.push(m);
    else run = [];
    if (run.length > bestRun.length) bestRun = run.slice();
  }
  if (bestRun.length >= 6) return bestRun;
  return good.size >= 3 ? [...good] : marks;
}

/**
 * Hold a voiced sound for `lenMs` by pitch-synchronous overlap-add.
 *
 * Each output period is one two-period grain of the source, centred on a pitch
 * mark and placed exactly one period after the last, so the result is as
 * smooth as the source: no seams, no warble, no period-doubling roughness.
 *
 *   walk 'pingpong'  wanders forward and back across the source — for a
 *                    steady sound (m, n, a short vowel) held much longer
 *   walk 'forward'   passes through the source once — a real time-stretch,
 *                    for a glide like "ay" whose movement is the point
 *
 * The pitch eases down a few percent over the hold, the way a person's does.
 *
 *   pitch 'flat'     every period the same length, plus a little jitter
 *   pitch 'follow'   each period as long as the grain it came from, so the
 *                    source's own small wobbles in pitch come along with it
 *
 * `human` adds what makes a held sound a voice rather than a drone: a small
 * rise and slow fall in pitch, a slow drift, and the period-to-period
 * jitter and shimmer every real voice has. A perfectly regular hold is what
 * people hear as an engine or a plane.
 */
export function psola(src, lenMs, { seed = 1, driftPct = 3, jitterPct = 0.25, walk = 'pingpong', pitch = 'flat', human = false, markOn = src } = {}) {
  const rand = rng(seed);
  // pitch periods can be found in a cleaner copy (the low band of a hissy
  // /z/, where its voicing lives) while the grains come from the sound itself
  const P = medianPeriod(markOn);
  if (!P) throw new Error('no pitch to hold');
  const marks = cleanMarks(markOn, pitchMarks(markOn, P).filter(m => m - P >= 0 && m + P < src.length), P);
  if (marks.length < 3) throw new Error(`too few pitch periods (${marks.length})`);

  const len = ms(lenMs);
  const out = new Float32Array(len + 4 * P);
  const norm = new Float32Array(len + 4 * P);
  const periods = Math.ceil(len / P);

  // the human voice's slow movements: two drifts at about 0.7 and 1.6 Hz
  const drift = human ? [0, 1].map(i => ({ f: 0.6 + i + rand() * 0.3, p: rand() * Math.PI * 2, a: i ? 0.004 : 0.006 })) : [];
  const gauss = () => {
    const u = Math.max(rand(), 1e-9);
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rand());
  };

  let t = P;
  for (let k = 0; t < len + P; k += 1) {
    const phase = (k / periods) * 2;
    const pos = walk === 'forward' ? Math.min(1, k / periods) : phase <= 1 ? phase : 2 - phase;
    const j = Math.max(0, Math.min(marks.length - 1, Math.round(pos * (marks.length - 1))));
    const m = marks[j];
    const g = Math.min(P, m, src.length - 1 - m);
    const gain = human ? 10 ** ((gauss() * 0.5) / 20) : 1;
    for (let i = -g; i < g; i += 1) {
      const w = 0.5 + 0.5 * Math.cos((Math.PI * i) / g);
      const at = t + i;
      if (at >= 0 && at < out.length) {
        out[at] += src[m + i] * w * gain;
        norm[at] += w;
      }
    }
    const progress = Math.min(1, t / len);
    const own = j + 1 < marks.length ? marks[j + 1] - m : m - marks[j - 1];
    if (human) {
      // pitch rises 1.5% over the first sixth, then eases down 5%, drifting slowly
      const arc = progress < 0.15 ? 0.015 * (progress / 0.15) : 0.015 - 0.065 * ((progress - 0.15) / 0.85);
      const wobble = drift.reduce((a, d) => a + d.a * Math.sin(2 * Math.PI * d.f * (t / SR) + d.p), 0);
      const base = pitch === 'follow' && Math.abs(own - P) < P * 0.15 ? own : P;
      t += Math.max(1, Math.round((base / (1 + arc + wobble)) * (1 + gauss() * 0.006)));
    } else {
      const period = pitch === 'follow' && Math.abs(own - P) < P * 0.15 ? own : P * (1 + ((rand() - 0.5) * 2 * jitterPct) / 100);
      t += Math.round(period * (1 + (driftPct / 100) * progress));
    }
  }

  const res = new Float32Array(len);
  for (let i = 0; i < len; i += 1) res[i] = norm[i] > 0.2 ? out[i] / Math.max(norm[i], 1) : out[i];
  return res;
}

// ---------- buzzes: voiced fricatives ----------

/** Zero-phase FFT split at `fc` with a smooth 200 Hz crossover: [low, high]. */
export function splitBands(x, fc) {
  let n = 1;
  while (n < x.length * 2) n <<= 1;
  const re = new Float64Array(n);
  const im = new Float64Array(n);
  re.set(x);
  fft(re, im);
  for (let k = 0; k < n; k += 1) {
    const f = ((k <= n / 2 ? k : n - k) * SR) / n;
    const g = f < fc - 100 ? 1 : f > fc + 100 ? 0 : 0.5 + 0.5 * Math.cos((Math.PI * (f - (fc - 100))) / 200);
    re[k] *= g;
    im[k] *= g;
  }
  fft(re, im, true);
  const low = Float32Array.from(re.subarray(0, x.length));
  return [low, x.map((v, i) => v - low[i])];
}

/**
 * A held voiced fricative ("zzzz", "vvvv") from two clean parts: a voice bar —
 * the bottom ~600 Hz of a held voiced sound, which is little more than the
 * fundamental — and the fricative's own hiss, pulsed at the voice's pitch.
 * The pulsing is what makes a /z/ buzz instead of sounding like an /s/ with a
 * hum underneath. Kokoro devoices these at the edges of words, as English
 * speakers do, so there is no long voiced one in Luna's speech to borrow.
 */
export function buzz(voiceHeld, noiseSeg, { seed = 1, split = 600, hissSplit = 900, noiseDb = 0, pulse = 0.5 } = {}) {
  const [bar] = splitBands(voiceHeld, split);
  const len = bar.length;
  const [, highNoise] = splitBands(noiseSeg, hissSplit);
  const hiss = resynthNoise(highNoise, (len / SR) * 1000, { seed: seed + 1, attackMs: 1, releaseMs: 1, wanderDb: 0.4 });

  const P = medianPeriod(bar) || 110;
  const smooth = Math.max(1, Math.round(P / 6));
  const env = new Float32Array(len);
  let acc = 0;
  for (let i = 0; i < len; i += 1) {
    acc += Math.max(0, bar[i]) - (i >= smooth ? Math.max(0, bar[i - smooth]) : 0);
    env[i] = acc / smooth;
  }
  const envRms = rms(env) || 1;
  const gain = (rms(bar) / (rms(hiss) || 1)) * 10 ** (noiseDb / 20);
  const out = new Float32Array(len);
  for (let i = 0; i < len; i += 1) {
    const m = 1 - pulse + pulse * Math.min(2.5, env[i] / envRms);
    out[i] = bar[i] + hiss[i] * gain * m;
  }
  return out;
}

// ---------- breath and joins ----------

/**
 * A breath of air under a held voice, the colour of the sound itself and
 * pulsed with the voice. Real voices always carry some; without it a held
 * vowel sounds electronic.
 */
export function breathe(voice, colour, { db = -27, seed = 1 } = {}) {
  const len = voice.length;
  const air = resynthNoise(colour, (len / SR) * 1000, { seed: seed + 7, attackMs: 1, releaseMs: 1, wanderDb: 0.3 });
  const P = medianPeriod(voice) || 110;
  const smooth = Math.max(1, Math.round(P / 6));
  const env = new Float32Array(len);
  let acc = 0;
  for (let i = 0; i < len; i += 1) {
    acc += Math.abs(voice[i]) - (i >= smooth ? Math.abs(voice[i - smooth]) : 0);
    env[i] = acc / smooth;
  }
  const envRms = rms(env) || 1;
  const gain = (rms(voice) / (rms(air) || 1)) * 10 ** (db / 20);
  return voice.map((v, i) => v + air[i] * gain * Math.min(2.5, 0.4 + 0.6 * (env[i] / envRms)));
}

/** Join pieces end to end with short equal-power crossfades, so nothing clicks at a seam. */
export function join(parts, xfMs = 8) {
  const xf = ms(xfMs);
  let out = Float32Array.from(parts[0]);
  for (const next of parts.slice(1)) {
    if (!next.length) continue;
    const n = Math.min(xf, out.length >> 1, next.length >> 1);
    const res = new Float32Array(out.length + next.length - n);
    res.set(out.subarray(0, out.length - n));
    for (let i = 0; i < n; i += 1) {
      const t = (i + 0.5) / n;
      res[out.length - n + i] = out[out.length - n + i] * Math.cos((t * Math.PI) / 2) + next[i] * Math.sin((t * Math.PI) / 2);
    }
    res.set(next.subarray(n), out.length);
    out = res;
  }
  return out;
}

export const silence = lenMs => new Float32Array(ms(lenMs));

// ---------- words and sentences ----------

/**
 * Words and sentences keep their natural shape and their own dynamics: they
 * are trimmed, given short fades so nothing clicks, and levelled. Phonics
 * sounds do not come through here — see phonemes.mjs.
 */
export function shapeClip(samples, tune = {}) {
  const out = trimSilence(samples, { floorDb: tune.floorDb ?? -42 }).slice();
  fadeIn(out, ms(6));
  fadeOut(out, ms(18));
  return normalize(out, { targetDb: tune.targetDb ?? -19, ceilingDb: -1.5 });
}
