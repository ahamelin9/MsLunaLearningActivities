// Ms. Luna's voice. She is a slightly dramatic librarian owl who loves mysteries,
// keeps losing things in her own library, and is genuinely delighted when a child
// figures something out. She talks in short bursts and never scolds.

import { pick } from './content';

export type LunaMood =
  | 'idle'
  | 'happy'
  | 'cheer'
  | 'think'
  | 'oops'
  | 'surprise'
  | 'listen'
  | 'sleepy';

export interface LunaLine {
  text: string;
  mood: LunaMood;
}

type Bank = Record<string, LunaLine[]>;

const GENERAL: Bank = {
  greet: [
    { text: 'Oh good, you came! I have games ready.', mood: 'happy' },
    { text: 'Welcome back to my library!', mood: 'happy' },
    { text: 'Shh… some letters are hiding in here again.', mood: 'surprise' },
    { text: 'I dusted the shelves AND lost my glasses. Twice.', mood: 'oops' },
    { text: 'Pick a game. I promise not to hide the pieces.', mood: 'happy' },
    { text: 'The reading tree grew a new star last night!', mood: 'surprise' }
  ],
  correct: [
    { text: 'YES! That’s the one!', mood: 'cheer' },
    { text: 'Whoa! You found it!', mood: 'cheer' },
    { text: 'Excellent detective work!', mood: 'happy' },
    { text: 'Your ears are SHARP today.', mood: 'cheer' },
    { text: 'I knew it. I knew you’d get that.', mood: 'happy' },
    { text: 'Beautiful. Absolutely beautiful.', mood: 'cheer' },
    { text: 'That’s it! Write it in the big book!', mood: 'cheer' },
    { text: 'Oh, you’re good at this.', mood: 'happy' }
  ],
  streak: [
    { text: 'Three in a row?! Are you a wizard?', mood: 'surprise' },
    { text: 'You’re on fire. Careful, my books are paper!', mood: 'cheer' },
    { text: 'I can barely keep up with you!', mood: 'cheer' }
  ],
  missFirst: [
    { text: 'Hmm… let’s look again.', mood: 'think' },
    { text: 'Almost! I think your ears got tricked.', mood: 'think' },
    { text: 'Ooh, close one. Try another.', mood: 'think' },
    { text: 'Not that one — but good thinking.', mood: 'think' },
    { text: 'Hold on. Let’s listen one more time.', mood: 'listen' }
  ],
  missAgain: [
    { text: 'Tricky, isn’t it? Here’s a clue.', mood: 'think' },
    { text: 'Okay, okay. I’ll help a little.', mood: 'happy' },
    { text: 'This one fools me too. Look here…', mood: 'think' },
    { text: 'Let me shine my lamp on it for you.', mood: 'think' }
  ],
  reveal: [
    { text: 'There it is! Sneaky thing.', mood: 'surprise' },
    { text: 'Aha — it was hiding right there.', mood: 'surprise' },
    { text: 'See? Now you’ll know it forever.', mood: 'happy' }
  ],
  finish: [
    { text: 'You did the whole thing! Sticker time.', mood: 'cheer' },
    { text: 'Round finished. My feathers are all fluffed up!', mood: 'cheer' },
    { text: 'That was wonderful reading work.', mood: 'happy' }
  ],
  quirk: [
    { text: 'Wait… did that letter just move?!', mood: 'surprise' },
    { text: 'Okay, I definitely didn’t hide that one…', mood: 'oops' },
    { text: 'My tea is getting cold. Worth it.', mood: 'happy' },
    { text: 'A book just sneezed. Ignore it.', mood: 'surprise' },
    { text: 'Don’t tell the other owls how fast you are.', mood: 'happy' }
  ],
  surprisePick: [
    { text: 'Close your eyes… I’m picking!', mood: 'surprise' },
    { text: 'Ooh! I have JUST the game.', mood: 'cheer' },
    { text: 'Spinning the old library wheel…', mood: 'think' },
    { text: 'Trust me on this one.', mood: 'happy' }
  ]
};

/** Per-game flavour so two games never sound alike. */
const PER_GAME: Record<string, Partial<Bank>> = {
  'sound-detective': {
    intro: [{ text: 'A sound is hiding in this room. Find who makes it!', mood: 'think' }],
    correct: [
      { text: 'Case closed! Detective work!', mood: 'cheer' },
      { text: 'You heard it before I did!', mood: 'surprise' }
    ],
    missFirst: [{ text: 'Listen to the very FIRST bit of the word.', mood: 'listen' }]
  },
  'letter-hunt': {
    intro: [{ text: 'The letters escaped the jar. Catch every one!', mood: 'oops' }],
    correct: [
      { text: 'Got one! Into the jar it goes.', mood: 'cheer' },
      { text: 'Caught it! Keep looking…', mood: 'happy' }
    ],
    missFirst: [{ text: 'Careful — some letters look like twins.', mood: 'think' }]
  },
  'bubble-sounds': {
    intro: [{ text: 'Bubbles! Pop only the right ones, quick!', mood: 'surprise' }],
    correct: [
      { text: 'POP! Nice one!', mood: 'cheer' },
      { text: 'Ha! Got it before it floated off.', mood: 'cheer' }
    ],
    missFirst: [{ text: 'Oops, wrong bubble. Soapy fingers!', mood: 'oops' }]
  },
  'feed-luna': {
    intro: [{ text: 'I’m hungry! Feed me the matching letter.', mood: 'happy' }],
    correct: [
      { text: 'Mmm! Crunchy letter. Delicious.', mood: 'cheer' },
      { text: 'Yum! That one tastes like honey.', mood: 'cheer' }
    ],
    missFirst: [{ text: 'Bleh! That one is the wrong flavour.', mood: 'oops' }]
  },
  'memory-match': {
    intro: [{ text: 'I mixed up my cards. Find the pairs!', mood: 'oops' }],
    correct: [
      { text: 'A pair! Put them on my desk.', mood: 'cheer' },
      { text: 'You remembered! I never do.', mood: 'surprise' }
    ],
    missFirst: [{ text: 'Not a pair. But now you know where they live.', mood: 'think' }]
  },
  'build-sentence': {
    intro: [{ text: 'The words fell off the page. Line them up!', mood: 'oops' }],
    correct: [
      { text: 'That sentence sounds just right!', mood: 'cheer' },
      { text: 'Perfect order. Very tidy.', mood: 'happy' }
    ],
    missFirst: [{ text: 'Hmm, that reads a little wobbly. Try again.', mood: 'think' }]
  },
  'whats-missing': {
    intro: [{ text: 'Look hard… I’m about to take something!', mood: 'surprise' }],
    correct: [
      { text: 'You spotted it! Nothing gets past you.', mood: 'cheer' },
      { text: 'Correct! I’ll put it back. Probably.', mood: 'happy' }
    ],
    missFirst: [{ text: 'That one is still on the desk. Look again!', mood: 'think' }]
  },
  'luna-says': {
    intro: [{ text: 'Ears only for this one. No peeking at words!', mood: 'listen' }],
    correct: [
      { text: 'That IS what I said! Good listening.', mood: 'cheer' },
      { text: 'You heard me perfectly.', mood: 'happy' }
    ],
    missFirst: [{ text: 'That’s not what I said. Listen once more.', mood: 'listen' }]
  },
  'treasure-read': {
    intro: [{ text: 'Read each stone or we’ll never reach the treasure!', mood: 'think' }],
    correct: [
      { text: 'Step forward! The chest is closer.', mood: 'cheer' },
      { text: 'Safe stone! Keep going.', mood: 'happy' }
    ],
    missFirst: [{ text: 'Careful, that stone wobbles. Read it again.', mood: 'think' }]
  },
  'sorting-baskets': {
    intro: [{ text: 'Everything is in the wrong basket. Help me!', mood: 'oops' }],
    correct: [
      { text: 'In it goes! Much tidier.', mood: 'cheer' },
      { text: 'Right basket. My shelves thank you.', mood: 'happy' }
    ],
    missFirst: [{ text: 'Hmm, that doesn’t belong there. Where else?', mood: 'think' }]
  },
  'story-time': {
    intro: [{ text: 'Snuggle in. A very short story…', mood: 'happy' }],
    correct: [
      { text: 'You were really reading! I can tell.', mood: 'cheer' },
      { text: 'That’s exactly what happened.', mood: 'happy' }
    ],
    missFirst: [{ text: 'Peek back at the story. The answer is in there.', mood: 'think' }]
  }
};

/** Every line Luna can say, for pre-generating her voice. */
export const LUNA_PHRASES: string[] = [
  ...Object.values(GENERAL).flat().map(l => l.text),
  ...Object.values(PER_GAME)
    .flatMap(bank => Object.values(bank))
    .flatMap(lines => lines ?? [])
    .map(l => l.text)
];

let lastText = '';

/**
 * Pick a line for a moment, preferring game-specific flavour and avoiding
 * an immediate repeat of the previous line.
 */
export function lunaSay(kind: keyof typeof GENERAL | 'intro', gameId?: string): LunaLine {
  const specific = gameId ? PER_GAME[gameId]?.[kind] : undefined;
  const general = GENERAL[kind] ?? GENERAL.happy ?? GENERAL.correct;
  const pool = [...(specific ?? []), ...(kind === 'intro' ? [] : general ?? [])];
  const options = pool.length > 0 ? pool : general;

  let line = pick(options);
  if (options.length > 1) {
    let guard = 0;
    while (line.text === lastText && guard < 5) {
      line = pick(options);
      guard++;
    }
  }
  lastText = line.text;
  return line;
}

/** Roughly one in six moments, Luna says something delightfully off-topic. */
export function maybeQuirk(chance = 0.16): LunaLine | null {
  return Math.random() < chance ? pick(GENERAL.quirk) : null;
}

export function greeting(): LunaLine {
  return lunaSay('greet');
}
