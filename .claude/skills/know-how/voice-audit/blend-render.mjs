// Renders text in a blend of Kokoro voices, e.g. mostly Luna (af_heart) with a
// little of a voice whose short vowels stay apart. A Kokoro voice is a table of
// 256-number style vectors (one per input length); a blend is their weighted
// average, handed to the model directly, so nothing in node_modules changes.
//   node blend-render.mjs <jobs.json> <outDir>        (run from the repo root)
// jobs.json: [{ id, text, speed?, mix: { af_heart: 0.7, af_bella: 0.3 } }]
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { createRequire } from 'node:module';
import { KokoroTTS } from 'kokoro-js';
import { Tensor } from '@huggingface/transformers';
import { phonemize } from 'phonemizer';

const [jobsPath, outDir] = process.argv.slice(2);
mkdirSync(outDir, { recursive: true });
const voiceDir = join(createRequire(join(process.cwd(), 'package.json')).resolve('kokoro-js'), '../../voices');
const tables = new Map();
const table = name => {
  if (!tables.has(name)) { const b = readFileSync(join(voiceDir, `${name}.bin`)); tables.set(name, new Float32Array(b.buffer, b.byteOffset, b.byteLength / 4)); }
  return tables.get(name);
};
const tts = await KokoroTTS.from_pretrained('onnx-community/Kokoro-82M-v1.0-ONNX', { dtype: 'fp32', device: 'cpu' });

// kokoro-js's own clean-up of espeak's American phonemes, for plain words and short sentences
const toPs = async text => (await phonemize(text, 'en-us')).join(' ').replace(/ʲ/g, 'j').replace(/r/g, 'ɹ').replace(/x/g, 'k').replace(/ɬ/g, 'l').trim();

function wav(samples, sr = 24000) {
  const b = Buffer.alloc(44 + samples.length * 2);
  b.write('RIFF', 0); b.writeUInt32LE(36 + samples.length * 2, 4); b.write('WAVE', 8); b.write('fmt ', 12); b.writeUInt32LE(16, 16); b.writeUInt16LE(1, 20); b.writeUInt16LE(1, 22);
  b.writeUInt32LE(sr, 24); b.writeUInt32LE(sr * 2, 28); b.writeUInt16LE(2, 32); b.writeUInt16LE(16, 34); b.write('data', 36); b.writeUInt32LE(samples.length * 2, 40);
  for (let i = 0; i < samples.length; i += 1) b.writeInt16LE(Math.max(-32768, Math.min(32767, Math.round(samples[i] * 32767))), 44 + i * 2);
  return b;
}

for (const job of JSON.parse(readFileSync(jobsPath, 'utf8'))) {
  const ps = job.ps ?? (await toPs(job.text)) + (job.text.match(/[.!?]$/)?.[0] ?? '');
  const { input_ids } = tts.tokenizer(ps, { truncation: true });
  const at = 256 * Math.min(Math.max(input_ids.dims.at(-1) - 2, 0), 509);
  const style = new Float32Array(256);
  for (const [name, w] of Object.entries(job.mix)) { const t = table(name); for (let i = 0; i < 256; i += 1) style[i] += w * t[at + i]; }
  const { waveform } = await tts.model({ input_ids, style: new Tensor('float32', style, [1, 256]), speed: new Tensor('float32', [job.speed ?? 0.95], [1]) });
  writeFileSync(join(outDir, `${job.id}.wav`), wav(waveform.data));
  process.stdout.write('.');
}
console.log(' done');
