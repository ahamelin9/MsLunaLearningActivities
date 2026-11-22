# BUG — Bugs

### BUG-34 · Story Corner's found word runs into the next word
Bug · P1 · S · needs: — · confirmed
- **Why:** confirmed in CUR-23's shots (2026-11-21): once the hunted word is found, its highlight touches the word after it ("got|in the bath", "Soon,|three"). It may be part of her "weird spacing in sentences" (2026-11-21), which CUR-26 fixed in the lessons only.
- **How:** in `StoryTime.module.scss`, the found word turns `inline-block`, and an inline-block drops the space at the end of its text (`{word}{' '}` in `StoryTime.tsx`), so the gap goes. Keep the space outside the highlighted box, the way CUR-26 spaced the lessons' words (`docs/design-system/decisions.md`, 2026-11-21).
- **Blocked (2026-11-21):** fixed in away mode (the space sits outside the word, `StoryTime.tsx`; `story-found-space-check.mjs`: 6px, was 0px); waits for Alex's OK (`screenshots/review/bug34-found-word-space.png`) and his commit, one with CUR-21's and CUR-23's.
- **Complete when:** a found word, and a word shown after three misses, keep the same gap to the next word as the rest of the line (`word-space-check.mjs`'s measure, or a check like it, failing on the code before); before and after shots in light and dark; build and lint pass.
