---
name: backlog
description: Ms. Luna's project backlog (epics, stories, bugs, priorities, phase order) kept in the kanban/ folder at the repo root. Use when the user asks what to work on next, wants to start, continue or finish a ticket (IDs like DES-3, BUG-2, FB-1), reports a new bug or idea to log, or asks where something stands.
---

# Working the backlog

The backlog lives in `kanban/` at the repo root. It is the source of truth for
what to do and in what order. Read it before answering any "what's next"
question; don't rely on memory of it.

| File | Holds |
|---|---|
| `kanban/README.md` | How to read it, the Completion criteria, the Roadmap, **Now / Next**, the epic list (links to the epic files) and the **board**: every ticket's one status |
| `kanban/epics/<EPIC>.md` | One file per epic: its goal and every ticket's full section (`### DES-3 · Title`, Why / How / Complete when) |
| `kanban/CHANGELOG.md` | Finished and dropped tickets, one line each; the only record once a ticket is deleted |

The files are split **by epic, never by status**. A ticket never moves between
files when its status changes; the status changes in the board row only. The
`/board` pane gives the lane view (To do, In progress, Blocked, Done today).

## Picking what's next

1. Start from **Now / Next** in `kanban/README.md`.
2. Otherwise, take the first `Todo` ticket in the current phase (see **Roadmap**).
   Within a phase, go in board order, and skip any ticket whose `needs:` are
   still on the board. A ticket that's no longer on the board is done.
3. Suggest the ticket with its ID, title, size and a one-line plan, then wait for
   the go-ahead. The user sets priorities. Don't reorder phases or priorities
   unless they ask.
4. Keep only one ticket `In progress` at a time. To weigh a request against
   the agenda, use the `focus` skill.

## Doing a ticket

1. Read the ticket's **Why / How / Complete when** in its epic file, then the
   files it names. Line numbers can drift, so check them before relying on
   them. If the **Complete when** is missing or vague, write a checkable one
   first and show it to Alex.
2. Set the ticket to `In progress` on the board.
3. Before starting, split anything sized **L** into smaller tickets
   (e.g. `DES-9a`, `DES-9b`). Each piece gets its own **Complete when**.
4. Build it.
5. **Completion check:** go through the **Completion criteria** in the README.
   - **A:** check every point of the ticket's **Complete when**.
   - **B:** run the general checks.
   - **C:** get Alex's OK on anything that needs judgement.

   Report it in the reply as a short checklist, each point marked ✅ or ❌ with
   its evidence (command result, clip log, screenshot path). If everything is
   ✅, continue to step 6 right away; only C waits for Alex. If anything is
   ❌, the ticket stays `In progress` (or `Blocked`, with the reason) and is
   **not** deleted.
6. **Delete the finished ticket**, in this order (the guard checks each step):
   1. Add the line to `kanban/CHANGELOG.md`, e.g.
      `- **2026-10-12** — DES-1 Screenshot harness for design review — Done`.
   2. Remove its board row in `kanban/README.md`. The guard runs the build and
      lint first.
   3. Remove its `###` section from its epic file.
   4. Remove its ID from other tickets' `needs:` lines.

   Note anything found along the way as a new ticket. If finishing it took
   troubleshooting, add the how-to to the `know-how` skill
   (`.claude/skills/know-how/`); a hook reminds you when the Done line lands.
7. **Commit message:** suggest one commit per ticket, its message starting
   with the ID (`DES-1: screenshot harness`), so git history lines up with
   the changelog. Alex does all git himself (add, commit, push) on the one
   branch, `main`. Never run those or create branches; just hand over the
   message.
8. **Finishing an epic:** when an epic's last ticket goes, remove the epic's
   board header row, then its link in the README's epic list, then its file
   (`rm kanban/epics/<EPIC>.md` is the one shell change the guard allows, and
   only once the file is unlinked). Log `Epic DES complete` in the changelog.
9. **Finishing a phase:** when a phase has nothing left, move `— now` in the
   Roadmap table to the next phase (the hook reads that marker).
10. Refresh **Now / Next** and **Last updated** in the README.

Status lives **only** in the board table, so update it in one place. Finished
work doesn't stay on the board: the changelog is its only record.

## The guard

`.claude/hooks/backlog-guard.mjs` checks every Edit or Write to a backlog file
before it lands, and refuses one that breaks a rule. It checks the whole
backlog (all the files joined), so a deletion can span the board, an epic file
and the changelog. A refusal comes back starting with "Backlog guard:" and
says why.
- **What it checks:**
  - only Todo, In progress or Blocked as a status, and at most one In progress;
  - no duplicate IDs, and every ticket on the board has a section with **Complete when** in a linked epic file;
  - a deleted ticket needs a changelog line naming it with Done or Won't do;
  - deleting a ticket as Done needs `npm run build` and `npm run lint` clean;
  - an ID already in the changelog can't be reused;
  - the README only links epic files that exist.
- **Shell edits:** shell commands that would write `kanban/` (`sed -i`,
  redirects, `mv`, `rm`, scripts named in the same command) are refused.
  Always use Edit or Write. The one exception is `rm` of an epic file the
  README no longer links. Reading with `grep`, `cat` or `ls` is fine, but
  don't put it in the same command as `node`/`python`, or the guard can't
  tell it's only a read.
- **Leftovers:** a section left behind mid-deletion, a `needs:` pointing at a
  deleted ticket, or an epic file that isn't linked doesn't block. The agenda
  hook lists it as "Backlog needs tidying" until it's fixed.

Never work around a refusal: fix what it names, or ask Alex.

After changing the guard or the backlog's layout, run
`node .claude/skills/backlog/guard-check.mjs "$PWD"`. It feeds the guard 14
pretend edits (nothing is written) and checks each is refused or allowed as it
should be.

## Adding tickets

- Use the next number in the right epic, counting IDs in the changelog too
  (deleted tickets still own their numbers). IDs are never reused.
- Write the section in the epic's file, then add a row to the board table in
  priority order within its epic. The guard needs the section to exist when
  the row appears.
- A dropped ticket is deleted the same way as a finished one, and logged as
  `Won't do: <reason>`.
- Fill in the type, priority and size. Write **Why / How / Complete when**, and
  add `needs:` if the ticket depends on another. **Complete when** must be
  checkable facts (what someone sees, hears or can run), not effort ("worked on
  X").
- For a bug, say whether it was **confirmed** (reproduced) or **likely** (from
  reading the code).
- **A new epic:** create `kanban/epics/<EPIC>.md` (starting `# <EPIC> — Title`,
  then the goal), link it in the README's epic list in board order, then add
  its board header row and tickets. Give it a Roadmap phase if it needs one.

## Guardrails every ticket inherits

- **Heard, never shown.** Targets, sounds and answer words are spoken, never
  written on screen before the round is solved. Hints are spoken as
  `SpeechPart[]`.
- **Voice stays pre-rendered.** No on-device speech or model. Audio work
  belongs in `scripts/voice/`.
- **Keep it simple.** Don't build more than a ticket asks for. Note extra
  ideas as new tickets instead.
