#!/usr/bin/env node
// PostToolUse hook (Edit, Write, MultiEdit): runs the design check on the file
// just edited (DES-19), so a raw colour, size, duration or @keyframes slipped
// into a UI file is caught in the same turn, not at lint time.
//
// It reports only what this edit made worse: violations that aren't in the
// file's committed (HEAD) version, matched by rule and text so moved lines
// don't count, and a count above the file's baseline. Each comes with a fix
// hint. A legacy file edited without adding any says nothing. The rules are
// scripts/design/rules.mjs, the same ones `npm run lint` uses.
//
// It never blocks a session over its own bug: on bad input or any error it
// stays silent.

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { relative, resolve } from 'node:path';
import { checkFile, checkText, readBaseline } from '../../scripts/design/rules.mjs';

const MAX_LISTED = 15;

function main() {
  let input;
  try {
    input = JSON.parse(readFileSync(0, 'utf8'));
  } catch {
    return;
  }
  const file = input.tool_input?.file_path;
  if (!file) return;
  const root = process.env.CLAUDE_PROJECT_DIR || input.cwd || process.cwd();
  const rel = relative(root, resolve(root, file)).split('\\').join('/');
  if (!/^src\/.*\.(scss|css|ts|tsx)$/.test(rel) || !existsSync(resolve(root, rel))) return;

  const now = checkFile(root, rel).violations;

  // what the committed version already had, as rule|text counts
  const had = new Map();
  try {
    const head = execFileSync('git', ['show', `HEAD:${rel}`], { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
    for (const v of checkText(root, rel, head).violations) {
      const key = `${v.rule}|${v.text.toLowerCase()}`;
      had.set(key, (had.get(key) ?? 0) + 1);
    }
  } catch {
    // a new file: everything in it is new
  }
  const fresh = [];
  for (const v of now.sort((a, b) => a.line - b.line)) {
    const key = `${v.rule}|${v.text.toLowerCase()}`;
    if (had.get(key)) had.set(key, had.get(key) - 1);
    else fresh.push(v);
  }

  const count = now.filter(v => v.counted).length;
  const allowed = readBaseline(root)[rel] ?? 0;
  if (!fresh.length && count <= allowed) return;

  const lines = [`Design check on ${rel}: this edit added raw values. Fix them now, in this turn (never raise the baseline):`];
  for (const v of fresh.slice(0, MAX_LISTED)) lines.push(`  line ${v.line}: ${v.text}\n    ↳ ${v.hint}`);
  if (fresh.length > MAX_LISTED) lines.push(`  … and ${fresh.length - MAX_LISTED} more: node scripts/design/check.mjs ${rel}`);
  if (count > allowed) {
    lines.push(`  The file now has ${count} counted raw value(s); its baseline allows ${allowed}, so npm run lint fails until it's back at or under that.`);
    if (!fresh.length) lines.push(`  List them: node scripts/design/check.mjs ${rel}`);
  }
  lines.push('Something truly doesn\'t fit? Go down the ladder in docs/design-system/fitting-in.md.');
  process.stdout.write(JSON.stringify({ decision: 'block', reason: lines.join('\n') }));
}

try {
  main();
} catch {
  // never wedge a session over a bug here
}
