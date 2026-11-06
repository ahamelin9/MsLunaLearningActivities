// Adds the research run's second pass to the Sound Check page's Research tab:
// candidates for the sounds round 2 left with no take Alex liked (W, Y, J, NG,
// V, Z, voiced TH, SP, SM), each labelled with what it measures.
//   node pack4.mjs <scratch> <repo>
// Reads page/audio3.json and research-meta.json (from pack3.mjs), and
// gap/measured*.json (heldmeasure.py), gap/scored*.json (score.py);
// writes page/audio4.json and research-meta.json, and puts the groups into
// page/sound-check.html in place of the old ones.
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const [S, repo] = process.argv.slice(2);
const manifest = JSON.parse(readFileSync(join(repo, 'public/voice/af_heart/manifest.json'), 'utf8'));
const keyOf = JSON.parse(readFileSync(join(S, 'key-of-sound.json'), 'utf8'));
const audio = JSON.parse(readFileSync(join(S, 'page/audio3.json'), 'utf8'));
const groups = JSON.parse(readFileSync(join(S, 'research-meta.json'), 'utf8')).filter(g => !g.second);
const today = s => readFileSync(join(repo, 'public/voice/af_heart', manifest.clips[`sound|${keyOf[s].replace('_', '+')}|normal`])).toString('base64');
const wav = f => 'WAV:' + readFileSync(join(S, 'gap/takes', `${f}.wav`)).toString('base64');
const meas = Object.fromEntries(['measured.json', 'measured2.json'].flatMap(f => JSON.parse(readFileSync(join(S, 'gap', f), 'utf8'))).map(r => [`${r.sound}|${r.take}`, r]));
const heard = Object.fromEntries(['scored.json', 'scored2.json'].flatMap(f => Object.entries(JSON.parse(readFileSync(join(S, 'gap', f), 'utf8'))).flatMap(([s, takes]) => Object.entries(takes).map(([t, r]) => [`${s}|${t}`, r]))));

// what each sound is checked against: real women's speech (LibriSpeech), 1-7.8 kHz
const REAL = { v: 2039, z: 4421, dh: 2178 };
const small = (s, take) => {
  const m = meas[`${s}|${take}`]; const h = heard[`${s}|${take}`]; const bits = [];
  if (m) bits.push(`${m.ms} ms`);
  if (REAL[s] && m?.centroid) bits.push(`brightness ${m.centroid} Hz (real: ${REAL[s]})`);
  const NAME = { w: 'W', y: 'Y', j: 'J', ng: 'NG', sp: 'S + P' };
  if (h && NAME[s]) bits.push(`machine ear: ${Math.round(h.target * 100)}% sure it’s ${NAME[s]}`);
  return bits.join(' · ');
};

const g = { second: true, title: 'Round 3 candidates: the sounds still without a good take', how: 'Round 2 left these with “None are right”. Each is built from the exact stretch of a word where Luna says the sound (found by the aligner), checked against real American speech, with today’s first. For V, Z and voiced TH the number to watch is brightness: today’s are far too bright, which is the “TV static”. W, Y, J, NG and SP have the machine ear’s verdict, which is reliable for consonants. SP and SM are joined from the S, P and M you already picked.', cards: [] };
const C = [
  ['w', '/w/', 'quick, no long “ooo” in front', [['w-wet-quick', 'from “wet”, quick'], ['w-we-quick', 'from “we”, quick'], ['w-wet-held', 'from “wet”, the w held a little'], ['w-we-held', 'from “we”, the w held a little']]],
  ['y', '/y/', 'the start of “yes”, slower', [['y-yes-slow', '“yes” said slowly, cut after the y'], ['y-yum-held', 'from “yum”, the y held'], ['y-yes-held', 'from “yes”, the y held']]],
  ['j', '/j/', 'the whole J, not cut off', [['j-jet-whole', 'from “jet”, the whole J'], ['j-jump-whole', 'from “jump”, the whole J'], ['j-jam-whole', 'from “jam”, the whole J']]],
  ['ng', '/ng/', 'not just “nnn”', [['ng-king-ing', 'from “king”, with the end of the i in front'], ['ng-song-ing', 'from “song”, with the end of the o in front'], ['ng-king-held', 'from “king”, the ng alone, held'], ['ng-sing-held', 'from “sing”, the ng alone, held']]],
  ['v', '/v/', 'a buzzy V, not static', [['v-van-held', 'from “van”, held'], ['v-van-soft', 'from “van”, held, softer'], ['v-love-soft', 'from “love”, held, softer']]],
  ['z', '/z/', 'a buzzy Z, not static', [['z-mix-lp7k-6', 'a held Z with her S hiss under it'], ['z-mix-lp7k-12', 'the same, less hiss'], ['z-zoo-held', 'from “zoo”, held (no added hiss)']]],
  ['dh', '/th/ voiced', 'TH as in this', [['dh-this-held', 'from “this”, held'], ['dh-this-soft', 'from “this”, held, softer'], ['dh-mother-soft', 'from “mother”, held, softer']]],
  ['sp', 'SP', 'sss-p, no “puh”', [['sp-picked-gap25', 'your S, a short gap, your P'], ['sp-picked-gap50', 'your S, a longer gap, your P'], ['sp-spin', 'cut from “spin” (the P there has no puff)']]],
  ['sm', 'SM', 'sss-mmm, more M', [['sm-picked-m+3', 'your S, then your M, louder'], ['sm-picked-m+6', 'your S, then your M, louder still'], ['sm-smile-m+6', 'from “smile”, the M held, louder']]]
];
for (const [s, title, sub, takes] of C) {
  const all = [{ take: 'today', label: 'Today’s (in the app)', small: small(s, 'today'), data: today(s) }, ...takes.map(([t, l]) => ({ take: t, label: l, small: small(s, t), data: wav(t) }))];
  for (const t of all) audio[`rx3:${s}:${t.take}`] = t.data;
  g.cards.push({ item: `rx:rx3:${s}`, prefix: 'rx3', id: s, title, sub, takes: all.map(({ take, label, small: sm }) => ({ take, label, small: sm })) });
}
groups.push(g);

writeFileSync(join(S, 'page/audio4.json'), JSON.stringify(audio));
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
