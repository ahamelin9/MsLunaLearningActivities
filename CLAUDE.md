# Ms. Luna: notes for Claude

Ms. Luna's Learning Pad is a web app for iPads, for an ESL teacher's reading
groups (Kindergarten to 2nd grade). Reading is the whole app. Alex builds it
with Claude, and the teacher picks the look. Every session reads this first,
on Alex's Mac or in a cloud session (`docs/cloud-sessions.md`).

## Where things live

| For | Read |
|---|---|
| What to work on, and how a ticket is done, closed and committed | the `backlog` skill and `kanban/` (`README.md` has Now/Next and the board) |
| Anything visual | the `luna-design` skill, then `docs/design-system/` |
| A problem that may have been solved before | the `know-how` skill |
| Where a learning, preference or decision goes; the end of a session | the `wrap-up` skill |
| Whether a request fits the agenda | the `focus` skill |
| Luna's lines waiting to be rendered on the Mac | the `voice-queue` skill |
| Working the board on your own ("auto mode", "keep going until the limit") | the `away-mode` skill |
| Working from a cloud session | `docs/cloud-sessions.md` |

The hooks in `.claude/settings.json` bring in the agenda with every message
(including where the session runs), guard the backlog, and check every UI
edit. Never work around a refusal: fix what it names, or ask Alex.

## How a ticket goes

1. Read its Why / How / Complete when and the files it names. If the How is
   wrong or incomplete once in the code, tell Alex before building, as a short
   list with a recommendation for each; split a ticket that turns out L.
2. Set it In progress. Change `kanban/` only with Edit or Write.
3. Plan from its round 2 board, if it has one
   (`.claude/skills/luna-design/prototype/shots/`): its contents are the plan.
4. Take the "before" shots (light and dark) before touching `src`.
5. Build only what it asks, from the kit and the roles. Extra ideas become
   new tickets.
6. Take the "after" shots, run its Complete when as a ✅/❌ checklist with
   evidence, and send a review sheet: before, after in light and dark, any
   state the shots don't reach, and the board beside ours. Say what still
   looks old and which ticket restyles it. Stop for Alex's OK.
7. On his OK, close it out (the backlog skill), then end with the stage's
   table (done / next / after), what still looks old, and the two commits:
   code, then close-out. Who runs git: the backlog skill's **Git** section.

## Guardrails every change keeps

- **Heard, never shown:** the target letter, sound or word is never on screen
  before the round is solved, at any grade; hints are spoken.
- **The voice stays pre-rendered:** no speech made on the device. Every line
  is a whole `{ text }` part; after a change, `npm run voice:render` and
  `npm run voice:audit` (or the voice queue).
- **Kit and tokens:** values live only in `src/styles/tokens/`, and everything
  on screen is built from `src/components/kit/`.
- **Nothing personal in the repo:** it's public on GitHub.
