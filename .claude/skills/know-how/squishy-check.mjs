// Squishy check (PRG-5a): the collection's rules, without a browser.
//
//   node .claude/skills/know-how/squishy-check.mjs
//
// Bundles engine/squishies.ts and checks:
//   - over 1,000 seeded awards, rare and super-rare colours come up within 2
//     points of the set odds (1 in 8, 1 in 40);
//   - every kind's 3 colours are reachable, and nothing else;
//   - a lesson's or game's signature kind comes first, then kinds still to
//     find, so the shelf fills before kinds repeat;
//   - an old save's 18 stickers become 18 different squishies (the count
//     doesn't drop), and a save mixing old and new keeps every one;
//   - kinds found is the count.

import { build } from 'esbuild';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const repo = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const out = mkdtempSync(join(tmpdir(), 'squishy-check-'));
await build({
  entryPoints: [join(repo, 'src/apps/reading/engine/squishies.ts')],
  bundle: true,
  format: 'esm',
  platform: 'node',
  outfile: join(out, 'bundle.mjs'),
  loader: { '.scss': 'empty', '.css': 'empty' },
  alias: { '@': join(repo, 'src') },
  nodePaths: [join(repo, 'node_modules')],
  jsx: 'automatic',
  logLevel: 'error'
});
const S = await import(pathToFileURL(join(out, 'bundle.mjs')).href);
rmSync(out, { recursive: true, force: true });

const results = [];
const ok = (name, pass, detail = '') => { results.push(pass); console.log(`${pass ? '✅' : '❌'} ${name}${detail ? `  (${detail})` : ''}`); };
let seed = 20261019;
const rand = () => ((seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296);

// odds over 1,000 awards (a full shelf, so only the colour roll matters)
const full = S.SQUISHY_KINDS.map(k => S.squishyId(k.kind, k.usual));
const counts = { usual: 0, rare: 0, 'super-rare': 0 };
for (let i = 0; i < 1000; i++) counts[S.nextSquishy(full, undefined, rand).rarity] += 1;
const pct = n => n / 10;
ok('rare about 1 in 8, within 2 points', Math.abs(pct(counts.rare) - 12.5) <= 2, `${pct(counts.rare)}%`);
ok('super rare about 1 in 40, within 2 points', Math.abs(pct(counts['super-rare']) - 2.5) <= 2, `${pct(counts['super-rare'])}%`);

// colours reachable
const seen = new Set();
for (let i = 0; i < 5000; i++) seen.add(S.nextSquishy(full, undefined, rand).id);
const expected = new Set(S.SQUISHY_KINDS.flatMap(k => S.coloursOf(k.kind).map(c => S.squishyId(k.kind, c))));
ok(`every kind's 3 colours come up, and nothing else (${expected.size})`, seen.size === expected.size && [...seen].every(id => expected.has(id)), `${seen.size} seen`);

// signature first, then kinds still to find
const first = S.nextSquishy([], 'moon', rand);
ok('a signature kind comes first', first.kind === 'moon', first.id);
let owned = [first.id];
for (let i = 0; i < S.SQUISHY_KINDS.length - 1; i++) owned.push(S.nextSquishy(owned, 'moon', rand).id);
ok('the shelf fills before a kind repeats', S.kindsFound(owned) === S.SQUISHY_KINDS.length, `${S.kindsFound(owned)} kinds from ${owned.length} awards`);

// old saves
const OLD = ['magnifier', 'jar', 'bubble', 'cookie', 'cards', 'quill', 'lamp', 'headphones', 'chest', 'basket', 'book', 'moon', 'star', 'leaf', 'cat', 'rainbow', 'cupcake', 'crown'];
const up = S.upgradeStickers(OLD);
ok('an old save\'s 18 stickers become 18 different squishies', up.length === 18 && new Set(up).size === 18 && up.every(id => S.parseSquishy(id)), `${up.length}`);
const mixed = S.upgradeStickers(['jar', 'cat:caramel', 'cookie', 'bear:toffee']);
ok('a save mixing old and new keeps every one', mixed.length === 4 && new Set(mixed).size === 4, mixed.join(', '));
ok('the count is kinds found', S.kindsFound(['cat:caramel', 'cat:butter', 'bear:toffee']) === 2);

const passed = results.every(Boolean);
console.log(passed ? '\nALL PASS' : '\nSOME FAILED');
process.exit(passed ? 0 : 1);
