# SET — Settings & grown-up area (Phase 3)

### SET-2 · A child can't silence Luna by accident
Story · P0 · S · needs: —
- **Blocked (2026-10-18): waits for Alex's call.** Built on Claude's recommendation while he was away (gate the mute, a one-tap unmute, the banner) and checked (`gate-check.mjs`, `greeting-check.mjs`, `kit-check.mjs`; shots unchanged). Left for Alex: the "decide here" below (gate it, or keep one tap) and the banner's words. Review sheet: `screenshots/review/set2-luna-mute.png`; `screenshots/review/HANDOVER.md` has the rest.
- **Why:** targets are only spoken, so with narration off every activity shows "?" and can't be played. Today the status-bar mute turns off narration in one tap.
  - **Since DES-8 and DES-9a (2026-10-12):** the app's header and the home status bar have no mute: they follow the boards, which have none. Narration still switches off in Settings, which SET-1 put behind the 2s press-and-hold gate (2026-10-18), so only the banner and Luna's mute remain.
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
- **Blocked (2026-10-18): built and checked; waits for Alex's OK on the look.** The accent comes from the voice; `voiceLanguage` is gone from the settings and is stripped from an older save as it loads. The accent and voice buttons show only when two or more voices are rendered ("Tap a voice to hear it" with them); "Which voice", its status and the privacy line stay. `voice-section-check.mjs` (know-how) passes, and fails with the picker forced on; lint, build; shots: only Settings changed. Sheet: `screenshots/review/set3-voice-section.png`.

### SET-4 · Settings grade list uses `GRADES`
Task · P2 · S
- **Why:** `SettingsModal.tsx` has its own copy of the grade list.
- **Fix:** read it from `data/readingCurriculum.ts`.

- **Complete when:** the Settings grade buttons come from `GRADES`, so a grade added there appears in Settings with no other change.
- **Blocked (2026-10-18): done and checked; waits for Alex's OK.** Settings maps `GRADES` (its own list is gone), so the buttons now read "1st Grade" and "2nd Grade", as the library's header does. `voice-section-check.mjs` checks the buttons are `GRADES`' titles in order; shots: only the grade row in Settings changed.

### SET-5 · Grown-ups can see what each game and lesson teaches
Story · P2 · S · needs: —
- **Why:** each game and lesson has a learning objective written for grown-ups (`objective` on its definition). It was the start screen's "Learning:" line until DES-22a took it off the child's screen (screens.md rule 8: grown-up text sits behind the gate). Alex, 2026-10-12.
- **How:** show every game's and lesson's objective in plain words behind the grown-up gate, for example a list in Settings.
- **Complete when:** a grown-up past the gate can read the objective of every game and lesson, and no child screen shows one.
- **Blocked (2026-10-18): built and checked; waits for Alex's OK on the look and words.** Settings has a new "What they learn" row whose "See them" swaps the panel for every game's objective, then each grade's lessons in order (`SettingsModal/TeachesList.tsx`, sharing Settings' rows), opening at the top, with "Back to settings". `gate-check.mjs` checks all 20 objectives are listed past the gate and Back works; only `TeachesList` reads `objective` in `src`, so no child screen shows one. Lint, build; shots: only Settings changed. Sheet: `screenshots/review/set5-what-they-learn.png`.
