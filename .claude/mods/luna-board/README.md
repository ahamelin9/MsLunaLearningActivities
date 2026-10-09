# luna-board

Ms. Luna's `BACKLOG.md` as a live task board inside Claude Code.

- **▦ Board** button at the right of the prompt footer (or `/board`) shows and
  hides the board: To do (Now and Next first, then P0; "Show all" for P1/P2),
  In progress, Blocked, and Done today.
- `/board list` prints the board in the chat, in any app.
- The board re-reads `BACKLOG.md` every few seconds and after every tool call,
  so it follows changes made by Claude or by hand. It only reads the file;
  the backlog stays the one source of truth.
- The status line shows the ticket being worked on (In progress, else Now).
- A toast appears when a ticket leaves the board as Done.

## Install (once, on your computer)

In a terminal session of Claude Code:

```
/plugin install luna-board --marketplace ahamelin9/MsLunaLearningActivities
```

Answer `y` to add the marketplace, then pick the user scope. It then loads in
every session, the desktop app's Code tab included.

## Develop

```
claude plugin validate .claude/mods/luna-board
claude plugin test .claude/mods/luna-board
```
