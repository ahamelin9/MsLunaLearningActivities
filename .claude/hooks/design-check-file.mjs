#!/usr/bin/env node
// PostToolUse hook (Edit, Write, MultiEdit): runs the design check on the file
// just edited (DES-19), so a raw colour, size, duration or @keyframes slipped
// into a UI file is caught in the same turn, not at lint time.
//
// The check is strict since DES-24 (no baseline), so it lists every violation
// left in the file, each with a fix hint. The rules are
// scripts/design/rules.mjs, the same ones `npm run lint` uses.
//
// It never blocks a session over its own bug: on bad input or any error it
// stays silent.

import { existsSync, readFileSync } from 'node:fs';
import { relative, resolve } from 'node:path';
import { checkFile } from '../../scripts/design/rules.mjs';

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

  const found = checkFile(root, rel).violations.sort((a, b) => a.line - b.line);
  if (!found.length) return;

  const lines = [`Design check on ${rel}: ${found.length} raw value(s) or broken rule(s), and npm run lint fails until they're gone. Fix them now, in this turn:`];
  for (const v of found.slice(0, MAX_LISTED)) lines.push(`  line ${v.line}: ${v.text}\n    ↳ ${v.hint}`);
  if (found.length > MAX_LISTED) lines.push(`  … and ${found.length - MAX_LISTED} more: node scripts/design/check.mjs ${rel}`);
  lines.push('Something truly doesn\'t fit? Go down the ladder in docs/design-system/fitting-in.md.');
  process.stdout.write(JSON.stringify({ decision: 'block', reason: lines.join('\n') }));
}

try {
  main();
} catch {
  // never wedge a session over a bug here
}
