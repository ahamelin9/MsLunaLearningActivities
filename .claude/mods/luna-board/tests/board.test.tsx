import { expect, test } from 'claude-code/testing'

const backlog = (status: string, done = '') => `# Backlog

| Phase | Focus | Epics | Why |
|---|---|---|---|
| **1 — now** | Design foundation | DES | x |

- **Now:** BUG-6
- **Next:** BUG-15, then DES-2

## Board

| ID | Title | Type | P | Size | Status |
|---|---|---|---|---|---|
| DES-2 | Write the design standards | Story | P0 | M | Blocked |
| DES-3 | One set of design tokens | Story | P0 | M | Todo |
| BUG-6 | Treasure Path reads the missing word | Bug | P1 | S | ${status} |
${done ? '' : '| BUG-15 | Games read the text first | Bug | P1 | S | Todo |\n'}| BUG-9 | Warm-up plays one story twice | Bug | P2 | S | Todo |

## Changelog

${done}
`

test('the board follows the backlog, and the footer button opens it', async ($, on) => {
  let file = backlog('Todo')
  on('fs.read', async () => ({ value: file }))
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

  const ui = await $.ui.mount({ plugin: 'luna-board', surface: 'desktop', ...PANE, requestId: 'luna-board' })
  expect(await ui.find({ type: 'Text', text: /Phase 1 — Design foundation/ })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: /NOW/ })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: /DES-3/ })).toBeDefined()
  // P2 tickets wait behind "Show all"
  expect(await ui.find({ type: 'Text', text: /BUG-9/ })).toBeUndefined()
  await ui.press({ key: 'luna-board-show-all' })
  expect(await ui.find({ type: 'Text', text: /BUG-9/ })).toBeDefined()
  await ui.unmount()

  // BUG-15 finishes: it leaves the board and shows under Done today
  const pad = (n: number) => String(n).padStart(2, '0')
  const d = new Date()
  const today = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
  file = backlog('In progress', `- **${today}** — BUG-15 Games read the text first — Done`)
  await $.command.run(BOARD) // closes
  expect(open.has('luna-board')).toBe(false)
  await $.command.run(BOARD) // re-reads and opens
  const after = await $.ui.mount({ plugin: 'luna-board', surface: 'terminal', ...PANE, requestId: 'luna-board' })
  expect(await after.find({ type: 'Text', text: /✓ BUG-15/ })).toBeDefined()
  expect(await after.find({ type: 'Text', text: /In progress/ })).toBeDefined()
  await after.unmount()
})
