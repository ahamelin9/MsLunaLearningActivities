#!/usr/bin/env node
// The design check (DES-19): no raw colours, sizes, durations, easings or
// @keyframes outside their homes in src/styles/ (the rules are in rules.mjs).
//
//   node scripts/design/check.mjs             run by `npm run lint`: fails if a
//                                              file has more violations than its
//                                              baseline, a new file has any, or
//                                              a rule that always fails is broken
//   node scripts/design/check.mjs <files…>    lists every violation in those files
//   node scripts/design/check.mjs --update    writes the lower baseline after a
//                                              cleanup; refuses any increase
//   node scripts/design/check.mjs --status    `npm run design:status`: what's
//                                              left per area and folder
//
// The baseline (scripts/design/baseline.json) holds today's count per file
// while the legacy styles go away. It may only shrink (fitting-in.md); DES-24
// deletes it and the check runs strict.

import { existsSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { BASELINE, COUNTED, checkFile, kitFoldersWithoutPage, readBaseline, sourceFiles } from './rules.mjs';

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
const baseline = readBaseline(root);
const sum = obj => Object.values(obj).reduce((a, b) => a + b, 0);
const counts = Object.fromEntries(Object.entries(files).map(([f, r]) => [f, counted(r).length]).filter(([, n]) => n > 0));
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
    ['Legacy kit (goes with DES-9b, DES-9c)', /^src\/components\/ui\//],
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
    const depth = /^src\/components\/(kit|ui|os)\//.test(f) ? 4 : /^src\/apps\/reading\/(pages|engine|games|lessons)\//.test(f) ? 5 : 0;
    return depth && parts.length > depth ? parts.slice(0, depth).join('/') + '/' : f;
  };
  const LEGACY_FILE = /^src\/(styles\/_variables\.scss|index\.css|apps\/reading\/engine\/_world\.scss)$/;
  const rows = new Map();
  for (const [f, r] of Object.entries(files)) {
    const area = AREAS.find(([, re]) => re.test(f))[0];
    const key = `${area}\0${folderOf(f)}`;
    const row = rows.get(key) ?? { colour: 0, size: 0, motion: 0, keyframes: 0, markers: 0, legacy: false };
    for (const v of counted(r)) row[v.rule]++;
    row.markers += r.markers;
    row.legacy ||= LEGACY_FILE.test(f) || r.legacy;
    rows.set(key, row);
  }
  const pad = (s, n) => String(s).padStart(n);
  console.log('What\'s left per area: raw values to move onto the tokens (a folder at 0 is done).');
  console.log('"old styles" marks a folder still on the legacy partials, which DES-24 deletes.\n');
  console.log(`${'folder'.padEnd(58)}${pad('colour', 7)}${pad('size', 6)}${pad('motion', 7)}${pad('kf', 4)}${pad('total', 7)}`);
  let grand = 0;
  for (const [area] of AREAS) {
    const mine = [...rows].filter(([k]) => k.startsWith(`${area}\0`));
    if (!mine.length) continue;
    const total = mine.reduce((a, [, r]) => a + r.colour + r.size + r.motion + r.keyframes, 0);
    const done = mine.filter(([, r]) => !(r.colour + r.size + r.motion + r.keyframes) && !r.legacy).length;
    grand += total;
    console.log(`\n${area} — ${total}${done ? ` (${done} at 0 and off the old styles, not listed)` : ''}`);
    for (const [k, r] of mine.sort(([a], [b]) => a.localeCompare(b))) {
      const t = r.colour + r.size + r.motion + r.keyframes;
      if (!t && !r.legacy && !r.markers) continue;
      const note = [r.legacy ? 'old styles' : '', r.markers ? `${r.markers} exception(s)` : ''].filter(Boolean).join(', ');
      console.log(`  ${k.split('\0')[1].replace(/^src\//, '').padEnd(56)}${pad(r.colour, 7)}${pad(r.size, 6)}${pad(r.motion, 7)}${pad(r.keyframes, 4)}${pad(t, 7)}${note ? `  ${note}` : ''}`);
    }
  }
  console.log(`\nIn all: ${grand} (baseline ${sum(baseline)}). Exception markers: ${Object.values(files).reduce((a, r) => a + r.markers, 0)}.`);
  if (hardOnes.length) console.log(`And ${hardOnes.length} problem(s) that always fail: run npm run lint.`);
  process.exit(0);
}

// ── --update: write the lower baseline ─────────────────────────────────────
if (args[0] === '--update') {
  const first = !existsSync(join(root, BASELINE));
  const raised = Object.entries(counts).filter(([f, n]) => f in baseline && n > baseline[f]);
  const added = Object.entries(counts).filter(([f]) => !(f in baseline));
  const refusals = [];
  if (!first) {
    for (const [f, n] of raised) refusals.push(`${f}: ${baseline[f]} → ${n}`);
    if (added.length && sum(counts) > sum(baseline)) {
      for (const [f, n] of added) refusals.push(`${f}: new with ${n}, and the total would rise ${sum(baseline)} → ${sum(counts)}`);
    }
  }
  if (refusals.length) {
    console.log('Refused: the baseline may only shrink (docs/design-system/fitting-in.md).');
    for (const r of refusals) console.log(`  ${r}`);
    console.log('Fix the new violations instead (node scripts/design/check.mjs <file> lists them).');
    process.exit(1);
  }
  const sorted = Object.fromEntries(Object.entries(counts).sort(([a], [b]) => a.localeCompare(b)));
  writeFileSync(join(root, BASELINE), JSON.stringify({
    about: 'Raw values each file may still have while the legacy styles go away (DES-19). It may only shrink: node scripts/design/check.mjs --update. DES-24 deletes it.',
    total: sum(sorted),
    files: sorted
  }, null, 2) + '\n');
  const gone = Object.keys(baseline).filter(f => !(f in counts)).length;
  console.log(`Baseline ${first ? 'written' : 'updated'}: ${sum(sorted)} in ${Object.keys(sorted).length} files (was ${sum(baseline)}${gone ? `; ${gone} file(s) now at 0 or gone` : ''}).`);
  process.exit(0);
}

// ── the check, for npm run lint ────────────────────────────────────────────
const problems = [];
let problemCount = hardOnes.length;
for (const [f, n] of Object.entries(counts)) {
  const allowed = baseline[f] ?? 0;
  if (n <= allowed) continue;
  problemCount++;
  const list = counted(files[f]).sort((a, b) => a.line - b.line);
  problems.push(`${f}: ${n} raw value(s), the baseline allows ${allowed}${allowed ? ` (+${n - allowed})` : ''}`);
  if (!allowed) for (const v of list.slice(0, 12)) problems.push(line(f, v));
  else problems.push(`  The new one(s) are among these: node scripts/design/check.mjs ${f}`);
  if (!allowed && list.length > 12) problems.push(`  … and ${list.length - 12} more: node scripts/design/check.mjs ${f}`);
}
for (const v of hardOnes) problems.push(line(v.file, v));

const lower = Object.entries(baseline).filter(([f, n]) => (counts[f] ?? 0) < n);
if (problems.length) {
  console.log(`Design check: ❌ ${problemCount} problem(s)`);
  for (const p of problems) console.log(p);
  console.log('\nHow to read this: docs/design-system/README.md, "Reading a design check failure".');
  process.exit(1);
}
console.log(`Design check: ✅ ${sum(counts)} raw values left in ${Object.keys(counts).length} files, none above the baseline (${sum(baseline)}).`);
if (lower.length) console.log(`  ${lower.length} file(s) now below their baseline: run node scripts/design/check.mjs --update to lock that in.`);
