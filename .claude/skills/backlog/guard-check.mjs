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

// The edits target lines that exist on the board and in epics/DES.md today; if
// one is gone, its case shows as allowed and needs a new target.
const readme = join(root, 'kanban/README.md');
const des = join(root, 'kanban/epics/DES.md');
const edit = (file_path, old_string, new_string) => ({ tool_name: 'Edit', tool_input: { file_path, old_string, new_string } });
const bash = command => ({ tool_name: 'Bash', tool_input: { command } });

const cases = [
  // two In progress at once (DES-2 is Blocked while waiting, so set two others)
  [
    'deny',
    'a second In progress',
    edit(
      readme,
      '| DES-3 | One set of design tokens | Story | P0 | M | Todo |\n| DES-4 | Typography and local fonts | Story | P0 | S | Todo |',
      '| DES-3 | One set of design tokens | Story | P0 | M | In progress |\n| DES-4 | Typography and local fonts | Story | P0 | S | In progress |'
    )
  ],
  ['deny', 'a ticket deleted with no changelog line', edit(readme, '| OPS-1 | Delete dead code | Task | P2 | S | Todo |\n', '')],
  ['deny', 'a ticket losing its Complete when', edit(des, '- **Complete when:** the app shows the right fonts', '- the app shows the right fonts')],
  ['deny', 'a status that is not allowed', edit(readme, '| DES-4 | Typography and local fonts | Story | P0 | S | Todo |', '| DES-4 | Typography and local fonts | Story | P0 | S | Done |')],
  ['deny', 'a link to an epic file that does not exist', edit(readme, '- [OPS — Housekeeping](epics/OPS.md) · anytime', '- [OPS — Housekeeping](epics/OPS.md) · anytime\n- [NEW — Something](epics/NEW.md)')],
  ['deny', 'a shell write into kanban/', bash("sed -i '' 's/Todo/Done/' kanban/README.md")],
  ['deny', 'a shell move of the folder', bash('mv kanban backlog-old')],
  ['deny', 'removing a linked epic file', bash('rm kanban/epics/OPS.md')],
  ['deny', 'removing an epic file plus something else', bash('rm kanban/epics/NEW.md kanban/README.md')],
  ['allow', 'removing an unlinked epic file', bash('rm kanban/epics/NEW.md')],
  ['allow', 'reading kanban/ in the shell', bash('grep -n DES-2 kanban/README.md')],
  ['allow', 'a new, unlinked epic file', { tool_name: 'Write', tool_input: { file_path: join(root, 'kanban/epics/NEW.md'), content: '# NEW — Something\n' } }],
  ['allow', 'a progress note on a ticket', edit(des, '### DES-4 · Typography and local fonts', '### DES-4 · Typography and local fonts')],
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
