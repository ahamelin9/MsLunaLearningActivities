// Packs round 2 of the Sound Check: every card's takes, with your round 1 pick as the reference.
//   node pack2.mjs <scratch> <repo>
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { createRequire } from 'node:module';

const [S, repo] = process.argv.slice(2);
const ff = createRequire(join(repo, 'package.json'))('ffmpeg-static');
const manifest = JSON.parse(readFileSync(join(repo, 'public/voice/af_heart/manifest.json'), 'utf8'));
const keyOf = JSON.parse(readFileSync(join(S, 'key-of-sound.json'), 'utf8'));
const log2 = JSON.parse(readFileSync(join(S, 'round2/_log.json'), 'utf8'));
const scored = JSON.parse(readFileSync(join(S, 'scoredR2.json'), 'utf8'));
const picks = JSON.parse(readFileSync(join(S, 'picks-decoded.json'), 'utf8'));
const tmp = join(S, 'enc-tmp.m4a');
const enc = wav => { execFileSync(ff, ['-nostdin', '-v', 'error', '-y', '-i', wav, '-ac', '1', '-ar', '24000', '-c:a', 'aac', '-b:a', '48k', '-movflags', '+faststart', tmp]); return readFileSync(tmp); };
const prod = key => readFileSync(join(repo, 'public/voice/af_heart', manifest.clips[key]));
const audio = {};
const put = (id, buf) => { audio[id] = buf.toString('base64'); };

// your round 1 reference for each sound: the take you picked, or the one your note named as closest
const REF = { k: ['proto', 'k--cup20', 'Your round 1 pick (from “cup”, least vowel)'], t: ['proto', 't--tub15', 'Round 1 “tub”, the one you liked'],
  z: ['proto', 'z--noise3', 'Your round 1 pick (more hiss)'], ay: ['proto', 'ay--dA', 'Your round 1 pick (from “day”)'],
  sk: ['proto', 'sk--parts', 'Your round 1 pick'], st: ['proto', 'st--parts', 'Your round 1 pick'] };
const SETTLED = new Set(['a', 'e', 'i', 'o', 'u', 'ks']);
const order = ['f', 'th', 's', 'sh', 'h', 'v', 'z', 'dh', 'm', 'n', 'ng', 'l', 'r', 'b', 'd', 'g', 't', 'k', 'p', 'j', 'ch', 'w', 'kw', 'y',
  'ay', 'ee', 'eye', 'oh', 'oo', 'you', 'ar', 'or', 'er', 'bl', 'br', 'cl', 'cr', 'dr', 'fl', 'fr', 'gl', 'gr', 'pl', 'pr', 'tr', 'tw', 'sl', 'sm', 'sn', 'sw', 'sp', 'st', 'sk'];
const cards = [];
for (const s of order) {
  if (SETTLED.has(s)) continue;
  const takes = [];
  const r = REF[s];
  if (r) { put(`s2:${s}:ref`, enc(join(S, r[0], `${r[1]}.wav`))); takes.push({ take: 'ref', label: r[2], small: '' }); }
  else { put(`s2:${s}:ref`, prod(`sound|${keyOf[s].replace('_', '+')}|normal`)); takes.push({ take: 'ref', label: 'Today’s (round 1)', small: '' }); }
  for (const [id, l] of Object.entries(log2)) {
    if (!l.ok || !id.startsWith(`${s}--`)) continue;
    const take = id.slice(s.length + 2);
    put(`s2:${s}:${take}`, enc(join(S, 'round2', `${id}.wav`)));
    takes.push({ take, label: l.label, small: `${l.ms} ms`, m: scored[s]?.[take] ?? null });
  }
  if (s === 'ch' && existsSync(join(S, 'proto2', 'ch--itch.wav'))) { put('s2:ch:itch', enc(join(S, 'proto2', 'ch--itch.wav'))); takes.push({ take: 'itch', label: 'the end of “itch”', small: '' }); }
  cards.push({ item: `s2:${s}`, sound: s, note: picks[`s:${s}`]?.note ?? '', takes });
}

// names and words: today, today trimmed, and slower with a full stop (trimmed)
const nameCards = [];
for (const n of ['B', 'CH', 'E', 'N', 'P']) {
  put(`n2:${n}:today`, prod(`name|${n}|normal`));
  const takes = [{ take: 'today', label: 'Today’s', small: '' }];
  for (const [v, label] of [['today-trim', 'Today’s, edges trimmed'], ['espeak85-trim', 'Slower, ended with a full stop'], ['misaki85-trim', 'Slower, full stop, misaki spelling']]) {
    put(`n2:${n}:${v}`, enc(join(S, 'wavT', `n:${n}:${v}.wav`)));
    takes.push({ take: v, label, small: '' });
  }
  nameCards.push({ item: `n2:${n}`, name: n, note: picks[`n:${n}`]?.note ?? '', takes });
}
const wordCards = [];
for (const w of ['cup', 'pup', 'hop', 'hopped', 'popped', 'cook', 'peach', 'jump', 'bed', 'ball', 'moon', 'green', 'hen', 'leaf', 'eat', 'key', 'her', 'sheep', 'stops']) {
  put(`w2:${w}:today`, prod(`word|${w}|normal`));
  const takes = [{ take: 'today', label: 'Today’s', small: '' }];
  for (const [v, label] of [['today-trim', 'Today’s, edges trimmed'], ['dot85-trim', 'A little slower, full stop, trimmed'], ['dot80-trim', 'Slower, full stop, trimmed']]) {
    put(`w2:${w}:${v}`, enc(join(S, 'wavT', `w:${w}:${v}.wav`)));
    takes.push({ take: v, label, small: '' });
  }
  const p = picks[`w:${w}`] ?? picks[`e:${w}`];
  wordCards.push({ item: `w2:${w}`, word: w, note: p?.note ?? '', takes });
}
writeFileSync(join(S, 'page', 'audio2.json'), JSON.stringify(audio));
writeFileSync(join(S, 'pack2-meta.json'), JSON.stringify({ cards, nameCards, wordCards }));
console.log(Object.keys(audio).length, 'clips,', (Object.values(audio).reduce((a, b) => a + b.length, 0) / 1048576).toFixed(2), 'MB;', cards.length, 'sounds,', nameCards.length, 'names,', wordCards.length, 'words');
