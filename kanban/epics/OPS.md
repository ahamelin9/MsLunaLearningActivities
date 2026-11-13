# OPS — Housekeeping (anytime)

### OPS-11 · A first cloud session (parked)
Task · P2 · M
- **Why:** the rest of OPS-10, parked by Alex on 2026-10-17: the cloud set-up was taking time away from building the app, and he hasn't needed to work away from the Mac yet. OPS-10 left the groundwork in the repo (one Chrome helper, the boards as pictures, `CLAUDE.md`, the backlog's **Git** section, the `voice-queue` skill, `docs/cloud-sessions.md`). Pick this up only if Alex wants to work from claude.ai/code.
- **How:**
  - **Claude's notes into the repo:** the notes in the Mac's memory (git rules, follow the board, the teacher's tastes, the stage table…) move into `.claude/memory/`, indexed from `CLAUDE.md`; the Mac's memory keeps only a pointer, and the `wrap-up` skill sends new notes there. Leave out anything personal: the repo is public. On 2026-10-17 the auto-mode safety check refused copying them (private memory into a public repo), so Alex allows those writes first.
  - **The cloud environment:** Alex sets up the setup script and the network access in `docs/cloud-sessions.md`.
  - **The first run:** that page's "The first cloud session" steps, noting in its table how review sheets reach Alex and whether `voice:render` reaches the model.
- **Complete when:**
  - `.claude/memory/` holds every note, `CLAUDE.md` indexes them, and the Mac's memory only points at them;
  - a cloud session passes `npm run lint` and `kit-check.mjs`, runs `ui:shots` with the emoji drawn, and a review sheet reaches Alex;
  - `docs/cloud-sessions.md` says which way the review sheet came and whether the voice model was reachable.

