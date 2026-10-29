// Blends whose second sound Kokoro devoices: the first sound, then a held L, R or W.
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { KokoroTTS } from 'kokoro-js';
import { renderSound } from '../../../../scripts/voice/phonemes.mjs';
import { join as joinParts, normalize, fadeOut, fadeIn, ms } from '../../../../scripts/voice/dsp.mjs';
const dir = process.argv[2];
const tts = await KokoroTTS.from_pretrained('onnx-community/Kokoro-82M-v1.0-ONNX', { dtype: 'fp32', device: 'cpu' });
const memo = new Map();
const say = (ps, speed = 1) => { const id = `${ps}@${speed}`; if (!memo.has(id)) memo.set(id, tts.generate_from_ids(tts.tokenizer(ps, { truncation: true }).input_ids, { voice: 'af_heart', speed }).then(r => Float32Array.from(r.audio))); return memo.get(id); };
const readWav = f => { const b = readFileSync(f); const n = (b.length - 44) / 2; return Float32Array.from({ length: n }, (_, i) => b.readInt16LE(44 + i * 2) / 32768); };
function wav(s) { const b = Buffer.alloc(44 + s.length * 2); b.write('RIFF', 0); b.writeUInt32LE(36 + s.length * 2, 4); b.write('WAVE', 8); b.write('fmt ', 12); b.writeUInt32LE(16, 16); b.writeUInt16LE(1, 20); b.writeUInt16LE(1, 22); b.writeUInt32LE(24000, 24); b.writeUInt32LE(48000, 28); b.writeUInt16LE(2, 32); b.writeUInt16LE(16, 34); b.write('data', 36); b.writeUInt32LE(s.length * 2, 40); for (let i = 0; i < s.length; i += 1) b.writeInt16LE(Math.max(-32768, Math.min(32767, Math.round(s[i] * 32767))), 44 + i * 2); return b; }
const second = (file, lenMs) => { const x = readWav(join(dir, file)); return fadeOut(fadeIn(x.slice(0, Math.min(x.length, ms(lenMs))), ms(8)), ms(90)); };
const L = () => second('l--slow-bell.wav', 380), R = () => second('r--tail-fur.wav', 380), W = () => second('w--short-web.wav', 260);
const first = {
  k: () => renderSound('k', say, { carrier: 'kˈʌp', afterMs: 10, fadeMs: 15 }), p: () => renderSound('p', say, { carrier: 'pˈʌp', afterMs: 10, fadeMs: 15, targetDb: -23 }),
  t: () => renderSound('t', say, { carrier: 'tˈʌb', afterMs: 10, fadeMs: 15 }), g: () => renderSound('g', say, { carrier: 'ɡˈʌm', afterMs: 25, fadeMs: 20 }),
  f: () => renderSound('f', say, { carrier: 'kˈʌf', holdMs: 260, targetDb: -22 }), b: () => renderSound('b', say, { carrier: 'bˈʌɡ', afterMs: 25, fadeMs: 20 }),
  d: () => renderSound('d', say, { carrier: 'dˈʌk', afterMs: 25, fadeMs: 20 })
};
const blends = { bl: ['b', L], br: ['b', R], cl: ['k', L], cr: ['k', R], dr: ['d', R], fl: ['f', L], fr: ['f', R], gl: ['g', L], gr: ['g', R], pl: ['p', L], pr: ['p', R], tr: ['t', R], tw: ['t', W] };
const log = JSON.parse(readFileSync(join(dir, '_log.json'), 'utf8'));
for (const [b, [f, sec]] of Object.entries(blends)) {
  const a = (await first[f]()).samples;
  const out = normalize(joinParts([fadeOut(Float32Array.from(a), ms(6)), sec()], 12), { targetDb: -20 });
  writeFileSync(join(dir, `${b}--joined.wav`), wav(out));
  log[`${b}--joined`] = { ok: true, label: `${b[0]} then a held ${b[1] === 'w' ? 'W' : b[1] === 'l' ? 'L' : 'R'} from round 2`, ms: Math.round(out.length / 24) };
  process.stdout.write('.');
}
writeFileSync(join(dir, '_log.json'), JSON.stringify(log, null, 1));
console.log(' joined blends done');
process.exit(0);
