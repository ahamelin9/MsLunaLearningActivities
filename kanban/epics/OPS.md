# OPS — Housekeeping (anytime)

### OPS-1 · Delete dead code
Task · P2 · S
- (`src/App.css` and `components/os/AppDock` go with DES-18a and DES-18b, 2026-10-10.)
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
- **Why:** found while closing DES-25 (2026-10-10): `node .claude/skills/backlog/guard-check.mjs "$PWD"` shows 2 cases wrong. "A second In progress" edits a DES-3 row followed by DES-4, but the board now runs DES-3, DES-19; "a ticket losing its Complete when" looks for DES-4's old one-line Complete when, which is now a list. Their edits miss, so the guard never sees them and they show as allowed. The guard itself is fine.
- **How:** point both cases at text that's on the board and in `epics/DES.md` today (two rows next to each other; a one-line `- **Complete when:**`), ideally rows less likely to move, and keep the script's note on what to do when a target goes.
- **Complete when:** the guard check shows all 14 cases as expected.

### OPS-3 · Decide the "Coming Soon" apps
Task · P2 · S
- **Why:** Math, Science and Art are registered, but the home screen only shows Reading, so `ComingSoonApp` can't be reached.
- **Decided (Alex, 2026-10-08):** remove them. This is an ESL teacher's app and reading is the core. Other subjects will never be added. Later apps will only surround ESL reading (activities that support a child's English as a whole), so the home screen leaves room for those, not for school subjects.
- **How:** delete the Math, Science and Art entries from `apps/registry.ts`, `apps/preview/ComingSoonApp.*`, and the unused icons that only they use.
- **Complete when:** the registry holds only Reading, `ComingSoonApp` is gone, and build and lint pass.
