#!/usr/bin/env node
// Proves a move to CSS modules (DES-18b–e) changed no style, including states
// the screenshots never reach (a loading badge, a pressed variant, a screen
// no shot visits). It compiles every stylesheet as it was and as it is, turns
// the old state classes into the new data-* selectors, and compares the rules.
//
//   git archive HEAD src | tar -x -C <scratch>/head
//   node .claude/skills/know-how/css-rules-compare.mjs "$PWD" <scratch>/head [extra-map.json]
//
// Each `X.module.scss` in today's src is paired with the old `X.scss` of the
// same name. Rules that only moved between files cancel out in the total, so
// the total lists only real additions and losses. Exits 1 if anything differs.
//
// The built-in map covers `is-x`/`state-x` -> data-state and `size-x` ->
// data-size. Anything else (a `toggle-on` that became data-state="on", a
// `btn-blue` that became data-variant="primary") goes in extra-map.json as
// [["regex", "replacement"], ...], applied to the old CSS before the built-ins.

import * as sass from 'sass-embedded';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { basename, join, relative } from 'node:path';

const [repo, old, mapFile] = process.argv.slice(2);
if (!repo || !old) {
  console.error('Usage: node css-rules-compare.mjs <repo> <old-tree-root> [extra-map.json]');
  process.exit(2);
}
const extra = mapFile ? JSON.parse(readFileSync(mapFile, 'utf8')).map(([re, to]) => [new RegExp(re, 'g'), to]) : [];
const MAP = [
  ...extra,
  [/\.is-([a-z]+)/g, '[data-state=$1]'],
  [/\.state-([a-z]+)/g, '[data-state=$1]'],
  [/\.size-([a-z]+)/g, '[data-size=$1]']
];

const walk = p => (statSync(p).isDirectory() ? readdirSync(p).flatMap(f => walk(join(p, f))) : [p]);
const compile = async (root, file) =>
  (await sass.compileAsync(file, { loadPaths: [join(root, 'src')], style: 'expanded' })).css;

// "selector >> nested { decls }", one line per rule; attribute quotes dropped
function rules(css) {
  const out = [];
  const sel = [];
  let buf = '';
  for (const ch of css.replace(/\/\*[\s\S]*?\*\//g, '')) {
    if (ch === '{') {
      sel.push(buf.trim().replace(/\s+/g, ' '));
      buf = '';
    } else if (ch === '}') {
      if (buf.trim()) out.push(`${sel.join(' >> ')} { ${buf.trim().replace(/\s+/g, ' ')} }`);
      buf = '';
      sel.pop();
    } else buf += ch;
  }
  return out.map(r => r.replace(/="([\w-]+)"\]/g, '=$1]'));
}

const oldByName = new Map(
  walk(join(old, 'src'))
    .filter(f => f.endsWith('.scss') && !basename(f).startsWith('_'))
    .map(f => [basename(f).replace(/\.module\.scss$|\.scss$/, ''), f])
);
const modules = walk(join(repo, 'src')).filter(f => f.endsWith('.module.scss'));

const allOld = [];
const allNew = [];
for (const now of modules) {
  const name = basename(now, '.module.scss');
  const was = oldByName.get(name);
  const b = rules(await compile(repo, now));
  const a = was && existsSync(was)
    ? rules(await compile(old, was)).map(r => MAP.reduce((s, [re, to]) => s.replace(re, to), r))
    : [];
  allOld.push(...a);
  allNew.push(...b);
  const lost = a.filter(r => !b.includes(r)).length;
  const added = b.filter(r => !a.includes(r)).length;
  const note = !was ? 'new file' : lost + added ? `${lost} only before, ${added} only now` : 'same rules';
  console.log(`${relative(repo, now)}: ${note}`);
}

// a multiset difference, so a rule moved to another file cancels out
const minus = (xs, ys) => {
  const left = [...ys];
  return xs.filter(x => {
    const i = left.indexOf(x);
    if (i === -1) return true;
    left.splice(i, 1);
    return false;
  });
};
const lost = minus(allOld, allNew);
const added = minus(allNew, allOld);
console.log(`\nIn total: ${allOld.length} rules before, ${allNew.length} now`);
for (const r of lost) console.log(`  - ${r}`);
for (const r of added) console.log(`  + ${r}`);
console.log(lost.length + added.length ? '\n❌ the rules differ (fine only if each line above was agreed)' : '\n✅ the same rules');
process.exit(lost.length + added.length ? 1 : 0);
