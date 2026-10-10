# luna-board

Ms. Luna's backlog (`kanban/`) as a live task board inside Claude Code.

- **▦ Board** button at the right of the prompt footer (or `/board`) shows and
  hides the board: To do (Now and Next first, then P0; "Show all" for P1/P2),
  In progress, Blocked, and Done today.
- Above the lanes, Now and Next read as one line each (the ticket and its
  title); **Why ▸** opens the full notes. The **Epic** dropdown filters every
  lane to one epic, and shows all of that epic's tickets, P1/P2 included.
- `/board list` prints the board in the chat, in any app.
- The board re-reads the backlog every few seconds and after every tool call,
  so it follows changes made by Claude or by hand: `kanban/README.md` (the
  board, Now and Next), the epic files it links in `kanban/epics/`, and
  `kanban/CHANGELOG.md`. It only reads them; the backlog stays the one source
  of truth. (A repo still on the old single backlog file works too.)
- The status line shows the ticket being worked on (In progress, else Now).
- A toast appears when a ticket leaves the board as Done.

## Install (once, on your computer)

In a terminal session of Claude Code:

```
/plugin install luna-board --marketplace ahamelin9/MsLunaLearningActivities
```

Answer `y` to add the marketplace, then pick the user scope. It then loads in
every session, the desktop app's Code tab included.

## Always up to date (Alex's setup, 2026-10-10)

Instead of the installed copy, Claude loads the board straight from this folder,
so every edit shows without reinstalling. In `~/.claude/settings.json`:

```json
"env": {
  "CLAUDE_CODE_PLUGIN_DIRS": "/Users/alex/Random Projects/MsLunaLearningActivities/.claude/mods/luna-board",
  "CLAUDE_CODE_PLUGIN_DIR_WATCH": "1"
},
"enabledPlugins": { "luna-board@ms-luna": false }
```

The second setting makes sessions the desktop app starts reload the board when
the folder changes. The installed copy stays switched off so there's only one
board; to go back, flip it to `true` and remove the two `env` lines.

## Develop

```
claude plugin validate .claude/mods/luna-board
claude plugin test .claude/mods/luna-board
```
