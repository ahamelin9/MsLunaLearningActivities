# CUR — Curriculum (Phase 6)

### CUR-9 · This week's words
Story · P2 · M · needs: —
- **Why:** Alex (2026-11-08) liked it: the teacher picks the few words her class is working on this week, and the games deal them more, so play backs up her lessons.
- **How:** "This week's words" in the grown-up area: up to 10 picked from the word bank by their pictures (every bank word already has its voice, so nothing new to render). A game's deck deals a picked word first wherever its round can use it, and skips it where it can't. Saved on the device, so every group using it gets the same words, with a "Clear" for next week. Lessons keep their order and rounds.
- **Complete when:** a browser check picks 3 words and sees every game that can use them deal them in its first play, and none after "Clear"; `deck-check` still holds; the picker is on the kit, in light and dark; build, lint and `voice:audit` pass.

### CUR-10 · Luna says a skill's name when it's tapped
Story · P2 · S · needs: —
- **Why:** Alex (2026-11-08, CUR-7's mock): most children can't read "Letter sounds" or "Vowel teams" yet, so a skill card on the library should say its name when it's tapped.
- **How:** a spoken line per skill, kept as a whole `{ text }` part next to its name in `readingCurriculum.ts`: 13 in all (Kindergarten's 5; Letter teams and blends, Magic E, Sentences and Little stories in 1st; Vowel teams, Compound words, Storybooks and Vowels with R in 2nd). Tapping a skill card opens it and Luna says its line, unless she's muted. Then `npm run voice:render` and `voice:audit`.
- **Complete when:** a browser check taps every skill card at each grade and the clip log has its line from a rendered clip, never the browser's voice; nothing plays with Luna muted; `voice:audit`, build and lint pass.

