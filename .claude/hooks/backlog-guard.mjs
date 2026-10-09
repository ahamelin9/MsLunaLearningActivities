#!/usr/bin/env node
// PreToolUse guard for BACKLOG.md. Checks an edit against the backlog's rules
// (backlog-lib.mjs) before it lands, and refuses it with the reason when it
// would break one. A ticket deleted as Done also needs a clean build and lint.
// Shell commands that would write BACKLOG.md are refused, so every change goes
// through Edit or Write, where it can be checked.
//
// It only ever blocks for a rule; if the guard itself fails, the edit goes
// ahead and the error shows, so a bug here never wedges a session.

import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { checkEdit } from './backlog-lib.mjs';

const root = process.env.CLAUDE_PROJECT_DIR || process.cwd();
const backlog = join(root, 'BACKLOG.md');

const input = JSON.parse(readFileSync(0, 'utf8') || '{}');
const tool = input.tool_name;
const args = input.tool_input ?? {};

function deny(reason) {
  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'PreToolUse',
        permissionDecision: 'deny',
        permissionDecisionReason: `Backlog guard: ${reason}`
      }
    })
  );
  process.exit(0);
}

// ---- shell: no writing BACKLOG.md behind the guard's back ----
if (tool === 'Bash') {
  const cmd = String(args.command ?? '');
  const escaped = backlog.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const target = `(?:(?:\\./)?BACKLOG\\.md|${escaped})`;
  const namesIt = new RegExp(`(^|[\\s"'=])${target}`).test(cmd);
  const redirectsInto = new RegExp(`>>?\\s*["']?${target}`).test(cmd);
  // inline code (node -e, python -c) is fine unless it writes; a script file
  // handed the backlog can't be seen into, so it counts as a write
  const inlineCode = /\b(node|python3?|ruby)\b[^|;&]*\s-(e|c|-eval)\b/.test(cmd);
  const inlineWrites = /writeFile|appendFile|createWriteStream|\.write\(|open\([^)]*["'][wa]/.test(cmd);
  const runsScript = /\b(node|python3?|ruby)\b/.test(cmd) && !inlineCode;
  const writes =
    redirectsInto ||
    (inlineCode && inlineWrites) ||
    runsScript ||
    /\bsed\b[^|;&]*\s-i|\bperl\b[^|;&]*\s-\w*i|\btee\b|\b(mv|cp|rm|truncate)\b/.test(cmd);
  if (namesIt && writes) {
    deny('change BACKLOG.md with the Edit or Write tool, not the shell, so the edit can be checked.');
  }
  process.exit(0);
}

// ---- Edit / Write / MultiEdit on BACKLOG.md ----
if (!args.file_path || resolve(root, args.file_path) !== backlog) process.exit(0);

let before = '';
try {
  before = readFileSync(backlog, 'utf8');
} catch {
  // a new backlog: nothing to compare against
}

let after = before;
if (tool === 'Write') {
  after = String(args.content ?? '');
} else {
  const edits = tool === 'MultiEdit' ? args.edits ?? [] : [args];
  for (const edit of edits) {
    // an old_string that isn't there fails in the tool itself
    if (!after.includes(edit.old_string)) process.exit(0);
    after = edit.replace_all
      ? after.split(edit.old_string).join(edit.new_string)
      : after.replace(edit.old_string, () => edit.new_string);
  }
}

const { problems, completed } = checkEdit(before, after);
if (problems.length) deny(problems.join(' '));

// ---- a ticket deleted as Done: the build and lint must be clean ----
if (completed.length) {
  for (const script of ['build', 'lint']) {
    const run = spawnSync('npm', ['run', script], { cwd: root, encoding: 'utf8', timeout: 240_000 });
    if (run.status !== 0) {
      const tail = `${run.stdout ?? ''}${run.stderr ?? ''}`.trim().split('\n').slice(-12).join('\n');
      deny(`${completed.join(', ')} can't be deleted as Done: \`npm run ${script}\` fails.\n${tail}`);
    }
  }
}

process.exit(0);
