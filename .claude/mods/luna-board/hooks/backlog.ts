// Reads the backlog the way the project's own hooks do
// (.claude/hooks/backlog-lib.mjs in the Ms. Luna repo), so the board and the
// agenda always agree.
//
// The backlog lives in kanban/: README.md (roadmap, Now/Next and the board),
// one file per epic in kanban/epics/ linked from the README, and
// CHANGELOG.md. They are joined into one text and parsed together. Before
// kanban/ existed it was a single BACKLOG.md, still read if the README is
// missing.

export const README = 'kanban/README.md'
export const CHANGELOG = 'kanban/CHANGELOG.md'
export const LEGACY = 'BACKLOG.md'

/** The epic files the README links to, in order: "epics/DES.md" → "kanban/epics/DES.md". */
export const epicLinks = (readme: string): string[] => [
  ...new Set([...readme.matchAll(/\]\((?:\.\/)?(epics\/[A-Za-z0-9_-]+\.md)\)/g)].map(m => `kanban/${m[1]}`)),
]

/** The whole backlog as one text; '' when there is none. `read` rejects for a missing file. */
export async function loadBacklog(read: (path: string) => Promise<string>): Promise<string> {
  let readme: string
  try {
    readme = await read(README)
  } catch {
    try {
      return await read(LEGACY)
    } catch {
      return ''
    }
  }
  const parts = [readme]
  for (const file of [...epicLinks(readme), CHANGELOG]) {
    try {
      parts.push(await read(file))
    } catch {
      // a missing file: the agenda hook reports it
    }
  }
  return parts.join('\n\n')
}

export type Ticket = {
  id: string
  title: string
  type: string
  priority: string
  size: string
  status: string
}

export type Backlog = {
  phase: string
  now: string
  next: string
  tickets: Ticket[]
  changelog: string
}

const ID = '[A-Z]+-\\d+[a-z]?'

const cells = (line: string) =>
  line
    .split('|')
    .slice(1, -1)
    .map(c => c.replace(/\*\*/g, '').trim())

const mentions = (text: string, id: string) =>
  new RegExp(`(^|[^A-Za-z0-9-])${id}(?![A-Za-z0-9])`).test(text)

export function parseBacklog(text: string): Backlog {
  const lines = text.split('\n')

  const phaseRow = lines.find(l => /^\|\s*\*{0,2}\d+\s*—\s*now/i.test(l))
  const [phaseCell, focus, epics] = phaseRow ? cells(phaseRow) : []
  const phase = phaseCell
    ? `Phase ${phaseCell.replace(/\s*—\s*now/i, '')} — ${focus} (${epics})`
    : ''

  const field = (name: string) =>
    text.match(new RegExp(`^- \\*\\*${name}:\\*\\*\\s*(.+)$`, 'm'))?.[1]?.trim() ?? '—'

  const tickets = lines
    .filter(l => new RegExp(`^\\|\\s*${ID}\\s*\\|`).test(l))
    .map(cells)
    .filter(c => c.length >= 6)
    .map(([id = '', title = '', type = '', priority = '', size = '', status = '']) => ({
      id,
      title,
      type,
      priority,
      size,
      status,
    }))

  const changelogAt = text.search(/^#{1,2} Changelog\s*$/m)
  const changelog = changelogAt >= 0 ? text.slice(changelogAt) : ''

  return { phase, now: field('Now'), next: field('Next'), tickets, changelog }
}

/** The board's tickets named in a Now or Next line, in the order named. */
export function ticketsIn(line: string, tickets: Ticket[]): Ticket[] {
  const ids = line.match(new RegExp(ID, 'g')) ?? []

  return ids.map(id => tickets.find(t => t.id === id)).filter((t): t is Ticket => t !== undefined)
}

/** How the Changelog closed `id`: Done, Won't do, or not at all. */
export function closedAs(changelog: string, id: string): 'done' | 'dropped' | undefined {
  const lines = changelog.split('\n').filter(l => mentions(l, id))
  if (lines.some(l => /Won.t do/i.test(l))) return 'dropped'
  if (lines.some(l => /\bDone\b/.test(l))) return 'done'

  return undefined
}

/** Tickets the Changelog closes as Done on `day` (local date). */
export function todayIn(changelog: string, day: Date): { id: string; title: string }[] {
  const pad = (n: number) => String(n).padStart(2, '0')
  const date = `${day.getFullYear()}-${pad(day.getMonth() + 1)}-${pad(day.getDate())}`

  return changelog
    .split('\n')
    .filter(l => l.startsWith(`- **${date}**`) && /— Done\b/.test(l))
    .map(l => l.replace(/^- \*\*\d{4}-\d{2}-\d{2}\*\* — /, ''))
    .map(l => {
      const m = l.match(new RegExp(`^(${ID})\\s+(.*?)\\s+— Done`))
      return m?.[1] && m[2] ? { id: m[1], title: m[2] } : undefined
    })
    .filter((d): d is { id: string; title: string } => d !== undefined)
}
