# LVL — Difficulty (Phase 4)

### LVL-3 · Adaptive difficulty from skill mastery
Story · P2 · L · needs: PRG-1
- **Why:** `skillMastery` is recorded but never read.
- **How:** track accuracy per skill, then nudge the starting tier up or down. If this doesn't happen, remove `skillMastery`.

- **Complete when:** the starting tier moves after a run of strong or weak results in a skill, never by more than one tier at a time. If dropped instead, `skillMastery` is deleted and the Changelog says why.
