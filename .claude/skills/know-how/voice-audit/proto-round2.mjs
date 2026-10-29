// Round 2 takes: the app's recipes with new tuning, plus a few new ways of
// making a sound that Alex's round 1 notes asked for.
//   node proto2.mjs <outDir>
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { KokoroTTS } from 'kokoro-js';
import { SOUNDS, renderSound } from '../../../../scripts/voice/phonemes.mjs';
import { analyze, runs, psola, normalize, fadeIn, fadeOut, join as joinParts, splitBands, ms, rms, rng, medianPeriod, silence } from '../../../../scripts/voice/dsp.mjs';

const outDir = process.argv[2];
mkdirSync(outDir, { recursive: true });
const tts = await KokoroTTS.from_pretrained('onnx-community/Kokoro-82M-v1.0-ONNX', { dtype: 'fp32', device: 'cpu' });
const memo = new Map();
const say = (ps, speed = 1) => {
  const id = `${ps}@${speed}`;
  if (!memo.has(id))
    memo.set(id, tts.generate_from_ids(tts.tokenizer(ps, { truncation: true }).input_ids, { voice: 'af_heart', speed }).then(r => Float32Array.from(r.audio)));
  return memo.get(id);
};
function wav(samples, sr = 24000) {
  const b = Buffer.alloc(44 + samples.length * 2);
  b.write('RIFF', 0); b.writeUInt32LE(36 + samples.length * 2, 4); b.write('WAVE', 8);
  b.write('fmt ', 12); b.writeUInt32LE(16, 16); b.writeUInt16LE(1, 20); b.writeUInt16LE(1, 22);
  b.writeUInt32LE(sr, 24); b.writeUInt32LE(sr * 2, 28); b.writeUInt16LE(2, 32); b.writeUInt16LE(16, 34);
  b.write('data', 36); b.writeUInt32LE(samples.length * 2, 40);
  for (let i = 0; i < samples.length; i += 1) b.writeInt16LE(Math.max(-32768, Math.min(32767, Math.round(samples[i] * 32767))), 44 + i * 2);
  return b;
}

// ---------- new tools

/** Her real hiss, held: overlapping grains taken from the hiss itself, not new noise. */
function grainHold(seg, lenMs, seed, grainMs = 40) {
  const rand = rng(seed);
  const N = Math.min(ms(grainMs), Math.floor(seg.length / 2));
  const hop = N >> 1;
  const len = ms(lenMs);
  const out = new Float32Array(len + N);
  const w = Float32Array.from({ length: N }, (_, i) => Math.sin((Math.PI * i) / N));
  for (let at = 0; at < len; at += hop) {
    const from = Math.floor(rand() * (seg.length - N));
    for (let i = 0; i < N; i += 1) out[at + i] += seg[from + i] * w[i];
  }
  return out.subarray(0, len);
}
const isHiss = f => f.live && (f.noise || f.zc > 4000);
const vowelish = f => f && f.voiced && f.rel > -4 && f.zc > 1100 && f.zc < 3500;
function nucleus(fr, from = 0) {
  for (let i = from; i < fr.length; i += 1) if (vowelish(fr[i]) && vowelish(fr[i + 1]) && vowelish(fr[i + 2])) return i;
  for (let i = from; i < fr.length; i += 1) if (fr[i].voiced && fr[i].rel > -3) return i;
  return -1;
}
/** The longest hiss in a word, without its edges. */
function longestHiss(x, after = 0) {
  const fr = analyze(x);
  const r = runs(fr, (f, i) => i >= after && isHiss(f), 4).sort((p, q) => q[1] - q[0] - (p[1] - p[0]))[0];
  if (!r) throw new Error('no hiss');
  return x.slice(fr[r[0]].mid + ms(15), Math.max(fr[r[0]].mid + ms(40), fr[r[1]].mid - ms(15)));
}
/** A vowel said on its own, from where it settles to where the voice stops: no stray sound in front. */
function settledVowel(x, { skipOnset = false } = {}) {
  const fr = analyze(x);
  let a = nucleus(fr);
  if (a < 0) throw new Error('no vowel');
  if (skipOnset) a += 2;
  let b = a;
  while (b + 1 < fr.length && fr[b + 1].voiced && fr[b + 1].rel > -24) b += 1;
  return x.slice(fr[a].at, fr[b].mid);
}
/** The last part of a voiced run, where an R is most R: the end of "fur". */
function voicedTail(x, keep = 0.45) {
  const fr = analyze(x);
  const v = runs(fr, f => f.voiced && f.rel > -16, 6).sort((p, q) => q[1] - q[0] - (p[1] - p[0]))[0];
  if (!v) throw new Error('no voice');
  const a = v[1] - Math.round((v[1] - v[0]) * keep);
  return x.slice(fr[a].mid, fr[v[1]].mid);
}
const finish = (x, { inMs = 15, outMs = 90, db = -20 } = {}) => normalize(fadeOut(fadeIn(Float32Array.from(x), ms(inMs)), ms(outMs)), { targetDb: db });

const takes = [];
const add = (sound, take, make, label) => takes.push({ sound, take, make, label });
const recipe = (sound, tune, id = sound) => async () => (await renderSound(id, say, tune)).samples;

// ---------- hisses: her own, not static
for (const [s, carriers, db] of [['f', [['kˈʌf.', 'cuff'], ['lˈif.', 'leaf']], -22], ['th', [['bˈæθ.', 'bath'], ['tˈuθ.', 'tooth']], -22], ['s', [['jˈɛs.', 'yes']], -21], ['sh', [['pˈʊʃ.', 'push']], -21]]) {
  for (const [ps, word] of carriers) {
    add(s, `real-${word}`, async () => finish(grainHold(longestHiss(await say(ps, 0.85)), s === 'sh' || s === 's' ? 420 : 400, 7), { inMs: 40, outMs: 110, db }), `her real hiss from “${word}”, held`);
  }
}
add('s', 'today-450', recipe('s', { carrier: 'jˈɛs', holdMs: 450 }), 'today’s, shorter (450 ms)');
add('sh', 'today-420', recipe('sh', { carrier: 'pˈʊʃ', holdMs: 420 }), 'today’s, shorter (420 ms)');
add('sh', 'today-320', recipe('sh', { carrier: 'pˈʊʃ', holdMs: 320 }), 'today’s, shorter (320 ms)');
add('h', 'longer-330', recipe('h', { holdMs: 330 }), 'today’s, longer (330 ms)');
add('h', 'longer-420', recipe('h', { holdMs: 420 }), 'today’s, longer (420 ms)');

// ---------- buzzing sounds: a held voice with her own hiss over it
async function buzzReal(carrier, word, noiseDb) {
  const x = await say(carrier, 0.85);
  const hiss = longestHiss(x);
  const hum = await say('hˈʌm', 1);
  const fr = analyze(hum);
  const v = runs(fr, f => f.voiced, 4).at(-1);
  const low = runs(fr.slice(v[0], v[1] + 1), f => f.zc < 900 && f.rel > -22, 4).at(-1);
  const murmur = hum.slice(fr[v[0] + low[0] + 3].mid, fr[v[0] + low[1] - 3].mid);
  const voice = psola(murmur, 600, { seed: 3, pitch: 'follow', human: true });
  const [bar] = splitBands(voice, 600);
  const [, high] = splitBands(hiss, 900);
  const h = grainHold(high, 600, 5);
  const gain = (rms(bar) / (rms(h) || 1)) * 10 ** (noiseDb / 20);
  const out = Float32Array.from(bar, (b, i) => b + h[i] * gain);
  return finish(out, { inMs: 35, outMs: 120 });
}
for (const [s, c, w] of [['z', 'bˈʌz.', 'buzz'], ['v', 'lˈʌv.', 'love']]) for (const n of [0, 4]) add(s, `real-${n}`, () => buzzReal(c, w, n), `a hum with her real hiss from “${w}”${n ? `, hiss +${n} dB` : ''}`);
add('dh', 'this', recipe('dh', { carrier: 'ðˈɪs', initial: true, holdMs: 600 }), 'from the start of “this”, held');
add('dh', 'that', recipe('dh', { carrier: 'ðˈæt', initial: true, holdMs: 600 }), 'from the start of “that”, held');
add('dh', 'real-0', () => buzzReal('bɹˈið.', 'breathe', 0), 'a hum with her real hiss from “breathe”');

// ---------- hums: said slowly instead of stretched
async function naturalMurmur(ps, zcMax = 900) {
  const x = await say(ps, 0.75);
  const fr = analyze(x);
  const v = runs(fr, f => f.voiced, 4).at(-1);
  const low = runs(fr.slice(v[0], v[1] + 1), f => f.zc < zcMax && f.rel > -24, 4).at(-1);
  if (!low) throw new Error('no murmur');
  return finish(x.slice(fr[v[0] + low[0] + 2].mid, fr[v[0] + low[1]].mid), { inMs: 30, outMs: 120 });
}
add('m', 'slow-hum', () => naturalMurmur('hˈʌm.'), 'the end of “hum” said slowly, not stretched');
add('m', 'slow-mum', () => naturalMurmur('mˈʌm.'), 'the end of “mum” said slowly, not stretched');
add('m', 'human', recipe('m', { carrier: 'hˈʌm', holdMs: 480, human: true, breathDb: -30 }), 'held, with a natural wobble');
add('n', 'slow-sun', () => naturalMurmur('sˈʌn.'), 'the end of “sun” said slowly, not stretched');
add('n', 'slow-fun', () => naturalMurmur('fˈʌn.'), 'the end of “fun” said slowly, not stretched');
add('n', 'human', recipe('n', { carrier: 'sˈʌn', holdMs: 480, human: true, breathDb: -30 }), 'held, with a natural wobble');
add('ng', 'g-tail', recipe('ng', { carrier: 'bˈæŋ', holdMs: 520, pitch: 'follow', gTail: 'fˈɪŋɡəɹ', gTailMs: 70 }), 'held, then the soft g of “finger”');
add('ng', 'g-tail-short', recipe('ng', { carrier: 'kˈɪŋ', holdMs: 420, pitch: 'follow', gTail: 'fˈɪŋɡəɹ', gTailMs: 50 }), 'shorter, then a softer g');
add('l', 'slow-bell', () => naturalMurmur('bˈɛl.', 1300), 'the end of “bell” said slowly, not stretched');
add('l', 'slow-feel', () => naturalMurmur('fˈil.', 1300), 'the end of “feel” said slowly, not stretched');
add('l', 'bell-human', recipe('l', { carrier: 'bˈɛl', holdMs: 520, human: true, breathDb: -30 }), 'from “bell”, held with a natural wobble');
// R: the most R part of a word, held
for (const [c, w] of [['fˈɜɹ.', 'fur'], ['kˈɑɹ.', 'car'], ['hˈɪɹ.', 'here']]) {
  add('r', `tail-${w}`, async () => finish(psola(voicedTail(await say(c, 0.8)), 560, { seed: 9, pitch: 'follow', human: true }), { inMs: 40, outMs: 120 }), `the R at the end of “${w}”, held`);
}

// ---------- stops: a softer, slightly longer release
for (const [s, c, w, sets] of [
  ['b', 'bˈʌɡ', 'bug', [[70, 70], [100, 90]]], ['d', 'dˈʌk', 'duck', [[60, 60], [90, 80]]], ['g', 'ɡˈʌm', 'gum', [[100, 90], [120, 100]]],
  ['t', 'tˈʌb', 'tub', [[25, 30], [40, 40]]], ['k', 'kˈʌp', 'cup', [[25, 50], [35, 60]]]
]) for (const [after, fade] of sets) add(s, `${w}${after}`, recipe(s, { carrier: c, afterMs: after, fadeMs: fade, targetDb: -22 }), `from “${w}”, ${after} ms with a ${fade} ms fade`);
add('d', 'dig70', recipe('d', { carrier: 'dˈɪɡ', afterMs: 70, fadeMs: 70, targetDb: -22 }), 'from “dig”, 70 ms with a 70 ms fade');
add('p', 'pup-soft', recipe('p', { carrier: 'pˈʌp', afterMs: 25, fadeMs: 30, targetDb: -25 }), 'from “pup”, softer');
add('p', 'pup-softer', recipe('p', { carrier: 'pˈʌp', afterMs: 15, fadeMs: 25, targetDb: -27 }), 'from “pup”, softer still');
add('p', 'pin-soft', recipe('p', { carrier: 'pˈɪn', afterMs: 20, fadeMs: 30, targetDb: -25 }), 'from “pin”, softer');

// ---------- J, CH, W, QU, Y
add('j', 'lodger100', recipe('j', { afterMs: 100 }), 'from “lodger”, less cut off');
add('j', 'lodger130', recipe('j', { afterMs: 130 }), 'from “lodger”, less cut off still');
SOUNDS['ch~p'] = { ...SOUNDS.p };
add('ch', 'chip', recipe('ch', { carrier: 'ʧˈɪp', afterMs: 15, fadeMs: 30 }, 'ch~p'), 'from the start of “chip”');
add('ch', 'chuck', recipe('ch', { carrier: 'ʧˈʌk', afterMs: 20, fadeMs: 35 }, 'ch~p'), 'from the start of “chuck”');
async function shortGlide(c, before, after) {
  const x = await say(c, 0.9);
  const fr = analyze(x);
  const n = nucleus(fr);
  return finish(x.slice(Math.max(0, fr[n].at - ms(before)), fr[n].at + ms(after)), { inMs: 20, outMs: 50 });
}
add('w', 'short-web', () => shortGlide('wˈɛb', 80, 40), 'from “web”, without the long oo before it');
add('w', 'short-won', () => shortGlide('wˈʌn', 80, 45), 'from “won”, without the long oo before it');
add('kw', 'kwuh', recipe('kw', { carrier: 'kwˈʌk', afterMs: 55, fadeMs: 55 }), 'kw with a little “uh”');
add('kw', 'kwuh-less', recipe('kw', { carrier: 'kwˈʌk', afterMs: 35, fadeMs: 45 }), 'kw with less “uh”');
add('y', 'yes-slow', recipe('y', { carrier: 'jˈɛs', speed: 0.8, afterMs: 90, fadeMs: 110 }), 'from “yes” said slower');

// ---------- long vowels and R vowels: said slowly, not stretched, nothing in front
for (const [s, bare, words] of [
  ['ay', 'ˈA.', [['dˈA.', 'day']]], ['ee', 'ˈi.', [['sˈi.', 'see']]], ['eye', 'ˈI.', [['mˈI.', 'my']]], ['oh', 'ˈO.', [['nˈO.', 'no']]],
  ['oo', 'ˈu.', [['mˈun.', 'moon'], ['ʃˈu.', 'shoe']]], ['you', 'jˈu.', []], ['ar', 'ˈɑɹ.', [['kˈɑɹ.', 'car']]], ['or', 'ˈɔɹ.', [['dˈɔɹ.', 'door']]], ['er', 'ˈɜɹ.', [['bˈɜɹd.', 'bird']]]
]) {
  add(s, 'slow-bare', async () => finish(settledVowel(await say(bare, 0.75)), { outMs: 110 }), 'said on its own, slowly');
  for (const [c, w] of words) add(s, `slow-${w}`, async () => finish(settledVowel(await say(c, 0.75), { skipOnset: true }), { outMs: 110 }), `the vowel of “${w}” said slowly`);
}

// ---------- blends: the second sound held, no vowel after
for (const [b, carrier] of [['bl', 'blˈæk'], ['br', 'bɹˈʌʃ'], ['cl', 'klˈʌb'], ['cr', 'kɹˈʌm'], ['dr', 'dɹˈʌm'], ['fl', 'flˈæɡ'], ['fr', 'fɹˈʌnt'], ['gl', 'ɡlˈʌv'], ['gr', 'ɡɹˈʌb'],
  ['pl', 'plˈʌm'], ['pr', 'pɹˈɪnt'], ['tr', 'tɹˈʌk'], ['tw', 'twˈɪn'], ['sl', 'slˈʌɡ'], ['sm', 'smˈʌɡ'], ['sn', 'snˈʌɡ'], ['sw', 'swˈɪm']]) {
  add(b, 'held-300', recipe(b, { carrier, afterMs: 160, holdSecond: 300, noVowel: true }), 'the second sound held, no “uh”');
  add(b, 'held-450', recipe(b, { carrier, afterMs: 160, holdSecond: 450, noVowel: true }), 'the second sound held longer');
}
const S = ms => ({ sound: 's', tune: { carrier: 'jˈɛs', holdMs: ms } });
add('sp', 'parts', recipe('sp', { parts: [S(350), { sound: 'p', tune: { carrier: 'pˈʌp', afterMs: 15, fadeMs: 25 } }] }), 'a long s, then p');
add('st', 'parts', recipe('st', { parts: [S(200), { sound: 't', tune: { carrier: 'tˈʌb', afterMs: 25, fadeMs: 30 } }] }), 'a short s, then t');
add('sk', 'parts', recipe('sk', { parts: [S(170), { sound: 'k', tune: { carrier: 'kˈʌp', afterMs: 25, fadeMs: 50 } }] }), 'a short s, then k');

const log = {};
for (const t of takes) {
  try {
    const samples = await t.make();
    writeFileSync(join(outDir, `${t.sound}--${t.take}.wav`), wav(samples));
    log[`${t.sound}--${t.take}`] = { ok: true, label: t.label, ms: Math.round((samples.length / 24000) * 1000) };
  } catch (e) {
    log[`${t.sound}--${t.take}`] = { ok: false, label: t.label, error: e.message };
  }
  process.stdout.write(log[`${t.sound}--${t.take}`].ok ? '.' : 'x');
}
writeFileSync(join(outDir, '_log.json'), JSON.stringify(log, null, 1));
console.log(`\n${Object.values(log).filter(l => l.ok).length}/${takes.length} rendered`);
process.exit(0);
