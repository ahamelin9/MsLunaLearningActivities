// First grade's lessons beyond the first three, and the rounds that grow those
// three (CUR-4b): letter teams, blends, magic E, sight words, rhymes, sentences
// and little stories. Written for Alex to review all at once.

import type { Lesson, LessonQuestion } from '../../types/reading';
import { blendRounds, readRounds, rhymeRounds, sentenceRounds, storyRounds } from '../lessonRounds';
import { G1_DOLCH, ORDINALS, sightLesson } from './dolch';

const BLEND = 'Blend the sounds:';
const MAGIC_E = 'Read the word, then find its picture. The magic E makes the vowel say its name!';
const READ_BLEND = 'Read the word, then find its picture. Listen for the two letters at the start!';
const READ_IT = 'Read this word!';

const WHICH_ANIMAL = 'Tap any word to hear it. Which animal is in the sentence?';
const WHAT_ABOUT = 'Tap any word to hear it. What is the sentence about?';

export const G1_MORE_ROUNDS: Record<string, LessonQuestion[]> = {
  'g1-ph-digraphs': blendRounds(['sh-e-ll', 'ch-i-ck', 'fl-a-g', 'cr-a-b', 'dr-u-m', 'st-o-p', 'sh-ee-p', 'tr-u-ck'], BLEND, { lesson: 'g1-ph', tier: 2 }),
  'g1-bw-magic-e': readRounds(['game', 'bike', 'rose', 'nose', 'wave', 'five', 'rope'], 'Read this Magic E word!', MAGIC_E, { lesson: 'g1-bw', tier: 2 }),
  'g1-rs-happy-pets': sentenceRounds('g1-rs', [
    ['The big dog digs a hole.', WHICH_ANIMAL, ['dog', 'Dog digging'], ['cat', 'Cat on a bed'], ['duck', 'Duck in a pond']],
    ['A fat hen sits on her eggs.', WHICH_ANIMAL, ['hen', 'Hen on a nest'], ['pig', 'Pig in the mud'], ['fish', 'Fish in a bowl']],
    ['The little duck swims in the pond.', WHICH_ANIMAL, ['duck', 'Duck swimming'], ['bird', 'Bird on a branch'], ['dog', 'Dog with a ball']],
    ['The bat sleeps all day.', WHICH_ANIMAL, ['bat', 'Bat sleeping'], ['fox', 'Fox running'], ['hen', 'Hen pecking']],
    ['A red fox runs past the log.', WHICH_ANIMAL, ['fox', 'Fox running fast'], ['frog', 'Frog on a rock'], ['pig', 'Pig eating']],
    ['The pig rolls in the mud.', WHICH_ANIMAL, ['pig', 'Muddy pig'], ['duck', 'Duck swimming'], ['cat', 'Cat on a bed']],
    ['The fish swims in a bowl.', WHICH_ANIMAL, ['fish', 'Fish swimming'], ['bird', 'Bird flying'], ['bear', 'Bear sleeping']],
    ['A bird sings in the tree.', WHICH_ANIMAL, ['bird', 'Bird singing'], ['frog', 'Frog jumping'], ['dog', 'Dog barking']]
  ])
};

const lesson = (id: string, skillId: string, title: string, description: string, icon: string, questions: LessonQuestion[], perPlay?: number): Lesson => ({
  id,
  skillId,
  grade: 'grade1',
  title,
  description,
  icon,
  difficulty: 2,
  starsToEarn: 3,
  perPlay,
  questions
});

export const G1_SH_CH = lesson('g1-ph-sh-ch', 'g1-digraphs', 'SH & CH Words', 'Sound out words with the letter teams SH and CH.', '🐚', blendRounds(
  ['sh-i-p', 'sh-e-ll', 'sh-ee-p', 'sh-ar-k', 'sh-ir-t', 'sh-or-t-s', 'f-i-sh', 'ch-i-ck', 'ch-ee-se', 'ch-ai-n', 'b-ea-ch', 'p-ea-ch'],
  BLEND,
  { lesson: 'g1-sc', tier: 2 }
));

export const G1_TH_WH = lesson('g1-ph-th-wh-ck', 'g1-digraphs', 'TH, WH, CK & NG', 'Sound out words with more letter teams.', '🦆', blendRounds(
  ['wh-ee-l', 'th-r-ee', 't-oo-th', 'd-u-ck', 's-o-ck', 'r-o-ck', 'l-o-ck', 'cl-o-ck', 'k-i-ng', 'r-i-ng', 'tr-u-ck'],
  BLEND,
  { lesson: 'g1-tw', tier: 2 }
));

export const G1_L_BLENDS = lesson('g1-ph-l-blends', 'g1-digraphs', 'Blends with L', 'Read words that start with FL, PL, CL, GL and SL.', '🚩', [
  ...blendRounds(['fl-a-g', 'pl-u-g', 'pl-a-n-t', 'sl-e-d', 'cl-o-ck'], BLEND, { lesson: 'g1-lb', tier: 2 }),
  ...readRounds(['flower', 'plane', 'plate', 'cloud', 'glove', 'globe', 'slide', 'flute'], READ_IT, READ_BLEND, { lesson: 'g1-lb', tier: 2 })
]);

export const G1_R_BLENDS = lesson('g1-ph-r-blends', 'g1-digraphs', 'Blends with R', 'Read words that start with CR, DR, BR, FR, GR and TR.', '🥁', [
  ...blendRounds(['cr-a-b', 'dr-u-m', 'dr-e-ss', 'br-i-ck', 'fr-o-g', 'tr-u-ck', 'tr-ee', 'br-oo-m', 'tr-ai-n'], BLEND, { lesson: 'g1-rb', tier: 2 }),
  ...readRounds(['crown', 'crayon', 'dragon', 'bread', 'grape', 'bridge', 'trophy'], READ_IT, READ_BLEND, { lesson: 'g1-rb', tier: 2 })
]);

export const G1_S_BLENDS = lesson('g1-ph-s-blends', 'g1-digraphs', 'Blends with S', 'Read words that start with ST, SN, SP, SK and SW.', '⭐', [
  ...blendRounds(['st-o-p', 'st-ar', 'sn-ai-l', 'sp-oo-n', 'sk-u-n-k'], BLEND, { lesson: 'g1-sb', tier: 2 }),
  ...readRounds(['snake', 'snow', 'spider', 'skate', 'ski', 'swan', 'store'], READ_IT, READ_BLEND, { lesson: 'g1-sb', tier: 2 })
]);

export const G1_MAGIC_A = lesson('g1-bw-magic-a', 'g1-magic-e', 'Magic E with A', 'Read words where magic E makes the A say its name.', '🐍', readRounds(
  ['cake', 'game', 'wave', 'vase', 'plate', 'plane', 'snake', 'whale', 'grape', 'skate', 'ape'],
  'Read this Magic E word!',
  MAGIC_E,
  { lesson: 'g1-ma', tier: 2, wrong: 3 }
));

export const G1_MAGIC_I_O = lesson('g1-bw-magic-i-o', 'g1-magic-e', 'Magic E with I, O & U', 'Read words where magic E makes the vowel say its name.', '🪁', readRounds(
  ['kite', 'bike', 'five', 'nine', 'rice', 'slide', 'rose', 'nose', 'bone', 'rope', 'globe', 'flute'],
  'Read this Magic E word!',
  MAGIC_E,
  { lesson: 'g1-mi', tier: 2, wrong: 3 }
));

export const G1_RHYMES = lesson('g1-rh-long', 'g1-rhymes', 'Rhyme Time', 'Listen for words that end the same.', '🎵', rhymeRounds(
  [
    ['cake', 'snake'],
    ['bee', 'tree', 'three', 'key', 'ski'],
    ['moon', 'spoon'],
    ['star', 'car', 'jar'],
    ['boat', 'coat', 'goat'],
    ['rain', 'train', 'chain', 'plane'],
    ['mail', 'snail', 'whale'],
    ['light', 'night'],
    ['nose', 'rose'],
    ['house', 'mouse']
  ],
  'g1-rh',
  3
));

// none of a sight lesson's words in its title or on Luna's perch (CUR-3)
export const G1_SIGHT_1 = lesson('g1-sw-first', 'g1-sight-words', 'Sight Words 1', 'Hear a word, then find it among look-alikes.', '👀', sightLesson('g1-sw1', G1_DOLCH[0]));

export const G1_SIGHT_2 = lesson('g1-sw-second', 'g1-sight-words', 'Sight Words 2', 'Hear a word, then find it among look-alikes.', '👀', sightLesson('g1-sw2', G1_DOLCH[1]));

export const G1_SIGHT_3 = lesson('g1-sw-third', 'g1-sight-words', 'Sight Words 3', 'Hear a word, then find it among look-alikes.', '👀', sightLesson('g1-sw3', G1_DOLCH[2]));

/** Sight Words 4 on: the rest of Dolch 1–100 (CUR-27b), 10 words a lesson. */
export const G1_SIGHT_MORE: Lesson[] = G1_DOLCH.slice(3).map((rows, i) =>
  lesson(`g1-sw-${ORDINALS[i + 3]}`, 'g1-sight-words', `Sight Words ${i + 4}`, 'Hear a word, then find it among look-alikes.', '👀', sightLesson(`g1-sw${i + 4}`, rows))
);

export const G1_SENTENCES_2 = lesson('g1-rs-home', 'g1-sentences', 'Sentences at Home', 'Read sentences about home and food.', '🏠', sentenceRounds('g1-rh2', [
  ['Mom puts the cake on the table.', WHAT_ABOUT, ['cake', 'A sweet treat'], ['apple', 'Fruit on a tree'], ['egg', 'Egg in a nest']],
  ['The milk is in the cup.', WHAT_ABOUT, ['milk', 'Something to drink'], ['jam', 'Something on toast'], ['cheese', 'Something to slice']],
  ['Dad makes a big pancake.', WHAT_ABOUT, ['pancake', 'Breakfast with syrup'], ['donut', 'Sweet with a hole'], ['bun', 'Soft and round']],
  ['I wear my hat when it is cold.', WHAT_ABOUT, ['hat', 'It goes on my head'], ['shoe', 'It goes on my foot'], ['fan', 'It cools me off']],
  ['The key is on the table.', WHAT_ABOUT, ['key', 'It opens the door'], ['bell', 'It rings'], ['pen', 'It writes']],
  ['My bed is soft and warm.', WHAT_ABOUT, ['bed', 'A cozy place to sleep'], ['chair', 'A place to sit'], ['tub', 'A place to wash']],
  ['The clock says it is time for lunch.', WHAT_ABOUT, ['clock', 'It tells the time'], ['book', 'It has a story'], ['soap', 'It makes bubbles']],
  ['I wash my hands with soap.', WHAT_ABOUT, ['soap', 'It gets me clean'], ['spoon', 'It helps me eat'], ['pen', 'It helps me write']],
  ['Sam has a book in bed.', WHAT_ABOUT, ['book', 'Pages with a story'], ['ball', 'Fun to kick'], ['drum', 'Fun to bang']],
  ['The spoon is next to the bowl.', WHAT_ABOUT, ['spoon', 'For eating soup'], ['pen', 'For writing'], ['bell', 'For ringing']]
]));

export const G1_SENTENCES_3 = lesson('g1-rs-outside', 'g1-sentences', 'Sentences Outside', 'Read sentences about going outside.', '🌳', sentenceRounds('g1-ro', [
  ['The sun is hot today.', WHAT_ABOUT, ['sun', 'A bright, warm day'], ['snow', 'Cold, white flakes'], ['moon', 'A dark night sky']],
  ['Snow falls on the hill.', WHAT_ABOUT, ['snow', 'Cold and white'], ['sun', 'Hot and bright'], ['leaf', 'Green and flat']],
  ['The kite flies up high.', WHAT_ABOUT, ['kite', 'Up on a string'], ['boat', 'Floating on water'], ['bus', 'Driving on a road']],
  ['A boat sails on the lake.', WHAT_ABOUT, ['boat', 'Floating on water'], ['kite', 'Up on a string'], ['truck', 'Driving on a road']],
  ['The bus stops at school.', WHAT_ABOUT, ['bus', 'A ride for children'], ['ship', 'A ride on the sea'], ['plane', 'A ride in the sky']],
  ['We ride our bikes to the park.', WHAT_ABOUT, ['bike', 'Two wheels and pedals'], ['train', 'Rolls on tracks'], ['ship', 'Sails on the sea']],
  ['The rain makes big puddles.', WHAT_ABOUT, ['rain', 'A wet day'], ['sun', 'A sunny day'], ['star', 'A starry night']],
  ['A pink flower grows by the gate.', WHAT_ABOUT, ['flower', 'In the garden'], ['tree', 'Tall with a trunk'], ['rock', 'Hard and gray']],
  ['The moon is out at night.', WHAT_ABOUT, ['moon', 'Shining in the dark'], ['sun', 'Shining all day'], ['cloud', 'Soft and white']],
  ['The train goes fast on the track.', WHAT_ABOUT, ['train', 'Rolling on the rails'], ['car', 'Driving down the road'], ['boat', 'Floating on the lake']]
]));

export const G1_STORIES_1 = lesson('g1-story-little', 'g1-stories', 'Little Stories', 'Read a little story yourself, then answer some questions.', '📖', storyRounds('g1-st1', [
  {
    title: 'The Big Red Hen',
    picture: '🐔',
    lines: ['A big red hen sat on a nest.', 'She had six eggs in the nest.', 'She sat and sat.', 'Then the eggs went crack!'],
    questions: [
      { question: 'What came out of the eggs?', answers: ['Little chicks', 'Little ducks', 'Little pigs'], because: 'Yes! Little chicks came out of the eggs.' },
      { question: 'How many eggs did the hen have?', answers: ['Six', 'Two', 'Ten'], because: 'Yes! She had six eggs in her nest.' },
      { question: 'What color is the hen?', answers: ['Red', 'Black', 'White'], because: 'That’s right! She is a big red hen.' },
      { question: 'What did the eggs do?', answers: ['They cracked', 'They rolled away', 'They got wet'], because: 'Yes! The eggs went crack!' }
    ]
  },
  {
    title: 'Sam and the Ship',
    picture: '🚢',
    lines: ['Sam has a small ship.', 'It can float in the tub.', 'Splash! The ship tips.', 'Sam picks it up and sets it back.'],
    questions: [
      { question: 'Where does the ship float?', answers: ['The tub', 'The sink', 'The pond'], because: 'That’s right! The ship floats in the tub.' },
      { question: 'Is Sam’s ship big or small?', answers: ['Small', 'Big', 'Long'], because: 'That’s right! Sam has a small ship.' },
      { question: 'What happens to the ship?', answers: ['It tips over', 'It sinks to the bottom', 'It flies away'], because: 'Yes! Splash! The ship tips.' },
      { question: 'What does Sam do then?', answers: ['He puts it back in the water', 'He throws it away', 'He goes to bed'], because: 'Yes! Sam picks it up and sets it back.' }
    ]
  },
  {
    title: 'Frog and Bug',
    picture: '🐸',
    lines: ['A green frog sits on a log.', 'A bug lands next to the frog.', 'Zip! The frog gets the bug.', 'Yum! The frog is glad.'],
    questions: [
      { question: 'What does the frog eat?', answers: ['A bug', 'A leaf', 'A fish'], because: 'Yes! The frog gets the bug and eats it.' },
      { question: 'Where does the frog sit?', answers: ['A log', 'A rock', 'A lily pad'], because: 'Yes! The frog sits on a log.' },
      { question: 'What color is the frog?', answers: ['Green', 'Red', 'Blue'], because: 'That’s right! It is a green frog.' },
      { question: 'How does the frog feel at the end?', answers: ['Glad', 'Sad', 'Mad'], because: 'Yes! Yum! The frog is glad.' }
    ]
  },
  {
    title: 'Pip’s Black Hat',
    picture: '🎩',
    lines: ['Pip has a black hat.', 'The wind blows and the hat flips off.', 'It lands on a fat cat!', 'The cat runs, and Pip runs too.'],
    questions: [
      { question: 'Where does the hat land?', answers: ['On a cat', 'In a tree', 'On a bus'], because: 'Yes! The hat lands on a fat cat.' },
      { question: 'What color is Pip’s hat?', answers: ['Black', 'Red', 'Green'], because: 'Yes! Pip has a black hat.' },
      { question: 'What makes the hat flip off?', answers: ['The wind', 'The cat', 'A dog'], because: 'That’s right! The wind blows the hat off.' },
      { question: 'What does the cat do?', answers: ['It runs', 'It naps', 'It sings'], because: 'Yes! The cat runs, and Pip runs after it.' }
    ]
  },
  {
    title: 'A Fish for Beth',
    picture: '🐟',
    lines: ['Dad and Beth go to the lake.', 'Dad has a rod and Beth has a net.', 'Beth gets a big fish in the net!', 'Dad claps and Beth grins.'],
    questions: [
      { question: 'Who gets the fish?', answers: ['Beth', 'Dad', 'The cat'], because: 'That’s right! Beth gets the fish with her net.' },
      { question: 'Where do Dad and Beth go?', answers: ['The lake', 'The shop', 'The zoo'], because: 'Yes! They go to the lake.' },
      { question: 'What does Beth have?', answers: ['A net', 'A rod', 'A bucket'], because: 'That’s right! Beth has a net, and Dad has a rod.' },
      { question: 'What does Dad do when Beth gets the fish?', answers: ['He claps', 'He cries', 'He runs off'], because: 'Yes! Dad claps for Beth.' }
    ]
  },
  {
    title: 'Luna’s Lunch',
    picture: '🍱',
    lines: ['Ms. Luna has a lunch box.', 'In the box is a plum and a bun.', 'She munches the bun and then the plum.', 'Luna is full, so she naps on a branch.'],
    questions: [
      { question: 'What does Luna do after lunch?', answers: ['She takes a nap', 'She goes for a swim', 'She rides a bus'], because: 'Yes! Luna is full, so she naps on a branch.' },
      { question: 'What is in the lunch box?', answers: ['A bun and a plum', 'A cake and an egg', 'A fish and a nut'], because: 'Yes! There is a plum and a bun.' },
      { question: 'What does Luna eat first?', answers: ['The bun', 'The plum', 'An apple'], because: 'That’s right! She munches the bun first, then the plum.' },
      { question: 'Where does Luna nap?', answers: ['Up in a tree', 'In a bed', 'On a boat'], because: 'Yes! She naps on a branch, up in her tree.' }
    ]
  },
  {
    title: 'The Pet Duck',
    picture: '🦆',
    lines: [
      'Meg has a pet duck.',
      'The duck likes to swim in the pond.',
      'One day it swims to a log.',
      'Meg calls, and the duck swims back to her.'
    ],
    questions: [
      { question: 'What pet does Meg have?', answers: ['A duck', 'A cat', 'A fish'], because: 'Yes! Meg has a pet duck.' },
      { question: 'Where does the duck like to swim?', answers: ['The pond', 'The tub', 'The sea'], because: 'That’s right! It swims in the pond.' },
      { question: 'What does the duck swim to one day?', answers: ['A log', 'A boat', 'A rock'], because: 'Yes! It swims to a log.' },
      { question: 'What does the duck do when Meg calls?', answers: ['It swims back', 'It flies off', 'It hides'], because: 'Yes! The duck swims back to Meg.' }
    ]
  },
  {
    title: 'Bath Time for Rex',
    picture: '🐶',
    lines: [
      'Rex the dog is all mud.',
      'Dad fills the tub.',
      'Rex jumps in with a big splash!',
      'Now Rex is wet, and Dad is wet too.'
    ],
    questions: [
      { question: 'Who needs a bath?', answers: ['The dog', 'The cat', 'Dad'], because: 'Yes! Rex the dog is all mud.' },
      { question: 'Why does Rex need a bath?', answers: ['He is muddy', 'He is cold', 'He is hungry'], because: 'That’s right! Rex is all mud.' },
      { question: 'How does Rex get in the tub?', answers: ['He jumps in', 'He walks in slowly', 'Dad lifts him in'], because: 'Yes! Rex jumps in with a big splash!' },
      { question: 'Who gets wet?', answers: ['Rex and Dad', 'Just Rex', 'Just Dad'], because: 'Yes! Rex and Dad both get wet.' }
    ]
  },
  {
    title: 'The Red Bus',
    picture: '🚌',
    lines: [
      'Kim gets on the red bus.',
      'It stops at the shop.',
      'Kim hops off and picks a hat.',
      'Then she rides the bus back home.'
    ],
    questions: [
      { question: 'What color is the bus?', answers: ['Red', 'Yellow', 'Blue'], because: 'Yes! Kim gets on the red bus.' },
      { question: 'Where does the bus stop?', answers: ['The shop', 'The park', 'The pond'], because: 'That’s right! It stops at the shop.' },
      { question: 'What does Kim get at the shop?', answers: ['A hat', 'A cake', 'A doll'], because: 'Yes! Kim picks a hat.' },
      { question: 'How does Kim get home?', answers: ['On the bus', 'She walks', 'In a car'], because: 'Yes! She rides the bus back home.' }
    ]
  },
  {
    title: 'Luna Sees a Star',
    picture: '⭐',
    lines: [
      'It is night, and Ms. Luna is up.',
      'She sees a star in the sky.',
      'She makes a wish on it.',
      'Then she shuts her eyes and sleeps.'
    ],
    questions: [
      { question: 'When is Luna up?', answers: ['At night', 'In the morning', 'At lunch'], because: 'Yes! It is night, and Luna is up.' },
      { question: 'What does Luna see?', answers: ['A star', 'A cat', 'A kite'], because: 'That’s right! She sees a star in the sky.' },
      { question: 'What does Luna make?', answers: ['A wish', 'A cake', 'A hat'], because: 'Yes! She makes a wish on the star.' },
      { question: 'What does Luna do at the end?', answers: ['She sleeps', 'She sings', 'She eats'], because: 'Yes! She shuts her eyes and sleeps.' }
    ]
  }
]), 5);

export const G1_STORIES_2 = lesson('g1-story-more', 'g1-stories', 'More Little Stories', 'Read a little story yourself, then answer some questions.', '📖', storyRounds('g1-st2', [
  {
    title: 'Jake’s Kite',
    picture: '🪁',
    lines: ['Jake has a kite with a long tail.', 'He runs up the hill with it.', 'The wind lifts the kite up, up, up!', 'Jake smiles and holds the string.'],
    questions: [
      { question: 'Where does Jake run?', answers: ['Up a hill', 'Into a lake', 'To the store'], because: 'Yes! Jake runs up the hill with his kite.' },
      { question: 'What is long on the kite?', answers: ['The tail', 'The string', 'The stick'], because: 'Yes! Jake’s kite has a long tail.' },
      { question: 'What lifts the kite up?', answers: ['The wind', 'Jake’s dad', 'A bird'], because: 'That’s right! The wind lifts it up, up, up!' },
      { question: 'How does Jake feel?', answers: ['Happy', 'Sad', 'Scared'], because: 'Yes! Jake smiles, so he is happy.' }
    ]
  },
  {
    title: 'The Snow Day',
    picture: '❄️',
    lines: ['Snow falls on the hill.', 'Kate gets her sled and her red hat.', 'Whee! The sled slides down fast.', 'Kate runs back up to go once more.'],
    questions: [
      { question: 'What does Kate ride down the hill?', answers: ['A sled', 'A bike', 'A bus'], because: 'That’s right! Kate rides her sled down the hill.' },
      { question: 'What falls on the hill?', answers: ['Snow', 'Rain', 'Leaves'], because: 'Yes! Snow falls on the hill.' },
      { question: 'What color is Kate’s hat?', answers: ['Red', 'Blue', 'Green'], because: 'That’s right! Kate has a red hat.' },
      { question: 'What does Kate do at the end?', answers: ['She goes again', 'She goes home', 'She takes a nap'], because: 'Yes! Kate runs back up to go once more.' }
    ]
  },
  {
    title: 'A Snack for Pip',
    picture: '🍇',
    lines: ['Pip is hungry at the park.', 'He opens his bag and finds a bunch of grapes.', 'He gives some to Luna.', 'They munch and smile on the bench.'],
    questions: [
      { question: 'What does Pip do with the grapes?', answers: ['He shares them', 'He drops them', 'He hides them'], because: 'Yes! Pip gives some of his grapes to Luna.' },
      { question: 'Where is Pip?', answers: ['The park', 'The zoo', 'The beach'], because: 'Yes! Pip is at the park.' },
      { question: 'What is in Pip’s bag?', answers: ['Grapes', 'Cookies', 'A ball'], because: 'That’s right! He finds a bunch of grapes.' },
      { question: 'Where do they sit to eat?', answers: ['A bench', 'The grass', 'A swing'], because: 'Yes! They munch on the bench.' }
    ]
  },
  {
    title: 'The Lost Sock',
    picture: '🧦',
    lines: ['Ben has one sock on.', 'Where is the other sock?', 'He checks the bed and the rug.', 'The dog has it! Ben grabs it and laughs.'],
    questions: [
      { question: 'Who has the lost sock?', answers: ['The dog', 'Ben’s dad', 'The cat'], because: 'That’s right! The dog has Ben’s sock.' },
      { question: 'How many socks does Ben have on?', answers: ['One', 'Two', 'Three'], because: 'Yes! Ben has just one sock on.' },
      { question: 'Where does Ben look?', answers: ['His bed and his rug', 'The sink and the tub', 'The car and the yard'], because: 'That’s right! He checks the bed and the rug.' },
      { question: 'What does Ben do at the end?', answers: ['He laughs', 'He cries', 'He hides'], because: 'Yes! Ben grabs the sock and laughs.' }
    ]
  },
  {
    title: 'The Drum Band',
    picture: '🥁',
    lines: ['Max has a drum.', 'Tess has a bell.', 'Bang, bang! Ding, ding!', 'They march and sing in the yard.'],
    questions: [
      { question: 'What does Tess play?', answers: ['A bell', 'A drum', 'A flute'], because: 'Yes! Tess plays a bell, ding, ding!' },
      { question: 'What does Max play?', answers: ['A drum', 'A bell', 'A horn'], because: 'Yes! Max plays the drum, bang, bang!' },
      { question: 'Where do they march?', answers: ['The yard', 'The street', 'The gym'], because: 'That’s right! They march in the yard.' },
      { question: 'What sound does the bell make?', answers: ['Ding, ding', 'Bang, bang', 'Moo, moo'], because: 'Yes! Tess’s bell goes ding, ding!' }
    ]
  },
  {
    title: 'Luna Plants a Seed',
    picture: '🌱',
    lines: ['Ms. Luna digs a small hole.', 'She drops a seed in and pats the dirt.', 'She gives it a drink each day.', 'Then a green stem pops up!'],
    questions: [
      { question: 'What pops up from the dirt?', answers: ['A green stem', 'A red ball', 'A small frog'], because: 'Yes! A green stem pops up from the seed.' },
      { question: 'What does Luna dig?', answers: ['A hole', 'A pond', 'A tunnel'], because: 'Yes! She digs a small hole.' },
      { question: 'What does Luna put in the hole?', answers: ['A seed', 'A rock', 'A coin'], because: 'That’s right! She drops a seed in.' },
      { question: 'What does Luna give the seed each day?', answers: ['Water', 'Milk', 'Juice'], because: 'Yes! She gives it a drink of water each day.' }
    ]
  },
  {
    title: 'The Fox and the Box',
    picture: '🦊',
    lines: [
      'A fox finds a big box.',
      'He hops in the box.',
      'The box tips and rolls down the hill!',
      'The fox hops out and grins.'
    ],
    questions: [
      { question: 'What does the fox find?', answers: ['A box', 'A ball', 'A bun'], because: 'Yes! The fox finds a big box.' },
      { question: 'Where does the fox go?', answers: ['Into the box', 'Up a tree', 'Into the pond'], because: 'That’s right! He hops in the box.' },
      { question: 'What does the box do?', answers: ['It rolls away', 'It flies', 'It sinks'], because: 'Yes! The box tips and rolls down the hill.' },
      { question: 'How does the fox feel at the end?', answers: ['Happy', 'Sad', 'Mad'], because: 'Yes! The fox grins, so he is happy.' }
    ]
  },
  {
    title: 'Cupcakes for Mom',
    picture: '🧁',
    lines: [
      'Lin and Dad make cupcakes.',
      'Lin mixes, and Dad puts them in to bake.',
      'Lin adds pink frosting on top.',
      'They give the cupcakes to Mom.'
    ],
    questions: [
      { question: 'What do Lin and Dad make?', answers: ['Cupcakes', 'Soup', 'A pie'], because: 'Yes! They make cupcakes.' },
      { question: 'Who mixes?', answers: ['Lin', 'Dad', 'Mom'], because: 'That’s right! Lin mixes.' },
      { question: 'What color is the frosting?', answers: ['Pink', 'Green', 'Black'], because: 'Yes! Lin adds pink frosting.' },
      { question: 'Who gets the cupcakes?', answers: ['Mom', 'The dog', 'Lin’s teacher'], because: 'Yes! They give the cupcakes to Mom.' }
    ]
  },
  {
    title: 'Pip Rides a Bike',
    picture: '🚲',
    lines: [
      'Pip gets a new bike.',
      'He rides it to the end of the block.',
      'He hits a bump and falls off!',
      'Pip gets up, dusts off, and rides again.'
    ],
    questions: [
      { question: 'What does Pip get?', answers: ['A bike', 'A kite', 'A sled'], because: 'Yes! Pip gets a new bike.' },
      { question: 'Where does Pip ride?', answers: ['Down the block', 'Into the lake', 'Up a tree'], because: 'That’s right! He rides to the end of the block.' },
      { question: 'What makes Pip fall?', answers: ['A bump', 'A dog', 'The rain'], because: 'Yes! He hits a bump and falls off.' },
      { question: 'What does Pip do after he falls?', answers: ['He rides again', 'He goes home', 'He cries all day'], because: 'Yes! Pip gets up and rides again.' }
    ]
  },
  {
    title: 'The Sandcastle',
    picture: '🏖️',
    lines: [
      'Max and Ella go to the beach.',
      'They make a big sandcastle.',
      'A wave comes up and splashes it.',
      'They laugh and make a new one.'
    ],
    questions: [
      { question: 'Where do Max and Ella go?', answers: ['The beach', 'The park', 'The store'], because: 'Yes! They go to the beach.' },
      { question: 'What do they make?', answers: ['A sandcastle', 'A cake', 'A snowman'], because: 'That’s right! They make a big sandcastle.' },
      { question: 'What splashes the castle?', answers: ['A wave', 'A dog', 'The rain'], because: 'Yes! A wave splashes it.' },
      { question: 'What do they do after the wave?', answers: ['They build another one', 'They go home sad', 'They yell at the wave'], because: 'Yes! They laugh and make a new one.' }
    ]
  }
]), 5);
