# OPS — Housekeeping (anytime)

### OPS-9 · Know-how browser checks find things by `data-shot`
Task · P1 · S · needs: —
- **Why:** found while closing DES-18a (2026-10-11). `speech-check.cjs`, `treasure-check.cjs` and `treasure-fit.cjs` in `.claude/skills/know-how/` find everything by class name (`.ipad-reading-app-card`, `.game-thing`, `.cookie.is-eaten`, `.treasure-option.is-right`…). DES-18b–d turn those into CSS-module names, so the checks stop finding anything partway through the stage. `ui:shots` already moved to `data-shot` names (DES-18a).
- **How:**
  - the walk from home to a game uses the `data-shot` names that exist since DES-18a (`open-reading`, `grade-card`, `hub`, `lesson-tile`, `game-tile`, `tile-title`, `play`, `shell-play`, `round-pips`);
  - the game pieces they read (Feed Luna's cookies; Treasure Path's passage, claim, options and gaps; the speak chip) get `data-shot` names, and their states are read from `data-state` once DES-18c/d have moved them there;
  - the "Selectors that work" list in the know-how skill names only those.
  - **From DES-12 (2026-10-12):** `treasure-check.cjs` couldn't run to judge Treasure Path's new passage pictures (it still clicks `.ipad-reading-app-card`). The harness's clip labels also stick to the first line said (know-how, "Every clip carries the first line's label"); label each clip where it starts.
- **Complete when:** the three checks pass against the moved tree, no class selector is left in them, and the know-how list names only `data-shot` and `data-state`.

### OPS-1 · Delete dead code
Task · P2 · S
- (`src/App.css` went with DES-18a and `components/os/AppDock` with DES-18b, both 2026-10-11.)
- `useUserProgress`
- `getAppById`
- `AppDefinition.component`
- `WindowState`
- Luna's unused `intro` lines, unless FB-2 uses them
- **Complete when:** every listed item is deleted, and build and lint stay clean.

### OPS-2 · README and stale copy
Task · P2 · S
- The README says ~0.8 MB of audio; it's 21 MB.
- Grade Select mentions a "dashboard" that doesn't exist.
- **Complete when:** the README's audio size and layout match the repo, and no screen mentions a dashboard.

### OPS-7 · Drop Treasure Path's leftovers from the sentence bank
Task · P2 · S
- **Why:** since GAME-1b (2026-10-10) Treasure Path plays passages, so each `SENTENCES` item's `key`, `decoys` and `truth` are no longer used by any game. Words Off the Page only needs `text`, `emoji`, `tier` and `alsoFits`. The voice inventory and `voice:audit` still render and check those old wrong words, true/false claims and "what?" gap reads, clips nobody hears any more. CNT-3's "true/false claims copy the sentence" point goes away with them.
- **How:** remove the three fields from `SentenceItem` and `SENTENCES` in `engine/content.ts`, the `SENTENCES` parts of the voice inventory and `scripts/voice/audit.mjs` that read them, and the `SENTENCES` entries in `FILL_INS` in `distractor-check.mjs` (narrow `alsoFits` there to the tier 3 extra tile). Then `npm run voice:render`, which prunes the unused clips.
- **Complete when:** no code reads a sentence's `key`, `decoys` or `truth`; `voice:audit`, `distractor-check.mjs`, build and lint pass; Words Off the Page still plays at every grade.

### OPS-8 · Retarget the backlog guard check's two stale cases
Task · P2 · S
- **Why:** found while closing DES-25 (2026-10-10): `node .claude/skills/backlog/guard-check.mjs "$PWD"` shows 2 cases wrong. "A second In progress" edits a DES-3 row followed by DES-4, but the board now runs DES-3, DES-19; "a ticket losing its Complete when" looks for DES-4's old one-line Complete when, which is now a list. Their edits miss, so the guard never sees them and they show as allowed. The guard itself is fine. (DES-3 closed on 2026-10-11, so its row is gone too; still the same 2 cases.) Since DES-4 closed, a third shows the same way (found in OPS-10, 2026-10-13): "a status that is not allowed" edits DES-4's board row, which is gone.
- **How:** point both cases at text that's on the board and in `epics/DES.md` today (two rows next to each other; a one-line `- **Complete when:**`), ideally rows less likely to move, and keep the script's note on what to do when a target goes.
- **Complete when:** the guard check shows all 14 cases as expected.

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

