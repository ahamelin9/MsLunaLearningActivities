// Audit prototype: render several takes of each phonics sound with the app's
// own recipes (scripts/voice/phonemes.mjs), so they can be scored and heard.
//   node proto.mjs <variants.json> <outDir>
// variants.json: [{ id: 'take name', sound: 'b', tune: {...}, recipe?: 'z' }]
// `recipe` borrows another sound's recipe (a clear /l/ held like a buzz).
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { KokoroTTS } from 'kokoro-js';
import { SOUNDS, renderSound } from '../../../../scripts/voice/phonemes.mjs';

const [variantsPath, outDir] = process.argv.slice(2);
const variants = JSON.parse(readFileSync(variantsPath, 'utf8'));
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

const log = {};
for (const v of variants) {
  try {
    let id = v.sound;
    if (v.recipe) {
      id = `${v.sound}~${v.recipe}`;
      SOUNDS[id] = { ...SOUNDS[v.recipe], carriers: SOUNDS[v.recipe].carriers };
    }
    const made = await renderSound(id, say, v.tune ?? {});
    writeFileSync(join(outDir, `${v.id}.wav`), wav(made.samples));
    log[v.id] = { ok: true, carrier: made.carrier, ms: Math.round((made.samples.length / 24000) * 1000) };
  } catch (e) {
    log[v.id] = { ok: false, error: e.message };
  }
  process.stdout.write(log[v.id].ok ? '.' : 'x');
}
writeFileSync(join(outDir, '_log.json'), JSON.stringify(log, null, 1));
console.log(`\n${Object.values(log).filter(l => l.ok).length}/${variants.length} rendered`);
process.exit(0);
