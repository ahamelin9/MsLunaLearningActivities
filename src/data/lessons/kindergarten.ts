// Kindergarten's lessons beyond the first six, and the rounds that grow those six
// (CUR-4a): every letter's sound and shape, short vowel words, sight words and
// rhymes. Written for Alex to review all at once.

import type { Lesson, LessonQuestion } from '../../types/reading';
import { blendRounds, huntRounds, rhymeRounds, sightRounds, soundRounds } from '../lessonRounds';

const SOUND_OUT = 'Sound out';

/** The first six lessons' new rounds, by lesson id. */
export const K_MORE_ROUNDS: Record<string, LessonQuestion[]> = {
  'k-ms-m-s-b-t': [
    ...soundRounds('M', ['milk', 'monkey'], 'k-ms'),
    ...soundRounds('S', ['sun', 'sock'], 'k-ms'),
    ...soundRounds('B', ['ball', 'bug'], 'k-ms'),
    ...soundRounds('T', ['tent', 'top'], 'k-ms'),
    ...soundRounds('A', ['apple', 'ant', 'ax'], 'k-ms')
  ],
  'k-lh-easy': huntRounds('k-lh', [
    ['B', 'Letter B has two bumps on its side!', 'D', 'P', 'R'],
    ['D', 'Letter D has one big round belly!', 'B', 'O', 'P'],
    ['N', 'Letter N has two posts and a slanted line!', 'M', 'H', 'Z'],
    ['W', 'Letter W looks like two valleys side by side!', 'M', 'V', 'N'],
    ['E', 'Letter E has three arms on one side!', 'F', 'B', 'L'],
    ['F', 'Letter F has two arms on top, and none at the bottom!', 'E', 'P', 'T'],
    ['O', 'Letter O is a big round circle!', 'Q', 'C', 'D']
  ]),
  'k-bw-animals': blendRounds(['b-a-t', 'r-a-t', 'h-e-n', 'f-o-x', 'p-u-p', 'b-u-g', 'd-u-ck', 'r-a-m', 'a-n-t'], SOUND_OUT, {
    lesson: 'k-bw',
    tier: 1
  }),
  // four pictures: a step up, as this lesson's first rounds are (CUR-5)
  'k-bw-everyday': blendRounds(
    ['b-o-x', 'p-e-n', 'j-a-m', 'c-a-p', 'm-a-p', 'n-e-t', 'f-a-n', 'v-a-n', 'b-u-s', 'p-o-t', 'p-a-n', 'c-a-n', 'b-a-g', 'l-o-g', 'm-u-g', 't-u-b'],
    SOUND_OUT,
    { lesson: 'k-bw', tier: 1, wrong: 3 }
  ),
  'k-sw-starter': [
    ...sightRounds('k-sw', 'see', ['sun', 'she'], [['I see a red ball.', '⚽']]),
    ...sightRounds('k-sw', 'the', ['she', 'then'], [['The cat is on the bed.', '🐱']]),
    ...sightRounds('k-sw', 'like', ['lake', 'bike'], [['I like my blue hat.', '🎩']]),
    ...sightRounds('k-sw', 'I', ['it', 'in'], [['I can see a frog.', '🐸']]),
    ...sightRounds('k-sw', 'a', ['at', 'an'], [['A bird can sing.', '🐦']])
  ],
  'k-rh-pairs': rhymeRounds(
    [['bat', 'rat', 'hat'], ['bun', 'sun'], ['dog', 'log'], ['bug', 'mug'], ['hen', 'pen', 'ten'], ['map', 'cap']],
    'k-rh'
  )
};

/** The lessons a skill in `readingCurriculum.ts` gains: each in its place on the path. */
const lesson = (id: string, skillId: string, title: string, description: string, icon: string, questions: LessonQuestion[]): Lesson => ({
  id,
  skillId,
  grade: 'kindergarten',
  title,
  description,
  icon,
  difficulty: 1,
  starsToEarn: 3,
  questions
});

export const K_SOUNDS_2 = lesson('k-ms-p-n-c-d-i', 'k-match-sounds', 'Sounds: P, N, C, D & I', 'Listen to five new letter sounds and find each letter.', '🎶', [
  ...soundRounds('P', ['pig', 'pan', 'pen'], 'k-s2'),
  ...soundRounds('N', ['nut', 'net', 'nest'], 'k-s2'),
  ...soundRounds('C', ['cat', 'cup', 'car'], 'k-s2', 'k'),
  ...soundRounds('D', ['dog', 'duck', 'doll'], 'k-s2'),
  ...soundRounds('I', ['igloo', 'insect', 'ink'], 'k-s2')
]);

export const K_SOUNDS_3 = lesson('k-ms-f-g-h-l-o', 'k-match-sounds', 'Sounds: F, G, H, L & O', 'Listen to five more letter sounds and find each letter.', '🎶', [
  ...soundRounds('F', ['fox', 'fan', 'fish'], 'k-s3'),
  ...soundRounds('G', ['goat', 'gift', 'girl'], 'k-s3'),
  ...soundRounds('H', ['hat', 'hen', 'hand'], 'k-s3'),
  ...soundRounds('L', ['lion', 'leaf', 'lemon'], 'k-s3'),
  ...soundRounds('O', ['ox', 'octopus', 'olive'], 'k-s3')
]);

export const K_SOUNDS_4 = lesson('k-ms-j-k-r-v-u', 'k-match-sounds', 'Sounds: J, K, R, V & U', 'Listen to five more letter sounds and find each letter.', '🎶', [
  ...soundRounds('J', ['jam', 'jet', 'juice'], 'k-s4'),
  ...soundRounds('K', ['key', 'king', 'kite'], 'k-s4'),
  ...soundRounds('R', ['rabbit', 'ring', 'robot'], 'k-s4'),
  ...soundRounds('V', ['van', 'vase', 'vest'], 'k-s4'),
  ...soundRounds('U', ['umbrella', 'up', 'under'], 'k-s4')
]);

export const K_SOUNDS_5 = lesson('k-ms-w-y-z-e-q-x', 'k-match-sounds', 'Sounds: W, Y, Z, E, Q & X', 'Listen to the last letter sounds and find each letter.', '🎶', [
  ...soundRounds('W', ['web', 'wolf', 'window'], 'k-s5'),
  ...soundRounds('Y', ['yarn', 'yes', 'yellow'], 'k-s5'),
  ...soundRounds('Z', ['zebra', 'zoo', 'zipper'], 'k-s5'),
  ...soundRounds('E', ['egg', 'elephant', 'elbow'], 'k-s5'),
  ...soundRounds('Q', ['queen', 'quilt', 'quiet'], 'k-s5'),
  ...soundRounds('X', ['box', 'fox', 'six'], 'k-s5')
]);

export const K_HUNT_2 = lesson('k-lh-more', 'k-letter-hunter', 'More Letter Hunting', 'Hear a letter’s name and spot it among look-alikes.', '🔎', huntRounds('k-lh2', [
  ['C', 'Letter C is a circle with its mouth open!', 'G', 'O', 'Q'],
  ['G', 'Letter G is a C with a little shelf!', 'C', 'O', 'Q'],
  ['H', 'Letter H looks like two posts and a bridge!', 'N', 'K', 'M'],
  ['K', 'Letter K has one post and two arms kicking out!', 'H', 'X', 'R'],
  ['L', 'Letter L is a tall line with a foot!', 'I', 'T', 'J'],
  ['P', 'Letter P is a post with one bump on top!', 'B', 'R', 'F'],
  ['Q', 'Letter Q is a circle with a little tail!', 'O', 'G', 'C'],
  ['R', 'Letter R is like P with a leg kicking out!', 'P', 'B', 'K'],
  ['T', 'Letter T is a tall post with a flat top!', 'I', 'L', 'F'],
  ['U', 'Letter U looks like a cup!', 'V', 'J', 'O'],
  ['V', 'Letter V comes to a point at the bottom!', 'U', 'W', 'Y'],
  ['X', 'Letter X is two lines that cross!', 'K', 'Y', 'Z'],
  ['Y', 'Letter Y has two arms up and one leg down!', 'V', 'X', 'T'],
  ['Z', 'Letter Z zigs and zags!', 'N', 'S', 'X'],
  ['I', 'Letter I is one straight line, with a top and a bottom!', 'L', 'T', 'J'],
  ['J', 'Letter J is a line with a hook at the bottom!', 'L', 'U', 'I']
]));

export const K_HUNT_3 = lesson('k-lh-little', 'k-letter-hunter', 'Little Letters', 'Hear a letter’s name and spot its little letter.', '🔎', huntRounds('k-lh3', [
  ['b', 'Little B has a tall stick, then a round belly!', 'd', 'p', 'q'],
  ['d', 'Little D has a round belly, then a tall stick!', 'b', 'p', 'q'],
  ['p', 'Little P has a tail going down, then a round belly!', 'q', 'b', 'd'],
  ['q', 'Little Q has a round belly, then a tail going down!', 'p', 'd', 'g'],
  ['a', 'Little A is round, with a stick on its side!', 'o', 'd', 'e'],
  ['e', 'Little E has a line across its middle!', 'c', 'a', 'o'],
  ['g', 'Little G has a round top and a tail that hooks!', 'q', 'y', 'p'],
  ['h', 'Little H has a tall stick and one hump!', 'n', 'b', 'k'],
  ['n', 'Little N has a short stick and one hump!', 'h', 'm', 'u'],
  ['m', 'Little M has two humps!', 'n', 'w', 'h'],
  ['u', 'Little U looks like a little cup!', 'n', 'v', 'w'],
  ['t', 'Little T looks like a little cross!', 'f', 'l', 'i'],
  ['f', 'Little F has a hook on top and a line across!', 't', 'l', 'j'],
  ['r', 'Little R is a short stick with a little arm!', 'n', 'v', 't'],
  ['y', 'Little Y has a tail going down!', 'v', 'g', 'j']
]));

export const K_SHORT_A = lesson('k-bw-short-a', 'k-blend-words', 'Short A Words', 'Sound out words with the short A sound.', '🎒', blendRounds(
  ['b-a-g', 'c-a-b', 'c-a-n', 'f-a-n', 'h-a-t', 'j-a-m', 'm-a-n', 'm-a-p', 'p-a-n', 'r-a-t', 't-a-g', 'v-a-n', 'b-a-t', 'c-a-p', 'c-a-t'],
  SOUND_OUT,
  { lesson: 'k-sa', tier: 1 }
));

export const K_SHORT_I_O = lesson('k-bw-short-i-o', 'k-blend-words', 'Short I & O Words', 'Sound out words with the short I and O sounds.', '📦', blendRounds(
  ['p-i-g', 'p-i-n', 'l-i-p', 's-i-x', 'k-i-d', 'b-o-x', 'd-o-g', 'f-o-x', 'l-o-g', 'p-o-t', 'r-o-ck', 's-o-ck', 'l-o-ck', 'o-x'],
  SOUND_OUT,
  { lesson: 'k-sio', tier: 1 }
));

export const K_SHORT_E_U = lesson('k-bw-short-e-u', 'k-blend-words', 'Short E & U Words', 'Sound out words with the short E and U sounds.', '🔔', blendRounds(
  ['b-e-d', 'h-e-n', 'j-e-t', 'l-e-g', 'n-e-t', 'p-e-n', 't-e-n', 'w-e-b', 'b-e-ll', 'b-u-g', 'b-u-n', 'b-u-s', 'c-u-p', 'd-u-ck', 'h-u-g', 'm-u-g', 'n-u-t', 'p-u-p', 'r-u-n', 's-u-n', 't-u-b'],
  SOUND_OUT,
  { lesson: 'k-seu', tier: 1, wrong: 3 }
));

// none of a sight lesson's words in its title or on Luna's perch (CUR-3)
export const K_SIGHT_2 = lesson('k-sw-second', 'k-sight-words', 'Sight Words 2', 'Hear a word, then find it among look-alikes.', '👀', [
  ...sightRounds('k-sw2', 'is', ['in', 'as'], [['The sun is hot.', '☀️'], ['My dog is big.', '🐶']]),
  ...sightRounds('k-sw2', 'it', ['is', 'at'], [['I can see it.', '👀'], ['It is a fun game.', '🎮']]),
  ...sightRounds('k-sw2', 'in', ['is', 'on'], [['The fish is in the bowl.', '🐟'], ['The bird is in the tree.', '🐦']]),
  ...sightRounds('k-sw2', 'at', ['it', 'an'], [['Look at the moon.', '🌙'], ['We play at the park.', '🛝']]),
  ...sightRounds('k-sw2', 'my', ['me', 'by'], [['This is my cat.', '🐱'], ['I love my mom.', '🥰']]),
  ...sightRounds('k-sw2', 'you', ['your', 'yes'], [['I see you!', '👋'], ['You can jump high.', '🐸']])
]);

export const K_SIGHT_3 = lesson('k-sw-third', 'k-sight-words', 'Sight Words 3', 'Hear a word, then find it among look-alikes.', '👀', [
  ...sightRounds('k-sw3', 'we', ['wet', 'me'], [['We can run fast.', '🏃'], ['We go to school.', '🏫']]),
  ...sightRounds('k-sw3', 'can', ['cat', 'man'], [['I can hop.', '🐰'], ['A bird can fly.', '🐦']]),
  ...sightRounds('k-sw3', 'he', ['she', 'her'], [['He has a red cap.', '🧢'], ['He can kick the ball.', '⚽']]),
  ...sightRounds('k-sw3', 'she', ['he', 'see'], [['She has a pet dog.', '🐶'], ['She can swim fast.', '🏊']]),
  ...sightRounds('k-sw3', 'me', ['my', 'we'], [['Come with me.', '🤝'], ['Look at me!', '😀']]),
  ...sightRounds('k-sw3', 'to', ['top', 'do'], [['We go to the zoo.', '🦁'], ['I go to bed.', '🛏️']])
]);

export const K_SIGHT_4 = lesson('k-sw-fourth', 'k-sight-words', 'Sight Words 4', 'Hear a word, then find it among look-alikes.', '👀', [
  ...sightRounds('k-sw4', 'and', ['an', 'end'], [['I see a cat and a dog.', '🐱'], ['Mom and I bake a cake.', '🎂']]),
  ...sightRounds('k-sw4', 'go', ['no', 'got'], [['Let’s go to the park!', '🛝'], ['The cars go fast.', '🚗']]),
  ...sightRounds('k-sw4', 'no', ['not', 'on'], [['I have no hat.', '🎩'], ['No, thank you!', '🙂']]),
  ...sightRounds('k-sw4', 'up', ['us', 'cup'], [['The kite goes up.', '🪁'], ['Look up at the stars.', '⭐']]),
  ...sightRounds('k-sw4', 'on', ['off', 'no'], [['The cat sits on the bed.', '🐱'], ['Put on your hat.', '🎩']]),
  ...sightRounds('k-sw4', 'look', ['book', 'lock'], [['Look at the big bug!', '🐛'], ['Look, it is snowing!', '❄️']])
]);

export const K_RHYME_2 = lesson('k-rh-more', 'k-rhyming', 'More Rhymes', 'Listen for words that end the same.', '🎩', rhymeRounds(
  [['can', 'fan', 'man', 'pan', 'van'], ['bag', 'tag'], ['jam', 'ram'], ['jet', 'net'], ['lock', 'rock', 'sock'], ['king', 'ring'], ['cup', 'pup'], ['bell', 'shell']],
  'k-rh2'
));
