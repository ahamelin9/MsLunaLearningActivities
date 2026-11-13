# BUG — Bugs

### BUG-33 · What's Missing tells a child a wrong word "is still on the desk"
Bug · P1 · S · needs: — · confirmed
- **Why:** What's Missing's wrong choices are never on the desk (`pickWrong`'s on-screen rule, so the answer can't be found by elimination), yet a miss gets Luna's "That one is still on the desk. Look again!" (`engine/luna.ts`, `missFirst`), and from the second miss the spoken hint "[word] is still on the desk. Which one is not there any more?" (`WhatsMissing.tsx`). Both are untrue. Seen 2026-11-13 in CUR-19's shots: a miss on "bone", with frog, hen, sock and milk on the desk. CUR-19's look-alike choices will bring more misses, so more of these lines.
- **How:** lines that say what's true, for Alex to pick, e.g. "That one was not on my desk. Look again!" and "[word] was not on my desk. Which one did I take away?". Each stays a whole `{ text }` part with the word as its own `{ word }`; render them (`npm run voice:render`, `npm run voice:audit`).
- **Complete when:** no miss in What's Missing says the word is on the desk (a browser check reads both lines after a miss, and fails on the code before); the new lines are rendered and `voice:audit` passes; build and lint pass; Alex has OKed the words.

### BUG-32 · A lesson asks a word again before every word has had a turn
Bug · P2 · S · needs: — · confirmed
- **Why:** since CUR-12 (20 a play), `dealMissedFirst` (`engine/deck.ts`) shuffles a play's first pass as a whole (`shuffle([...back, ...rest])`), which undoes `spreadOut`. So CUR-6's rule (a lesson asks each of its letters or words once before one comes again) no longer holds when a lesson has several questions about one thing. `sight-check.mjs` saw Starter Sight Words ask "the, see, like, the, a, I": "the" twice before "a" and "I" had a turn (2026-11-13, found while checking CUR-15). The check itself also still expects a play of 5 rounds.
- **How:**
  - Keep the shuffle, then spread it again (`spreadOut(shuffle([...back, ...rest]), aboutOf, [])`), so the missed ones and the rest still mix but each thing is asked once first.
  - Update `sight-check.mjs` to read a play's first five rounds (each word once) instead of a 5-round play, and watch it fail on the code before.
- **Complete when:** in 20 plays of Starter Sight Words, the first five rounds ask the, see, like, I and a, once each; `sight-check.mjs` passes and fails on the code before; `practice-check`, `partway-check` and `stars-check` pass; build and lint pass.
