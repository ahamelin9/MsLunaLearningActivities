#!/usr/bin/env node
// Past-tense "read" (BUG-22): the voice reads every "read" as "reed" (ɹˈiːd),
// since espeak can't tell the tense. This lists every spoken string in the
// content and the curriculum that has "read" in it, with how it's said, and
// fails on the past-tense pattern: a person, then "read" ("she read", "Luna
// read"), not after "can", "to", "will" and the like. Reword those lines
// ("she spent the morning reading"), then `npm run voice:render`.
//
//   node .claude/skills/know-how/read-tense-check.mjs
//
// No browser. It failed on "The Rainy Day Plan" before BUG-22.

import { build } from 'esbuild';
import { phonemize } from 'phonemizer';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const repo = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const out = mkdtempSync(join(tmpdir(), 'read-tense-'));
await build({
  stdin: {
    contents: `export * as content from './src/apps/reading/engine/content.ts'; export { READING_CURRICULUM } from './src/data/readingCurriculum.ts';`,
    resolveDir: repo,
    loader: 'ts'
  },
  bundle: true,
  format: 'esm',
  platform: 'node',
  outfile: join(out, 'bundle.mjs'),
  alias: { '@': join(repo, 'src') },
  logLevel: 'error'
});
const { content, READING_CURRICULUM } = await import(pathToFileURL(join(out, 'bundle.mjs')).href);
rmSync(out, { recursive: true, force: true });

const lines = new Set();
const walk = n => {
  if (typeof n === 'string') { if (/\bread\b/i.test(n)) lines.add(n); return; }
  if (Array.isArray(n)) return n.forEach(walk);
  if (n && typeof n === 'object') Object.values(n).forEach(walk);
};
walk(content);
walk(READING_CURRICULUM);

// someone did the reading: a person or pronoun right before "read" (but not
// "what you read", which is the present)
const PAST = /(?<!\bwhat\s)\b(I|you|he|she|we|they|Luna|Pip|[A-Z][a-z]+)\s+read\b(?!\s+(?:it|this|the word|me)\b[^.]*\?)/;
let failed = false;
for (const line of lines) {
  const said = (await phonemize(line, 'en-us')).join(' | ');
  const past = PAST.test(line);
  if (past) failed = true;
  console.log(`${past ? '❌ past tense?' : '✅'} ${JSON.stringify(line)}\n     ${said}`);
}
console.log(failed ? '\nSOME FAILED: reword the lines marked ❌' : `\nALL PASS: ${lines.size} lines with "read", none in the past tense`);
process.exit(failed ? 1 : 0);
