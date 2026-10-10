# BUG — Bugs

### BUG-1 · Game speech is cut off by Luna's reaction — confirmed
P0 · fixed by FB-1. Examples:
- Letter Jar: "That is G" never plays.
- Treasure Path and Words Off the Page: the sentence read-back after a right answer never plays.
- (Feed Luna's cheer was fixed on its own in BUG-19, 2026-10-09.)
- **Complete when:** with clip logging on, the Letter Jar wrong-tap line and the Treasure Path and Words Off the Page read-backs all play in full. Closes with FB-1.

### BUG-2 · Feed Luna: one wrong tap counts as two misses — confirmed
P0 · S
- **Cause:** a tap feeds the cookie on pointer-up (`games/FeedLuna.tsx:187`), and then the button's `onClick` feeds it again (`:238`).
- **Effect:** the hint plays after the first mistake.
- **Complete when:** one wrong tap counts as one miss, and drag, tap and keyboard each still work.

### BUG-3 · What's Missing can be solved by elimination
P0 · S
- **Cause:** the wrong choices are items still on the desk (`games/WhatsMissing.tsx:20`), so the answer is just "the one I can't see".
- **Fix:** take the wrong choices from words that were never on the desk.
- **Complete when:** none of the wrong choices is visible on the desk.

### BUG-4 · Same-sound letters used as wrong answers
P0 · S
- **Cause:** in Bubble Sounds and Feed Luna's sound rounds, K can be a "wrong" choice when the target is C. Both use the same audio file. W and WH have the same problem at tier 3.
- **Fix:** filter out wrong choices that share the target's sound, ideally using the same rule as CNT-1.
- **Complete when:** no round ever offers two letters with the same sound.

### BUG-7 · Status-bar mute needs two taps to unmute
P1 · S
- **Cause:** the icon treats sound as "on" only when *both* sound and narration are on, but the toggle (`utils/storage.ts:111`) treats *either* as on.
- **Fix:** use one rule for both. It may be easier to drop the button once SET-2 lands.
- **Complete when:** from any mix of the two sound settings, one tap leaves the app in the state its icon shows.

### BUG-8 · Story lessons ignore the Beginner speed
P1 · S
- **Cause:** `components/StoryReader.tsx:29` and `:35` hard-code `rate: 0.9` and `0.85`, which always lands on Normal.
- **Fix:** remove the overrides, or scale them relative to the user's speed setting.
- **Complete when:** with Beginner selected, story lines and words play the slow clips (checked with clip logging).

### BUG-15 · Games read the text before the child tries
P1 · S · confirmed (code read, 2026-10-09)
- **Cause:**
  - Treasure Path true/false rounds open by reading the sentence and the claim aloud (`games/TreasureRead.tsx:58`), so the child listens instead of reading.
  - Story Corner reads each new line aloud as it appears (`games/StoryTime.tsx:62`), and any line on tap.
- **Fix:** it depends on the grade (Alex, 2026-10-09):
  - **Kindergarten:** a read-along. Every line is read aloud as it appears, line 1 included.
  - **1st and 2nd grade:** the lessons' rule (`useAnswer`'s `tried` in `components/lessonHooks.ts`). The text stays silent until the child has answered once, and a wrong answer unlocks the read-aloud. Single words can always be tapped.
  - This is taken out of GAME-1 and GAME-2, which keep the rest of their work.
- **Complete when:** in the browser, at Kindergarten every Story Corner line (line 1 included) is read as it appears; at 1st and 2nd grade, no Treasure Path or Story Corner round reads its sentence, claim or lines before the child's first answer, and the text can be heard after a wrong one.

### BUG-9 · Story Corner K warm-up plays one story twice
P2 · S
- **Cause:** tier 1 has only one story. Resolved properly by GAME-2.
- **Complete when:** no story repeats within one play of Story Corner, at any grade or difficulty.

### BUG-10 · Settings may loop saving when the voice index fails
P2 · S · likely, not yet reproduced
- **Cause:** if the voice index fails to load (for example offline), `components/os/VoicePicker.tsx:58` keeps re-saving settings on every render.
- **Fix:** run the correction once per open of Settings.
- **Verify:** reproduce it with the network off before fixing.
- **Complete when:** with the voice index blocked (offline), opening Settings saves at most once and the page stays responsive.

### BUG-11 · Launch and close sounds play twice
P2 · S
- **Cause:** `HomeScreen.tsx:19` and `App.tsx:43` both play the launch sound. `AppWindow` and `App` both play the close pop.
- **When:** fix as part of DES-8.
- **Complete when:** opening an app plays one sound, and closing it plays one sound.

### BUG-12 · Day streak rolls over at 7 pm
P2 · S
- **Cause:** `computeStreak` in `utils/storage.ts` uses the UTC date.
- **Fix:** use the local date.
- **Complete when:** playing at 8 pm and again at 9 am the next morning counts as two days in a row, and two sessions on the same local day count once.

### BUG-13 · Trophy dot never clears
P2 · S
- **Cause:** the dot shows whenever any achievement exists, not just new ones.
- **When:** fix in PRG-3.
- **Complete when:** the dot shows only for achievements not yet seen, and clears when the Trophy room opens.

### BUG-14 · "Word of the day" changes on every visit
P2 · S
- **Cause:** `pages/ReadingHub.tsx` picks a random word each time the hub mounts.
- **Fix:** seed the pick from the date.

- **Complete when:** the word stays the same on every visit within a local day and changes the next day.
