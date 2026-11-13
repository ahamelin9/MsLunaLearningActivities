# Ms. Luna — Kanban

Epics, stories, bugs and tasks for the Learning Pad, in the order we plan to do
them. Built from the full app review on 2026-10-08. The `/backlog` skill
(`.claude/skills/backlog/`) explains how Claude picks up, finishes and adds
tickets.

**This folder:**
- **`README.md`** (this file): how to read it, the roadmap, Now/Next, the epic list and the board. A ticket's status lives **only** in the board below.
- **`epics/<EPIC>.md`**: one file per epic, with its goal and every ticket's full section (Why / How / Complete when). A ticket never moves files when its status changes.
- **`CHANGELOG.md`**: finished and dropped tickets. Once a ticket is deleted, its changelog line is its only record.

**Last updated:** 2026-11-13

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

- **Now:** she showed more children and they all love it (2026-11-13). Her two asks are done: every game deals about 20 a play (CUR-15), and a countdown pie times each round at 1st and 2nd grade, with less time in 2nd (CUR-16). The phonics are what's left to fix: VOX-1 next. The Sound Check page has had no picks since 2026-10-29, so the picks so far go in, and B, D, G, TH, voiced TH, NG, W and OO get a fourth round of takes for Alex's ear. CUR-17 (more sentences, passages and Kindergarten stories, so a game's next play is new) is content for Alex to review, like CUR-13. Her try-out notes (2026-11-12) are done and live, but one: the password, American spelling, lessons 1, 2, 3 in each skill, 20 questions a play, reading first, and Luna on the tab. VOX-6 (Luna "like a demon" on her classroom whiteboard) is Blocked: one audio engine for voice and effects, made fresh after anything that can leave it at the wrong rate; its hardening is live too (`921ddad`), and her ear on the whiteboard decides it. Then CUR-13 (every lesson holds 20, split by grade), content for Alex to review. She likes the emoji (DES-27 dropped) and wants no per-child sign-in: one save per device stays.
- **Next:** phones held upright work (DES-32a, done 2026-11-12); next DES-32c (laptops and the classroom's big screen), then DES-32b (phones turned sideways: Alex's call first, scale or scroll). Still waiting on Alex: DES-28 (which Chromebooks the class has), SAY-1 (his recordings), and his Sound Check picks for VOX-1, with VOX-4 alongside it; VOX-5 (the Luna/Kore blend for single words; his call first: lines too?), then VOX-2, then VOX-3. The Writing app (WRT) after Phase 7. OPS-11 stays parked.

## Epics

In board order. A new epic gets its file in `epics/` first, then a link here
(the tools only read linked files), then its rows on the board.

- [VOX — Luna's voice: letter sounds and words](epics/VOX.md) · ahead of everything (Alex, 2026-10-28)
- [CUR — Curriculum: the teacher's try-out](epics/CUR.md) · from her notes, 2026-11-12
- [SAY — Reading aloud, checked by ear](epics/SAY.md) · not in the roadmap yet: a test first
- [DES — Design system & layout](epics/DES.md) · Phase 1
- [BUG — Bugs](epics/BUG.md) · P0/P1 in Phase 2, P2 anytime
- [LVL — Difficulty](epics/LVL.md) · Phase 4
- [WRT — Writing & grammar app](epics/WRT.md) · Phase 8
- [OPS — Housekeeping](epics/OPS.md) · anytime

## Board

| ID | Title | Type | P | Size | Status |
|---|---|---|---|---|---|
| **VOX** | **Luna's voice: letter sounds and words** | Epic | **P0** | | |
| VOX-6 | Where Luna sounds shaky, "like a demon" | Bug | P0 | M | Blocked |
| VOX-1 | Letter sounds retuned by ear | Story | P0 | M | Todo |
| VOX-5 | Single words in a blend of Luna and Kore | Story | P1 | M | Todo |
| VOX-2 | Words said alone end cleanly | Story | P1 | S | Todo |
| VOX-4 | A sound check that can fail | Task | P1 | S | Todo |
| VOX-3 | Words and lines in Kokoro's own phoneme spelling, as far as it helps | Story | P2 | M | Todo |
| **CUR** | **Curriculum: the teacher's try-out** | Epic | **P0** | | |
| CUR-13 | Every lesson holds at least 20 of its own | Story | P1 | L | Todo |
| CUR-17 | Every game holds two plays of its own | Story | P1 | L | Todo |
| **SAY** | **Reading aloud, checked by ear** | Epic | **P1** | | |
| SAY-1 | Can a machine tell a right sound from a wrong one? A test on Alex's recordings | Task | P1 | M | Todo |
| **DES** | **Design system & layout** | Epic | **P0** | | |
| DES-32c | Laptops and the classroom's big screen | Story | P1 | M | Todo |
| DES-32b | Phones turned sideways | Story | P2 | S | Todo |
| DES-28 | Works on a Chromebook | Story | P1 | M | Todo |
| **BUG** | **Bugs** | | | | |
| BUG-32 | A lesson asks a word again before every word has had a turn | Bug | P2 | S | Todo |
| **LVL** | **Difficulty** | Epic | **P0** | | |
| LVL-3 | Adaptive difficulty from skill mastery | Story | P2 | L | Todo |
| **WRT** | **Writing & grammar app** | Epic | **P1** | | |
| WRT-1 | Writing app on the home screen | Story | P1 | M | Todo |
| WRT-2 | Punctuation game: where does the mark go? | Story | P1 | L | Todo |
| **OPS** | **Housekeeping** | Epic | **P2** | | |
| OPS-11 | A first cloud session (parked) | Task | P2 | M | Todo |
