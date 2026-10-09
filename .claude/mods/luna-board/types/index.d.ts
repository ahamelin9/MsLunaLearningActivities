declare module 'claude-code' {
  interface PluginState {
    'luna-board': {
      /** BACKLOG.md as last read; '' before the first read or when missing. */
      text: string
      /** Show every Todo ticket, not just Now, Next and P0. */
      showAll: boolean
    }
  }
}

export type ShowAll = boolean
