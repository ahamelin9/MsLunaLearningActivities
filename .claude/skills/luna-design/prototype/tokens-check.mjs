#!/usr/bin/env node
// Does every colour on the approved round 2 boards have a home in the tokens?
// (DES-3's "every colour on the round 2 boards has a role or an --illo-* entry")
//
//   node .claude/skills/luna-design/prototype/tokens-check.mjs "$PWD"
//   node .claude/skills/luna-design/prototype/tokens-check.mjs "$PWD" --drop illo-moon-pale
//
// 1. Each of the prototype's named colours (gen.py's .t-light/.t-dark, and the
//    home board's) maps to an app role or --illo-* entry with the same light
//    and the same dark value.
// 2. Every raw colour drawn on the boards equals some role (light or dark) or
//    --illo-* value.
//
// The boards are rebuilt from gen.py into a temporary folder (project/ is left
// alone), and the tokens are compiled from src/styles/tokens/ with
// sass-embedded. Left out on purpose, and listed in the report: the viewer's
// own chrome (nav bars, zoom), the Luna options the teacher didn't pick, and
// the seed colour of the dropped seeds-to-flowers progress.
//
// --drop <token> forgets one token, to prove the check fails without it.
// Exits 1 on any gap.

import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as sass from 'sass-embedded';

const HERE = dirname(fileURLToPath(import.meta.url));
const root = resolve(process.argv[2] ?? process.cwd());
const dropAt = process.argv.indexOf('--drop');
const dropped = dropAt === -1 ? null : process.argv[dropAt + 1];

/** Prototype colour name → app token (null: left out on purpose). */
const MAP = {
  // gen.py TOKENS
  bg: 'ground', dot: 'grain', dot2: 'grain-2', card: 'card', edge: 'edge', well: 'well',
  soil: 'soil', 'soil-dk': 'soil-deep', ink: 'ink', soft: 'ink-soft',
  accent: 'accent', 'accent-ink': 'accent-ink', 'accent-edge': 'accent-edge',
  'accent-soft': 'accent-soft', 'accent-text': 'accent-text',
  action: 'action', 'action-ink': 'action-ink', 'action-edge': 'action-edge',
  right: 'right', 'right-ink': 'right-ink', 'right-edge': 'right-edge',
  'right-soft': 'right-soft', 'right-text': 'right-text', 'right-glow': 'right-glow',
  'retry-soft': 'try-again-soft', 'retry-edge': 'try-again-edge', 'retry-text': 'try-again-text',
  'rare-soft': 'rare-soft', 'rare-edge': 'rare-edge', 'rare-text': 'rare-text',
  'super-soft': 'super-rare-soft', 'super-edge': 'super-rare-edge', 'super-text': 'super-rare-text',
  leaf: 'illo-leaf', stem: 'illo-stem', petal: 'illo-daisy-petal', 'petal-edge': 'illo-daisy-petal-edge',
  seed: null, // only the dropped seeds-to-flowers progress drew it
  'tint-1': 'picture-1', 'tint-2': 'picture-2', 'tint-3': 'picture-3', 'tint-4': 'picture-4', 'tint-5': 'picture-5',
  focus: 'focus', shadow: 'shade', 'shadow-lg': 'shade-deep', shine: 'shine',
  // the home board's own (frag/_homecss.part)
  sky: 'illo-sky', dune1: 'illo-dune-1', dune2: 'illo-dune-2', dune3: 'illo-dune-3',
  plume: 'illo-pampas', plume2: 'illo-pampas-2', 'plume-line': 'illo-pampas-line', reed: 'illo-reed',
  pill: 'card', 'pill-edge': 'illo-home-pill-edge', indicator: 'illo-home-indicator', glass: 'illo-home-glass'
};

/** Board colours snapped onto a token that differs a little (Alex's OK, 2026-10-11). */
const SNAPPED = {
  'rgba(154, 107, 69, 0.35)': 'action-glow' // the ListenCue's pulse uses the one glow (45%)
};

/** Cards on the Ms. Luna board the teacher didn't pick (she picked 1 and 6). */
const UNPICKED_LUNAS = [2, 3, 4, 5, 7, 8];

const COLOUR = /(?<![&\w])#(?:[0-9a-f]{8}|[0-9a-f]{6}|[0-9a-f]{3,4})\b|rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(?:,\s*[\d.]+\s*)?\)/gi;

/** '#3B2A20', 'rgba(59, 42, 32, 0.5)' → '59,42,32,0.5'; null for fully transparent. */
function norm(text) {
  let r, g, b, a = 1;
  const t = text.trim().toLowerCase();
  if (t.startsWith('#')) {
    let h = t.slice(1);
    if (h.length <= 4) h = [...h].map(c => c + c).join('');
    [r, g, b] = [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16));
    if (h.length === 8) a = parseInt(h.slice(6, 8), 16) / 255;
  } else {
    const n = t.match(/[\d.]+/g).map(Number);
    [r, g, b] = n;
    if (n.length > 3) a = n[3];
  }
  if (a === 0) return null;
  return `${r},${g},${b},${Math.round(a * 1000) / 1000}`;
}

// ── The tokens, compiled ───────────────────────────────────────────────────
const tokens = { light: new Map(), dark: new Map() }; // token → normalised colour
for (const file of ['_roles.scss', '_illustration.scss']) {
  const { css } = await sass.compileAsync(join(root, 'src/styles/tokens', file), {
    loadPaths: [join(root, 'src')]
  });
  for (const [, selector, body] of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const modes = selector.includes('dark') ? ['dark'] : selector.includes('light') ? ['light'] : ['light', 'dark'];
    for (const [, name, value] of body.matchAll(/--([\w-]+):\s*([^;]+);/g)) {
      if (name === dropped) continue;
      const m = value.trim().match(new RegExp(`^(?:${COLOUR.source})$`, 'i'));
      if (!m) continue;
      for (const mode of modes) tokens[mode].set(name, norm(value));
    }
  }
}
/** normalised colour → the tokens that hold it */
const holders = new Map();
for (const mode of ['light', 'dark']) {
  for (const [name, c] of tokens[mode]) {
    if (!holders.has(c)) holders.set(c, new Set());
    holders.get(c).add(name);
  }
}

// ── The boards, rebuilt ────────────────────────────────────────────────────
const out = mkdtempSync(join(tmpdir(), 'luna-boards-'));
const boards = readdirSync(join(HERE, 'frag'))
  .filter(f => f.endsWith('.frag'))
  .map(f => f.replace('.frag', ''));
execFileSync('python3', ['-I', '-B', '-c', [
  'import sys, pathlib',
  `sys.path.insert(0, ${JSON.stringify(HERE)})`,
  'import gen',
  `gen.OUT = pathlib.Path(${JSON.stringify(out)})`,
  `[gen.build(n) for n in ${JSON.stringify(boards)}]`
].join('\n')]);

const named = { light: new Map(), dark: new Map() };
const drawn = new Map(); // normalised colour → { text, where }
for (const board of boards) {
  let html = readFileSync(join(out, `${board}.dc.html`), 'utf8');
  for (const [, mode, body] of html.matchAll(/\.t-(light|dark)\s*\{([^}]*)\}/g)) {
    for (const [, name, value] of body.matchAll(/--([\w-]+):\s*([^;]+);/g)) named[mode].set(name, value.trim());
  }
  html = html
    .replace(/\.t-(light|dark)\s*\{[^}]*\}/g, '')       // checked by name above
    .replace(/<nav[\s\S]*?<\/nav>/g, '')                // the viewer's nav bars
    .replace(/<style>\s*\.lz-check[\s\S]*?<\/style>/, '') // the viewer's zoom
    .replace(/background: #16161A;/g, '');              // the viewer's frame
  if (board === 'R2Luna') {
    // each card runs from its `<!-- N · …` comment to the next card's, the last to its </button>
    const cards = [...html.matchAll(/<!-- (\d) · /g)].map((m, i, all) => ({
      n: Number(m[1]),
      start: m.index,
      end: all[i + 1]?.index ?? html.lastIndexOf('</button>') + '</button>'.length
    }));
    const unpicked = cards.filter(c => UNPICKED_LUNAS.includes(c.n));
    if (cards.length !== 8 || unpicked.length !== UNPICKED_LUNAS.length) throw new Error('The Ms. Luna board no longer has cards 1–8');
    for (const { start, end } of unpicked.reverse()) html = html.slice(0, start) + html.slice(end);
  }
  for (const m of html.matchAll(COLOUR)) {
    const c = norm(m[0]);
    if (c && !drawn.has(c)) drawn.set(c, { text: m[0], where: `${board}: …${html.slice(m.index - 70, m.index).replace(/\s+/g, ' ')}` });
  }
}
rmSync(out, { recursive: true, force: true });

// ── Compare ────────────────────────────────────────────────────────────────
const problems = [];
const left = [];
let mapped = 0;
for (const name of new Set([...named.light.keys(), ...named.dark.keys()])) {
  if (!(name in MAP)) { problems.push(`prototype colour --${name} isn't in MAP: give it a token`); continue; }
  const token = MAP[name];
  if (token === null) { left.push(`--${name}`); continue; }
  for (const mode of ['light', 'dark']) {
    const want = norm(named[mode].get(name));
    const have = tokens[mode].get(token);
    if (have !== want) problems.push(`--${name} (${mode} ${named[mode].get(name)}) → --${token} is ${have ?? 'missing'}`);
  }
  mapped++;
}
const covered = [];
const snapped = [];
const snaps = new Map(Object.entries(SNAPPED).map(([text, token]) => [norm(text), { text, token }]));
for (const [c, { text, where }] of drawn) {
  const snap = snaps.get(c);
  if (holders.get(c)) covered.push(c);
  else if (snap && tokens.light.has(snap.token)) { covered.push(c); snapped.push(`${snap.text} → --${snap.token}`); }
  else problems.push(`${text} has no role or --illo-* entry (${where})`);
}

console.log(`Prototype colour names: ${mapped} map to a token with the same light and dark value.`);
console.log(`Colours drawn on the ${boards.length} boards: ${covered.length} of ${drawn.size} have a role or an --illo-* entry.`);
if (snapped.length) console.log(`Snapped: ${snapped.join(', ')}.`);
console.log(`Left out on purpose: ${left.join(', ')} (dropped progress); Luna options ${UNPICKED_LUNAS.join(', ')} (not picked); the viewer's nav and zoom.`);
if (dropped) console.log(`(--drop ${dropped}: that token was ignored)`);
if (problems.length) {
  console.log(`\n❌ ${problems.length} gap(s):`);
  for (const p of problems) console.log(`  - ${p}`);
  process.exit(1);
}
console.log('✅ Every colour on the round 2 boards has a home in the tokens.');
