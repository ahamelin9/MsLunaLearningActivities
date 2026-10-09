#!/usr/bin/env node
// UserPromptSubmit hook: hands Claude the current agenda from BACKLOG.md with
// every message, so a request for other work gets a quick priority check
// (rules in .claude/skills/focus/SKILL.md), plus anything in the backlog that
// breaks its rules, so a half-finished deletion gets tidied. It never blocks
// a prompt, and it stays silent if the backlog is missing or unreadable.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { checkBacklog, parseBacklog } from './backlog-lib.mjs';

const root = process.env.CLAUDE_PROJECT_DIR || process.cwd();

let text;
try {
  text = readFileSync(join(root, 'BACKLOG.md'), 'utf8');
} catch {
  process.exit(0);
}

const { phase, now, next, tickets } = parseBacklog(text);
const { blocking, warnings } = checkBacklog(text);

const inProgress = tickets.filter(t => /^in progress/i.test(t.status));
const blocked = tickets.filter(t => /^blocked/i.test(t.status));
const openP0 = tickets.filter(t => t.priority === 'P0');
const list = ts => (ts.length ? ts.map(t => `${t.id} ${t.title}`).join('; ') : 'none');
const problems = [...blocking, ...warnings];

const context = [
  'Backlog agenda (BACKLOG.md):',
  `- ${phase}`,
  `- Now: ${now} | Next: ${next}`,
  `- In progress: ${list(inProgress)}${blocked.length ? ` | Blocked: ${list(blocked)}` : ''}`,
  `- Open P0: ${openP0.map(t => t.id).join(', ') || 'none'}`,
  ...(problems.length ? [`- Backlog needs tidying: ${problems.join(' ')}`] : []),
  'Focus check (focus skill): if this message starts new work that is not the in-progress or Now ticket, open your reply with one line naming what is next on the agenda and how this request ranks against it, then do what was asked: the user decides. Offer to log untracked work as a ticket. Skip this for questions, chat, and work on the current ticket.'
].join('\n');

process.stdout.write(
  JSON.stringify({ hookSpecificOutput: { hookEventName: 'UserPromptSubmit', additionalContext: context } })
);
