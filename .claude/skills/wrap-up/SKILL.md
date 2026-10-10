---
name: wrap-up
description: Where Ms. Luna learnings go, and the end-of-session wrap-up so nothing learned is lost. Use when Alex says "wrap up", "that's it for today", "save what we learned", "don't lose this", or asks where a learning, decision, preference or script belongs (memory, a skill, the backlog, or the docs).
---

# Wrap-up: where learnings go

Every learning has one home. Put it there once, link to it from elsewhere if
needed, and never keep two copies that can drift apart. Before adding, look
for an existing entry and update it instead.

## Where each kind of learning goes

| What you learned | Where it goes | Example |
|---|---|---|
| How Alex wants to work: a preference, a correction, a "do it this way" | **Memory**, type `feedback` (with **Why** and **How to apply**) | Alex does all git himself; Claude only suggests commit messages |
| Who Alex or the teacher is, or what they like | **Memory**, type `user` or `project` | The teacher's favourite flower is a red rose |
| A link to something outside the repo | **Memory**, type `reference`, plus the skill that uses it | The style sample canvas URL |
| Progress, a decision or a new idea for a ticket | **`BACKLOG.md`** through the `backlog` skill (OPS-4 will move it to `kanban/`) | "Teacher (2026-10-09): no rainbow" on DES-2 |
| A problem that took troubleshooting: symptom, cause, fix, check | **`know-how` skill** | Luna sounds like the browser voice |
| Design direction, design decisions, how to change the prototype | **`luna-design` skill**; `docs/design-standards.md` once final | Moon gold is the only off-palette colour |
| A process we will repeat | **A skill**: a section in the closest one, or a new skill if none fits | This wrap-up |
| A reusable script | **Next to the skill that uses it**, never the scratchpad (it's deleted after the session) | `luna-design/prototype/gen.py` |
| What changed today, for the teacher | **`app-updates` skill** (`/app-updates`) | The end-of-day note for Apple Notes |
| Something the code or git history already says | **Nowhere**: don't save it | The file layout of `src/` |
| Something that only mattered in this conversation | **Nowhere** | A typo fixed along the way |

**Memory or a skill?** Memory is loaded every session but holds short facts
and pointers. A skill is loaded when its topic comes up and holds the long
version: steps, tables, scripts. When both are needed, the memory is one line
that points to the skill (see `voice-reload-after-render` in memory).

**Memory files:** `~/.claude/projects/-Users-alex-Random-Projects-MsLunaLearningActivities/memory/`.
One fact per file, with frontmatter (`name`, `description`, `metadata.type`),
and a one-line pointer in `MEMORY.md`. Link related memories with `[[name]]`.
Convert relative dates ("tomorrow") to real ones.

## End-of-session checklist

1. **Tickets:** with the `backlog` skill, add progress notes and decisions to the tickets you touched, set the right status (Blocked with a reason if waiting), and refresh **Now / Next**.
2. **Learnings:** go back through the session and route each one with the table above. Look for these in particular:
   - Alex's corrections and preferences, and anything he said "from now on" about;
   - the teacher's feedback and tastes;
   - anything that took more than one try to get right (that's a `know-how` entry);
   - scripts still in the scratchpad.
3. **Stale notes:** fix or delete memory or skill text that today proved wrong, such as "X is next" when it no longer is.
4. **Commit message:** suggest one, starting with the ticket ID. Alex does all git himself on `main`; never run add, commit, push or branch.
5. **Teacher note (optional):** offer `/app-updates` if something changed that she'd notice.
6. **Report:** a short list of what went where, so Alex can check it.
