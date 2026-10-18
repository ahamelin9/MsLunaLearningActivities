#!/usr/bin/env node
// The design check (DES-19): no raw colours, sizes, durations, easings or
// @keyframes outside their homes in src/styles/ (the rules are in rules.mjs).
//
//   node scripts/design/check.mjs             run by `npm run lint`: fails on any
//                                              violation in any file
//   node scripts/design/check.mjs <files…>    lists every violation in those files
//   node scripts/design/check.mjs --status    `npm run design:status`: raw values
//                                              and exception markers per area
//
// Strict since DES-24: the legacy styles are gone, and with them the baseline
// that let old files keep their raw values while they moved onto the tokens.

import { existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { checkFile, kitFoldersWithoutPage, sourceFiles } from './rules.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const args = process.argv.slice(2);

function scan() {
  const files = {};
  for (const rel of sourceFiles(root)) files[rel] = checkFile(root, rel);
  return files;
}
const counted = r => r.violations.filter(v => v.counted);
const hard = r => r.violations.filter(v => !v.counted);
const line = (file, v) => `  ${file}${v.line ? `:${v.line}` : ''}  ${v.text}\n      ↳ ${v.hint}`;

// ── <files…>: list every violation ─────────────────────────────────────────
if (args.length && !args[0].startsWith('--')) {
  let total = 0;
  for (const arg of args) {
    const rel = arg.replace(/^\.\//, '');
    if (!existsSync(join(root, rel))) { console.log(`${rel}: no such file`); continue; }
    const { violations, markers } = checkFile(root, rel);
    total += violations.length;
    console.log(`${rel}: ${violations.length} violation(s)${markers ? `, ${markers} exception marker(s)` : ''}`);
    for (const v of violations.sort((a, b) => a.line - b.line)) console.log(line(rel, v));
  }
  process.exit(total ? 1 : 0);
}

const files = scan();
const kitGaps = kitFoldersWithoutPage(root);
const hardOnes = [
  ...Object.entries(files).flatMap(([f, r]) => hard(r).map(v => ({ file: f, ...v }))),
  ...kitGaps
];

// ── --status: what's left, per area and folder ─────────────────────────────
if (args[0] === '--status') {
  const AREAS = [
    ['Tokens and global styles', /^src\/(styles\/|index\.css)/],
    ['Kit', /^src\/components\/kit\//],
    ['Tablet shell', /^src\/(components\/os\/|App\.|main\.)/],
    ['Library and pages', /^src\/apps\/reading\/pages\//],
    ['GameShell and engine', /^src\/apps\/reading\/engine\//],
    ['Games', /^src\/apps\/reading\/games\//],
    ['Lessons', /^src\/apps\/reading\/lessons\//],
    ['Other apps and the registry', /^src\/apps\//],
    ['Data', /^src\/data\//],
    ['Everything else', /^src\//]
  ];
  // a component's folder, or the file itself when it sits loose
  const folderOf = f => {
    const parts = f.split('/');
    const depth = /^src\/components\/(kit|os)\//.test(f) ? 4 : /^src\/apps\/reading\/(pages|engine|games|lessons)\//.test(f) ? 5 : 0;
    return depth && parts.length > depth ? parts.slice(0, depth).join('/') + '/' : f;
  };
  const rows = new Map();
  for (const [f, r] of Object.entries(files)) {
    const area = AREAS.find(([, re]) => re.test(f))[0];
    const key = `${area}\0${folderOf(f)}`;
    const row = rows.get(key) ?? { colour: 0, size: 0, motion: 0, keyframes: 0, markers: 0 };
    for (const v of counted(r)) row[v.rule]++;
    row.markers += r.markers;
    rows.set(key, row);
  }
  const pad = (s, n) => String(s).padStart(n);
  console.log('Raw values per area, which should all be 0 (a folder at 0 isn\'t listed), and exception markers.\n');
  console.log(`${'folder'.padEnd(58)}${pad('colour', 7)}${pad('size', 6)}${pad('motion', 7)}${pad('kf', 4)}${pad('total', 7)}`);
  let grand = 0;
  for (const [area] of AREAS) {
    const mine = [...rows].filter(([k]) => k.startsWith(`${area}\0`));
    if (!mine.length) continue;
    const total = mine.reduce((a, [, r]) => a + r.colour + r.size + r.motion + r.keyframes, 0);
    const done = mine.filter(([, r]) => !(r.colour + r.size + r.motion + r.keyframes)).length;
    grand += total;
    console.log(`\n${area} — ${total}${done ? ` (${done} at 0, not listed)` : ''}`);
    for (const [k, r] of mine.sort(([a], [b]) => a.localeCompare(b))) {
      const t = r.colour + r.size + r.motion + r.keyframes;
      if (!t && !r.markers) continue;
      const note = r.markers ? `${r.markers} exception(s)` : '';
      console.log(`  ${k.split('\0')[1].replace(/^src\//, '').padEnd(56)}${pad(r.colour, 7)}${pad(r.size, 6)}${pad(r.motion, 7)}${pad(r.keyframes, 4)}${pad(t, 7)}${note ? `  ${note}` : ''}`);
    }
  }
  console.log(`\nIn all: ${grand}. Exception markers: ${Object.values(files).reduce((a, r) => a + r.markers, 0)}.`);
  if (hardOnes.length) console.log(`And ${hardOnes.length} problem(s) that always fail: run npm run lint.`);
  process.exit(0);
}

// ── the check, for npm run lint ────────────────────────────────────────────
const problems = [];
let problemCount = hardOnes.length;
for (const [f, r] of Object.entries(files)) {
  const list = counted(r).sort((a, b) => a.line - b.line);
  if (!list.length) continue;
  problemCount++;
  problems.push(`${f}: ${list.length} raw value(s)`);
  for (const v of list.slice(0, 12)) problems.push(line(f, v));
  if (list.length > 12) problems.push(`  … and ${list.length - 12} more: node scripts/design/check.mjs ${f}`);
}
for (const v of hardOnes) problems.push(line(v.file, v));

if (problems.length) {
  console.log(`Design check: ❌ ${problemCount} problem(s)`);
  for (const p of problems) console.log(p);
  console.log('\nHow to read this: docs/design-system/README.md, "Reading a design check failure".');
  process.exit(1);
}
console.log(`Design check: ✅ no raw values in ${Object.keys(files).length} files.`);
