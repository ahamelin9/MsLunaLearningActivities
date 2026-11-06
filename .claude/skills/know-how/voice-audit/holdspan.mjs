// Holds one aligned stretch of Luna's word with PSOLA and a natural wobble.
//   node holdspan.mjs <in.wav> <t0> <t1> <holdMs> <out.wav>
import { readFileSync, writeFileSync } from 'node:fs';
import { psola, breathe, normalize, fadeIn, fadeOut, ms } from '../../../../scripts/voice/dsp.mjs';
const [inp, t0, t1, hold, out] = process.argv.slice(2);
const b = readFileSync(inp); const n = (b.length - 44) / 2;
const x = Float32Array.from({ length: n }, (_, i) => b.readInt16LE(44 + i * 2) / 32768);
const seg = x.slice(Math.round(Number(t0) * 24000), Math.round(Number(t1) * 24000));
let y = psola(seg, Number(hold), { seed: 5, pitch: 'follow', human: true, walk: 'pingpong' });
y = breathe(y, seg, { db: -30, seed: 5 });
y = normalize(fadeOut(fadeIn(y, ms(35)), ms(120)), { targetDb: -20 });
const o = Buffer.alloc(44 + y.length * 2);
o.write('RIFF', 0); o.writeUInt32LE(36 + y.length * 2, 4); o.write('WAVE', 8); o.write('fmt ', 12); o.writeUInt32LE(16, 16); o.writeUInt16LE(1, 20); o.writeUInt16LE(1, 22);
o.writeUInt32LE(24000, 24); o.writeUInt32LE(48000, 28); o.writeUInt16LE(2, 32); o.writeUInt16LE(16, 34); o.write('data', 36); o.writeUInt32LE(y.length * 2, 40);
for (let i = 0; i < y.length; i += 1) o.writeInt16LE(Math.max(-32768, Math.min(32767, Math.round(y[i] * 32767))), 44 + i * 2);
writeFileSync(out, o);
console.log(out, Math.round(y.length / 24), 'ms from', Math.round((Number(t1) - Number(t0)) * 1000), 'ms');
