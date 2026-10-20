# Ms. Luna — Kanban

Epics, stories, bugs and tasks for the Learning Pad, in the order we plan to do
them. Built from the full app review on 2026-10-08. The `/backlog` skill
(`.claude/skills/backlog/`) explains how Claude picks up, finishes and adds
tickets.

**This folder:**
- **`README.md`** (this file): how to read it, the roadmap, Now/Next, the epic list and the board. A ticket's status lives **only** in the board below.
- **`epics/<EPIC>.md`**: one file per epic, with its goal and every ticket's full section (Why / How / Complete when). A ticket never moves files when its status changes.
- **`CHANGELOG.md`**: finished and dropped tickets. Once a ticket is deleted, its changelog line is its only record.

**Last updated:** 2026-10-18

## How to read this

| Field | Values |
|---|---|
| **ID** | `EPIC-n`, e.g. `DES-3`, `BUG-2`. IDs never change or get reused. |
| **Type** | Story (user-visible change) · Bug (something broken) · Task (behind the scenes) |
| **Priority** | **P0** must do · **P1** should do · **P2** nice to have |
| **Size** | **S** one sitting · **M** one or two sittings · **L** several sittings, split before starting |
| **Status** | Todo · In progress · Blocked — kept **only** in the board table below. A ticket is **deleted** (board row and its section) once it passes the Completion criteria, and recorded in the changelog. |
| **Complete when** | Each ticket's own finish line: facts someone can check, not effort spent. |

### Completion criteria

A ticket is complete, and only then deleted, when **all three** hold.

**A. Its Complete when is met.** Every point under the ticket's **Complete
when** has been checked, with evidence: command output, the clip log, or
screenshots. Nothing is assumed.

**B. The general checks pass:**
1. `npm run build` and `npm run lint` are clean.
2. Anything that changes what Luna says: `npm run voice:render`, then `npm run voice:audit` passes.
3. Anything visual: before/after screenshots at iPad landscape and portrait (`npm run ui:shots -- --label before`, then `--label after`).
4. Targets stay heard, never shown, and hints stay spoken.
5. No on-device speech or extra runtime audio work (voice stays pre-rendered).
6. Nothing was built beyond the ticket; extra ideas became new tickets.
7. UI work: the design check passes (part of `npm run lint` from DES-19), and the status row in `docs/design-system/README.md` is updated.

**C. Alex signs off where it matters.** Any point that needs judgement
(a design approval, anything marked "reviewed by Alex", how something looks
or sounds) has Alex's OK. Points that can be checked objectively don't wait
for sign-off.

**Then:**
- add one line to `CHANGELOG.md`;
- delete the board row here, and the ticket's section in its epic file;
- remove its ID from other tickets' `needs:`.

If any point fails, the ticket stays `In progress`, or goes to `Blocked` with
the reason written on the ticket.

## Roadmap — when

| Phase | Focus | Epics | Why this order |
|---|---|---|---|
| **1 — now** | Design foundation | DES | Agreed as the next priority. Sets the look, layout and motion that every later screen change builds on. |
| 2 | Feedback & confirmed bugs | FB, BUG P0/P1 | The biggest correctness problems. FB-1 touches GameShell, so it waited for its layout, settled by DES-8 and DES-10 (2026-10-11). |
| 3 | Settings & grown-up area | SET | Keeps a child from breaking play (mute, reset, grade). |
| 4 | Difficulty & content model | LVL, CNT | One content source and an honest difficulty dial, before games and lessons grow. |
| 5 | Games to standard | GAME | Reworks built on FB and CNT. |
| 6 | Curriculum | CUR | More lessons, once content is generated from one bank. |
| 7 | Progress & rewards | PRG | Stars and badges that mean something. |
| 8 | Writing companion app | WRT | A new ESL app next to Reading, starting with punctuation. Built on the restyled shell, the shared feedback path and the difficulty table, so it starts at the standard the reading games reach in Phase 5. |
| anytime | Housekeeping | OPS, BUG P2 | Small and independent. Fill gaps between bigger work. |

The P0 bugs are small and don't depend on the design work, so any of them can
be pulled into Phase 1 for a break from styling.

### Now / Next

- **Now:** PRG-5b's sample sheet as an artifact, Pearl Moon first (Alex wants to see it before it's built). Done 2026-10-20: OPS-12, BUG-28, OPS-13, DES-26, PRG-11, CUR-5, CNT-3, PRG-5a, PRG-2, PRG-10, PRG-9, PRG-4.
- **Next:** CNT-2 (six calls for Alex on the ticket), then CUR-4 and GAME-5; DES-27's 100 pictures after his notes on the first sample; the rest of PRG-5b once its sheet is OKed. The Writing app (WRT) after Phase 7. OPS-11 stays parked.

## Epics

In board order. A new epic gets its file in `epics/` first, then a link here
(the tools only read linked files), then its rows on the board.

- [DES — Design system & layout](epics/DES.md) · Phase 1
- [BUG — Bugs](epics/BUG.md) · P0/P1 in Phase 2, P2 anytime
- [LVL — Difficulty](epics/LVL.md) · Phase 4
- [CNT — One content model](epics/CNT.md) · Phase 4
- [GAME — Games to standard](epics/GAME.md) · Phase 5
- [CUR — Curriculum](epics/CUR.md) · Phase 6
- [PRG — Progress & rewards](epics/PRG.md) · Phase 7
- [WRT — Writing & grammar app](epics/WRT.md) · Phase 8
- [OPS — Housekeeping](epics/OPS.md) · anytime

## Board

| ID | Title | Type | P | Size | Status |
|---|---|---|---|---|---|
| **DES** | **Design system & layout** | Epic | **P0** | | |
| DES-27 | Our own pictures instead of emoji | Story | P2 | L | Todo |
| **BUG** | **Bugs** | | | | |
| **LVL** | **Difficulty** | Epic | **P0** | | |
| LVL-3 | Adaptive difficulty from skill mastery | Story | P2 | L | Todo |
| **CNT** | **One content model** | Epic | **P1** | | |
| CNT-2 | Lessons draw their words from the content bank | Story | P1 | M | Todo |
| **GAME** | **Games to standard** | Epic | **P1** | | |
| GAME-5 | Words Off the Page: bigger sentence pool | Story | P2 | S | Todo |
| **CUR** | **Curriculum** | Epic | **P1** | | |
| CUR-4 | Expand the curriculum per grade | Story | P1 | L | Todo |
| **PRG** | **Progress & rewards** | Epic | **P1** | | |
| PRG-5b | More squishies: kinds, colours and super-rare looks | Story | P2 | M | Todo |
| **WRT** | **Writing & grammar app** | Epic | **P1** | | |
| WRT-1 | Writing app on the home screen | Story | P1 | M | Todo |
| WRT-2 | Punctuation game: where does the mark go? | Story | P1 | L | Todo |
| **OPS** | **Housekeeping** | Epic | **P2** | | |
| OPS-1 | Delete dead code | Task | P2 | S | Todo |
| OPS-2 | README and stale copy | Task | P2 | S | Todo |
| OPS-7 | Drop Treasure Path's leftovers from the sentence bank | Task | P2 | S | Todo |
| OPS-8 | Retarget the backlog guard check's two stale cases | Task | P2 | S | Todo |
| OPS-11 | A first cloud session (parked) | Task | P2 | M | Todo |
