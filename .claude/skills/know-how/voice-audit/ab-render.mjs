// A/B renderer for the audit: the same model and voice, fed either the text
// (kokoro-js's own espeak path, as the app does today) or phonemes we give it.
//   node --input-type=module -e "$(cat ab-render.mjs)" <jobs.json> <outDir>
// jobs.json: [{ id, text?, ps?, speed? }]
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { KokoroTTS } from 'kokoro-js';

const [jobsPath, outDir] = process.argv.slice(1);
const jobs = JSON.parse(readFileSync(jobsPath, 'utf8'));
mkdirSync(outDir, { recursive: true });

const tts = await KokoroTTS.from_pretrained('onnx-community/Kokoro-82M-v1.0-ONNX', { dtype: 'fp32', device: 'cpu' });

function wav(samples, sr = 24000) {
  const b = Buffer.alloc(44 + samples.length * 2);
  b.write('RIFF', 0); b.writeUInt32LE(36 + samples.length * 2, 4); b.write('WAVE', 8);
  b.write('fmt ', 12); b.writeUInt32LE(16, 16); b.writeUInt16LE(1, 20); b.writeUInt16LE(1, 22);
  b.writeUInt32LE(sr, 24); b.writeUInt32LE(sr * 2, 28); b.writeUInt16LE(2, 32); b.writeUInt16LE(16, 34);
  b.write('data', 36); b.writeUInt32LE(samples.length * 2, 40);
  for (let i = 0; i < samples.length; i += 1) b.writeInt16LE(Math.max(-32768, Math.min(32767, Math.round(samples[i] * 32767))), 44 + i * 2);
  return b;
}

for (const job of jobs) {
  const voice = job.voice ?? 'af_heart';
  const speed = job.speed ?? 0.95;
  const r = job.ps
    ? await tts.generate_from_ids(tts.tokenizer(job.ps, { truncation: true }).input_ids, { voice, speed })
    : await tts.generate(job.text, { voice, speed });
  writeFileSync(join(outDir, `${job.id}.wav`), wav(r.audio));
  process.stdout.write('.');
}
console.log(`\n${jobs.length} rendered`);
process.exit(0);
