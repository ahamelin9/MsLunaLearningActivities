// How each phonics sound is made.
//
// A TTS model cannot say an isolated phoneme. It was trained on words, so
// asked for "f" alone Kokoro produces a voiced vowel, asked for "bə" it says
// "buh", and asked for "mː" — the length mark is British-only in its alphabet —
// it hums briefly and trails into a vowel. Shaping that output afterwards, as
// this renderer used to, mostly looped or clipped the wrong part: measured
// against the same sounds in real words, the old /s/, /sh/, /f/ and /th/ were
// closer to vowels than to themselves.
//
// What Kokoro does say well is words. So every sound here is cut out of a real
// word, in Luna's own voice, at the point where that sound is cleanest — a
// word-final /s/ is long and steady, an initial /p/ is a crisp release — and
// then held by the tools in dsp.mjs. A word is written in misaki, the phoneme
// alphabet Kokoro v1.0 was trained on (github.com/hexgrad/misaki, EN_PHONES.md);
// validateCarriers() rejects any symbol outside the American set.
//
// Sounds that are held try each carrier word and keep the one that holds most
// smoothly, so one glitchy word does not decide how a sound comes out.

import {
  SAMPLE_RATE,
  analyze,
  breathe,
  buzz,
  splitBands,
  fadeIn,
  fadeOut,
  join,
  ms,
  normalize,
  psola,
  resynthNoise,
  runs,
  seedOf,
  silence,
  worstSeam
} from './dsp.mjs';

/** Kokoro v1.0's American English phonemes, from misaki's EN_PHONES.md. */
export const US_PHONEMES = new Set([...'AIWYbdfhijklmnpstuvwzðŋɑɔəɛɜɡɪɹʃʊʌʒʤʧˈˌθᵊOæɾᵻ']);

// ---------- finding a sound inside its word ----------

const isHiss = f => f.live && (f.noise || f.zc > 4000);

/**
 * The vowel nucleus: three frames in a row that are loud, voiced, and buzz
 * like a vowel — more than an l, r, w or nasal does, but without the hiss of
 * a frame that still straddles an /s/.
 */
function nucleus(frames, from = 0) {
  const vowelish = f => f && f.voiced && f.rel > -4 && f.zc > 1100 && f.zc < 3500;
  for (let i = from; i < frames.length; i += 1) {
    if (vowelish(frames[i]) && vowelish(frames[i + 1]) && vowelish(frames[i + 2])) return i;
  }
  for (let i = from; i < frames.length; i += 1) if (frames[i].voiced && frames[i].rel > -3) return i;
  return -1;
}

/**
 * The hiss that ends a word — "bus", "fish" — minus its edges. The longest
 * hiss after the vowel, not simply the last one: Kokoro sometimes adds a
 * breath of vowel after a final /sh/ ("dish-uh"), and the breathy tail of that
 * is a hiss too, coloured like a vowel.
 */
function finalHiss(x) {
  const fr = analyze(x);
  const n0 = nucleus(fr);
  const r = runs(fr, (f, i) => i > n0 && isHiss(f), 4).sort((p, q) => q[1] - q[0] - (p[1] - p[0]))[0];
  if (!r) throw new Error('no final hiss');
  const from = fr[r[0]].mid + ms(20);
  return x.slice(from, Math.max(from + ms(40), fr[r[1]].mid - ms(25)));
}

/** The breath before the voice starts: the /h/ of "her". */
function initialHiss(x) {
  const fr = analyze(x);
  const r = runs(fr, f => f.noise, 2)[0];
  const voice = fr.findIndex(f => f.voiced);
  if (!r || (voice >= 0 && r[0] > voice)) throw new Error('no initial hiss');
  return x.slice(fr[r[0]].at, fr[Math.min(r[1], voice > 0 ? voice - 1 : r[1])].mid);
}

/**
 * The steady murmur that ends a word: the /m/ of "hum". A nasal is far less
 * buzzy up high than the vowel before it, so its zero-crossing rate drops
 * sharply; the steady low stretch at the end is the sound.
 */
function finalMurmur(x, zcMax = 900) {
  const [from, to] = finalMurmurRange(x, zcMax);
  return x.slice(from, to);
}

function finalMurmurRange(x, zcMax = 900) {
  const fr = analyze(x);
  const v = runs(fr, f => f.voiced, 4).at(-1);
  if (!v) throw new Error('no voiced run');
  const low = runs(fr.slice(v[0], v[1] + 1), f => f.zc < zcMax && f.rel > -22, 4).at(-1);
  if (!low) throw new Error('no murmur');
  const a = v[0] + low[0] + 3;
  const b = v[0] + low[1] - 3;
  if (b - a < 8) throw new Error(`murmur too short (${(b - a) * 5} ms)`);
  return [fr[a].mid, fr[b].mid];
}

/** The steady middle of the vowel in a word like "hat". */
function vowelCore(x, keep = 0.5) {
  const fr = analyze(x);
  const v = runs(fr, f => f.voiced && f.rel > -10, 6).sort((p, q) => q[1] - q[0] - (p[1] - p[0]))[0];
  if (!v) throw new Error('no vowel');
  const n = v[1] - v[0];
  const a = v[0] + Math.round((n * (1 - keep)) / 2);
  return x.slice(fr[a].mid, fr[a + Math.round(n * keep)].mid);
}

/**
 * The start of a word, up to a point defined by the vowel:
 *   'voicing'  the aspiration of p/t/k, up to where the voice starts
 *   'release'  a voiced stop: a little prevoicing, the burst, a sliver of vowel
 *   'nucleus'  everything before the vowel proper: w, y, blends
 * Kokoro sometimes opens with a few ms of stray voicing before an /s/ or /p/;
 * `unvoicedStart` skips it.
 */
function onset(x, opts) {
  const [from, to] = onsetRange(x, opts);
  return x.slice(from, to);
}

function onsetRange(x, { end, afterMs = 0, prevoiceMs = 35, unvoicedStart = false }) {
  const fr = analyze(x);
  let first = fr.findIndex(f => f.live);
  if (unvoicedStart) {
    // only a hiss near the start counts: a quiet /f/ may not register as
    // one, and the word's final consonant must not be mistaken for it
    const hiss = runs(fr, f => f.noise, 4).find(([a]) => a >= first && a <= first + 12);
    if (hiss) first = hiss[0];
  }

  let stop = -1;
  if (end === 'voicing') {
    // where the voice starts after the opening hiss or aspiration — which
    // must start near the beginning, so a word's final consonant cannot
    // stand in for a first one too quiet to register
    const hiss = runs(fr, f => f.noise, 2).find(([a]) => a >= first && a <= first + 12);
    stop = fr.findIndex((f, i) => i > (hiss ? hiss[1] : first) && f.voiced);
  } else if (end === 'nucleus') {
    stop = nucleus(fr, first);
  } else if (end === 'release') {
    // the burst is the biggest jump in level once the prevoicing has begun
    let jump = -Infinity;
    for (let i = first + 4; i < Math.min(fr.length, first + 30); i += 1) {
      const d = fr[i].rel - fr[i - 1].rel;
      if (d > jump) {
        jump = d;
        stop = i;
      }
    }
  }
  if (stop < 0) throw new Error(`no ${end} point`);

  const from = end === 'release' ? Math.max(fr[first].at, fr[stop].at - ms(prevoiceMs)) : fr[first].at;
  return [from, Math.min(x.length, fr[stop].at + ms(afterMs))];
}

/**
 * An affricate between two vowels — "ˈɑʤə" — with a sliver of the vowel
 * after it. Word-initially Kokoro devoices /j/ until it sounds like /ch/;
 * between vowels it stays voiced.
 */
function medialAffricate(x, afterMs = 45) {
  const fr = analyze(x);
  const n0 = nucleus(fr);
  const r = runs(fr, (f, i) => i > n0 && isHiss(f), 3)[0];
  if (!r) throw new Error('no medial affricate');
  const voice = fr.findIndex((f, i) => i > r[1] && f.voiced);
  if (voice < 0) throw new Error('no vowel after the affricate');
  return x.slice(Math.max(0, fr[r[0]].at - ms(10)), fr[voice].at + ms(afterMs));
}

/** A final consonant with its release and frication: the "ch" of "itch", the "ks" of "fox". */
function coda(x, maxMs) {
  const fr = analyze(x);
  const r = runs(fr, isHiss, 3).at(-1);
  if (!r) throw new Error('no final consonant');
  const from = Math.max(0, fr[r[0]].at - ms(8));
  return x.slice(from, Math.min(fr[r[1]].mid, from + ms(maxMs)));
}

/** A whole syllable from its first voiced frame to where the voice stops — no breathy onset or tail. */
function voicedSpan(x) {
  const fr = analyze(x);
  const first = fr.findIndex(f => f.voiced && f.rel > -20);
  if (first < 0) throw new Error('no voice');
  let last = first;
  while (last + 1 < fr.length && (fr[last + 1].voiced || fr[last + 1].per > 0.6) && fr[last + 1].rel > -26) last += 1;
  return x.slice(fr[first].at, Math.min(x.length, fr[last].mid));
}

/** A fricative between two vowels — the /z/ of "busy" — where English keeps it voiced. */
function medialFric(x) {
  const fr = analyze(x);
  const n0 = nucleus(fr);
  const r = runs(fr, (f, i) => i > n0 && isHiss(f), 3)[0];
  if (!r) throw new Error('no medial fricative');
  return x.slice(fr[r[0]].mid, fr[r[1]].mid);
}

/** The voiced consonant at the start of a word, before its vowel: the /l/ of "luck". */
function voicedLead(fr, from = 0) {
  const v = fr.findIndex((f, i) => i >= from && f.voiced);
  if (v < 0) return null;
  const nuc = nucleus(fr, v + 2);
  const end = nuc > v ? Math.min(nuc, v + 16) : v + 10;
  return end - v >= 5 ? [v, end] : null;
}

/**
 * Hold the samples between `a` and `b` for `holdMs`, keeping what comes
 * before — and, unless `keepAfter` is false, what comes after.
 */
function holdRegion(x, a, b, holdMs, seed, keepAfter = true) {
  const held = psola(x.slice(a, b), holdMs, { seed, pitch: 'follow', human: true, walk: 'pingpong' });
  return join(keepAfter ? [x.slice(0, a), held, x.slice(b)] : [x.slice(0, a), held], 8);
}

/**
 * The /ŋ/-to-/g/ release from a word like "finger": the end of the nasal and
 * the soft "g" that follows it, so a held /ng/ does not sound like /n/.
 */
function gRelease(x, afterMs = 60) {
  const fr = analyze(x);
  const n0 = nucleus(fr);
  const nasal = runs(fr, (f, i) => i > n0 && f.voiced && f.zc < 900, 4)[0];
  if (!nasal) throw new Error('no nasal before the g');
  // the nasal can be as loud as the vowel, so the g shows as the buzz coming
  // back (zero-crossings rising) rather than as a jump in level
  return x.slice(fr[Math.max(nasal[0], nasal[1] - 6)].at, Math.min(x.length, fr[nasal[1]].mid + ms(afterMs)));
}

// ---------- recipe builders ----------
//
// Each recipe names its carrier words (misaki phonemes, plain spelling) and
// a `make` that turns one carrier's audio into the finished sound. `tune` is
// the per-sound override from overrides.json.

/** A carrier word. `speed` < 1 lengthens it a little — never below ~0.8, where Kokoro starts to stutter. */
const word = (ps, spelled, speed = 1) => ({ ps, spelled, speed });

/**
 * s, sh, f, th: a held hiss in Luna's own colour. Fresh noise is smooth
 * whatever it is shaped like, so smoothness says nothing about which carrier
 * cut best — the first that cuts cleanly is used, in the order listed.
 */
const hiss = (carriers, { lenMs = 750, db = -21 } = {}) => ({
  method: 'held hiss',
  defaults: { holdMs: lenMs, targetDb: db },
  held: false,
  carriers,
  make: (x, { tune, seed }) => normalize(resynthNoise(finalHiss(x), tune.holdMs ?? lenMs, { seed }), { targetDb: tune.targetDb ?? db })
});

/**
 * m, n, ng, l, r and the short vowels: a held voiced sound. `natural` keeps
 * the sound as long as it was in the word instead of holding it.
 */
const hum = (carriers, cut, { lenMs = 680, attackMs = 30, releaseMs = 120, db = -20 } = {}) => ({
  method: 'held voice',
  defaults: { holdMs: lenMs, targetDb: db },
  held: true,
  carriers,
  make: async (x, { tune, seed, say }) => {
    const seg = tune.cut === 'vowel' ? vowelCore(x, tune.keep ?? 0.5) : cut(x);
    if (tune.natural) {
      const out = Float32Array.from(seg);
      return normalize(fadeOut(fadeIn(out, Math.min(ms(attackMs), out.length >> 2)), Math.min(ms(releaseMs), out.length >> 2)), {
        targetDb: tune.targetDb ?? db
      });
    }
    let out = psola(seg, tune.holdMs ?? lenMs, { seed, pitch: tune.human ? 'follow' : tune.pitch ?? 'flat', human: Boolean(tune.human) });
    if (tune.human) out = breathe(out, seg, { db: tune.breathDb ?? -27, seed });
    if (tune.vowelLeadMs) {
      // a sliver of the vowel before a nasal: the glide into /ŋ/ is most of
      // what tells it apart from /n/ ("(i)ng"), with no g after it
      const [from] = finalMurmurRange(x);
      const lead = x.slice(Math.max(0, from - ms(tune.vowelLeadMs)), from);
      out = join([fadeIn(Float32Array.from(lead), ms(12)), out], 15);
    } else {
      fadeIn(out, ms(attackMs));
    }
    if (tune.gTail) {
      // the held nasal runs straight into the soft g of a word like "finger"
      const tail = gRelease(await say(tune.gTail), tune.gTailMs ?? 60);
      out = join([out, fadeOut(Float32Array.from(tail), ms(Math.min(25, (tune.gTailMs ?? 60) / 2)))], 20);
    } else {
      fadeOut(out, ms(releaseMs));
    }
    return normalize(out, { targetDb: tune.targetDb ?? db });
  }
});

/** z, v, voiced th: a held voice bar with the sound's own hiss pulsed over it. */
const buzzing = (carriers, { lenMs = 640, noiseDb = 0, pulse = 0.5 } = {}) => ({
  method: 'held buzz',
  defaults: { holdMs: lenMs, noiseDb, pulse },
  held: true,
  carriers,
  make: async (x, { tune, seed, say }) => {
    const len = tune.holdMs ?? lenMs;
    if (tune.medial || tune.initial) {
      // Luna's own voiced fricative, held as it is: from between two vowels
      // ("busy"), or from the start of a word that keeps it voiced ("this")
      let seg;
      if (tune.medial) seg = medialFric(x);
      else {
        const fr = analyze(x);
        const r = voicedLead(fr);
        if (!r) throw new Error('no voiced sound at the start of the word');
        seg = x.slice(fr[r[0]].at, fr[r[1]].at);
      }
      const [low] = splitBands(seg, 800);
      const held = psola(seg, len, { seed, pitch: 'follow', human: true, markOn: low });
      return normalize(fadeOut(fadeIn(held, ms(35)), ms(120)), { targetDb: tune.targetDb ?? -20 });
    }
    const voice = psola(finalMurmur(await say('hˈʌm')), len, { seed, human: Boolean(tune.human), pitch: tune.human ? 'follow' : 'flat' });
    const out = buzz(voice, finalHiss(x), { seed, noiseDb: tune.noiseDb ?? noiseDb, pulse: tune.pulse ?? pulse });
    return normalize(fadeOut(fadeIn(out, ms(35)), ms(120)), { targetDb: tune.targetDb ?? -20 });
  }
});

/** Long vowels and r-vowels glide, so they are slowed down whole — never looped. */
const glide = (carriers, { lenMs = 430 } = {}) => ({
  method: 'whole glide',
  defaults: { holdMs: lenMs },
  held: true,
  carriers,
  make: (x, { tune, seed }) => {
    // a vowel inside a longer word ("hoop") is cut out; a bare syllable ("A") is kept whole
    const src = tune.cut === 'vowel' ? vowelCore(x, tune.keep ?? 0.6) : voicedSpan(x);
    const len = tune.holdMs ?? lenMs;
    let out =
      tune.natural || src.length >= ms(len)
        ? Float32Array.from(src)
        : psola(src, len, { seed, walk: tune.human ? 'pingpong' : 'forward', driftPct: 2, pitch: tune.human ? 'follow' : tune.pitch ?? 'flat', human: Boolean(tune.human) });
    if (tune.human && !tune.natural) out = breathe(out, src, { db: tune.breathDb ?? -27, seed });
    return normalize(fadeOut(fadeIn(out, ms(15)), ms(90)), { targetDb: tune.targetDb ?? -20 });
  }
});

/** Stops, glides and blends: the start of a word, cut before the vowel takes over. */
const opening = (carriers, opts, { fadeMs = 30 } = {}) => ({
  method: 'word onset',
  defaults: { afterMs: opts.afterMs, end: opts.end },
  held: false,
  carriers,
  make: async (x, { tune, seed, say, render }) => {
    const fade = tune.fadeMs ?? fadeMs;
    let out;
    if (tune.parts) {
      // built from other sounds in order — "s", a pause, "p" — for a blend no word gives cleanly
      const pieces = [];
      for (const part of tune.parts) pieces.push(part.gapMs ? silence(part.gapMs) : (await render(part.sound, part.tune ?? {})).samples);
      return normalize(join(pieces, 6), { targetDb: tune.targetDb ?? -20 });
    }
    if (tune.tail) {
      // two parts: the opening of this word (or another sound) up to where the voice starts,
      // then a second consonant that is voiced and clear, from a word that starts with it, held
      const lead = tune.lead
        ? (await render(tune.lead.sound, tune.lead.tune ?? {})).samples
        : Float32Array.from(onset(x, { ...opts, end: 'voicing', afterMs: 0 }));
      const tx = await say(tune.tail.carrier);
      const [tFrom, tTo] = onsetRange(tx, { end: 'nucleus', afterMs: tune.tail.afterMs ?? 40 });
      let second = tx.slice(tFrom, tTo);
      // the consonant is found in the whole word, where the vowel is the loudest part
      const whole = analyze(tx);
      const region = voicedLead(whole, whole.findIndex(f => f.at >= tFrom));
      if (!region) throw new Error(`no voiced consonant to hold in ${tune.tail.carrier}`);
      // noVowel: end on the held consonant, so "kr" is not "kruh" — and hold
      // only its steady first three quarters, since the rest already bends
      // toward the vowel
      const a = Math.max(0, whole[region[0]].at - tFrom);
      const end = Math.min(second.length, whole[region[1]].at - tFrom);
      const b = tune.noVowel ? a + Math.round((end - a) * 0.75) : end;
      if (b - a < ms(20)) throw new Error(`consonant in ${tune.tail.carrier} too short to hold`);
      second = holdRegion(second, a, b, tune.tail.holdMs ?? 160, seed, !tune.noVowel);
      const halves = tune.gapMs ? [fadeOut(lead.slice(), ms(4)), silence(tune.gapMs), second] : [fadeOut(lead.slice(), ms(4)), second];
      out = join(halves.map((h, i) => (i === halves.length - 1 ? fadeOut(h, ms(fade)) : h)), tune.joinMs ?? 10);
      return normalize(fadeIn(out, ms(2)), { targetDb: tune.targetDb ?? -20 });
    }
    const [from, to] = onsetRange(x, { ...opts, afterMs: tune.afterMs ?? opts.afterMs });
    out = x.slice(from, to);
    if (tune.holdSecond) {
      // the word's own voiced second consonant (the /m/ of "smug"), held
      // longer; found in the whole word, where the vowel is the loudest part
      const whole = analyze(x);
      const region = voicedLead(whole, whole.findIndex(f => f.at >= from));
      if (!region) throw new Error('no voiced second consonant to hold');
      const a = Math.max(0, whole[region[0]].at - from), b = Math.min(out.length, whole[region[1]].at - from);
      if (b - a < ms(20)) throw new Error('second consonant too short to hold');
      out = holdRegion(out, a, b, tune.holdSecond, seed, !tune.noVowel);
    }
    const fr = analyze(out);
    if (tune.stretch) {
      // slow the voiced part down without changing its pitch (a "w" that is too quick)
      const v = fr.findIndex(f => f.voiced);
      if (v >= 0) {
        const at = fr[v].at;
        const voiced = out.slice(at);
        const slow = psola(voiced, ((voiced.length * tune.stretch) / SAMPLE_RATE) * 1000, { seed, walk: 'forward', pitch: 'follow', driftPct: 0 });
        out = join([out.slice(0, at), slow], 6);
      }
    }
    return normalize(fadeOut(fadeIn(out, ms(2)), ms(fade)), { targetDb: tune.targetDb ?? -20 });
  }
});

/** h: a short breath with the colour of Luna's /h/. */
const breath = carriers => ({
  method: 'breath',
  defaults: { holdMs: 230 },
  held: false,
  carriers,
  make: (x, { tune, seed }) =>
    normalize(resynthNoise(initialHiss(x), tune.holdMs ?? 230, { seed, attackMs: 25, releaseMs: 150, wanderDb: 0.3 }), {
      targetDb: tune.targetDb ?? -23
    })
});

/** ch, x: the end of a word, release and all. */
const ending = (carriers, maxMs, fadeMs) => ({
  method: 'word ending',
  defaults: { holdMs: maxMs },
  held: false,
  carriers,
  make: (x, { tune }) => {
    const out = Float32Array.from(coda(x, tune.holdMs ?? maxMs));
    return normalize(fadeOut(fadeIn(out, ms(4)), ms(fadeMs)), { targetDb: tune.targetDb ?? -20 });
  }
});

/** j: from between two vowels, where it is still voiced. */
const affricate = carriers => ({
  method: 'between vowels',
  defaults: { afterMs: 45 },
  held: false,
  carriers,
  make: (x, { tune }) => {
    const out = Float32Array.from(medialAffricate(x, tune.afterMs ?? 45));
    return normalize(fadeOut(fadeIn(out, ms(4)), ms(35)), { targetDb: tune.targetDb ?? -20 });
  }
});

/**
 * Short vowels are cut from words, never asked for alone: an isolated vowel is
 * not something Kokoro learned, and the old isolated /ɪ/ drifted most of the
 * way to "ee". Voiced endings ("had") and a slightly slower pace give a longer,
 * steadier vowel to hold.
 */
const vowel = carriers => hum(carriers, x => vowelCore(x, 0.4), { lenMs: 480, attackMs: 35, releaseMs: 110 });

/**
 * A blend is both consonants and the moment the vowel arrives. It is cut a
 * fixed time after the voice starts, because the second consonant (l, r, w,
 * m, n) is where it starts: s+stop blends need only a sliver of the vowel,
 * the rest need room for that second consonant. Kokoro devoices a /g/ or /d/
 * at the start of a word, so those count as hiss-first too; only /b/ is
 * voiced all the way into its burst.
 */
const blend = (carriers, afterMs, opts = {}) =>
  opening(carriers, { end: 'voicing', afterMs, unvoicedStart: true, ...opts }, { fadeMs: 35 });
const voicedBlend = carriers => opening(carriers, { end: 'release', afterMs: 90, prevoiceMs: 30 }, { fadeMs: 40 });

// ---------- the sounds ----------

/** One recipe per distinct sound. Several letters share one: C, K and CK are all 'k'. */
export const SOUNDS = {
  s: hiss([word('bˈʌs', 'bus'), word('mˈɪs', 'miss'), word('jˈɛs', 'yes')]),
  sh: hiss([word('fˈɪʃ', 'fish'), word('dˈɪʃ', 'dish'), word('pˈʊʃ', 'push')]),
  // not "off": the rounded vowel before it pulls the /f/ toward /sh/
  f: hiss([word('kˈʌf', 'cuff'), word('lˈif', 'leaf'), word('ˈɔf', 'off')], { db: -22 }),
  th: hiss([word('bˈæθ', 'bath'), word('mˈæθ', 'math'), word('tˈuθ', 'tooth')], { db: -22 }),

  m: hum([word('hˈʌm', 'hum'), word('ɡˈʌm', 'gum'), word('hˈɪm', 'him')], finalMurmur, { lenMs: 700 }),
  n: hum([word('fˈʌn', 'fun'), word('sˈʌn', 'sun'), word('hˈɪn', 'hin')], finalMurmur, { lenMs: 680 }),
  ng: hum([word('jˈʌŋ', 'young'), word('bˈæŋ', 'bang'), word('kˈɪŋ', 'king')], finalMurmur, { lenMs: 650 }),
  l: hum([word('hˈʌl', 'hull'), word('bˈɛl', 'bell'), word('fˈʊl', 'full')], x => finalMurmur(x, 1300), { lenMs: 620 }),
  r: hum([word('hˈɜɹ', 'her'), word('fˈɜɹ', 'fur'), word('sˈɜɹ', 'sir'), word('pˈɜɹ', 'purr')], x => vowelCore(x, 0.4), { lenMs: 620 }),

  z: buzzing([word('bˈʌz', 'buzz'), word('fˈɪz', 'fizz')], { lenMs: 680, noiseDb: 3, pulse: 0.55 }),
  v: buzzing([word('lˈʌv', 'love'), word('ɡˈɪv', 'give')], { lenMs: 620, noiseDb: -2, pulse: 0.45 }),
  dh: buzzing([word('bɹˈið', 'breathe'), word('smˈuð', 'smooth')], { lenMs: 620, noiseDb: -4, pulse: 0.45 }),

  a: vowel([word('hˈæd', 'had', 0.85), word('hˈæz', 'has', 0.85), word('bˈæd', 'bad'), word('hˈæt', 'hat'), word('pˈæt', 'pat', 0.85)]),
  e: vowel([word('bˈɛd', 'bed'), word('hˈɛd', 'head', 0.85), word('hˈɛt', 'het'), word('pˈɛt', 'pet')]),
  i: vowel([word('bˈɪd', 'bid'), word('hˈɪd', 'hid', 0.85), word('pˈɪt', 'pit', 0.85), word('hˈɪt', 'hit')]),
  o: vowel([word('ɡˈɑd', 'god', 0.85), word('pˈɑt', 'pot', 0.85), word('hˈɑt', 'hot'), word('hˈɑd', 'hod')]),
  u: vowel([word('bˈʌd', 'bud', 0.85), word('pˈʌt', 'putt', 0.85), word('hˈʌt', 'hut'), word('hˈʌɡ', 'hug')]),

  ay: glide([word('ˈA', 'A'), word('hˈA', 'hay')]),
  ee: glide([word('ˈi', 'E'), word('hˈi', 'he'), word('sˈi', 'see')]),
  eye: glide([word('ˈI', 'I'), word('hˈI', 'high')]),
  oh: glide([word('ˈO', 'O'), word('hˈO', 'hoe')]),
  you: glide([word('jˈu', 'you'), word('hjˈu', 'hue')]),
  oo: glide([word('ˈu', 'oo'), word('hˈu', 'who'), word('tˈu', 'two')]),
  ar: glide([word('ˈɑɹ', 'are'), word('fˈɑɹ', 'far')]),
  or: glide([word('ˈɔɹ', 'or'), word('fˈɔɹ', 'for')]),
  er: glide([word('ˈɜɹ', 'er'), word('hˈɜɹ', 'her')]),

  p: opening([word('pˈʌp', 'pup')], { end: 'voicing', afterMs: 5, unvoicedStart: true }, { fadeMs: 15 }),
  t: opening([word('tˈʌb', 'tub')], { end: 'voicing', afterMs: 5, unvoicedStart: true }, { fadeMs: 15 }),
  k: opening([word('kˈʌp', 'cup')], { end: 'voicing', afterMs: 5, unvoicedStart: true }, { fadeMs: 15 }),
  b: opening([word('bˈʌɡ', 'bug')], { end: 'release', afterMs: 50 }),
  d: opening([word('dˈʌk', 'duck')], { end: 'release', afterMs: 50 }),
  g: opening([word('ɡˈʌm', 'gum')], { end: 'release', afterMs: 50 }),
  h: breath([word('hˈɜɹ', 'her')]),
  ch: ending([word('ˈɪʧ', 'itch')], 190, 60),
  j: affricate([word('ˈɑʤə', 'lodger')]),
  w: opening([word('wˈʌn', 'won')], { end: 'nucleus', afterMs: 45 }, { fadeMs: 55 }),
  y: opening([word('jˈʌm', 'yum')], { end: 'nucleus', afterMs: 45 }, { fadeMs: 55 }),
  ks: ending([word('fˈɑks', 'fox')], 240, 80),
  kw: opening([word('kwˈɪk', 'quick')], { end: 'nucleus', afterMs: 35, unvoicedStart: true }, { fadeMs: 45 }),

  bl: voicedBlend([word('blˈʌʃ', 'blush')]),
  br: voicedBlend([word('bɹˈʌʃ', 'brush')]),
  cl: blend([word('klˈʌb', 'club')], 60),
  cr: blend([word('kɹˈʌm', 'crumb')], 60),
  dr: blend([word('dɹˈʌm', 'drum')], 65, { unvoicedStart: false }),
  fl: blend([word('flˈʌf', 'fluff')], 95, { unvoicedStart: false }),
  fr: blend([word('fɹˈʌnt', 'front')], 60),
  gl: blend([word('ɡlˈʌv', 'glove')], 70, { unvoicedStart: false }),
  gr: blend([word('ɡɹˈʌb', 'grub')], 70, { unvoicedStart: false }),
  pl: blend([word('plˈʌm', 'plum')], 60),
  pr: blend([word('pɹˈɪnt', 'print')], 60),
  sk: blend([word('skˈʌl', 'skull')], 30),
  sl: blend([word('slˈʌɡ', 'slug')], 65),
  sm: blend([word('smˈʌɡ', 'smug')], 65),
  sn: blend([word('snˈʌɡ', 'snug')], 65),
  sp: blend([word('spˈʌn', 'spun')], 30),
  st: blend([word('stˈʌk', 'stuck')], 30),
  sw: blend([word('swˈɪm', 'swim')], 65),
  tr: blend([word('tɹˈʌk', 'truck')], 60),
  tw: blend([word('twˈɪn', 'twin')], 60)
};

/** The app's sound keys (phonics.ts, normalised) → the sound each one makes. */
export const KEY_TO_SOUND = {
  A: 'a', 'A+alt': 'ay', B: 'b', C: 'k', 'C+alt': 's', D: 'd', E: 'e', 'E+alt': 'ee', F: 'f', G: 'g', 'G+alt': 'j',
  H: 'h', I: 'i', 'I+alt': 'eye', J: 'j', K: 'k', L: 'l', M: 'm', N: 'n', O: 'o', 'O+alt': 'oh', P: 'p', Q: 'kw',
  R: 'r', S: 's', T: 't', U: 'u', 'U+alt': 'you', V: 'v', W: 'w', X: 'ks', Y: 'y', Z: 'z',
  SH: 'sh', CH: 'ch', TH: 'th', 'TH+alt': 'dh', WH: 'w', NG: 'ng', CK: 'k', QU: 'kw',
  BL: 'bl', BR: 'br', CL: 'cl', CR: 'cr', DR: 'dr', FL: 'fl', FR: 'fr', GL: 'gl', GR: 'gr', PL: 'pl', PR: 'pr',
  SC: 'sk', SK: 'sk', SL: 'sl', SM: 'sm', SN: 'sn', SP: 'sp', ST: 'st', SW: 'sw', TR: 'tr', TW: 'tw',
  AI: 'ay', AY: 'ay', EA: 'ee', EE: 'ee', IE: 'eye', IGH: 'eye', OA: 'oh', OW: 'oh', OO: 'oo', UE: 'oo',
  AR: 'ar', OR: 'or', ER: 'er', IR: 'er', UR: 'er'
};

/** The sound id for an inventory key, failing loudly for a key nobody mapped. */
export function soundFor(key) {
  const id = KEY_TO_SOUND[key];
  if (!id || !SOUNDS[id]) throw new Error(`no phonics recipe for sound key "${key}" — add it to KEY_TO_SOUND in scripts/voice/phonemes.mjs`);
  return id;
}

/** Every carrier spelling that would be dropped or is outside Kokoro's American alphabet. */
export function validateCarriers() {
  const bad = [];
  const extra = ['hˈʌm']; // the voice bar under every buzz
  for (const [id, recipe] of Object.entries(SOUNDS)) {
    for (const { ps } of recipe.carriers) {
      const outside = [...ps].filter(c => !US_PHONEMES.has(c));
      if (outside.length) bad.push({ id, ps, outside: outside.join('') });
    }
  }
  for (const ps of extra) {
    const outside = [...ps].filter(c => !US_PHONEMES.has(c));
    if (outside.length) bad.push({ id: '(voice bar)', ps, outside: outside.join('') });
  }
  return bad;
}

/**
 * Render one sound. `say(phonemes)` returns Kokoro's audio for a carrier word
 * at SAMPLE_RATE. Held sounds try every carrier and keep the smoothest; the
 * rest use the first that can be cut cleanly.
 */
export async function renderSound(id, say, tune = {}) {
  const recipe = SOUNDS[id];
  if (!recipe) throw new Error(`unknown sound "${id}"`);
  const carriers = tune.carrier ? [word(tune.carrier, tune.word ?? tune.carrier, tune.speed ?? 1)] : recipe.carriers;
  const seed = seedOf(id);
  const failures = [];
  let best = null;

  for (const carrier of carriers) {
    try {
      const render = (other, otherTune) => renderSound(other, say, otherTune);
      const samples = await recipe.make(await say(carrier.ps, carrier.speed), { tune, seed, say, render });
      if (!recipe.held) return { samples, carrier: carrier.spelled };
      const seam = worstSeam(samples);
      if (!best || seam < best.seam) best = { samples, carrier: carrier.spelled, seam };
    } catch (e) {
      failures.push(`${carrier.spelled}: ${e.message}`);
    }
  }
  if (!best) throw new Error(`could not cut "${id}" from any carrier (${failures.join('; ')})`);
  return best;
}

export { SAMPLE_RATE };
