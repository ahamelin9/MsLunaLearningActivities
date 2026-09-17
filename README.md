# Ms. Luna's Learning Pad

A children's ESL reading app: a tablet-style shell containing Ms. Luna's library,
a collection of short phonics, vocabulary, listening and reading games.

React 19 + TypeScript + Vite + SCSS. No backend, no API keys. Everything —
including the neural voice — runs in the browser.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # tsc -b && vite build
npm run lint
```

## Layout

```
src/
  apps/reading/
    engine/        game shell, content bank, Luna's character and dialogue
    games/         one file per mini-game
    components/    the original guided-lesson activity components
    pages/         library hub, grade select, lesson player
  components/os/   tablet shell: status bar, app window, settings, trophies
  utils/           audio (sound effects), pronunciation (speech), phonics, storage
  data/            the guided reading curriculum
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

Content comes from one bank (`engine/content.ts`) at three difficulty tiers, so
adding a word or sentence there reaches every game at once.

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

1. **Kokoro-82M**, an Apache-2.0 neural voice running on-device via
   `kokoro-js`. It lives in a Web Worker (`utils/voiceWorker.ts`), so
   generating speech never blocks an animation or a tap. The download starts
   on the first tap, not at page load.
2. **The browser's built-in `speechSynthesis`**, used only if Kokoro cannot
   load. The app never goes silent.

The worker picks its build by what the device can do. Every build was compared
against full precision on the same sentence, alignment-free (long-term average
spectrum, high-frequency noise share, periodicity):

| build | speech quality | 2.9s sentence | download |
| --- | --- | --- | --- |
| fp32 (WebGPU) | reference | 1.9s | 325 MB |
| q8 (WASM) | clean: least high-frequency noise | 5.7s | 92 MB |
| fp16 | gritty: more HF noise, less periodic | 1.7s | 163 MB |
| q4f16 | gritty: same artefacts, barely smaller | 1.7s | 155 MB |

The half-precision builds sound harsh, so neither is used. Full precision is
the default wherever WebGPU exists, since it is both the cleanest and the
fastest there. Otherwise the 8-bit build runs on WASM: equally clean, slower to
generate. The Settings toggle picks the 8-bit build deliberately when the
325 MB download is not wanted.

Isolated phonemes are possible because Kokoro's tokenizer accepts IPA directly,
so `/v/` is generated from `vː` rather than from the text "V" (which would say
"vee"). `utils/phonics.ts` holds that dictionary: for every letter and letter
team it stores the name, the IPA, a text carrier for the fallback voice, and an
example word. Continuants are held long (`mː`, `sː`, `fː`); stops take the
smallest schwa that makes them audible (`bə`, `tə`).

A phoneme written inside ordinary prose is lifted out automatically, so
content does not have to be written defensively: `"What letter makes the
mmmmm sound?"` is spoken as *"What letter makes the"* + a real /m/ +
*"sound?"* rather than spelling out "m-m-m-m-m".

Generated clips are cached in memory and in IndexedDB, so a sound is only ever
synthesised once per device, and the common phonics sounds are pre-generated
after the voice loads — those play instantly.

Voice, accent (American/British), speed and quality are in Settings.

## Progress

`utils/storage.ts` is the single source of truth, persisted to localStorage and
exposed through a subscription. It tracks stars, points, completed lessons,
finished games, collected stickers, the daily streak and settings.
