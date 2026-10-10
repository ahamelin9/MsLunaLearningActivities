declare module 'claude-code' {
  interface PluginState {
    'luna-board': {
      /** The backlog (kanban/ files joined) as last read; '' before the first read or when missing. */
      text: string
      /** Show every Todo ticket, not just Now, Next and P0. */
      showAll: boolean
    }
  }
}

export type ShowAll = boolean
