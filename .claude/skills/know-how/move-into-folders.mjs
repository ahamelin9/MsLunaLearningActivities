#!/usr/bin/env node
// Moves components into their own folders (DES-18b–e) and repoints every
// import in src/ that the move breaks, so a move is one command, not forty
// hand edits.
//
//   node .claude/skills/know-how/move-into-folders.mjs "$PWD" <moves.json>
//
// moves.json maps old paths to new ones, without extension, from the repo root:
//   { "src/apps/reading/engine/GameShell": "src/apps/reading/engine/GameShell/GameShell" }
// Each moves its .tsx/.ts and its .module.scss (whichever exist).
//
// Only imports whose meaning changes are rewritten (the importer moved, or
// what it imports did):
//  - TypeScript inside the same app (src/apps/<app>/) stays relative;
//    anything else becomes `@/…`;
//  - a stylesheet's `@use` becomes a path from src/ (`apps/reading/engine/world`),
//    which `css.preprocessorOptions.scss.loadPaths` resolves.
// It refuses to run if a destination exists. Check with build, lint and
// `ui:shots --diff` afterwards, as for any refactor.

import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, relative, resolve } from 'node:path';

const [repo, movesFile] = process.argv.slice(2);
if (!repo || !movesFile) {
  console.error('Usage: node move-into-folders.mjs <repo> <moves.json>');
  process.exit(2);
}
const src = join(repo, 'src');
const walk = d => (statSync(d).isDirectory() ? readdirSync(d).flatMap(f => walk(join(d, f))) : [d]);
const files = walk(src).filter(f => /\.(tsx?|scss)$/.test(f));

// old file -> new file
const moved = new Map();
for (const [from, to] of Object.entries(JSON.parse(readFileSync(movesFile, 'utf8')))) {
  let any = false;
  for (const ext of ['.tsx', '.ts', '.module.scss']) {
    const a = join(repo, from + ext);
    if (!existsSync(a)) continue;
    const b = join(repo, to + ext);
    if (existsSync(b)) throw new Error(`${relative(repo, b)} already exists`);
    moved.set(a, b);
    any = true;
  }
  if (!any) throw new Error(`nothing to move at ${from}`);
}
const where = f => moved.get(f) ?? f;

function resolveTs(fromFile, spec) {
  const base = spec.startsWith('@/') ? join(src, spec.slice(2)) : resolve(dirname(fromFile), spec);
  for (const c of [base, base + '.tsx', base + '.ts', join(base, 'index.ts'), join(base, 'index.tsx')]) {
    if (existsSync(c) && statSync(c).isFile()) return c;
  }
  return null;
}
function resolveScss(fromFile, spec) {
  const bases = [resolve(dirname(fromFile), spec), join(src, spec)];
  for (const base of bases) {
    const d = dirname(base);
    const n = basename(base);
    for (const c of [join(d, `_${n}.scss`), join(d, `${n}.scss`), base]) {
      if (existsSync(c) && statSync(c).isFile()) return c;
    }
  }
  return null;
}
const appOf = f => relative(src, f).match(/^apps\/[^/]+\//)?.[0] ?? null;

function tsSpec(importer, target) {
  const keepExt = target.endsWith('.scss');
  const t = keepExt ? target : target.replace(/\.(tsx|ts)$/, '').replace(/\/index$/, '');
  if (appOf(importer) && appOf(importer) === appOf(target)) {
    const r = relative(dirname(importer), t);
    return r.startsWith('.') ? r : './' + r;
  }
  return '@/' + relative(src, t);
}
const scssSpec = target => relative(src, target).replace(/(^|\/)_([^/]+)\.scss$/, '$1$2').replace(/\.scss$/, '');

let rewrites = 0;
const out = new Map();
for (const file of files) {
  let text = readFileSync(file, 'utf8');
  const now = where(file);
  const isScss = file.endsWith('.scss');
  const re = isScss ? /(@use\s+')([^']+)(')/g : /((?:from|import)\s+')([^']+)(')/g;
  text = text.replace(re, (whole, pre, spec, post) => {
    if (!isScss && !spec.startsWith('.') && !spec.startsWith('@/')) return whole; // a package
    const target = isScss ? resolveScss(file, spec) : resolveTs(file, spec);
    if (!target) {
      if (isScss) return whole; // sass: or a package
      throw new Error(`${relative(repo, file)}: can't resolve '${spec}'`);
    }
    if (now === file && where(target) === target) return whole; // nothing moved
    rewrites++;
    return pre + (isScss ? scssSpec(where(target)) : tsSpec(now, where(target))) + post;
  });
  out.set(file, text);
}

for (const [file, text] of out) {
  const now = where(file);
  if (now === file && text === readFileSync(file, 'utf8')) continue;
  mkdirSync(dirname(now), { recursive: true });
  writeFileSync(now, text);
  if (now !== file) rmSync(file);
}
console.log(`moved ${moved.size} files, rewrote ${rewrites} imports`);
for (const [a, b] of moved) console.log(`  ${relative(repo, a)} -> ${relative(repo, b)}`);
