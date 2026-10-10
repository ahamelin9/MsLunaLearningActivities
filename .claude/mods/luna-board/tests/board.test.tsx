import { expect, test } from 'claude-code/testing'

// The backlog as the kanban/ folder: the README (roadmap, Now/Next, the board,
// links to the epic files), the epic files, and the changelog.
const backlog = (status: string, done = ''): Record<string, string> => ({
  'kanban/README.md': `# Ms. Luna — Kanban

| Phase | Focus | Epics | Why |
|---|---|---|---|
| **1 — now** | Design foundation | DES | x |

- **Now:** BUG-6
- **Next:** BUG-15, then DES-2

## Epics

- [DES](epics/DES.md)
- [BUG](epics/BUG.md)

## Board

| ID | Title | Type | P | Size | Status |
|---|---|---|---|---|---|
| **DES** | **Design system & layout** | Epic | **P0** | | |
| DES-2 | Write the design standards | Story | P0 | M | Blocked |
| DES-3 | One set of design tokens | Story | P0 | M | Todo |
| **BUG** | **Bugs** | | | | |
| BUG-6 | Treasure Path reads the missing word | Bug | P1 | S | ${status} |
${done ? '' : '| BUG-15 | Games read the text first | Bug | P1 | S | Todo |\n'}| BUG-9 | Warm-up plays one story twice | Bug | P2 | S | Todo |
`,
  'kanban/epics/DES.md': '# DES — Design\n\n### DES-2 · Write the design standards\n\n### DES-3 · One set of design tokens\n',
  'kanban/epics/BUG.md': '# BUG — Bugs\n\n### BUG-6 · Treasure Path reads the missing word\n',
  'kanban/CHANGELOG.md': `# Changelog\n\n${done}\n`,
})

test('the board follows the backlog, and the footer button opens it', async ($, on) => {
  let files = backlog('Todo')
  const reads: string[] = []
  // the engine resolves the board's relative paths, so match on the path's end
  const fileAt = (path: string) => Object.keys(files).find(k => path === k || path.endsWith(`/${k}`))
  on('fs.read', async (_$, e) => {
    const key = fileAt(e.path)
    if (key) reads.push(key)
    return { value: (key && files[key]) || '' }
  })
  // The kit has no pane host: keep the open panes here.
  const open = new Set<string>()
  on('ui.open', async (_$, e) => (open.add(e.id), { value: { isPlaced: true } }))
  on('ui.close', async (_$, e) => (open.delete(e.id), { value: undefined }))
  on('ui.panes', async () => ({
    value: [...open].map(id => ({ id, title: id, isShown: true, isFocused: false, isPlaced: true })),
  }))

  const PANE = {
    component: 'Pane',
    props: {
      title: 'Ms. Luna board',
      isFocused: false,
      bodyColumns: 60,
      placement: 'dock',
      scroll: { offset: 0, bodyRows: 40 },
      view: {},
    },
  } as const
  const BOARD = {
    command: 'board',
    args: '',
    origin: { kind: 'composer' },
    presentation: { isFullscreen: true, columns: 120 },
  } as const
  for (const surface of ['terminal', 'desktop'] as const) {
    const footer = await $.ui.mount({ plugin: 'luna-board', surface, component: 'SessionMode', props: { modes: [] } })
    expect(await footer.find({ key: 'luna-board-toggle' })).toBeDefined()
    await footer.unmount()
  }

  await $.command.run(BOARD)
  expect(open.has('luna-board')).toBe(true)
  // it read the README, each epic file it links, and the changelog
  expect(reads).toContain('kanban/README.md')
  expect(reads).toContain('kanban/epics/DES.md')
  expect(reads).toContain('kanban/epics/BUG.md')
  expect(reads).toContain('kanban/CHANGELOG.md')

  const ui = await $.ui.mount({ plugin: 'luna-board', surface: 'desktop', ...PANE, requestId: 'luna-board' })
  expect(await ui.find({ type: 'Text', text: /Phase 1 — Design foundation/ })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: /NOW/ })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: /DES-3/ })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: /In progress/ })).toBeDefined()
  // P2 tickets wait behind "Show all"
  expect(await ui.find({ type: 'Text', text: /BUG-9/ })).toBeUndefined()
  await ui.press({ key: 'luna-board-show-all' })
  expect(await ui.find({ type: 'Text', text: /BUG-9/ })).toBeDefined()
  await ui.press({ key: 'luna-board-show-all' })

  // Now and Next read as one line each, the ticket's board title; the full notes open on "Why"
  expect(await ui.find({ type: 'Text', text: /Treasure Path reads the missing word/ })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: /then DES-2/ })).toBeUndefined()
  await ui.press({ key: 'luna-board-notes' })
  expect(await ui.find({ type: 'Text', text: /then DES-2/ })).toBeDefined()

  // filtered to one epic: only its tickets, all of them (P2 included), and no "Show all"
  expect(await ui.find({ key: 'luna-board-epic' })).toBeDefined()
  await ui.select({ key: 'luna-board-epic', value: 'BUG' })
  expect(await ui.find({ type: 'Text', text: /DES-3/ })).toBeUndefined()
  expect(await ui.find({ type: 'Text', text: /BUG-9/ })).toBeDefined()
  expect(await ui.find({ key: 'luna-board-show-all' })).toBeUndefined()
  await ui.select({ key: 'luna-board-epic', value: 'all' })
  expect(await ui.find({ type: 'Text', text: /DES-3/ })).toBeDefined()
  await ui.unmount()

  // BUG-15 finishes: it leaves the board and shows under Done today
  const pad = (n: number) => String(n).padStart(2, '0')
  const d = new Date()
  const today = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
  files = backlog('In progress', `- **${today}** — BUG-15 Games read the text first — Done`)
  await $.command.run(BOARD) // closes
  expect(open.has('luna-board')).toBe(false)
  await $.command.run(BOARD) // re-reads and opens
  const after = await $.ui.mount({ plugin: 'luna-board', surface: 'terminal', ...PANE, requestId: 'luna-board' })
  expect(await after.find({ type: 'Text', text: /✓ BUG-15/ })).toBeDefined()
  expect(await after.find({ type: 'Text', text: /In progress/ })).toBeDefined()
  await after.unmount()
})
