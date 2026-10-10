#!/usr/bin/env node
// PreToolUse guard for the backlog (kanban/: README.md, epics/*.md,
// CHANGELOG.md). Checks an edit against the backlog's rules (backlog-lib.mjs)
// before it lands, and refuses it with the reason when it would break one. A
// ticket deleted as Done also needs a clean build and lint. Shell commands
// that would write the backlog are refused, so every change goes through Edit
// or Write, where it can be checked.
//
// The rules are checked on the whole backlog (all its files joined), so a
// ticket can move between files and a deletion can span the board in the
// README, its section in an epic file and its line in the changelog.
//
// It only ever blocks for a rule; if the guard itself fails, the edit goes
// ahead and the error shows, so a bug here never wedges a session.

import { readFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { checkEdit, KANBAN, LEGACY, loadBacklog, README } from './backlog-lib.mjs';

const root = process.env.CLAUDE_PROJECT_DIR || process.cwd();

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

let current;
try {
  current = loadBacklog(root);
} catch {
  current = null; // no backlog yet: nothing to protect
}
const kanbanActive = current?.mode === 'kanban';

// ---- shell: no writing the backlog behind the guard's back ----
if (tool === 'Bash') {
  if (!current) process.exit(0);
  const cmd = String(args.command ?? '');
  // A finished epic's file can be removed once the README no longer links it:
  // a plain "rm" of unlinked kanban/epics/*.md files only.
  if (kanbanActive) {
    const rm = cmd.trim().match(/^rm\s+(?:-f\s+)?((?:["']?[^\s"';&|]+["']?\s*)+)$/);
    const paths = rm ? rm[1].trim().split(/\s+/).map(p => p.replace(/^["']|["']$/g, '')) : [];
    const rels = paths.map(p => relative(root, resolve(root, p)).split('\\').join('/'));
    if (rels.length && rels.every(r => /^kanban\/epics\/[A-Za-z0-9_-]+\.md$/.test(r) && !current.files.includes(r))) {
      process.exit(0);
    }
  }
  const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const target = kanbanActive
    ? `(?:(?:\\./)?${KANBAN}(?:/|\\b)|${esc(join(root, KANBAN))})`
    : `(?:(?:\\./)?${esc(LEGACY)}|${esc(join(root, LEGACY))})`;
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
    /\bsed\b[^|;&]*\s-i|\bperl\b[^|;&]*\s-\w*i|\btee\b|\b(mv|cp|rm|truncate|mkdir|touch)\b/.test(cmd);
  if (namesIt && writes) {
    deny(`change the backlog (${kanbanActive ? `${KANBAN}/` : LEGACY}) with the Edit or Write tool, not the shell, so the edit can be checked.`);
  }
  process.exit(0);
}

// ---- Edit / Write / MultiEdit on a backlog file ----
if (!args.file_path) process.exit(0);
const rel = relative(root, resolve(root, args.file_path)).split('\\').join('/');
const inBacklog = current ? current.files.includes(rel) : false;
// writing kanban/README.md while BACKLOG.md is still the backlog switches over to kanban/
const switchesOver = !kanbanActive && rel === README;
// An epic file the README doesn't link yet isn't part of the backlog, so it can
// be written freely; linking it from the README is the edit that gets checked.
if (!inBacklog && !switchesOver) process.exit(0);

let before = '';
try {
  before = readFileSync(join(root, rel), 'utf8');
} catch {
  // a new file: nothing to compare against
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

const next = loadBacklog(root, { [rel]: after });
if (next.mode === 'kanban' && next.missing.length) {
  deny(`${README} links ${next.missing.join(', ')}, which doesn't exist. Create the file, or take the link out.`);
}

const { problems, completed } = checkEdit(current?.text ?? '', next.text);
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
