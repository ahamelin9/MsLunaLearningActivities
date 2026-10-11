# Screens: pages, games and lessons

How a screen is put together, from the tablet shell to a single lesson type.
Screens are where the kit, the roles and the content meet.

## Rules

1. **Its own folder.** Every page, game and lesson type has a folder holding
   `<Name>.tsx` and `<Name>.module.scss` (CSS modules, so nothing collides).
2. **Kit first.** Every button, card, chip and answer is a kit component.
   Answer buttons are always `Choice`.
3. **Roles and the space scale only.** No raw values, and no component tokens
   of a screen's own. A one-off look uses roles directly.
4. **Heard, never shown.** The target is never on screen before the round is
   solved. The `ListenCue` holds its place, and hints are spoken.
5. **States go in `data-state`**, never in class names built from strings.
6. **Game pieces that aren't Choices** (bubbles, cookies, bugs, memory cards,
   word tiles) use the state roles and the shared motion.
7. **One Luna per screen.** While the milestone moon visits, only she talks.
8. **Kid-facing words are short, and Luna says them.** Grown-up text sits behind
   the gate, and child screens never use jargon like "digraphs" or "dashboard".
9. **Check light and dark, at the four sizes,** with no scrolling mid-round.

## Where screens live

```
src/
  components/os/<Name>/            the tablet shell: HomeScreen, StatusBar, AppWindow,
                                   SettingsModal, TrophyModal…
  apps/
    registry.ts                    the apps on the home screen
    reading/
      ReadingApp.tsx               picks the screen: Grade Select, the library or a game
      pages/Hub/                   the library (Luna's Lessons, the Play Shelf)
      pages/GradeSelect/
      engine/GameShell/            the frame every game and lesson plays in:
                                   start, stage, perch, reward
      games/<Game>/                one folder per game (BubbleSounds, FeedLuna, LetterHunt…)
      games/shared/                pieces several games share (SpeakChip, StagePrompt…)
      lessons/<Type>/              one folder per lesson type (BlendAndRead, StoryReader…)
      lessons/shared/              LessonKit, LessonRound, lessonHooks
    writing/                       the Writing app (WRT), the same shape
```

Folders use the component's name in code (`FeedLuna`, `MemoryMatch`). A rename
to what the child sees ("Letter Cookies", "Muddled Cards") happens with its
GAME ticket.

## Building a new screen

1. **Start from the board** if one exists (the style sample, page "Round 2 ·
   Teacher's picks"). If none exists, build it from the kit, and Alex OKs the
   screenshots.
2. **Make its folder** with `<Name>.tsx` and `<Name>.module.scss`.
3. **Lay it out from kit components.** Write styles only for layout and for
   what's truly this screen's own, using roles, the space scale and the
   breakpoint mixin.
4. **Check heard, never shown:** nothing names the target before it's found.
5. **Run `npm run lint`,** then look at it in light and dark at the four sizes
   (`npm run ui:shots`).

## Restyling an existing screen

This is how the DES tickets move each area onto the system.
1. **Before:** `npm run ui:shots -- --label before`.
2. **Move it onto the kit:** buttons, cards, chips, answers. Swap each raw value
   for a role or token, and each local animation for a shared one.
3. **Drop what the kit now does,** along with the legacy partials
   (`_world.scss`, `_variables.scss`) for this area.
4. **Check the count:** `npm run design:status` shows the area at zero, and
   `npm run lint` passes.
5. **After:** `npm run ui:shots -- --label after`. Compare it with the board in
   light and dark, and get Alex's OK.
6. **Record it:** update the area's row on the map.

For a pure refactor (moving files, CSS modules), nothing may look different.
`npm run ui:shots -- --diff before after` must report 0 changed screens
(DES-18a).

## Screens with no board

The round 2 boards show the look, the home screen, the library, lesson
progress, a round, the lesson-done screen, the squishy shelf and Luna. They
don't show:
- Settings and the Trophy room;
- Grade Select;
- the game start screens;
- each game's own scenery;
- a Modal.

These are built from the kit and the roles, and Alex OKs the screenshots. The
teacher sees them only if they change the direction.

## Heard, never shown

- **Before it's found,** the `ListenCue` holds the target's place: a dashed
  arch with an ear, a large "?" and "tap to listen". Tapping it says the target
  again.
- **After it's solved,** the cue turns to the right tint and shows the answer,
  with "found it!".
- **What never appears before the round is solved:** a target letter, sound,
  word to find, or name under an answer picture.
- **Hints are spoken** (`SpeechPart[]`). On screen a hint is only a "Hear my
  clue" button.
- **The revealed state** of a `Choice` is the only time the app points at the
  answer unprompted, after repeated misses (FB-2).

## Copy voice

- Kid-facing text is short, and Luna can say every line of it. Where space is
  tight, she says it with no bubble (tap her to hear it again).
- Grown-up text (objectives, settings, times in detail) is plain and lives behind
  the gate (SET-1).
