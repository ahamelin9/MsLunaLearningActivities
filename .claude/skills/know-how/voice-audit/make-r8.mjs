// Round 8's cards (VOX-10): each sound or letter name repitch.py moved to
// Luna's pitch, today's against version A (converted again, raised) and B
// (today's, pitch moved by PSOLA), and C where there is one (Z, cut from the
// word). One card per sound: keys that share it (AI, AY and A alt) share a
// card, so apply-picks.mjs copies the pick to all of them. Run from the repo root:
//   node .claude/skills/know-how/voice-audit/make-r8.mjs <repitch outdir> <out round8.json>
import { readFileSync, readdirSync, existsSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { KEY_TO_SOUND } from '../../../../scripts/voice/phonemes.mjs';

const [dir, outPath] = process.argv.slice(2);
const has = (v, k) => existsSync(join(dir, v, `${k}.wav`));
const keys = new Set(['A', 'B', 'C'].flatMap(v => existsSync(join(dir, v)) ? readdirSync(join(dir, v)) : [])
  .filter(f => f.endsWith('.wav')).map(f => f.slice(0, -4)));

// the words each sound is heard in (round 5's cards, and round 4's eight)
const words = { b: 'bug', d: 'duck', g: 'gum', w: 'web', ng: 'ring', th: 'thin', dh: 'this', oo: 'moon' };
for (const c of JSON.parse(readFileSync('.voice-tmp/vox8/page/r5-cards.json', 'utf8'))) words[c.sid] = c.word;
// what each letter name says (the recording page's cards)
const said = {};
for (const m of readFileSync('src/dev/RecordPage/sounds.ts', 'utf8').matchAll(/n\('([A-Z]+)', '([^']+)'/g)) said[m[1]] = m[2];

const ORDER = ['short', 'long', 'consonant', 'blend', 'n1', 'n2'];
const groupOf = (kind, key, sid) => {
  if (kind === 'name') return key.length > 1 || key > 'M' ? 'n2' : 'n1';
  if (/^(a|e|i|o|u)$/.test(sid)) return 'short';
  if (/^(ay|ee|eye|oh|you|ar|or|er|oo)$/.test(sid)) return 'long';
  return sid.length === 2 && !['ng', 'th', 'dh', 'sh', 'ch', 'ks', 'kw'].includes(sid) ? 'blend' : 'consonant';
};
const cards = new Map();
for (const file of [...keys].sort()) {
  const [kind, raw] = file.split('__');
  const key = raw.replace(/_alt$/, '+alt');
  const sid = kind === 'name' ? `name-${raw}` : KEY_TO_SOUND[key];
  if (!sid) throw new Error(`no sound for ${file}`);
  if (cards.has(sid)) { cards.get(sid).keys.push(raw); continue; }
  const takes = [{ id: 'today', label: 'In the app today', small: 'what Luna says now' }];
  if (has('A', file)) takes.push({ id: 'a', label: 'At her pitch, converted again', small: 'your take raised, then as Luna, and evened', path: join(dir, 'A', `${file}.wav`) });
  if (has('B', file)) takes.push({ id: 'b', label: "At her pitch, today's clip", small: 'the same clip, only its pitch moved', path: join(dir, 'B', `${file}.wav`) });
  if (has('C', file)) takes.push({ id: 'c', label: 'Cut from the word, at her pitch', small: `the start of "${words[sid] ?? ''}" sounded out, as Luna`, path: join(dir, 'C', `${file}.wav`) });
  cards.set(sid, {
    sid, key: raw, kind, keys: [raw], word: kind === 'name' ? said[raw] : words[sid] ?? '',
    group: groupOf(kind, raw, sid),
    title: kind === 'name' ? raw : '',
    sub: kind === 'name' ? `its name, “${said[raw] ?? ''}”` : '',
    takes
  });
}
const list = [...cards.values()].sort((a, b) => ORDER.indexOf(a.group) - ORDER.indexOf(b.group) || a.sid.localeCompare(b.sid));
// a card whose only new version didn't move (E's B found no steady pitch) is left out by repitch.py's rows;
// here every card has at least one new version
for (const c of list) if (c.takes.length < 2) throw new Error(`${c.sid}: nothing new`);
writeFileSync(outPath, JSON.stringify(list, null, 1));
const count = g => list.filter(c => c.group === g).length;
console.log(`${list.length} cards:`, ORDER.map(g => `${g} ${count(g)}`).join(', '));
