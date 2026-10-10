#!/usr/bin/env node
// Gathers the facts for one day's "App Updates" note: the backlog's Changelog
// lines for that date (finished tickets and other notes), tickets that first
// appeared on the board that day, that day's commits, and whether anything is
// still uncommitted. The note itself is written from this by the app-updates
// skill (SKILL.md, next to this file).
//
//   node .claude/skills/app-updates/collect.mjs              today
//   node .claude/skills/app-updates/collect.mjs 2026-10-09   another day

import { execFileSync } from 'node:child_process';
import { assembleBacklog, KANBAN, LEGACY, loadBacklog, parseBacklog } from '../../hooks/backlog-lib.mjs';

const root = process.env.CLAUDE_PROJECT_DIR || process.cwd();
const git = (...args) => {
  try {
    return execFileSync('git', args, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  } catch {
    return '';
  }
};

// the day, in local time
const pad = n => String(n).padStart(2, '0');
const now = new Date();
const date = process.argv[2] ?? `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
  console.error('Usage: collect.mjs [YYYY-MM-DD]');
  process.exit(1);
}
const [y, m, d] = date.split('-').map(Number);
const noteTitle = `App Updates ${m}/${d}/${String(y).slice(2)}`;

const { tickets, changelog } = parseBacklog(loadBacklog(root).text);

// Changelog lines dated that day: "- **2026-10-09** — BUG-5 … — Done. …"
const dayLines = changelog
  .split('\n')
  .filter(l => l.startsWith(`- **${date}**`))
  .map(l => l.replace(/^- \*\*\d{4}-\d{2}-\d{2}\*\* — /, ''));
const done = dayLines.filter(l => /— Done\b/.test(l));
const dropped = dayLines.filter(l => /Won.t do/i.test(l));
const notes = dayLines.filter(l => !done.includes(l) && !dropped.includes(l));

// Tickets on the board now that were not on it before that day began
// (the backlog at that commit: the kanban/ files, or the single BACKLOG.md before the split)
const base = git('rev-list', '-1', `--before=${date} 00:00`, 'HEAD', '--', LEGACY, KANBAN);
const showAt = rev => path => {
  const out = git('show', `${rev}:${path}`);
  if (!out) throw new Error(`${path} not in ${rev}`);
  return out;
};
let before = new Set();
if (base) {
  try {
    before = new Set(parseBacklog(assembleBacklog(showAt(base)).text).tickets.map(t => t.id));
  } catch {
    // no backlog at that commit
  }
}
const added = tickets.filter(t => !before.has(t.id));

const commits = git('log', `--since=${date} 00:00`, `--until=${date} 23:59:59`, '--format=%h %ad %s', '--date=format:%H:%M')
  .split('\n')
  .filter(Boolean);
const uncommitted = git('status', '--porcelain').split('\n').filter(Boolean);

const section = (heading, lines, empty = '(none)') =>
  [`${heading}:`, ...(lines.length ? lines.map(l => `- ${l}`) : [`  ${empty}`]), ''].join('\n');

process.stdout.write(
  [
    `Note title: ${noteTitle}   (facts for ${date})`,
    '',
    section('FINISHED THAT DAY (Changelog, Done)', done),
    section('DROPPED THAT DAY (Changelog, Won\'t do)', dropped),
    section('OTHER CHANGELOG NOTES THAT DAY', notes),
    section(
      'NEW ON THE BOARD (logged that day, not done yet)',
      added.map(t => `${t.id} ${t.title} (${t.type}, ${t.priority}, ${t.status})`)
    ),
    section('COMMITS THAT DAY', commits),
    `UNCOMMITTED NOW: ${uncommitted.length ? `${uncommitted.length} changed file${uncommitted.length === 1 ? '' : 's'}` : 'nothing'}`,
    ''
  ].join('\n')
);
