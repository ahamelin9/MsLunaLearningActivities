// Builds a letter-sound take from measured pieces of one of Luna's words:
// each piece is copied as it is, held with PSOLA (a voiced sound, with the
// natural wobble), or held with long overlapping grains (a hiss). Pieces are
// joined with short crossfades, so a held W can run into its own vowel.
//   node pieces.mjs <spec.json> <outDir>        (run from the repo root)
// spec.json: [{ id, src, pieces: [{ t0, t1, how: 'raw'|'psola'|'grain', hold?, db? }],
//               fadeInMs?, fadeOutMs?, lowpassHz? }]
// `db` sets a piece's loudness (dBFS over its sounding part) before the join,
// so a blend's second sound can be louder than its first (SM: "needs more mmm").
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join as pjoin } from 'node:path';
import { psola, breathe, normalize, fadeIn, fadeOut, join, ms, rng, SAMPLE_RATE as SR } from '../../../../scripts/voice/dsp.mjs';

const [specPath, outDir] = process.argv.slice(2);
mkdirSync(outDir, { recursive: true });

function readWav(p) {
  const b = readFileSync(p); const n = (b.length - 44) / 2;
  return Float32Array.from({ length: n }, (_, i) => b.readInt16LE(44 + i * 2) / 32768);
}
function writeWav(p, y) {
  const o = Buffer.alloc(44 + y.length * 2);
  o.write('RIFF', 0); o.writeUInt32LE(36 + y.length * 2, 4); o.write('WAVE', 8); o.write('fmt ', 12); o.writeUInt32LE(16, 16); o.writeUInt16LE(1, 20); o.writeUInt16LE(1, 22);
  o.writeUInt32LE(SR, 24); o.writeUInt32LE(SR * 2, 28); o.writeUInt16LE(2, 32); o.writeUInt16LE(16, 34); o.write('data', 36); o.writeUInt32LE(y.length * 2, 40);
  for (let i = 0; i < y.length; i += 1) o.writeInt16LE(Math.max(-32768, Math.min(32767, Math.round(y[i] * 32767))), 44 + i * 2);
  writeFileSync(p, o);
}

// a hiss held from Hann grains of itself, 120 ms long at a quarter hop, at random spots
function grainHold(seg, lenMs, seed = 3) {
  const rand = rng(seed); const N = Math.min(ms(120), seg.length >> 1); const hop = N >> 2; const L = ms(lenMs);
  const out = new Float32Array(L + N); const norm = new Float32Array(L + N);
  for (let at = 0; at < L; at += hop) {
    const s = Math.floor(rand() * (seg.length - N));
    for (let i = 0; i < N; i += 1) { const w = 0.5 - 0.5 * Math.cos((2 * Math.PI * i) / N); out[at + i] += seg[s + i] * w; norm[at + i] += w * w; }
  }
  return out.slice(0, L).map((v, i) => v / Math.sqrt(Math.max(norm[i], 1e-3)));
}

function level(x, dbfs) {
  let p = 0; for (const v of x) p = Math.max(p, Math.abs(v));
  let s = 0, n = 0; for (const v of x) if (Math.abs(v) >= p * 0.05) { s += v * v; n += 1; }
  const g = 10 ** (dbfs / 20) / Math.sqrt(s / Math.max(1, n));
  return x.map(v => v * g);
}

// RBJ second-order low-pass, run forward and back so it doesn't shift the timing
function lowpass(x, fc) {
  const w = (2 * Math.PI * fc) / SR, a = Math.sin(w) / Math.SQRT2, c = Math.cos(w), a0 = 1 + a;
  const b0 = (1 - c) / 2 / a0, b1 = (1 - c) / a0, b2 = b0, a1 = (-2 * c) / a0, a2 = (1 - a) / a0;
  const pass = s => { const y = new Float32Array(s.length); let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
    for (let i = 0; i < s.length; i += 1) { const v = b0 * s[i] + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2; x2 = x1; x1 = s[i]; y2 = y1; y1 = v; y[i] = v; } return y; };
  return pass(pass(x).reverse()).reverse();
}

for (const spec of JSON.parse(readFileSync(specPath, 'utf8'))) {
  try { build(spec); } catch (e) { console.log(spec.id, 'skipped:', e.message); }
}

function build(spec) {
  const x = readWav(spec.src);
  const parts = spec.pieces.map((p, k) => {
    const seg = x.slice(Math.round(p.t0 * SR), Math.round(p.t1 * SR));
    let y = seg;
    if (p.how === 'psola') y = breathe(psola(seg, p.hold, { seed: 5 + k, pitch: 'follow', human: true, walk: 'pingpong' }), seg, { db: -30, seed: 5 + k });
    if (p.how === 'grain') y = grainHold(seg, p.hold, 3 + k);
    return p.db === undefined ? Float32Array.from(y) : level(y, p.db);
  });
  let y = join(parts, 10);
  if (spec.lowpassHz) y = lowpass(y, spec.lowpassHz);
  y = normalize(fadeOut(fadeIn(y, ms(spec.fadeInMs ?? 25)), ms(spec.fadeOutMs ?? 90)), { targetDb: -20 });
  writeWav(pjoin(outDir, `${spec.id}.wav`), y);
  console.log(spec.id, Math.round(y.length / 24), 'ms');
}
