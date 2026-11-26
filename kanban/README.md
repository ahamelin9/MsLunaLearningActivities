# Ms. Luna — Kanban

Epics, stories, bugs and tasks for the Learning Pad, in the order we plan to do
them. Built from the full app review on 2026-10-08. The `/backlog` skill
(`.claude/skills/backlog/`) explains how Claude picks up, finishes and adds
tickets.

**This folder:**
- **`README.md`** (this file): how to read it, the roadmap, Now/Next, the epic list and the board. A ticket's status lives **only** in the board below.
- **`epics/<EPIC>.md`**: one file per epic, with its goal and every ticket's full section (Why / How / Complete when). A ticket never moves files when its status changes.
- **`CHANGELOG.md`**: finished and dropped tickets. Once a ticket is deleted, its changelog line is its only record.

**Last updated:** 2026-11-25

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

- **Now:** the letter sounds and letter names are Luna's generated ones again (VOX-11, done and live 2026-11-25), since Alex's recordings (VOX-7, VOX-8, VOX-9) didn't work as well for the teacher. The recordings are kept, switched off (`scripts/voice/recorded/README.md`), and VOX-10 waits with them. Waiting on the teacher's test, all pushed and in `screenshots/review/HANDOVER.md`: run 10's tickets (CUR-20 to CUR-28 and BUG-34, `f579bc8`) and CUR-29 (the countdown in every game, `4556edb`); they close out once she has tried them. VOX-6 (Luna "like a demon" on her classroom whiteboard) is Blocked on her ear there; its engine and hardening are live (`921ddad`). Still to ask her: which list goes on to 250.
- **Next:** DES-32c (laptops and the classroom's big screen), then DES-32b (phones turned sideways: Alex's call first, scale or scroll). On the voice: VOX-5 (the Luna/Kore blend for single words; his call first: lines too?), then VOX-2, VOX-4, then VOX-3. Then CUR-13 (every lesson holds 20, split by grade), content for Alex to review. Still waiting on Alex: DES-28 (which Chromebooks the class has) and SAY-1 (his recordings). The Writing app (WRT) after Phase 7. OPS-11 stays parked.

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
| VOX-10 | Every recorded sound at Luna's pitch | Story | P1 | M | Blocked |
| VOX-5 | Single words in a blend of Luna and Kore | Story | P1 | M | Todo |
| VOX-2 | Words said alone end cleanly | Story | P1 | S | Todo |
| VOX-4 | A sound check that can fail | Task | P1 | S | Todo |
| VOX-3 | Words and lines in Kokoro's own phoneme spelling, as far as it helps | Story | P2 | M | Todo |
| **CUR** | **Curriculum: the teacher's try-out** | Epic | **P0** | | |
| CUR-24 | The countdown in games only, 30 seconds a round | Story | P1 | S | Blocked |
| CUR-25 | Blend sounds said closer together | Story | P1 | S | Blocked |
| CUR-26 | Sentences spaced like a book | Story | P1 | S | Blocked |
| CUR-20 | Muddled Cards' bar counts its 20 pairs | Story | P1 | S | Blocked |
| CUR-21 | Story Corner: 10 stories a play, the bar counting its 20 answers | Story | P1 | S | Blocked |
| CUR-23 | Story Corner's "Hear the answers" button | Story | P1 | S | Blocked |
| CUR-22a | 1st grade's story lessons ask 20 a play, with more stories | Story | P1 | M | Blocked |
| CUR-22b | 2nd grade's story lessons ask 20 a play, with more stories | Story | P1 | M | Blocked |
| CUR-27a | Kindergarten's sight words: Dolch 1–50 | Story | P1 | M | Blocked |
| CUR-27b | 1st grade's sight words: Dolch 1–100 | Story | P1 | M | Blocked |
| CUR-27c | 2nd grade's sight words: Dolch 101–220 | Story | P1 | M | Blocked |
| CUR-28 | The library stays short with a skill of 10 lessons or more | Story | P1 | M | Blocked |
| CUR-29 | The countdown in every game: Bubble Sounds, Muddled Cards and Story Corner too | Story | P1 | S | Blocked |
| CUR-13 | Every lesson holds at least 20 of its own | Story | P1 | L | Todo |
| **SAY** | **Reading aloud, checked by ear** | Epic | **P1** | | |
| SAY-1 | Can a machine tell a right sound from a wrong one? A test on Alex's recordings | Task | P1 | M | Todo |
| **DES** | **Design system & layout** | Epic | **P0** | | |
| DES-32c | Laptops and the classroom's big screen | Story | P1 | M | Todo |
| DES-32b | Phones turned sideways | Story | P2 | S | Todo |
| DES-28 | Works on a Chromebook | Story | P1 | M | Todo |
| **BUG** | **Bugs** | | | | |
| BUG-34 | Story Corner's found word runs into the next word | Bug | P1 | S | Blocked |
| **LVL** | **Difficulty** | Epic | **P0** | | |
| LVL-3 | Adaptive difficulty from skill mastery | Story | P2 | L | Todo |
| **WRT** | **Writing & grammar app** | Epic | **P1** | | |
| WRT-1 | Writing app on the home screen | Story | P1 | M | Todo |
| WRT-2 | Punctuation game: where does the mark go? | Story | P1 | L | Todo |
| **OPS** | **Housekeeping** | Epic | **P2** | | |
| OPS-11 | A first cloud session (parked) | Task | P2 | M | Todo |
