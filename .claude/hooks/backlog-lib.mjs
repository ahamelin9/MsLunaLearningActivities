// Reads the backlog and checks it against its own rules. Shared by the agenda
// hook (backlog-focus.mjs), the edit guard (backlog-guard.mjs) and the
// app-updates collector, so they always agree on what the board says.
//
// The backlog lives in kanban/: README.md (how to read it, roadmap, Now/Next
// and the board), one file per epic in kanban/epics/ (linked from the README,
// in board order), and CHANGELOG.md. The loader joins them into one text, so
// the parser and the rules below work on the whole backlog at once. Before the
// kanban/ folder existed it was a single BACKLOG.md at the repo root; the
// loader still reads that if kanban/README.md is missing.

import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

export const KANBAN = 'kanban';
export const README = `${KANBAN}/README.md`;
export const CHANGELOG = `${KANBAN}/CHANGELOG.md`;
export const LEGACY = 'BACKLOG.md';

/** The epic files the README links to, in order: "epics/DES.md" → "kanban/epics/DES.md". */
export const epicLinks = readme => [
  ...new Set([...readme.matchAll(/\]\((?:\.\/)?(epics\/[A-Za-z0-9_-]+\.md)\)/g)].map(m => `${KANBAN}/${m[1]}`))
];

/**
 * Joins the backlog's files into one text. `read(path)` returns a file's text
 * (path relative to the repo root) and throws when it is missing.
 * Returns the text, the mode ("kanban" or "single"), the files read, and any
 * linked epic file that is missing.
 */
export function assembleBacklog(read) {
  let readme;
  try {
    readme = read(README);
  } catch {
    return { text: read(LEGACY), mode: 'single', files: [LEGACY], missing: [] };
  }
  const epics = epicLinks(readme);
  const missing = [];
  const parts = [readme];
  for (const file of epics) {
    try {
      parts.push(read(file));
    } catch {
      missing.push(file);
    }
  }
  let changelog = '';
  try {
    changelog = read(CHANGELOG);
  } catch {
    missing.push(CHANGELOG);
  }
  parts.push(changelog);
  return { text: parts.join('\n\n'), mode: 'kanban', files: [README, ...epics, CHANGELOG], missing };
}

/**
 * The backlog as it is on disk under `root`. `overrides` maps a repo-relative
 * path to the text it would have after an edit, so the guard can check an edit
 * before it lands. Also lists epic files that exist but aren't linked.
 */
export function loadBacklog(root, overrides = {}) {
  const read = rel => (rel in overrides ? overrides[rel] : readFileSync(join(root, rel), 'utf8'));
  const result = assembleBacklog(read);
  let unlinked = [];
  if (result.mode === 'kanban') {
    const dir = join(root, KANBAN, 'epics');
    const onDisk = existsSync(dir) ? readdirSync(dir).filter(f => f.endsWith('.md')).map(f => `${KANBAN}/epics/${f}`) : [];
    const pending = Object.keys(overrides).filter(p => p.startsWith(`${KANBAN}/epics/`));
    unlinked = [...new Set([...onDisk, ...pending])].filter(f => !result.files.includes(f));
  }
  return { ...result, unlinked };
}

const ID = '[A-Z]+-\\d+[a-z]?';
const STATUSES = ['Todo', 'In progress', 'Blocked'];

const cells = line =>
  line
    .split('|')
    .slice(1, -1)
    .map(c => c.replace(/\*\*/g, '').trim());

/** True when `text` names `id` as a whole ticket ID (DES-1 is not DES-10 or DES-1a). */
export const mentions = (text, id) => new RegExp(`(^|[^A-Za-z0-9-])${id}(?![A-Za-z0-9])`).test(text);

export function parseBacklog(text) {
  const lines = text.split('\n');

  // Roadmap row marked "now": | **1 — now** | Design foundation | DES | ... |
  const phaseRow = lines.find(l => /^\|\s*\*{0,2}\d+\s*—\s*now/i.test(l));
  const [phaseCell, focus, epics] = phaseRow ? cells(phaseRow) : [];
  const phase = phaseCell ? `Phase ${phaseCell.replace(/\s*—\s*now/i, '')} — ${focus} (${epics})` : 'unknown';

  const field = name => text.match(new RegExp(`^- \\*\\*${name}:\\*\\*\\s*(.+)$`, 'm'))?.[1].trim() ?? '—';

  // Board rows: | ID | Title | Type | P | Size | Status |
  const tickets = lines
    .filter(l => new RegExp(`^\\|\\s*${ID}\\s*\\|`).test(l))
    .map(cells)
    .filter(c => c.length >= 6)
    .map(([id, title, type, priority, size, status]) => ({ id, title, type, priority, size, status }));

  // Ticket sections: "### DES-1 · Title" up to the next heading (an epic file
  // starts with "# ", so a section never runs into the next file)
  const sections = new Map();
  let current = null;
  for (const line of lines) {
    if (/^#{1,3} /.test(line)) {
      const m = line.match(new RegExp(`^### (${ID}) `));
      current = m ? m[1] : null;
      if (current) sections.set(current, []);
      continue;
    }
    if (current) sections.get(current).push(line);
  }

  const changelogAt = text.search(/^#{1,2} Changelog\s*$/m);
  const changelog = changelogAt >= 0 ? text.slice(changelogAt) : '';

  return { phase, now: field('Now'), next: field('Next'), tickets, sections, changelog };
}

/** Changelog lines that close a ticket: they name it and say Done or Won't do. */
function closingLines(changelog, id) {
  return changelog
    .split('\n')
    .filter(l => mentions(l, id) && (/\bDone\b/.test(l) || /Won.t do/i.test(l)));
}

/**
 * The backlog's rules. `blocking` problems stop an edit that introduces them;
 * `warnings` are leftovers expected mid-way through deleting a ticket, shown
 * with the agenda until they are tidied.
 */
export function checkBacklog(text) {
  const { tickets, sections, changelog } = parseBacklog(text);
  const blocking = [];
  const warnings = [];
  const onBoard = new Set();

  for (const t of tickets) {
    if (onBoard.has(t.id)) blocking.push(`${t.id} appears twice on the board.`);
    onBoard.add(t.id);

    if (!STATUSES.some(s => t.status.startsWith(s))) {
      blocking.push(
        `${t.id} has status "${t.status}". Use Todo, In progress or Blocked; a finished ticket is deleted, not marked Done.`
      );
    }

    const body = sections.get(t.id);
    if (!body) blocking.push(`${t.id} is on the board but has no "### ${t.id}" section.`);
    else if (!body.some(l => l.includes('**Complete when:**'))) {
      blocking.push(`${t.id} has no "**Complete when:**" line.`);
    }
  }

  const active = tickets.filter(t => t.status.startsWith('In progress'));
  if (active.length > 1) {
    blocking.push(`Only one ticket may be In progress; found ${active.map(t => t.id).join(', ')}.`);
  }

  for (const [id, body] of sections) {
    if (!onBoard.has(id)) warnings.push(`Section "### ${id}" is left over: ${id} is no longer on the board.`);
    const needs = body.join('\n').match(/needs:\s*([^\n]*)/)?.[1].split(' · ')[0] ?? '';
    for (const dep of needs.match(new RegExp(ID, 'g')) ?? []) {
      if (!onBoard.has(dep)) warnings.push(`${id} still needs ${dep}, which is no longer on the board.`);
    }
  }

  return { blocking, warnings, onBoard, changelog };
}

/**
 * Problems an edit from `before` to `after` would introduce. Problems already
 * in `before` never block, so a broken backlog can always be repaired.
 */
export function checkEdit(before, after) {
  const was = checkBacklog(before);
  const now = checkBacklog(after);
  const problems = now.blocking.filter(p => !was.blocking.includes(p));

  const removed = [...was.onBoard].filter(id => !now.onBoard.has(id));
  const added = [...now.onBoard].filter(id => !was.onBoard.has(id));
  const completed = [];

  for (const id of removed) {
    const closing = closingLines(now.changelog, id);
    if (closing.length === 0) {
      problems.push(`${id} was removed from the board without a Changelog line naming it with "Done" or "Won't do".`);
    } else if (closing.some(l => !/Won.t do/i.test(l))) {
      completed.push(id);
    }
  }

  for (const id of added) {
    if (mentions(was.changelog, id)) {
      problems.push(`${id} is already used in the Changelog; IDs are never reused, so take the next free number.`);
    }
  }

  return { problems, completed };
}
