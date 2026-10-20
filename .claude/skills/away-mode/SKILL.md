---
name: away-mode
description: How to work Ms. Luna's board on your own for a long stretch, when Alex says "auto mode", "away mode", "keep going until the limit" or "go until the session limit". Use it whenever he hands over and steps away, and when he checks back in ("what's waiting on me?", "any blockers?").
---

# Away mode: working the board while Alex is away

Alex hands over for long stretches and wants as many tickets as possible done
properly, reviewable and committable in one go when he's back. This is how.
The `backlog`, `luna-design` and `wrap-up` skills hold the details; this is
the order of things.

## Ticket by ticket

1. **Pick** the next ticket from **Now / Next** (`backlog` skill). Skip one
   that needs his OK before it starts (a primitive change, new words or
   content without an OKed sample, a "decide here" with no pick).
2. **Run its full process** (CLAUDE.md, "How a ticket goes"): read it against
   the code, before shots, build from the kit and the roles, checks, after
   shots, a review sheet. If the How is wrong or the ticket turns out L,
   write the proposal on the ticket (a recommendation each) and move on.
3. **Prove it:** reproduce a bug before fixing it, and watch each new check
   fail with the fix off (know-how: "Prove the check can fail", and its zsh
   pitfall when swapping files).
4. **Never commit** on the Mac (`git-hands-off`). Set the ticket **Blocked**
   "waits for Alex's OK" (one In progress at a time), and add its section to
   `screenshots/review/HANDOVER.md`: what's built, Complete when ✅/❌/⏳,
   his call, the exact `git add` and message. Keep the "where things stand"
   block at the top current, so a session that ends mid-ticket leaves a clear
   state.
5. **Wrap up** with the `wrap-up` checklist before the next ticket: the
   ticket's notes and Now/Next, every learning routed (memory, know-how,
   `docs/design-system/`, a skill), stale notes fixed, the voice queue.
6. **Log what you find** on the way as new tickets, never extra building.

## When he checks in

- Finish the current step, note where the ticket stands, then give **one
  numbered list** of everything waiting on him, grouped: built and needing
  only his OK; decisions before building; only he can do (a device check, a
  commit). Each line ends with your pick in **bold**. He answers by number.
- Write each answer onto its ticket ("Decided (Alex, date)"), and when he says
  "pushed!", close out the Blocked ones (`backlog` skill), then carry on.

## Starting a run, and ending one

- A new run starts a fresh `HANDOVER.md` (the old one kept as
  `HANDOVER-runN.md`) with the close-out commit for anything he OKed at the
  top.
- At the end, or when he's back: what's done, what's waiting, the commits.
