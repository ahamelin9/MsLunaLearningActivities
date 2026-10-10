# SET — Settings & grown-up area (Phase 3)

### SET-1 · Grown-up gate for settings
Story · P0 · M · needs: DES-9
- **Why:** a child can open Settings, change the grade, turn off narration, or reset all progress.
- **How:** add a press-and-hold gate (about 2s) or a simple grown-up question before Settings opens. Grade, narration, speed, reduced motion and reset all go behind it.
- **Complete when:** a child tapping around can't change any setting.

### SET-2 · A child can't silence Luna by accident
Story · P0 · S · needs: SET-1
- **Why:** targets are only spoken, so with narration off every activity shows "?" and can't be played. Today the status-bar mute turns off narration in one tap.
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
