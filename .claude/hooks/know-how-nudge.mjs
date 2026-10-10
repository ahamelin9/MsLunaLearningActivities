#!/usr/bin/env node
// PostToolUse hook: when an edit to the backlog's changelog (kanban/CHANGELOG.md,
// or the old single BACKLOG.md) adds a line closing a
// ticket as Done, it reminds Claude to write down anything that took
// troubleshooting in the know-how skill (.claude/skills/know-how/SKILL.md),
// so the next session doesn't have to work it out again. It never blocks,
// and it says nothing for any other edit.

import { readFileSync } from 'node:fs';

let input;
try {
  input = JSON.parse(readFileSync(0, 'utf8'));
} catch {
  process.exit(0);
}

const tool = input.tool_input ?? {};
if (!/(^|[/\\])(BACKLOG\.md|kanban[/\\]CHANGELOG\.md)$/.test(tool.file_path ?? '')) process.exit(0);

// Edit carries one old/new pair, MultiEdit a list of them
const pairs = Array.isArray(tool.edits)
  ? tool.edits.map(e => [e.old_string ?? '', e.new_string ?? ''])
  : [[tool.old_string ?? '', tool.new_string ?? '']];

// a Changelog line such as: - **2026-10-09** — BUG-19 Feed Luna: … — Done…
const DONE = /^- \*\*\d{4}-\d{2}-\d{2}\*\* — ([A-Z]+-\d+[a-z]?)\b.*— Done/gm;
const closed = new Set();
for (const [before, after] of pairs) {
  const had = new Set([...before.matchAll(DONE)].map(m => m[1]));
  for (const m of after.matchAll(DONE)) if (!had.has(m[1])) closed.add(m[1]);
}
if (closed.size === 0) process.exit(0);

const ids = [...closed].join(', ');
process.stdout.write(
  JSON.stringify({
    hookSpecificOutput: {
      hookEventName: 'PostToolUse',
      additionalContext:
        `Know-how check: ${ids} just closed as Done. If getting there took troubleshooting ` +
        '(a wrong first theory, a check you had to build, a tool that misbehaved), add a short entry ' +
        '(symptom, cause, fix, check) to .claude/skills/know-how/SKILL.md now, and put any reusable script ' +
        'next to it rather than in the scratchpad. If it was a routine fix, skip this.'
    }
  })
);
