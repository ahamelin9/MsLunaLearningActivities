# SET — Settings & grown-up area (Phase 3)

### SET-1 · Grown-up gate for settings
Story · P0 · M · needs: —
- **Why:** a child can open Settings, change the grade, turn off narration, or reset all progress.
- **How:** add a press-and-hold gate (about 2s) or a simple grown-up question before Settings opens. Grade, narration, speed, reduced motion and reset all go behind it.
  - **From DES-21 (Alex, 2026-10-12):** the library's header shows the grade as a button that opens Grade Select, because the teacher takes different groups and swaps grades as the schedule needs. A child can change the grade with it too. Decide here whether it goes behind the gate (and how quick that gate is for her), or stays one tap.
- **Complete when:** a child tapping around can't change any setting.

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
