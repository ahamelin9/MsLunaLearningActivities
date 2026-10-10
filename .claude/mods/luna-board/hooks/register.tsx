// Ms. Luna's backlog (kanban/) as a live task board.
//
// - A "Board" button in the prompt footer, beside the mode labels, and the
//   /board command, both toggle the board pane.
// - The board re-reads the backlog every few seconds and after every tool
//   call, so it follows edits made by Claude or by hand.
// - The status line shows the ticket being worked on (In progress, else Now).
// - A toast says when a ticket leaves the board as Done.
//
// The backlog files stay the only source of truth: the board only reads them.

import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register, RenderChildren } from 'claude-code'

import { loadBacklog, parseBacklog, closedAs, epicOf, ticketsIn, todayIn } from './backlog'
import type { Ticket } from './backlog'

const PANE = 'luna-board'
const MISSING = 'No backlog (kanban/README.md) in this project.'
const POLL_MS = 3000

const text = atom({ plugin: 'luna-board', key: 'text' } as const, '')
const showAll = atom({ plugin: 'luna-board', key: 'showAll' } as const, false)
const epicFilter = atom({ plugin: 'luna-board', key: 'epic' } as const, 'all')
const showNotes = atom({ plugin: 'luna-board', key: 'notes' } as const, false)

// Ticket IDs on the board at the last read, to notice one that leaves.
let onBoard: Set<string> | undefined

async function refresh($: EngineInterface) {
  let next = ''
  try {
    next = await loadBacklog(async path => String(await $.fs.read(path)))
  } catch {
    next = ''
  }
  const was = await read($, text)
  // A reload keeps the text but loses onBoard: seed it again without toasts.
  if (next === was && onBoard) return
  if (next !== was) await update($, text, () => next)

  const parsed = parseBacklog(next)
  const ids = new Set(parsed.tickets.map(t => t.id))
  if (onBoard && next && next !== was) {
    for (const id of onBoard) {
      if (ids.has(id)) continue
      const how = closedAs(parsed.changelog, id)
      if (how === 'done') $.ui.toast(`✓ ${id} is done`)
      else if (how === 'dropped') $.ui.toast(`${id} was dropped`)
    }
  }
  onBoard = next ? ids : undefined

  const working = parsed.tickets.find(t => t.status.startsWith('In progress'))
  const now = working ?? ticketsIn(parsed.now, parsed.tickets)[0]
  $.ui.status(now ? `${working ? '▶' : 'Now:'} ${now.id} ${now.title}` : undefined)
}

// Opens the pane, or closes it when it is shown. Says what happened: a pane
// the attached app cannot place stays open but undrawn, with the reason.
async function toggle($: EngineInterface): Promise<{ state: 'opened' | 'closed' } | { state: 'unplaced'; reason: string }> {
  const pane = (await $.ui.panes()).find(p => p.id === PANE)
  if (pane?.isPlaced) {
    await $.ui.close({ id: PANE })
    return { state: 'closed' }
  }
  await refresh($)
  const opened = await $.ui.open({ id: PANE, title: 'Ms. Luna board' })
  return opened.isPlaced ? { state: 'opened' } : { state: 'unplaced', reason: opened.reason }
}

// The board as Markdown, for apps that place no panes: /board prints it.
function boardMarkdown(source: string): string {
  if (!source) return MISSING
  const b = parseBacklog(source)
  const line = (t: Ticket) => `- **${t.id}** ${t.title} · ${t.type} · ${t.priority}`
  const nowIds = ticketsIn(b.now, b.tickets).map(t => t.id)
  const nextIds = ticketsIn(b.next, b.tickets).map(t => t.id)
  const todo = b.tickets.filter(t => t.status.startsWith('Todo'))
  const upNext = [...nowIds, ...nextIds]
    .map(id => todo.find(t => t.id === id))
    .filter((t): t is Ticket => t !== undefined)
  const p0 = todo.filter(t => !upNext.includes(t) && t.priority === 'P0')
  const others = todo.length - upNext.length - p0.length
  const inProgress = b.tickets.filter(t => t.status.startsWith('In progress'))
  const blocked = b.tickets.filter(t => t.status.startsWith('Blocked'))
  const done = todayIn(b.changelog, new Date())
  const list = (ts: string[]) => (ts.length ? ts.join('\n') : '- —')

  return [
    `**${b.phase}**`,
    '',
    `**In progress (${inProgress.length})**`,
    list(inProgress.map(line)),
    '',
    `**Up next**`,
    list(upNext.map(t => `${line(t)}${nowIds.includes(t.id) ? ' — **NOW**' : ''}`)),
    '',
    `**Blocked (${blocked.length})**`,
    list(blocked.map(line)),
    '',
    `**Other P0 to do (${p0.length})**`,
    list(p0.map(line)),
    others > 0 ? `\n_…and ${others} more P1/P2 tickets._` : '',
    '',
    `**Done today (${done.length})**`,
    list(done.map(d => `- ✓ **${d.id}** ${d.title}`)),
  ].join('\n')
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: 'board',
      description: "Show or hide Ms. Luna's task board (from kanban/); /board list prints it in the chat",
    })
    await refresh($)
    $.clock.every(POLL_MS, () => refresh($).catch(() => undefined))

    return next(e)
  })

  on('command.run', { command: 'board' }, async ($, e) => {
    // "/board list" prints the board in the chat, whatever the app can draw.
    if (e.args.trim() === 'list') return { text: boardMarkdown(await read($, text)) }

    const result = await toggle($)
    if (result.state !== 'unplaced') return { text: result.state === 'opened' ? 'Board opened.' : 'Board closed.' }

    // This app draws no panes: show the board here instead.
    return {
      text: `${boardMarkdown(await read($, text))}\n\n_The board pane can't be shown here (${result.reason}), so here it is as text._`,
    }
  })

  on('tool.call', async ($, e, next) => {
    const ran = await next(e)
    await refresh($).catch(() => undefined)

    return ran
  })

  // The Board button, beside the mode labels at the right of the prompt footer.
  on('ui.render', { component: 'SessionMode' }, async ($, e) => {
    const { Box, Text, Button } = $.ui.resolve(e)
    const modes = e.props.modes

    return (
      <Box flexDirection="row" gap={1}>
        {modes.length > 0 && <Text dimColor>{modes.join(' & ')}</Text>}
        <Button key="luna-board-toggle" plain hotkey="b" onPress={() => toggle($)}>
          ▦ Board
        </Button>
      </Box>
    )
  })

  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    const els = $.ui.resolve(e)
    const { Box, Text, Button } = els
    const source = await read($, text)
    const all = await read($, showAll)
    const notes = await read($, showNotes)

    if (!source) {
      return <Text dimColor>{MISSING}</Text>
    }

    const b = parseBacklog(source)
    // only epics with tickets on the board can be picked; a stale pick shows all
    const epics = b.epics.filter(ep => b.tickets.some(t => epicOf(t.id) === ep.id))
    const picked = await read($, epicFilter)
    const epic = epics.some(ep => ep.id === picked) ? picked : 'all'
    const inEpic = (id: string) => epic === 'all' || epicOf(id) === epic
    const tickets = b.tickets.filter(t => inEpic(t.id))

    const nowIds = ticketsIn(b.now, tickets).map(t => t.id)
    const nextIds = ticketsIn(b.next, tickets).map(t => t.id)
    const inProgress = tickets.filter(t => t.status.startsWith('In progress'))
    const blocked = tickets.filter(t => t.status.startsWith('Blocked'))
    const todo = tickets.filter(t => t.status.startsWith('Todo'))
    const upNext = [...nowIds, ...nextIds]
      .map(id => todo.find(t => t.id === id))
      .filter((t): t is Ticket => t !== undefined)
    const rest = todo.filter(t => !upNext.includes(t))
    // one epic is a short list, so it shows whole
    const restShown = all || epic !== 'all' ? rest : rest.filter(t => t.priority === 'P0')
    const done = todayIn(b.changelog, new Date()).filter(d => inEpic(d.id))
    const width = e.props.bodyColumns ?? e.viewport?.columns ?? 40
    // Lanes always sit side by side, like a Jira board. In a narrow pane each
    // card shrinks to its ID, priority and title.
    const compact = width < 110

    const card = (t: Ticket, tag?: string) => (
      <Box key={t.id} flexDirection="column" borderStyle="round" borderDimColor paddingX={1}>
        <Text>
          <Text bold color={t.priority === 'P0' ? 'error' : t.priority === 'P1' ? 'warning' : undefined}>
            {t.id}
          </Text>
          <Text dimColor>
            {' '}
            {compact ? t.priority : `${t.type} · ${t.priority}`}
            {!compact && t.size && t.size !== '—' ? ` · ${t.size}` : ''}
          </Text>
          {tag && <Text color="success"> {tag}</Text>}
        </Text>
        <Text wrap="wrap">{t.title}</Text>
      </Box>
    )

    const column = (title: string, count: number, children: RenderChildren) => (
      <Box key={title} flexDirection="column" flexGrow={1} flexShrink={1} width="25%" gap={0}>
        <Text bold>
          {title} <Text dimColor>{count}</Text>
        </Text>
        {count === 0 && <Text dimColor>—</Text>}
        {children}
      </Box>
    )

    // Now and Next in one line each: the first ticket the line names, by its
    // board title. The full notes (the why, the order after it) open on "Why".
    const headline = (label: string, line: string) => {
      const [first] = ticketsIn(line, b.tickets)
      return (
        <Text key={label} wrap="wrap">
          <Text bold color={label === 'Now' ? 'success' : 'warning'}>
            {label.toUpperCase()}
          </Text>{' '}
          {first ? (
            <Text>
              <Text bold>{first.id}</Text> {first.title}
            </Text>
          ) : (
            line
          )}
        </Text>
      )
    }

    const pickEpic = (value: string) => update($, epicFilter, () => value)
    const epicOptions = [
      { value: 'all', label: `All epics (${b.tickets.length})` },
      ...epics.map(ep => ({
        value: ep.id,
        label: `${ep.id} · ${ep.name} (${b.tickets.filter(t => epicOf(t.id) === ep.id).length})`,
      })),
    ]

    return (
      <Box flexDirection="column" gap={1}>
        <Box flexDirection="column">
          <Text dimColor>{b.phase}</Text>
          {headline('Now', b.now)}
          {headline('Next', b.next)}
          <Button key="luna-board-notes" plain dimColor hotkey="w" onPress={() => update($, showNotes, v => !v)}>
            {notes ? 'Why ▾' : 'Why ▸'}
          </Button>
          {notes && (
            <Box flexDirection="column" paddingLeft={2}>
              <Text wrap="wrap" dimColor>
                <Text bold>Now:</Text> {b.now}
              </Text>
              <Text wrap="wrap" dimColor>
                <Text bold>Next:</Text> {b.next}
              </Text>
            </Box>
          )}
        </Box>

        {'Select' in els ? (
          <els.Select key="luna-board-epic" label="Epic" options={epicOptions} value={epic} onSelect={pickEpic} />
        ) : (
          // the mobile app draws no Select: one chip per epic instead
          <Box flexDirection="row" gap={1} flexWrap="wrap">
            {epicOptions.map(o => (
              <Button key={`luna-board-epic-${o.value}`} plain dimColor={o.value !== epic} onPress={() => pickEpic(o.value)}>
                {o.value === 'all' ? 'All' : o.value}
              </Button>
            ))}
          </Box>
        )}

        <Box flexDirection="row" gap={compact ? 1 : 2}>
          {column(
            'To do',
            todo.length,
            <Box flexDirection="column">
              {upNext.map(t => card(t, nowIds.includes(t.id) ? 'NOW' : 'NEXT'))}
              {restShown.map(t => card(t))}
              {epic === 'all' && rest.length > 0 && (
                <Button
                  key="luna-board-show-all"
                  plain
                  hotkey="a"
                  onPress={() => update($, showAll, v => !v)}
                >
                  {all ? 'Only P0' : `+${rest.length - restShown.length} P1/P2`}
                </Button>
              )}
            </Box>,
          )}
          {column('In progress', inProgress.length, inProgress.map(t => card(t)))}
          {column(
            'Blocked',
            blocked.length,
            blocked.map(t => card(t)),
          )}
          {column(
            'Done today',
            done.length,
            done.map(d => (
              <Box key={d.id} flexDirection="column" borderStyle="round" borderColor="success" paddingX={1}>
                <Text>
                  <Text bold color="success">
                    ✓ {d.id}
                  </Text>
                </Text>
                <Text wrap="wrap">{d.title}</Text>
              </Box>
            )),
          )}
        </Box>
      </Box>
    )
  })
}
