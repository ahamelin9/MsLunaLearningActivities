#!/usr/bin/env node
// Checks the backlog guard (.claude/hooks/backlog-guard.mjs) still refuses bad
// edits and allows good ones. It feeds the guard pretend edits; nothing is
// written. Run it after changing the guard or the backlog's layout:
//
//   node .claude/skills/backlog/guard-check.mjs "$PWD"
//
// Pass the repo root as an argument rather than naming kanban/ in the
// command: the live guard counts a command that names kanban/ and runs node
// as a write.

import { spawnSync } from 'node:child_process';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const root = process.argv[2] ?? process.cwd();
const guard = join(root, '.claude/hooks/backlog-guard.mjs');
const run = input => {
  const r = spawnSync('node', [guard], {
    input: JSON.stringify(input),
    encoding: 'utf8',
    env: { ...process.env, CLAUDE_PROJECT_DIR: root }
  });
  if (r.status !== 0) return `error: ${r.stderr.trim().split('\n').pop()}`;
  if (!r.stdout.trim()) return 'allowed';
  return 'denied: ' + JSON.parse(r.stdout).hookSpecificOutput.permissionDecisionReason.slice(0, 140);
};

// The edits are built from what's on the board today, so tickets closing don't
// leave a case aiming at nothing. An edit that matches no text would show as
// allowed whatever the guard does, so a target that can't be found stops the
// check rather than passing it.
const readme = join(root, 'kanban/README.md');
const epics = join(root, 'kanban/epics');
const edit = (file_path, old_string, new_string) => ({ tool_name: 'Edit', tool_input: { file_path, old_string, new_string } });
const bash = command => ({ tool_name: 'Bash', tool_input: { command } });

const board = readFileSync(readme, 'utf8');
const found = (what, value) => {
  if (!value) throw new Error(`guard-check: no ${what} on the board today, so a case has nothing to aim at`);
  return value;
};
const todo = '\\| [A-Z]+-\\w+ \\|[^\\n]*\\| Todo \\|';
const [, firstTodo, secondTodo] = found('two Todo rows next to each other', board.match(new RegExp(`(${todo})\\n(${todo})`)));
const oneTodo = found('Todo row', board.match(new RegExp(todo)))[0];
const inProgress = row => row.replace('| Todo |', '| In progress |');
const opsLink = found('OPS epic link', board.match(/- \[OPS[^\n]*/))[0];
// a ticket's one-line Complete when, in whichever epic has one today (a list
// one, like OPS-11's, can't lose its label in one line), and a heading to leave
// as it is
const oneLine = /- \*\*Complete when:\*\* [^\n]+/;
const cwFile = found('one-line Complete when in any epic', readdirSync(epics)
  .filter(name => name.endsWith('.md'))
  .map(name => join(epics, name))
  .find(file => oneLine.test(readFileSync(file, 'utf8'))));
const completeWhen = readFileSync(cwFile, 'utf8').match(oneLine)[0];
const opsFile = join(epics, 'OPS.md');
const ops = readFileSync(opsFile, 'utf8');
const heading = found('ticket in the OPS epic', ops.match(/### [^\n]+/))[0];

const cases = [
  [
    'deny',
    'a second In progress',
    edit(readme, `${firstTodo}\n${secondTodo}`, `${inProgress(firstTodo)}\n${inProgress(secondTodo)}`)
  ],
  ['deny', 'a ticket deleted with no changelog line', edit(readme, `${oneTodo}\n`, '')],
  ['deny', 'a ticket losing its Complete when', edit(cwFile, completeWhen, completeWhen.replace('- **Complete when:** ', '- '))],
  ['deny', 'a status that is not allowed', edit(readme, oneTodo, oneTodo.replace('| Todo |', '| Done |'))],
  ['deny', 'a link to an epic file that does not exist', edit(readme, opsLink, `${opsLink}\n- [NEW — Something](epics/NEW.md)`)],
  ['deny', 'a shell write into kanban/', bash("sed -i '' 's/Todo/Done/' kanban/README.md")],
  ['deny', 'a shell move of the folder', bash('mv kanban backlog-old')],
  ['deny', 'removing a linked epic file', bash('rm kanban/epics/OPS.md')],
  ['deny', 'removing an epic file plus something else', bash('rm kanban/epics/NEW.md kanban/README.md')],
  ['allow', 'removing an unlinked epic file', bash('rm kanban/epics/NEW.md')],
  ['allow', 'reading kanban/ in the shell', bash('grep -n DES-2 kanban/README.md')],
  ['allow', 'a new, unlinked epic file', { tool_name: 'Write', tool_input: { file_path: join(root, 'kanban/epics/NEW.md'), content: '# NEW — Something\n' } }],
  ['allow', 'a progress note on a ticket', edit(opsFile, heading, `${heading}\n- A note.`)],
  ['allow', 'a file outside the backlog', edit(join(root, 'src/App.tsx'), 'x', 'y')]
];

let failed = 0;
for (const [want, name, input] of cases) {
  const got = run(input);
  const ok = want === 'allow' ? got === 'allowed' : got.startsWith('denied');
  if (!ok) failed++;
  console.log(`${ok ? '✓' : '✗'} ${want} · ${name}: ${got}`);
}
console.log(failed ? `\n${failed} case(s) wrong` : '\nall cases as expected');
process.exit(failed ? 1 : 0);
