# Ms. Luna's Learning Pad

A children's ESL reading app: a tablet-style shell containing Ms. Luna's library,
a collection of short phonics, vocabulary, listening and reading games.

React 19 + TypeScript + Vite + SCSS. No backend, no API keys. Ms. Luna's voice
is a neural voice rendered ahead of time and shipped as audio files, so nothing
about a child ever leaves the browser.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # tsc -b && vite build
npm run lint
npm run voice:render   # only when the vocabulary or a phoneme changes
npm run ui:shots -- --label before   # every screen at four iPad sizes, in screenshots/before/
```

## Layout

```
src/
  apps/reading/
    engine/        game shell, content bank, Luna's character and dialogue
    games/         one file per mini-game
    components/    the guided lessons' question screens (one per question type)
    pages/         library hub, grade select
  components/os/   tablet shell: status bar, app window, settings, trophies
  utils/           audio (sound effects), pronunciation (speech), phonics, storage
  data/            the guided reading curriculum
scripts/voice/     renders Ms. Luna's voice to audio files (see below)
public/voice/      the rendered clips, committed
```

## The game system

Each mini-game is a single module exporting a `GameDef` (`engine/types.ts`):

```ts
export const myGame: GameDef<Round> = {
  id, title, emoji, tagline,
  objective,        // the learning objective, in plain words
  skill,            // phonics | letters | vocabulary | reading | listening
  mission,          // Luna's line on the start screen
  roundsPerPlay,
  shape,            // how its tile looks in the library, and its stage material
  sticker,          // the sticker unlocked the first time it is finished
  makeRounds({ grade, difficulty, count }),
  Play              // React component for a single round
};
```

Register it in `games/index.ts` and it appears in the library, in Luna's Pick,
and in the sticker tin. Nothing else needs to change.

`GameShell` owns the loop — start screen, difficulty, round pips, feedback,
hint escalation, rewards — so a game only reports what happened:

```ts
api.win()     // round solved
api.miss({ hint })  // wrong attempt; never a failure, always another go
api.tick()    // partial progress inside a round
api.say(line) // Luna speaks out of turn
```

**What the child is looking for is heard, never shown.** Children in every grade
know their letters, so a target written on screen — the letter, its sound
(`/m/`), the word to find, the name under an answer picture — turns a listening
or reading task into matching shapes. Show it once the round is solved. Hints
follow the same rule: `hint` is a list of speech parts that Luna says from the
second miss on, with a button to hear it again, and it is never written out:

```ts
api.miss({ hint: [{ text: 'Listen for' }, { sound: 'M' }, { text: 'like' }, { word: 'moon' }] });
```

Content comes from one bank (`engine/content.ts`) at three difficulty tiers, so
adding a word or sentence there reaches every game at once.

### Lessons

The guided lessons in `data/readingCurriculum.ts` are the structured teaching,
so they sit at the top of the library, numbered in the order they are taught,
with the games below. They run in the same `GameShell` as the games:
`engine/lessons.ts` turns each lesson into a `GameDef` whose rounds are its fixed
questions, and `components/LessonRound.tsx` shows each question type. A lesson
therefore gets Luna, spoken hints, "Again", stickers and the reward screen like
any game, with no difficulty to choose; its `lesson` field makes it earn the
curriculum's stars and marks it done in the child's progress. A new lesson is
data only. A new question type is one screen in `components/`, built from
`LessonKit.tsx` and `lessonHooks.ts`, plus a case in `LessonRound`.

## Speech and phonics

**A letter is not its sound.** "V" is called *vee*; it makes the sound /v/.
Anything that speaks must say which one it wants:

```ts
pronunciation.speakLetterName('V');   // "vee"
pronunciation.speakLetterSound('V');  // an actual /v/, held: "vvvv"
pronunciation.speakWord('van');
pronunciation.speakSentence('The van is red.');
pronunciation.speakSequence([{ text: 'Pop the bubbles that say' }, { sound: 'M' }]);
```

Two engines sit behind that API (`utils/pronunciation.ts`):

1. **Ms. Luna's rendered voice**: audio files generated ahead of time from
   Kokoro-82M (see [Ms. Luna's voice](#ms-lunas-voice)). A tap is a fetch and
   a decode, so it speaks immediately.
2. **The browser's built-in `speechSynthesis`**, used only for an utterance
   that was never rendered. The app never goes silent.

`utils/phonics.ts` is the phonics dictionary: for every letter and letter
team it stores the name, the sound, a text carrier for the fallback voice and
an example word. How Luna actually *says* each sound is decided at render time
by `scripts/voice/phonemes.mjs` — see [Phonics sounds](#phonics-sounds).

A phoneme written inside ordinary prose is lifted out automatically, so
content does not have to be written defensively: `"What letter makes the
mmmmm sound?"` is spoken as *"What letter makes the"* + a real /m/ +
*"sound?"* rather than spelling out "m-m-m-m-m". Slashes work too, for a
letter (`/b/`), a team or blend (`/sh/`, `/fr/`, `/ar/`) or IPA (`/aɪ/`), so a
lesson that wants Luna to sound out a word writes `"Sound out /p/ /i/ /g/!"`.
Writing `"P... I... G!"` would make her say the letter *names*: "pee, eye,
gee".

Decoded clips are kept in memory, and every phonics sound and letter name is
fetched as soon as the voice loads, so no phonics tap ever waits.

Voice and speed are in Settings.

## Progress

`utils/storage.ts` is the single source of truth, persisted to localStorage and
exposed through a subscription. It tracks stars, points, completed lessons,
finished games, collected stickers, the daily streak and settings.


## Ms. Luna's voice

The voice is [Kokoro-82M](https://huggingface.co/hexgrad/Kokoro-82M) (Apache-2.0),
but it does not run in the browser. Every clip is generated once on a developer's
machine and committed as audio, because the app's vocabulary is closed: there is
not a single text input in `src/`, and no `speak*()` call interpolates a template
literal, so every utterance can be listed ahead of time.

That trade matters a lot on a tablet:

|                            | on-device synthesis | pre-rendered |
| -------------------------- | ------------------- | ------------ |
| download before it speaks  | 21.6 MB WASM + ~325 MB weights | ~0.8 MB of audio |
| delay on a tap             | 5–10 s              | none         |
| `kokoro-js` in the bundle  | yes                 | no           |

### Re-rendering

```bash
npm run voice:render                      # the default voice, incrementally
npm run voice:render -- --only sound      # just the phonics sounds, while tuning
npm run voice:render -- --voice af_bella  # add another of LUNA_VOICES
npm run voice:render -- --force           # ignore the cache
```

A clip is only regenerated when something that affects it changes — its text,
recipe, speed or tuning — so a typical re-run does almost nothing. The code
that makes clips is fingerprinted too, so editing `dsp.mjs` or `phonemes.mjs`
re-renders exactly what it affects. `--only` narrows what is rendered, never
what the app can find: the manifest always covers the whole vocabulary. Only
voices that have been rendered are offered in settings; the rest are hidden
rather than silently falling back.

### Phonics sounds

A neural voice cannot say an isolated phoneme. It learned from words, so asked
for "f" on its own Kokoro produces a voiced vowel, and asked for "bə" it says
"buh". Earlier versions asked for each sound in isolation and then looped or
clipped the result; measured against the same sounds in Luna's own words, the
old /s/, /sh/, /f/ and /th/ were closer to *vowels* than to themselves, /m/ and
/n/ warbled at their loop points, and the stop-clipper often kept the vowel
and threw the consonant away (the /s/ of every s-blend was gone).

What Kokoro does say well is words, so `scripts/voice/phonemes.mjs` cuts every
sound out of a real word, in Luna's voice, where that sound is cleanest:

| sound | taken from | held by |
| --- | --- | --- |
| s sh f th | the end of *bus*, *fish*, *cuff*, *bath* | fresh noise with exactly that hiss's spectral colour — no loop, no seam |
| m n ng l r | the end of *hum*, *fun*, *young*, *hull*, the middle of *her* | TD-PSOLA: one pitch period at a time, smooth pitch, no warble |
| z v voiced th | the hiss of *buzz*, *love*, *breathe* | a held voice bar with that hiss pulsed at the voice's pitch (Kokoro devoices these at word edges, like real speech) |
| a e i o u | the middle of *had*, *bed*, *bid*, *god*, *bud* | TD-PSOLA, ~480 ms |
| long vowels, ar or er | Luna saying *A*, *E*, *I*, *O*, *you*, *are*… | slowed whole, never looped — the glide is the sound |
| p t k | the start of *pup*, *tub*, *cup* | the release and aspiration only: no vowel |
| b d g | the start of *bug*, *duck*, *gum* | prevoicing, burst and the smallest sliver of vowel |
| ch, x, j, w, y, qu, blends | *itch*, *fox*, *lodger*, *won*, *yum*, *quick*, *stuck*… | cut where the vowel takes over |

Held sounds try two to five carrier words each and keep whichever holds most
smoothly. Every carrier is written in [misaki](https://github.com/hexgrad/misaki/blob/main/EN_PHONES.md),
the phoneme alphabet Kokoro v1.0 was trained on — not IPA. The renderer rejects
any symbol outside its American set before generating anything, because the
traps are silent: plain `g` is dropped (write `ɡ`), `dʒ` and `tʃ` are two
sounds (write `ʤ`, `ʧ`), the diphthongs are single letters (`A I O W Y` for
"ay", "eye", "oh", "ow", "oy"), and the length mark `ː` is British-only, so an
American voice has never seen it.

C, K and CK make one sound, so they share one file; so do every speed setting
and the vowel teams that say the same thing (AI, AY and long A). That cuts the
phonics audio from 231 files to 59.

To change how one sounds:

1. `npm run dev`, then open `/voice/af_heart/review.html` — every sound with a
   play button, how it was made, and which word it came from. It works on a
   real iPad too, which is where it matters.
2. Add an entry to `scripts/voice/overrides.json`, keyed by the sound's id from
   the review page: `"sound|m": { "holdMs": 800 }`. A different carrier word is
   `"sound|ng": { "carrier": "kˈɪŋ" }`. The options are listed in that file.
3. `npm run voice:render -- --only sound` (about 30 s) and listen again.

### If a sound still will not come right

A person is still the gold standard for an isolated phoneme. Because the app
plays files, swapping one in needs no code: drop `sound__B.wav` into
`scripts/voice/recorded/` and it replaces the generated clip, trimmed and
levelled to match the rest of the set. See the README in that folder.

### Adding words

Anything spoken comes from the data modules, so new content is picked up
automatically by `scripts/voice/inventory.ts` — re-run the renderer after adding
it. In dev, any utterance that was never rendered logs
`[voice] not rendered: <key>` and falls back to the browser voice, so a gap is
loud in the console but never silent for the child.

A line built around a word or a sound is said as parts, never as a template
literal. `` `Tap the ${word}.` `` is a new sentence for every word, and none of
them was rendered; `[{ text: 'Tap the' }, { word }]` is two clips that exist.
The inventory renders every literal `{ text: '…' }` part wherever it is written,
and `npm run voice:audit` fails on a template literal handed to speech. The
audit also plays every game's rounds at every grade and difficulty, so check it
after any change to what Luna says.

### Pronunciation fixes

Kokoro reads prose through espeak-ng, which says a capital A followed by a word
as the article ("makes the A say its name" → "makes the uh say its name") and
spells some ALL-CAPS words out ("the sight word SEE" → "ess-ee-ee").
`scripts/voice/lexicon.mjs` respells those for the voice only, at render time;
the text on screen is untouched. A new oddity of that kind belongs there.
