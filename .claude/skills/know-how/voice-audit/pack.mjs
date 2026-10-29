// Packs the audit's clips and notes for the listening page.
//   node pack.mjs <scratch> <repo> <words comma list> <outDir>
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { createRequire } from 'node:module';

const [S, repo, wordList, outDir] = process.argv.slice(2);
const req = createRequire(join(repo, 'package.json'));
const ff = req('ffmpeg-static');
mkdirSync(outDir, { recursive: true });
const manifest = JSON.parse(readFileSync(join(repo, 'public/voice/af_heart/manifest.json'), 'utf8'));
const sources = JSON.parse(readFileSync(join(repo, 'public/voice/af_heart/.sources.json'), 'utf8'));
const prod = key => readFileSync(join(repo, 'public/voice/af_heart', manifest.clips[key]));
const tmp = join(S, 'enc-tmp.m4a');
const enc = wav => {
  execFileSync(ff, ['-nostdin', '-v', 'error', '-y', '-i', wav, '-ac', '1', '-ar', '24000', '-c:a', 'aac', '-b:a', '48k', '-movflags', '+faststart', tmp]);
  return readFileSync(tmp);
};

const audio = {};
const put = (id, buf) => { audio[id] = buf.toString('base64'); };

// ---- phonics sounds: today's clip and the candidate takes
const keyOf = JSON.parse(readFileSync(join(S, 'key-of-sound.json'), 'utf8')); // sound id → a key that plays it
const scored = { ...JSON.parse(readFileSync(join(S, 'scored.json'), 'utf8')) };
for (const [s, takes] of Object.entries(JSON.parse(readFileSync(join(S, 'scored2.json'), 'utf8')))) scored[s] = { ...scored[s], ...takes };
const logs = { ...JSON.parse(readFileSync(join(S, 'proto/_log.json'), 'utf8')), ...JSON.parse(readFileSync(join(S, 'proto2/_log.json'), 'utf8')) };
const sounds = {};
for (const [s, key] of Object.entries(keyOf)) {
  put(`s:${s}:current`, prod(`sound|${key.replace('_', '+')}|normal`));
  sounds[s] = { from: sources[`sound:${s}`] ?? '', takes: [{ take: 'current', from: sources[`sound:${s}`] ?? '', ms: null, m: scored[s]?.current ?? null }] };
}
for (const [id, l] of Object.entries(logs)) {
  if (!l.ok || id.includes('~')) continue;
  const [s, take] = id.split('--');
  const dir = existsSync(join(S, 'proto', `${id}.wav`)) ? 'proto' : 'proto2';
  put(`s:${s}:${take}`, enc(join(S, dir, `${id}.wav`)));
  sounds[s].takes.push({ take, from: l.carrier, ms: l.ms, m: scored[s]?.[take] ?? null });
}

// ---- letter names, words and lines: today's clip and the misaki one
const names = Object.keys(manifest.clips).filter(k => k.startsWith('name|') && k.endsWith('|normal')).map(k => k.split('|')[1]);
for (const n of names) {
  put(`n:${n}:A`, prod(`name|${n}|normal`));
  put(`n:${n}:B`, enc(join(S, 'wavB', `name:${n}.wav`)));
}
const words = wordList.split(',');
for (const w of words) {
  put(`w:${w}:A`, prod(`word|${w}|normal`));
  put(`w:${w}:B`, enc(join(S, 'wavB', `word:${w}.wav`)));
}
const endings = (process.argv[6] || '').split(',').filter(Boolean);
for (const w of endings) {
  put(`e:${w}:A`, prod(`word|${w}|normal`));
  put(`e:${w}:B`, enc(join(S, 'wavE', `dot:${w}.wav`)));
}
const lines = JSON.parse(readFileSync(join(S, 'lines.json'), 'utf8'));
for (const [id, key] of lines) {
  put(`t:${id}:A`, prod(`text|${key}|normal`));
  put(`t:${id}:B`, enc(join(S, 'wavB', `text:${id}.wav`)));
}

writeFileSync(join(outDir, 'audio.json'), JSON.stringify(audio));
writeFileSync(join(S, 'pack-meta.json'), JSON.stringify({ sounds, names, words, endings, lines: lines.map(([id, key]) => ({ id, text: key })) }, null, 1));
const bytes = Object.values(audio).reduce((a, b) => a + b.length, 0);
console.log(Object.keys(audio).length, 'clips,', (bytes / 1024 / 1024).toFixed(2), 'MB of base64');
