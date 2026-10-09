// Reads BACKLOG.md and checks it against the backlog's own rules. Shared by
// the agenda hook (backlog-focus.mjs) and the edit guard (backlog-guard.mjs)
// so both always agree on what the board says.

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

  // Ticket sections: "### DES-1 · Title" up to the next ## or ### heading
  const sections = new Map();
  let current = null;
  for (const line of lines) {
    if (/^#{2,3} /.test(line)) {
      const m = line.match(new RegExp(`^### (${ID}) `));
      current = m ? m[1] : null;
      if (current) sections.set(current, []);
      continue;
    }
    if (current) sections.get(current).push(line);
  }

  const changelogAt = text.search(/^## Changelog\s*$/m);
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
