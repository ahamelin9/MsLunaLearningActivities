# Ms. Luna — Kanban

Epics, stories, bugs and tasks for the Learning Pad, in the order we plan to do
them. Built from the full app review on 2026-10-08. The `/backlog` skill
(`.claude/skills/backlog/`) explains how Claude picks up, finishes and adds
tickets.

**This folder:**
- **`README.md`** (this file): how to read it, the roadmap, Now/Next, the epic list and the board. A ticket's status lives **only** in the board below.
- **`epics/<EPIC>.md`**: one file per epic, with its goal and every ticket's full section (Why / How / Complete when). A ticket never moves files when its status changes.
- **`CHANGELOG.md`**: finished and dropped tickets. Once a ticket is deleted, its changelog line is its only record.

**Last updated:** 2026-10-10

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
| 2 | Feedback & confirmed bugs | FB, BUG P0/P1 | The biggest correctness problems. FB-1 touches GameShell, so it lands after DES-8/DES-10 settle its layout. |
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

- **Now:** DES-2: the teacher has answered everything (2026-10-10) and the style sample shows her picks; what's left is writing them into `docs/design-standards.md` and copying the decisions into DES-3 to DES-7
- **Next:** DES-3, DES-4, DES-5 and DES-15, which only need DES-2. PRG-7 (lessons open in order) needs no design and can be pulled in any time. GAME-1c, Treasure Path's screen, waits on FB-1, which waits on the DES-8/DES-10 layout. Then GAME-4

## Epics

In board order. A new epic gets its file in `epics/` first, then a link here
(the tools only read linked files), then its rows on the board.

- [DES — Design system & layout](epics/DES.md) · Phase 1
- [FB — Shell feedback & hints](epics/FB.md) · Phase 2
- [BUG — Bugs](epics/BUG.md) · P0/P1 in Phase 2, P2 anytime
- [SET — Settings & grown-up area](epics/SET.md) · Phase 3
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
| DES-2 | Write the design standards | Story | P0 | M | In progress |
| DES-3 | One set of design tokens | Story | P0 | M | Todo |
| DES-4 | Typography and local fonts | Story | P0 | S | Todo |
| DES-5 | Motion system | Story | P0 | M | Todo |
| DES-6 | Reduced motion, wired end to end | Story | P0 | S | Todo |
| DES-7 | Shared component kit | Story | P0 | M | Todo |
| DES-8 | One set of chrome | Story | P0 | M | Todo |
| DES-9 | Restyle the tablet shell: iPad feel, boho finish | Story | P0 | L | Todo |
| DES-10 | Layout grid and breakpoints | Story | P0 | M | Todo |
| DES-15 | Draw the chosen Ms. Luna | Story | P0 | M | Todo |
| DES-11 | One right/wrong/reveal visual language | Story | P1 | S | Todo |
| DES-12 | Luna on screen: one Luna, clear moods | Story | P1 | S | Todo |
| DES-13 | Lesson path on the hub: in order, one bar | Story | P1 | S | Todo |
| DES-16 | Light and dark mode | Story | P1 | M | Todo |
| DES-17 | The moon visits for big milestones | Story | P1 | M | Todo |
| DES-14 | Feed Luna's cookies look like real, different cookies | Story | P2 | S | Todo |
| **FB** | **Shell feedback & hints** | Epic | **P0** | | |
| FB-1 | One answer-feedback path in GameShell | Story | P0 | M | Todo |
| FB-2 | "Show me" after repeated misses | Story | P0 | S | Todo |
| **BUG** | **Bugs** | | | | |
| BUG-1 | Game speech is cut off by Luna's reaction | Bug | P0 | — | Todo (via FB-1) |
| BUG-2 | Feed Luna: one wrong tap counts as two misses | Bug | P0 | S | Todo |
| BUG-7 | Status-bar mute needs two taps to unmute | Bug | P1 | S | Todo |
| BUG-8 | Story lessons ignore the Beginner speed | Bug | P1 | S | Todo |
| BUG-21 | Bubble Sounds only ever asks for the first 12 letters | Bug | P1 | S | Todo |
| BUG-22 | Story Corner says "she reed three books" | Bug | P1 | S | Todo |
| BUG-9 | Story Corner K warm-up plays one story twice | Bug | P2 | S | Todo |
| BUG-10 | Settings may loop saving when the voice index fails | Bug | P2 | S | Todo |
| BUG-11 | Launch and close sounds play twice | Bug | P2 | S | Todo |
| BUG-12 | Day streak rolls over at 7 pm (UTC date) | Bug | P2 | S | Todo |
| BUG-13 | Trophy dot never clears | Bug | P2 | S | Todo |
| BUG-14 | "Word of the day" changes on every visit | Bug | P2 | S | Todo |
| **SET** | **Settings & grown-up area** | Epic | **P0** | | |
| SET-1 | Grown-up gate for settings | Story | P0 | M | Todo |
| SET-2 | A child can't silence Luna by accident | Story | P0 | S | Todo |
| SET-3 | Simplify the voice section | Story | P2 | S | Todo |
| SET-4 | Settings grade list uses `GRADES` | Task | P2 | S | Todo |
| **LVL** | **Difficulty** | Epic | **P0** | | |
| LVL-1 | Explicit grade × dial difficulty table | Story | P0 | S | Todo |
| LVL-2 | Remember the chosen difficulty per game | Story | P2 | S | Todo |
| LVL-3 | Adaptive difficulty from skill mastery | Story | P2 | L | Todo |
| **CNT** | **One content model** | Epic | **P1** | | |
| CNT-2 | Lessons generated from the content bank | Story | P1 | L | Todo |
| CNT-3 | Content QA pass | Task | P1 | S | Todo |
| CNT-4 | Automated content checks in `voice:audit` | Task | P2 | S | Todo |
| **GAME** | **Games to standard** | Epic | **P1** | | |
| GAME-1c | Treasure Path screen for passages | Story | P1 | M | Todo |
| GAME-2 | Story Corner: the child reads first | Story | P1 | M | Todo |
| GAME-3 | Bubble Sounds: smooth, fair bubbles | Story | P1 | S | Todo |
| GAME-7 | Bubble Sounds: fewer answer bubbles, fewer still at higher grades | Story | P1 | S | Todo |
| GAME-4 | Muddled Cards: reading required at tier 2+ | Story | P2 | S | Todo |
| GAME-5 | Words Off the Page: bigger sentence pool | Story | P2 | S | Todo |
| GAME-6 | Rename "Feed Luna the Letter" | Story | P2 | S | Todo |
| **CUR** | **Curriculum** | Epic | **P1** | | |
| CUR-1 | Fix lesson/title/copy mismatches | Task | P1 | S | Todo |
| CUR-3 | Real sight words | Story | P1 | S | Todo |
| CUR-4 | Expand the curriculum per grade | Story | P1 | L | Todo |
| CUR-5 | Merge the two K blending lessons | Story | P2 | S | Todo |
| **PRG** | **Progress & rewards** | Epic | **P1** | | |
| PRG-1 | Stars reflect performance | Story | P1 | M | Todo |
| PRG-5 | Squishies instead of the sticker tin | Story | P1 | M | Todo |
| PRG-6 | Time per lesson: know it before, see it after | Story | P1 | M | Todo |
| PRG-7 | Lessons open in order | Story | P1 | M | Todo |
| PRG-2 | Points: remove or give them a meaning | Story | P2 | S | Todo |
| PRG-3 | Achievements worked out in one place | Task | P2 | S | Todo |
| PRG-4 | Secret platinum trophy for a full squishy shelf | Story | P2 | S | Todo |
| **WRT** | **Writing & grammar app** | Epic | **P1** | | |
| WRT-1 | Writing app on the home screen | Story | P1 | M | Todo |
| WRT-2 | Punctuation game: where does the mark go? | Story | P1 | L | Todo |
| **OPS** | **Housekeeping** | Epic | **P2** | | |
| OPS-1 | Delete dead code | Task | P2 | S | Todo |
| OPS-2 | README and stale copy | Task | P2 | S | Todo |
| OPS-3 | Decide the "Coming Soon" apps | Task | P2 | S | Todo |
| OPS-7 | Drop Treasure Path's leftovers from the sentence bank | Task | P2 | S | Todo |
