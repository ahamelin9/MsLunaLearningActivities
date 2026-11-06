// Adds the voice-blend listening test to the Sound Check page's Research tab:
// two of Luna's lines and six short-vowel words, each in Luna's voice today
// and in blends with a voice whose short vowels stay apart (blend-render.mjs).
//   node pack5.mjs <scratch>
// Reads page/audio4.json and research-meta.json (pack4.mjs), blend3/src/*.wav;
// writes page/audio5.json and research-meta.json, and the page's RESEARCH data.
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const [S] = process.argv.slice(2);
const audio = JSON.parse(readFileSync(join(S, 'page/audio4.json'), 'utf8'));
const groups = JSON.parse(readFileSync(join(S, 'research-meta.json'), 'utf8')).filter(g => !g.third);
const wav = f => 'WAV:' + readFileSync(join(S, 'blend3/src', `${f}.wav`)).toString('base64');

const g = { third: true, title: 'Luna’s short vowels: a little of another voice?', how: 'Said alone, Luna’s short i drifts toward e (“chick” heard as “check”) and her short e toward a (“bed” as “bad”). It’s her voice’s own habit: other Kokoro voices keep the vowels apart, and a blend of Luna with one of them moves her vowels back. Kore is the voice whose short i is right; Bella’s are the most spread out. The question is whether a blend still sounds like Luna. Pick the clearest one that does; None if only today’s sounds like her.', cards: [] };
const MIX = [['luna', 'Luna today'], ['k30', 'Luna 70%, Kore 30%'], ['k50', 'Luna and Kore, half each'], ['b30', 'Luna 70%, Bella 30%']];
const small = { luna: 'Whisper understood 355 of the app’s 450 words', k30: 'Whisper: 388 of 450 words; short i 670 Hz (real 483, Luna 760)', k50: 'short i 600 Hz, short e 732 (real 731)', b30: 'short i barely moves' };
const C = [['l1', '“Miss Luna hopped inside her shiny silver rocket ship.”', 'does it still sound like Luna?'], ['l11', '“A baby bird had fallen out of its nest.”', 'does it still sound like Luna?'],
  ['bed', 'bed', 'should be bed, not bad'], ['net', 'net', 'not gnat'], ['chick', 'chick', 'not check'], ['pin', 'pin', 'not pen'], ['six', 'six', 'with a clear i'], ['book', 'book', 'the oo of book']];
for (const [id, title, sub] of C) {
  const takes = MIX.map(([m, label]) => ({ take: m, label, small: small[m], data: wav(`${m}-${id}`) }));
  for (const t of takes) audio[`rxb:${id}:${t.take}`] = t.data;
  g.cards.push({ item: `rx:rxb:${id}`, prefix: 'rxb', id, title, sub, takes: takes.map(({ take, label, small: sm }) => ({ take, label, small: sm })) });
}
groups.push(g);

writeFileSync(join(S, 'page/audio5.json'), JSON.stringify(audio));
writeFileSync(join(S, 'research-meta.json'), JSON.stringify(groups));
const page = join(S, 'page/sound-check.html');
let html = readFileSync(page, 'utf8');
const at = html.indexOf('const RESEARCH = ') + 'const RESEARCH = '.length;
let depth = 0, end = at, inStr = false;
for (; end < html.length; end += 1) {
  const c = html[end];
  if (inStr) { if (c === '\\') end += 1; else if (c === '"') inStr = false; continue; }
  if (c === '"') inStr = true; else if (c === '[') depth += 1; else if (c === ']') { depth -= 1; if (!depth) { end += 1; break; } }
}
html = html.slice(0, at) + JSON.stringify(groups).replace(/</g, '\\u003c') + html.slice(end);
writeFileSync(page, html);
console.log(groups.map(x => `${x.title}: ${x.cards.length}`).join('\n'), '\n', (Object.values(audio).reduce((a, b) => a + b.length, 0) / 1048576).toFixed(1), 'MB');
