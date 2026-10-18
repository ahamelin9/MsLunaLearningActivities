# SET — Settings & grown-up area (Phase 3)

### SET-1 · Grown-up gate for settings
Story · P0 · M · needs: —
- **Why:** a child can open Settings, change the grade, turn off narration, or reset all progress.
- **How:** add a press-and-hold gate (about 2s) or a simple grown-up question before Settings opens. Grade, narration, speed, reduced motion and reset all go behind it.
  - **From DES-21 (Alex, 2026-10-12):** the library's header shows the grade as a button that opens Grade Select, because the teacher takes different groups and swaps grades as the schedule needs. A child can change the grade with it too. Decide here whether it goes behind the gate (and how quick that gate is for her), or stays one tap.
  - **Decided (Alex, 2026-10-18):**
    - the gate is a press and hold of about 2s, with a ring filling round the button; a quick tap only shows a small "Grown-ups: press and hold" note;
    - it's a `hold` mode on the kit's ChunkyButton (on the Kit page), timed by a new motion role, `--dur-hold` (2s), which keeps its length under reduced motion;
    - it guards the home screen's gear, the library's gear and the library's grade button;
    - Luna's mute beside her in the library stays one tap for SET-2 to settle.
- **Complete when:**
  - a tap, or a hold shorter than 2s, on either gear or the grade button opens nothing; a 2s hold opens Settings or Grade Select (checked in a browser);
  - a quick tap shows the "press and hold" note, and the ring fills while held, with and without reduced motion;
  - so a child tapping around can't change any setting, Luna's mute aside (SET-2);
  - the kit's ChunkyButton shows its hold mode on the Kit page, and `kit-check.mjs` checks it.

### SET-2 · A child can't silence Luna by accident
Story · P0 · S · needs: SET-1
- **Why:** targets are only spoken, so with narration off every activity shows "?" and can't be played. Today the status-bar mute turns off narration in one tap.
  - **Since DES-8 and DES-9a (2026-10-12):** the app's header and the home status bar have no mute: they follow the boards, which have none. Narration still switches off in Settings, which a child can open until SET-1 gates it, so the gate and the banner remain.
  - **Since DES-21 (Alex, 2026-10-12):** the library has a one-tap mute beside Luna, the same `speechEnabled` setting as Settings' "Ms. Luna's voice", because a grown-up wants to quiet her whenever needed. A child can reach it, so decide here: gate it, or keep it one tap and rely on the banner (and perhaps an "unmute" on the banner itself).
- **How:**
  - Kid-reachable controls only touch sound effects.
  - Narration lives behind the gate.
  - If narration is off, GameShell shows a "Luna is resting — ask a grown-up" banner. The banner never shows the target.
- **Complete when:** no single kid-reachable tap can make a game unplayable.

### SET-3 · Simplify the voice section
Story · P2 · S
- **Why:** only `af_heart` is rendered, so the picker shows one voice and one "American" button.
- **How:** hide the picker until two or more voices are rendered. Work out the accent from the voice and drop the `voiceLanguage` setting.
- **Complete when:** with one rendered voice, Settings shows no picker; `voiceLanguage` is gone, and older saves still load without errors.

### SET-4 · Settings grade list uses `GRADES`
Task · P2 · S
- **Why:** `SettingsModal.tsx` has its own copy of the grade list.
- **Fix:** read it from `data/readingCurriculum.ts`.

- **Complete when:** the Settings grade buttons come from `GRADES`, so a grade added there appears in Settings with no other change.

### SET-5 · Grown-ups can see what each game and lesson teaches
Story · P2 · S · needs: SET-1
- **Why:** each game and lesson has a learning objective written for grown-ups (`objective` on its definition). It was the start screen's "Learning:" line until DES-22a took it off the child's screen (screens.md rule 8: grown-up text sits behind the gate). Alex, 2026-10-12.
- **How:** show every game's and lesson's objective in plain words behind the grown-up gate, for example a list in Settings.
- **Complete when:** a grown-up past the gate can read the objective of every game and lesson, and no child screen shows one.
