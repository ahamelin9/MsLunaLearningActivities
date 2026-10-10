---
name: focus
description: Keeps Ms. Luna work on the most important task. Use when a request starts work that isn't the current backlog ticket, when the backlog hook's "Focus check" applies, when the user asks "are we on track?", "what matters most?" or "should we do X or Y first?", or when the user invokes /focus.
---

# Focus check

The agenda lives in `kanban/README.md` (Now/Next and the board). A hook (`.claude/hooks/backlog-focus.mjs`)
injects the current phase, Now/Next, the in-progress ticket and the open P0
list with every message, so this check needs no extra reading in the common
case. Ticket mechanics (statuses, changelog, adding tickets) belong to the
`backlog` skill.

**The rule:** Alex decides. When Alex asks for something, do it. The check is a
one-line heads-up, never a refusal, a stall or a second question.

## When to say something

Stay silent (just do the work) if the request is:
- the in-progress ticket, the Now ticket, or another ticket in the current phase;
- a quick fix (about 15 minutes or less) in code we're already touching;
- a question, chat, review or explanation rather than new work;
- something Alex already heard the heads-up for in this session.

Otherwise, open the reply with **one line**:

> Agenda check: next up is DES-2 (P0, Phase 1). This is BUG-6 (P1, Phase 2) /
> not on the board. Going ahead as you asked.

Then do the work. If the request isn't on the board, end the reply by offering
to log it as a ticket, with a suggested ID, priority and size.

## Ranking a request against the agenda

Use the first rule that applies:

1. **Finish what's started.** An in-progress ticket outranks starting anything
   new. Keep at most one ticket `In progress` at a time.
2. **Something is broken right now** (a build failure, a crash, a blank screen):
   fix it first; it outranks the agenda.
3. **Now ticket**, then the current phase in board order.
4. **Open P0 bugs** may be pulled into any phase. They're small and independent
   of the design work.
5. **Everything else:** by phase, then priority.

A request ranks **above** the agenda only under rule 2, or when Alex says it
does. Otherwise, mention where it ranks and still do it.

## When Alex changes priorities

If Alex says something like "do X first from now on", "make this P0" or "skip
DES-5", update the backlog in the same turn:
- the Now/Next lines and the ticket's priority on the board, in `kanban/README.md`;
- a line in `kanban/CHANGELOG.md` with the date and the reason.

The hook then reflects the change on the next message.

## /focus — on-demand review

When Alex invokes `/focus` or asks if we're on track, read `kanban/README.md` and
answer in at most 6 lines:
- what's in progress, and how far along it is;
- whether this session's work matched the agenda, and what drifted;
- the single recommended next ticket and why;
- anything blocked or stale (in progress but untouched) worth closing or
  splitting.
