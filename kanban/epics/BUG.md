# BUG — Bugs

### BUG-32 · A lesson asks a word again before every word has had a turn
Bug · P2 · S · needs: — · confirmed
- **Why:** since CUR-12 (20 a play), `dealMissedFirst` (`engine/deck.ts`) shuffles a play's first pass as a whole (`shuffle([...back, ...rest])`), which undoes `spreadOut`. So CUR-6's rule (a lesson asks each of its letters or words once before one comes again) no longer holds when a lesson has several questions about one thing. `sight-check.mjs` saw Starter Sight Words ask "the, see, like, the, a, I": "the" twice before "a" and "I" had a turn (2026-11-13, found while checking CUR-15). The check itself also still expects a play of 5 rounds.
- **How:**
  - Keep the shuffle, then spread it again (`spreadOut(shuffle([...back, ...rest]), aboutOf, [])`), so the missed ones and the rest still mix but each thing is asked once first.
  - Update `sight-check.mjs` to read a play's first five rounds (each word once) instead of a 5-round play, and watch it fail on the code before.
- **Complete when:** in 20 plays of Starter Sight Words, the first five rounds ask the, see, like, I and a, once each; `sight-check.mjs` passes and fails on the code before; `practice-check`, `partway-check` and `stars-check` pass; build and lint pass.
