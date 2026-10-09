// Ms. Luna's backlog (BACKLOG.md) as a live task board.
//
// - A "Board" button in the prompt footer, beside the mode labels, and the
//   /board command, both toggle the board pane.
// - The board re-reads BACKLOG.md every few seconds and after every tool call,
//   so it follows edits made by Claude or by hand.
// - The status line shows the ticket being worked on (In progress, else Now).
// - A toast says when a ticket leaves the board as Done.
//
// BACKLOG.md stays the only source of truth: the board only reads it.

import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register, RenderChildren } from 'claude-code'

import { parseBacklog, closedAs, ticketsIn, todayIn } from './backlog'
import type { Ticket } from './backlog'

const PANE = 'luna-board'
const FILE = 'BACKLOG.md'
const POLL_MS = 3000

const text = atom({ plugin: 'luna-board', key: 'text' } as const, '')
const showAll = atom({ plugin: 'luna-board', key: 'showAll' } as const, false)

// Ticket IDs on the board at the last read, to notice one that leaves.
let onBoard: Set<string> | undefined

async function refresh($: EngineInterface) {
  let next = ''
  try {
    next = await $.fs.read(FILE)
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

async function toggle($: EngineInterface) {
  const isOpen = (await $.ui.panes()).some(p => p.id === PANE)
  if (isOpen) {
    await $.ui.close({ id: PANE })
    return false
  }
  await refresh($)
  await $.ui.open({ id: PANE, title: 'Ms. Luna board' })
  return true
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: 'board',
      description: "Show or hide Ms. Luna's task board (from BACKLOG.md)",
    })
    await refresh($)
    $.clock.every(POLL_MS, () => refresh($).catch(() => undefined))

    return next(e)
  })

  on('command.run', { command: 'board' }, async $ => {
    const opened = await toggle($)

    return { text: opened ? 'Board opened.' : 'Board closed.' }
  })

  on('tool.call', async ($, e, next) => {
    const ran = await next(e)
    await refresh($).catch(() => undefined)

    return ran
  })

  // The Board button, beside the mode labels at the right of the prompt footer.
  on('ui.render', { component: 'SessionMode' }, async ($, e, next) => {
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
    const { Box, Text, Button } = $.ui.resolve(e)
    const source = await read($, text)
    const all = await read($, showAll)

    if (!source) {
      return <Text dimColor>No {FILE} in this project.</Text>
    }

    const b = parseBacklog(source)
    const nowIds = ticketsIn(b.now, b.tickets).map(t => t.id)
    const nextIds = ticketsIn(b.next, b.tickets).map(t => t.id)
    const inProgress = b.tickets.filter(t => t.status.startsWith('In progress'))
    const blocked = b.tickets.filter(t => t.status.startsWith('Blocked'))
    const todo = b.tickets.filter(t => t.status.startsWith('Todo'))
    const upNext = [...nowIds, ...nextIds]
      .map(id => todo.find(t => t.id === id))
      .filter((t): t is Ticket => t !== undefined)
    const rest = todo.filter(t => !upNext.includes(t))
    const restShown = all ? rest : rest.filter(t => t.priority === 'P0')
    const done = todayIn(b.changelog, new Date())
    const width = e.props.bodyColumns ?? e.viewport?.columns ?? 40
    const isWide = width >= 110

    const card = (t: Ticket, tag?: string) => (
      <Box key={t.id} flexDirection="column" borderStyle="round" borderDimColor paddingX={1}>
        <Text>
          <Text bold color={t.priority === 'P0' ? 'error' : t.priority === 'P1' ? 'warning' : undefined}>
            {t.id}
          </Text>
          <Text dimColor>
            {' '}
            {t.type} · {t.priority}
            {t.size && t.size !== '—' ? ` · ${t.size}` : ''}
          </Text>
          {tag && <Text color="success"> {tag}</Text>}
        </Text>
        <Text wrap="wrap">{t.title}</Text>
      </Box>
    )

    const column = (title: string, count: number, children: RenderChildren) => (
      <Box key={title} flexDirection="column" flexGrow={1} flexShrink={1} width={isWide ? '25%' : '100%'} gap={0}>
        <Text bold>
          {title} <Text dimColor>{count}</Text>
        </Text>
        {count === 0 && <Text dimColor>—</Text>}
        {children}
      </Box>
    )

    return (
      <Box flexDirection="column" gap={1}>
        <Box flexDirection="column">
          <Text dimColor>{b.phase}</Text>
          <Text>
            <Text bold>Now:</Text> {b.now}
          </Text>
          <Text wrap="wrap">
            <Text bold>Next:</Text> {b.next}
          </Text>
        </Box>

        <Box flexDirection={isWide ? 'row' : 'column'} gap={isWide ? 2 : 1}>
          {column(
            'To do',
            todo.length,
            <Box flexDirection="column">
              {upNext.map(t => card(t, nowIds.includes(t.id) ? 'NOW' : 'NEXT'))}
              {restShown.map(t => card(t))}
              {rest.length > 0 && (
                <Button
                  key="luna-board-show-all"
                  plain
                  hotkey="a"
                  onPress={() => update($, showAll, v => !v)}
                >
                  {all ? 'Show only P0' : `Show all (${rest.length - restShown.length} more P1/P2)`}
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
