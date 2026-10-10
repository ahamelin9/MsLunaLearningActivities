declare module 'claude-code' {
  interface PluginState {
    'luna-board': {
      /** The backlog (kanban/ files joined) as last read; '' before the first read or when missing. */
      text: string
      /** Show every Todo ticket, not just Now, Next and P0. */
      showAll: boolean
      /** The epic the board is filtered to ("DES"), or 'all'. */
      epic: string
      /** Show the full Now and Next notes, not just their tickets. */
      notes: boolean
    }
  }
}

export type ShowAll = boolean
