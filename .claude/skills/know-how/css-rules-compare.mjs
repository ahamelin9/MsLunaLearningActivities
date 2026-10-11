#!/usr/bin/env node
// Proves a move to CSS modules (DES-18b–e) changed no style, including states
// the screenshots never reach (a loading badge, a pressed variant, a screen
// no shot visits). It compiles every stylesheet as it was and as it is, turns
// the old state classes into the new data-* selectors, and compares the rules.
//
//   git archive HEAD src | tar -x -C <scratch>/head
//   node .claude/skills/know-how/css-rules-compare.mjs "$PWD" <scratch>/head [extra-map.json]
//
// Every stylesheet in src/ is compiled, then and now, and the two sets of
// rules are compared as one whole: a rule that moved to another file, or a
// file that was renamed, cancels out, so the total lists only real additions
// and losses. The per-file lines pair files by name (`X.scss` with
// `X.module.scss`) as a guide. Exits 1 if anything differs.
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

// every stylesheet that outputs CSS (partials don't), compared as one whole,
// so a rule may move or a file be renamed without showing as a change
const sheets = root => walk(join(root, 'src')).filter(f => /\.s?css$/.test(f) && !basename(f).startsWith('_'));
const nameOf = f => basename(f).replace(/\.module\.scss$|\.scss$|\.css$/, '');
const oldSheets = sheets(old);
const newSheets = sheets(repo);
const oldByName = new Map(oldSheets.map(f => [nameOf(f), f]));
const newNames = new Set(newSheets.map(nameOf));
// the renames apply to a sheet that became a module or went; one still global
// in the same place is compared as it is, so its own edits show as changes
const stillGlobal = new Set(newSheets.filter(f => !f.endsWith('.module.scss')).map(f => relative(repo, f)));
const mapped = (rs, was) =>
  stillGlobal.has(relative(old, was)) ? rs : rs.map(r => MAP.reduce((s, [re, to]) => s.replace(re, to), r));

const allOld = [];
const allNew = [];
for (const now of newSheets) {
  const was = oldByName.get(nameOf(now));
  const b = rules(await compile(repo, now));
  const a = was && existsSync(was) ? mapped(rules(await compile(old, was)), was) : [];
  allOld.push(...a);
  allNew.push(...b);
  const lost = a.filter(r => !b.includes(r)).length;
  const added = b.filter(r => !a.includes(r)).length;
  const note = !was ? 'new file' : lost + added ? `${lost} only before, ${added} only now` : 'same rules';
  console.log(`${relative(repo, now)}: ${note}`);
}
for (const was of oldSheets.filter(f => !newNames.has(nameOf(f)))) {
  allOld.push(...mapped(rules(await compile(old, was)), was));
  console.log(`${relative(old, was)}: gone (its rules count in the total)`);
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
