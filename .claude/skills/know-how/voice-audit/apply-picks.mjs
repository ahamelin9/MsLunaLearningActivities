// Copies Alex's Sound Check picks into scripts/voice/recorded/, one file for
// every inventory key that shares the picked sound (K also feeds C and CK); a
// letter name's pick goes in as name__<KEY>.wav. Run from the repo root:
//   node .claude/skills/know-how/voice-audit/apply-picks.mjs <round> <picksDir> <takesDir> <cards.json> [overrides.json] [--dry]
// <round>: r5 or r6, the items' prefix (r5:<sid>, r6:<sid>).
// <picksDir>: the `picks` collection saved with ArtifactData's out_dir, or a
//   folder of { item, choice } JSON files.
// <takesDir>: round 5's convert-takes.py output (`sound__<file>__take<n>--luna.wav`).
// <cards.json>: round 5's r5-cards.json ({ sid, file }), or round 6's
//   round6.json, whose takes carry their own `path`.
// overrides.json: { "<sid>": "<path to a wav>" } for a pick that isn't a take
// on the page (a take raised after he heard it, another card's take). A
// `none` or `today` pick copies nothing and leaves that sound as it is.
import { readFileSync, readdirSync, copyFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { KEY_TO_SOUND } from '../../../../scripts/voice/phonemes.mjs';

const [round, picksDir, takesDir, cardsPath, overridesPath] = process.argv.slice(2).filter(a => !a.startsWith('--'));
const dry = process.argv.includes('--dry');
const cards = JSON.parse(readFileSync(cardsPath, 'utf8'));
const overrides = overridesPath ? JSON.parse(readFileSync(overridesPath, 'utf8')) : {};
const picks = {};
for (const f of readdirSync(picksDir)) {
  const raw = JSON.parse(readFileSync(join(picksDir, f), 'utf8'));
  const p = raw.data ?? raw;
  if (p.item?.startsWith(`${round}:`)) picks[p.item.slice(round.length + 1)] = p;
}
const keysOf = sid => Object.keys(KEY_TO_SOUND).filter(k => KEY_TO_SOUND[k] === sid);
const safe = k => k.replace(/[^A-Za-z0-9]/g, '_');
const out = join('scripts', 'voice', 'recorded');
const rows = [];
for (const card of cards) {
  const { sid } = card;
  const choice = picks[sid]?.choice ?? '(no pick)';
  let src = overrides[sid];
  if (!src && card.takes) src = card.takes.find(t => t.id === choice && t.path)?.path;
  if (!src && card.file) {
    const m = /^(luna|his)(\d)$/.exec(choice);
    if (m) src = join(takesDir, `sound__${card.file}__take${m[2]}--${m[1]}.wav`);
  }
  if (!src) { rows.push(`${sid}\t${choice}\tleft as it is`); continue; }
  if (!existsSync(src)) throw new Error(`${sid}: ${src} is missing`);
  const files = card.kind === 'name' ? [`name__${safe(card.key)}.wav`] : keysOf(sid).map(k => `sound__${safe(k)}.wav`);
  for (const f of files) if (!dry) copyFileSync(src, join(out, f));
  rows.push(`${sid}\t${overrides[sid] ? 'override' : choice}\t→ ${files.join(' ')}`);
}
console.log(rows.join('\n'));
