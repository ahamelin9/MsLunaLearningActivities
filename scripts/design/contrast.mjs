#!/usr/bin/env node
// The contrast check (DES-19), run by `npm run lint`: every text pair listed
// next to the roles (`$text-pairs` in src/styles/tokens/_roles.scss) must reach
// 4.5:1 in light and in dark. Children are learning to read, so large text
// gets no 3:1 allowance (docs/design-system/colour.md, Contrast).
//
//   node scripts/design/contrast.mjs          prints every pair, fails under 4.5
//   node scripts/design/contrast.mjs <root>   checks another copy of the repo
//
// It compiles the tokens with sass-embedded, so it reads the values the app
// gets. A see-through colour is blended over what it sits on first: a
// background over --ground, then the text over that background.

import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as sass from 'sass-embedded';

const MIN = 4.5;
const root = resolve(process.argv[2] ?? join(dirname(fileURLToPath(import.meta.url)), '../..'));

const { css } = await sass.compileStringAsync(
  `@use 'styles/tokens/roles' as r;
   contrast-pairs { @each $text, $grounds in r.$text-pairs { --#{$text}: #{$grounds}; } }`,
  { loadPaths: [join(root, 'src')] }
);

const block = selector => {
  const at = css.indexOf(`${selector} {`);
  if (at < 0) throw new Error(`No "${selector}" block in the compiled tokens`);
  const body = css.slice(css.indexOf('{', at) + 1, css.indexOf('}', at));
  return new Map([...body.matchAll(/--([\w-]+):\s*([^;]+);/g)].map(m => [m[1], m[2].trim()]));
};
const modes = { light: block(':root,\n[data-theme=light]'), dark: block('[data-theme=dark]') };
const pairs = [...block('contrast-pairs')].flatMap(([text, grounds]) => grounds.split(',').map(g => [text, g.trim()]));

/** '#3B2A20' or 'rgba(59, 42, 32, 0.5)' → [r, g, b, a] */
function parse(value, name) {
  const v = value.trim().toLowerCase();
  if (v.startsWith('#')) {
    let h = v.slice(1);
    if (h.length <= 4) h = [...h].map(c => c + c).join('');
    const n = [0, 2, 4, 6].map(i => (i < h.length ? parseInt(h.slice(i, i + 2), 16) : 255));
    return [n[0], n[1], n[2], n[3] / 255];
  }
  const m = v.match(/^rgba?\(([^)]+)\)$/);
  if (!m) throw new Error(`--${name} is "${value}", which isn't a colour this check can read`);
  const [r, g, b, a = 1] = m[1].split(/[\s,/]+/).filter(Boolean).map(Number);
  return [r, g, b, a];
}
const over = ([r, g, b, a], [R, G, B]) => [r * a + R * (1 - a), g * a + G * (1 - a), b * a + B * (1 - a), 1];
const luminance = rgb =>
  rgb.slice(0, 3)
    .map(c => c / 255)
    .map(c => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4))
    .reduce((sum, c, i) => sum + c * [0.2126, 0.7152, 0.0722][i], 0);
const ratio = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

const failures = [];
const rows = [];
for (const [text, ground] of pairs) {
  const cells = [];
  for (const [mode, roles] of Object.entries(modes)) {
    const get = name => {
      if (!roles.has(name)) throw new Error(`--${name} has no ${mode} value`);
      return parse(roles.get(name), name);
    };
    const page = get('ground');
    if (page[3] < 1) throw new Error(`--ground must be solid in ${mode}`);
    const bg = over(get(ground), page);
    const r = ratio(over(get(text), bg), bg);
    cells.push(`${mode} ${r.toFixed(2).padStart(5)}${r < MIN ? ' ❌' : ' ✓'}`);
    if (r < MIN) failures.push(`--${text} on --${ground} in ${mode}: ${r.toFixed(2)}:1 (needs ${MIN})`);
  }
  rows.push(`  ${`--${text} on --${ground}`.padEnd(42)}${cells.join('   ')}`);
}

console.log(`Contrast check: ${pairs.length} text pairs × light and dark, each needs ${MIN}:1`);
for (const r of rows) console.log(r);
if (failures.length) {
  console.log(`\n❌ ${failures.length} pair(s) under ${MIN}:1:`);
  for (const f of failures) console.log(`  - ${f}`);
  console.log('Change the role\'s value (step 3 or 4 of the ladder in docs/design-system/fitting-in.md), never the minimum.');
  process.exit(1);
}
console.log(`✅ All ${pairs.length * 2} checks pass.`);
