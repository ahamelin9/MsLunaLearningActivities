// First grade's lessons beyond the first three, and the rounds that grow those
// three (CUR-4b): letter teams, blends, magic E, sight words, rhymes, sentences
// and little stories. Written for Alex to review all at once.

import type { Lesson, LessonQuestion } from '../../types/reading';
import { blendRounds, readRounds, rhymeRounds, sentenceRounds, sightRounds, storyRounds } from '../lessonRounds';

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
export const G1_SIGHT_1 = lesson('g1-sw-first', 'g1-sight-words', 'Sight Words 1', 'Hear a word, then find it among look-alikes.', '👀', [
  ...sightRounds('g1-sw1', 'was', ['saw', 'wash'], [['The cat was on the bed.', '🐱'], ['It was a sunny day.', '☀️']]),
  ...sightRounds('g1-sw1', 'said', ['sad', 'sand'], [['Mom said it is time to go.', '🕒'], ['Pip said hello to me.', '👋']]),
  ...sightRounds('g1-sw1', 'have', ['has', 'gave'], [['I have a red bike.', '🚲'], ['We have two cats.', '🐱']]),
  ...sightRounds('g1-sw1', 'they', ['then', 'the'], [['They play in the park.', '🛝'], ['They like to sing.', '🎵']]),
  ...sightRounds('g1-sw1', 'of', ['off', 'if'], [['I have a cup of milk.', '🥛'], ['I see a lot of stars.', '⭐']]),
  ...sightRounds('g1-sw1', 'for', ['far', 'from'], [['This gift is for you.', '🎁'], ['It is time for bed.', '🛏️']])
]);

export const G1_SIGHT_2 = lesson('g1-sw-second', 'g1-sight-words', 'Sight Words 2', 'Hear a word, then find it among look-alikes.', '👀', [
  ...sightRounds('g1-sw2', 'with', ['wish', 'will'], [['Come and play with me.', '⚽'], ['I eat with a spoon.', '🥄']]),
  ...sightRounds('g1-sw2', 'his', ['has', 'hit'], [['Dad has his hat.', '🎩'], ['Sam rides his bike.', '🚲']]),
  ...sightRounds('g1-sw2', 'her', ['he', 'hen'], [['She has her book.', '📖'], ['Ann hugs her dog.', '🐶']]),
  ...sightRounds('g1-sw2', 'what', ['that', 'wet'], [['What is in the box?', '📦'], ['What is your name?', '🙂']]),
  ...sightRounds('g1-sw2', 'when', ['then', 'went'], [['When can we go?', '🚗'], ['I sing when I am happy.', '😀']]),
  ...sightRounds('g1-sw2', 'where', ['here', 'were'], [['Where is my hat?', '🎩'], ['Where did the cat go?', '🐱']])
]);

export const G1_SIGHT_3 = lesson('g1-sw-third', 'g1-sight-words', 'Sight Words 3', 'Hear a word, then find it among look-alikes.', '👀', [
  ...sightRounds('g1-sw3', 'come', ['some', 'came'], [['Come to my house.', '🏠'], ['Come and see the kittens.', '🐱']]),
  ...sightRounds('g1-sw3', 'some', ['come', 'same'], [['I have some grapes.', '🍇'], ['Can I have some milk?', '🥛']]),
  ...sightRounds('g1-sw3', 'do', ['dog', 'go'], [['What do you like?', '🙂'], ['I can do it!', '💪']]),
  ...sightRounds('g1-sw3', 'one', ['on', 'once'], [['I have one nose.', '👃'], ['One bird sat in the tree.', '🐦']]),
  ...sightRounds('g1-sw3', 'who', ['how', 'why'], [['Who is at the door?', '🚪'], ['Who has my hat?', '🎩']]),
  ...sightRounds('g1-sw3', 'there', ['three', 'here'], [['There is a bug on me!', '🐛'], ['The park is over there.', '🛝']])
]);

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

export const G1_STORIES_1 = lesson('g1-story-little', 'g1-stories', 'Little Stories', 'Read a little story yourself, then answer a question.', '📖', storyRounds('g1-st1', [
  {
    title: 'The Big Red Hen',
    picture: '🐔',
    lines: ['A big red hen sat on a nest.', 'She had six eggs in the nest.', 'She sat and sat.', 'Then the eggs went crack!'],
    question: 'What came out of the eggs?',
    answers: ['Little chicks', 'Little ducks', 'Little pigs'],
    because: 'Yes! Little chicks came out of the eggs.'
  },
  {
    title: 'Sam and the Ship',
    picture: '🚢',
    lines: ['Sam has a small ship.', 'It can float in the tub.', 'Splash! The ship tips.', 'Sam picks it up and sets it back.'],
    question: 'Where does the ship float?',
    answers: ['The tub', 'The sink', 'The pond'],
    because: 'That’s right! The ship floats in the tub.'
  },
  {
    title: 'Frog and Bug',
    picture: '🐸',
    lines: ['A green frog sits on a log.', 'A bug lands next to the frog.', 'Zip! The frog gets the bug.', 'Yum! The frog is glad.'],
    question: 'What does the frog eat?',
    answers: ['A bug', 'A leaf', 'A fish'],
    because: 'Yes! The frog gets the bug and eats it.'
  },
  {
    title: 'Pip’s Black Hat',
    picture: '🎩',
    lines: ['Pip has a black hat.', 'The wind blows and the hat flips off.', 'It lands on a fat cat!', 'The cat runs, and Pip runs too.'],
    question: 'Where does the hat land?',
    answers: ['On a cat', 'In a tree', 'On a bus'],
    because: 'Yes! The hat lands on a fat cat.'
  },
  {
    title: 'A Fish for Beth',
    picture: '🐟',
    lines: ['Dad and Beth go to the lake.', 'Dad has a rod and Beth has a net.', 'Beth gets a big fish in the net!', 'Dad claps and Beth grins.'],
    question: 'Who gets the fish?',
    answers: ['Beth', 'Dad', 'The cat'],
    because: 'That’s right! Beth gets the fish with her net.'
  },
  {
    title: 'Luna’s Lunch',
    picture: '🍱',
    lines: ['Ms. Luna has a lunch box.', 'In the box is a plum and a bun.', 'She munches the bun and then the plum.', 'Luna is full, so she naps on a branch.'],
    question: 'What does Luna do after lunch?',
    answers: ['She takes a nap', 'She goes for a swim', 'She rides a bus'],
    because: 'Yes! Luna is full, so she naps on a branch.'
  }
]), 2);

export const G1_STORIES_2 = lesson('g1-story-more', 'g1-stories', 'More Little Stories', 'Read a little story yourself, then answer a question.', '📖', storyRounds('g1-st2', [
  {
    title: 'Jake’s Kite',
    picture: '🪁',
    lines: ['Jake has a kite with a long tail.', 'He runs up the hill with it.', 'The wind lifts the kite up, up, up!', 'Jake smiles and holds the string.'],
    question: 'Where does Jake run?',
    answers: ['Up a hill', 'Into a lake', 'To the store'],
    because: 'Yes! Jake runs up the hill with his kite.'
  },
  {
    title: 'The Snow Day',
    picture: '❄️',
    lines: ['Snow falls on the hill.', 'Kate gets her sled and her red hat.', 'Whee! The sled slides down fast.', 'Kate runs back up to go once more.'],
    question: 'What does Kate ride down the hill?',
    answers: ['A sled', 'A bike', 'A bus'],
    because: 'That’s right! Kate rides her sled down the hill.'
  },
  {
    title: 'A Snack for Pip',
    picture: '🍇',
    lines: ['Pip is hungry at the park.', 'He opens his bag and finds a bunch of grapes.', 'He gives some to Luna.', 'They munch and smile on the bench.'],
    question: 'What does Pip do with the grapes?',
    answers: ['He shares them', 'He drops them', 'He hides them'],
    because: 'Yes! Pip gives some of his grapes to Luna.'
  },
  {
    title: 'The Lost Sock',
    picture: '🧦',
    lines: ['Ben has one sock on.', 'Where is the other sock?', 'He checks the bed and the rug.', 'The dog has it! Ben grabs it and laughs.'],
    question: 'Who has the lost sock?',
    answers: ['The dog', 'Ben’s dad', 'The cat'],
    because: 'That’s right! The dog has Ben’s sock.'
  },
  {
    title: 'The Drum Band',
    picture: '🥁',
    lines: ['Max has a drum.', 'Tess has a bell.', 'Bang, bang! Ding, ding!', 'They march and sing in the yard.'],
    question: 'What does Tess play?',
    answers: ['A bell', 'A drum', 'A flute'],
    because: 'Yes! Tess plays a bell, ding, ding!'
  },
  {
    title: 'Luna Plants a Seed',
    picture: '🌱',
    lines: ['Ms. Luna digs a small hole.', 'She drops a seed in and pats the dirt.', 'She gives it a drink each day.', 'Then a green stem pops up!'],
    question: 'What pops up from the dirt?',
    answers: ['A green stem', 'A red ball', 'A small frog'],
    because: 'Yes! A green stem pops up from the seed.'
  }
]), 2);
