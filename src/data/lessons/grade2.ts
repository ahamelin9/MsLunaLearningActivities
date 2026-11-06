// Second grade's lessons beyond the first three, and the rounds that grow those
// three (CUR-4c): vowel teams, letters bossed by R, compound words, sight words
// and longer stories. Written for Alex to review all at once.

import type { Lesson, LessonQuestion } from '../../types/reading';
import { readRounds, sightRounds, storyRounds, type StoryRow } from '../lessonRounds';

const TEAM = 'Read this vowel team word!';
const WALKING = 'Read the word, then find its picture. When two vowels go walking, the first one does the talking!';
const NEW_SOUND = 'Read the word, then find its picture. These letters team up to make a new sound!';
const BOSSY_R = 'Read the word, then find its picture. The letter R changes the vowel’s sound!';
const COMPOUND = 'Read the two little words, then put them together. Which picture is it?';

const wordLesson = { tier: 3, wrong: 3 } as const;

const ROCKET_MORE: StoryRow[] = [
  {
    title: 'The Night Train',
    picture: '🚆',
    lines: [
      'Luna and Pip took the train at night.',
      'They sat by the window and looked at the moon.',
      'The train went over a bridge and past a dark forest.',
      'Pip fell asleep, but Luna stayed awake.',
      'In the morning they were at the beach!'
    ],
    question: 'Where were they in the morning?',
    answers: ['At the beach', 'Back at home', 'In the forest'],
    because: 'Yes! The train took them all the way to the beach.'
  },
  {
    title: 'The Snow Fort',
    picture: '⛄',
    lines: [
      'It snowed all night, and the road was white.',
      'Mia and Theo put on their coats and boots.',
      'They rolled big balls of snow and made a fort.',
      'Then they made a snowman to guard the door.',
      'Their toes were cold, but they did not want to go in.'
    ],
    question: 'Why did they make a snowman?',
    answers: ['To guard their fort', 'To give to a friend', 'To sell at a store'],
    because: 'That’s right! The snowman stood by the fort to guard the door.'
  },
  {
    title: 'The Lost Kitten',
    picture: '🐱',
    lines: [
      'Nora heard a soft meow in the rain.',
      'She looked under the porch and saw a wet gray kitten.',
      'She dried it with a towel and gave it warm milk.',
      'The next day, a sign on a tree said, “Lost kitten.”',
      'Nora felt sad, but she took the kitten home to its family.'
    ],
    question: 'How did Nora find out where the kitten lived?',
    answers: ['She saw a sign', 'Luna told her', 'The kitten showed her'],
    because: 'Yes! A sign on a tree said a kitten was lost.'
  },
  {
    title: 'Pip’s First Bike Ride',
    picture: '🚲',
    lines: [
      'Pip got a shiny blue bike for his birthday.',
      'At first he wobbled and fell in the grass.',
      'Luna held the seat and ran beside him.',
      'Then she let go, and Pip kept on riding!',
      'He looked back and laughed at how far he had come.'
    ],
    question: 'What helped Pip learn to ride?',
    answers: ['Luna held the seat', 'He had a new helmet', 'He rode down a hill'],
    because: 'That’s right! Luna held the seat until Pip could ride alone.'
  },
  {
    title: 'A Garden for the Bees',
    picture: '🐝',
    lines: [
      'There were not many bees in Luna’s garden.',
      'So Luna planted bright flowers in long rows.',
      'She watered them each morning and pulled the weeds.',
      'Soon the flowers opened, yellow and pink and blue.',
      'One by one, the bees came back to the garden.'
    ],
    question: 'Why did the bees come back?',
    answers: ['The flowers had opened', 'It started to rain', 'Luna called them'],
    because: 'Yes! The bright flowers opened, and the bees came to them.'
  }
];

const STORIES_2: StoryRow[] = [
  {
    title: 'The Boat Race',
    picture: '⛵',
    lines: [
      'The children made little boats out of paper.',
      'They set them on the stream and let them go.',
      'Ivy’s boat got stuck on a rock right away.',
      'Sam’s boat floated past it, spinning slowly.',
      'Ivy freed her boat, and they cheered for both of them.'
    ],
    question: 'What happened to Ivy’s boat?',
    answers: ['It got stuck on a rock', 'It sank to the bottom', 'It won the race'],
    because: 'Yes! Ivy’s boat got stuck, and then she freed it.'
  },
  {
    title: 'The Rainy Day',
    picture: '🌧️',
    lines: [
      'Rain fell all day, so Maya had to stay inside.',
      'She felt bored until she found an old box of paint.',
      'She painted a blue whale and a bright yellow sun.',
      'When the rain stopped, a rainbow filled the sky.',
      'Maya painted that too, with all of its colors.'
    ],
    question: 'What did Maya paint last?',
    answers: ['A rainbow', 'A blue whale', 'A yellow sun'],
    because: 'That’s right! When the rain stopped, she painted the rainbow.'
  },
  {
    title: 'Grandpa’s Soup',
    picture: '🍲',
    lines: [
      'Every Sunday, Grandpa makes soup in a big pot.',
      'Leo washes the carrots and Grandpa cuts them up.',
      'They add beans, salt, and a little bit of rice.',
      'The whole house smells warm and good.',
      'Leo always asks for a second bowl.'
    ],
    question: 'What does Leo do to help?',
    answers: ['He washes the carrots', 'He cuts up the beans', 'He sets the table'],
    because: 'Yes! Leo washes the carrots, and Grandpa cuts them.'
  },
  {
    title: 'The Owl Who Could Not Sleep',
    picture: '🌙',
    lines: [
      'Ms. Luna likes to stay up at night.',
      'One morning she could not fall asleep, as the sun was too bright.',
      'She pulled her leaf blanket over her eyes.',
      'A little bird sang her a quiet song.',
      'Soon Luna was snoring softly in her tree.'
    ],
    question: 'Why could Luna not fall asleep?',
    answers: ['The sun was too bright', 'A dog was barking', 'Her tree was shaking'],
    because: 'That’s right! The bright sun kept her awake.'
  },
  {
    title: 'The School Play',
    picture: '👑',
    lines: [
      'Ana was the queen in the school play.',
      'She wore a gold crown and a long red dress.',
      'Before the show, her knees began to shake.',
      'Then she saw her mom smile and wave at her.',
      'Ana took a deep breath and said every line.'
    ],
    question: 'What helped Ana feel brave?',
    answers: ['Her mom’s smile', 'Her gold crown', 'A big red curtain'],
    because: 'Yes! Ana saw her mom smile, and then she felt brave.'
  },
  {
    title: 'The Moon Book',
    picture: '🌙',
    lines: [
      'Pip found a book about the moon at the library.',
      'He learned that the moon goes around the earth.',
      'That night he looked up with Luna from the hill.',
      'The moon looked thin, like a smile in the sky.',
      '“It changes, but it is always there,” Pip said.'
    ],
    question: 'What did Pip learn about the moon?',
    answers: ['It goes around the earth', 'It is made of rock', 'It comes out by day'],
    because: 'Yes! His book said the moon goes around the earth.'
  }
];

const STORIES_3: StoryRow[] = [
  {
    title: 'The Mouse in the House',
    picture: '🐭',
    lines: [
      'Something was eating the cheese in Owen’s house.',
      'Owen found tiny crumbs on the floor and followed them.',
      'They led to a small hole behind the couch.',
      'A brown mouse looked out and twitched its nose.',
      'Owen’s dad gently took it outside to the field.'
    ],
    question: 'How did Owen find the mouse?',
    answers: ['He followed the crumbs', 'He heard it squeak', 'His cat showed him'],
    because: 'Yes! Owen followed the crumbs to the hole behind the couch.'
  },
  {
    title: 'The Big Storm',
    picture: '⛈️',
    lines: [
      'Dark clouds rolled in over the farm.',
      'The wind blew hard, and thunder shook the barn.',
      'Rosa helped her dad lead the horses inside.',
      'They waited together until the storm was over.',
      'In the morning, the corn was wet but still standing.'
    ],
    question: 'What did Rosa do in the storm?',
    answers: ['She helped the horses', 'She picked the corn', 'She fixed the barn'],
    because: 'That’s right! Rosa helped her dad lead the horses inside.'
  },
  {
    title: 'The Turtle and the Road',
    picture: '🐢',
    lines: [
      'A turtle was crossing the road very slowly.',
      'A girl named Kim saw a car coming far away.',
      'She asked her mom to stop and help.',
      'Her mom carried the turtle over to the grass.',
      'Kim waved as it walked off toward the pond.'
    ],
    question: 'Why did Kim ask her mom to stop?',
    answers: ['To help the turtle', 'To buy some food', 'To look at the pond'],
    because: 'Yes! Kim wanted to help the turtle get off the road.'
  },
  {
    title: 'The Birthday Surprise',
    picture: '🎂',
    lines: [
      'It was Luna’s birthday, but nobody said a word.',
      'She flew home feeling a little bit sad.',
      'When she opened her door, the lights came on.',
      '“Surprise!” shouted Pip and all of her friends.',
      'There was a cake with a moon drawn on top.'
    ],
    question: 'Why did nobody say a word about her birthday?',
    answers: ['They planned a surprise', 'They forgot about it', 'They were asleep'],
    because: 'That’s right! Her friends were hiding to surprise her.'
  },
  {
    title: 'The Little Lighthouse',
    picture: '💡',
    lines: [
      'A small light stood at the end of the dock.',
      'Each night, Mr. Grant climbed up and turned it on.',
      'It showed the fishing boats the way back home.',
      'One foggy night, the light went out.',
      'Mr. Grant fixed it fast, and the boats came safely in.'
    ],
    question: 'What does the light do for the boats?',
    answers: ['It shows the way home', 'It keeps them warm', 'It helps catch fish'],
    because: 'Yes! The light shows the boats the way back home.'
  },
  {
    title: 'Sharing the Swing',
    picture: '🛝',
    lines: [
      'There was only one swing left at the park.',
      'Tara and Jay both ran to it at the same time.',
      'They frowned at each other for a moment.',
      'Then Jay said, “You swing first, and I will push.”',
      'They took turns until it was time to go home.'
    ],
    question: 'How did they fix their problem?',
    answers: ['They took turns', 'They asked a grown-up', 'They went home'],
    because: 'Yes! Tara and Jay took turns on the swing.'
  }
];

export const G2_MORE_ROUNDS: Record<string, LessonQuestion[]> = {
  'g2-wp-vowel-teams': readRounds(['rain', 'soap', 'tea', 'road', 'snail', 'peach', 'goat', 'coat', 'leaf'], TEAM, WALKING, { lesson: 'g2-wp', tier: 3 }),
  'g2-bw-compounds': readRounds(['sunflower', 'popcorn', 'pancake', 'butterfly', 'football', 'ladybug', 'snowman', 'watermelon', 'pineapple'], 'Read this compound word!', COMPOUND, { lesson: 'g2-bw', tier: 3 }),
  'g2-story-luna-space': storyRounds('g2-st1', ROCKET_MORE)
};

const lesson = (id: string, skillId: string, title: string, description: string, icon: string, questions: LessonQuestion[], perPlay?: number): Lesson => ({
  id,
  skillId,
  grade: 'grade2',
  title,
  description,
  icon,
  difficulty: 3,
  starsToEarn: 3,
  perPlay,
  questions
});

export const G2_AI_AY = lesson('g2-wp-ai-ay', 'g2-vowel-teams', 'AI & AY Words', 'Read words where AI and AY say the long A sound.', '🐌', readRounds(
  ['train', 'rain', 'snail', 'mail', 'paint', 'chain', 'crayon', 'hay', 'daisy', 'rainbow'], TEAM, WALKING, { lesson: 'g2-ai', ...wordLesson }
));

export const G2_EE_EA = lesson('g2-wp-ee-ea', 'g2-vowel-teams', 'EE & EA Words', 'Read words where EE and EA say the long E sound.', '🐝', readRounds(
  ['bee', 'tree', 'feet', 'sheep', 'cheese', 'seed', 'wheel', 'tea', 'meat', 'beans', 'peach', 'beach', 'leaf'], TEAM, WALKING, { lesson: 'g2-ee', ...wordLesson }
));

export const G2_OA_OW = lesson('g2-wp-oa-ow', 'g2-vowel-teams', 'OA & OW Words', 'Read words where OA and OW say the long O sound.', '🐐', readRounds(
  ['boat', 'coat', 'goat', 'soap', 'road', 'snow', 'window', 'bowl', 'rainbow', 'snowman'], TEAM, WALKING, { lesson: 'g2-oa', ...wordLesson }
));

export const G2_IGH = lesson('g2-wp-igh', 'g2-vowel-teams', 'IGH, IE & Y Words', 'Read words that say the long I sound.', '💡', readRounds(
  ['light', 'night', 'pie', 'tie', 'fly', 'sky', 'cry', 'flashlight', 'stoplight', 'butterfly'], 'Read this long I word!', 'Read the word, then find its picture. Listen for the long I sound!', { lesson: 'g2-ig', ...wordLesson }
));

export const G2_OO = lesson('g2-wp-oo', 'g2-vowel-teams', 'OO Words', 'Read words with the letter team OO.', '🌙', readRounds(
  ['moon', 'spoon', 'boot', 'broom', 'tooth', 'book', 'hook', 'balloon', 'notebook', 'cookie'], 'Read this OO word!', NEW_SOUND, { lesson: 'g2-oo', ...wordLesson }
));

export const G2_OU_OW = lesson('g2-wp-ou-ow', 'g2-vowel-teams', 'OU & OW Words', 'Read words where OU and OW make one sound, as in a loud ouch.', '🐭', readRounds(
  ['mouse', 'house', 'cloud', 'couch', 'cow', 'mountain', 'crown', 'flower', 'clown', 'shower'], 'Read this word!', NEW_SOUND, { lesson: 'g2-ou', ...wordLesson }
));

export const G2_AR = lesson('g2-wp-ar', 'g2-r-vowels', 'AR Words', 'Read words where R changes the sound of A.', '⭐', readRounds(
  ['star', 'car', 'jar', 'shark', 'arm', 'cart', 'scarf', 'guitar', 'farmer', 'alarm'], 'Read this AR word!', BOSSY_R, { lesson: 'g2-ar', ...wordLesson }
));

export const G2_OR = lesson('g2-wp-or', 'g2-r-vowels', 'OR Words', 'Read words where R changes the sound of O.', '🌽', readRounds(
  ['corn', 'fork', 'horn', 'horse', 'storm', 'store', 'shorts', 'popcorn', 'unicorn', 'forest', 'orange'], 'Read this OR word!', BOSSY_R, { lesson: 'g2-or', ...wordLesson }
));

export const G2_ER_IR_UR = lesson('g2-wp-er-ir-ur', 'g2-r-vowels', 'ER, IR & UR Words', 'Read words where ER, IR and UR all sound the same.', '🐢', readRounds(
  ['girl', 'bird', 'shirt', 'turtle', 'purse', 'hammer', 'ladder', 'burger', 'spider', 'tiger'], 'Read this word!', BOSSY_R, { lesson: 'g2-er', ...wordLesson }
));

export const G2_COMPOUNDS_2 = lesson('g2-bw-compounds-2', 'g2-compounds', 'More Big Words', 'Read two little words joined into one big word.', '🎒', readRounds(
  ['hotdog', 'backpack', 'firetruck', 'goldfish', 'jellyfish', 'sunglasses', 'teapot', 'cowboy', 'basketball', 'baseball', 'notebook', 'fireworks', 'toothbrush'],
  'Read this compound word!',
  COMPOUND,
  { lesson: 'g2-c2', ...wordLesson }
));

// none of a sight lesson's words in its title or on Luna's perch (CUR-3)
export const G2_SIGHT_1 = lesson('g2-sw-first', 'g2-sight-words', 'Sight Words 1', 'Hear a word, then find it among look-alikes.', '👀', [
  ...sightRounds('g2-sw1', 'because', ['became', 'before'], [['I smile because I am happy.', '😀'], ['We stay in because it is raining.', '🌧️']]),
  ...sightRounds('g2-sw1', 'friend', ['found', 'fried'], [['Pip is my best friend.', '🤝'], ['My friend has a red bike.', '🚲']]),
  ...sightRounds('g2-sw1', 'people', ['purple', 'puzzle'], [['Many people ride the bus.', '🚌'], ['People like to play in the park.', '🛝']]),
  ...sightRounds('g2-sw1', 'again', ['against', 'gain'], [['Let’s play that game again.', '🎮'], ['Sing that song again.', '🎵']]),
  ...sightRounds('g2-sw1', 'about', ['above', 'around'], [['This book is about a whale.', '🐋'], ['We talk about the stars.', '⭐']]),
  ...sightRounds('g2-sw1', 'could', ['cloud', 'cold'], [['I could see the moon last night.', '🌙'], ['She could run very fast.', '🏃']])
]);

export const G2_SIGHT_2 = lesson('g2-sw-second', 'g2-sight-words', 'Sight Words 2', 'Hear a word, then find it among look-alikes.', '👀', [
  ...sightRounds('g2-sw2', 'would', ['world', 'word'], [['I would like some cake.', '🎂'], ['Would you like to play?', '⚽']]),
  ...sightRounds('g2-sw2', 'should', ['shout', 'shoulder'], [['You should wear a coat.', '🧥'], ['We should brush our teeth.', '🪥']]),
  ...sightRounds('g2-sw2', 'their', ['three', 'thing'], [['The birds left their nest.', '🪹'], ['They love their dog.', '🐶']]),
  ...sightRounds('g2-sw2', 'very', ['every', 'vest'], [['The sun is very hot.', '☀️'], ['My kitten is very small.', '🐱']]),
  ...sightRounds('g2-sw2', 'many', ['money', 'any'], [['I see many stars.', '⭐'], ['How many eggs do you have?', '🥚']]),
  ...sightRounds('g2-sw2', 'before', ['behind', 'because'], [['Wash your hands before lunch.', '🧼'], ['Brush your teeth before bed.', '🪥']])
]);

export const G2_SIGHT_3 = lesson('g2-sw-third', 'g2-sight-words', 'Sight Words 3', 'Hear a word, then find it among look-alikes.', '👀', [
  ...sightRounds('g2-sw3', 'after', ['always', 'other'], [['We play after school.', '🛝'], ['I brush my teeth after lunch.', '🪥']]),
  ...sightRounds('g2-sw3', 'always', ['away', 'also'], [['Luna always stays up late.', '🌙'], ['I always wear my hat.', '🎩']]),
  ...sightRounds('g2-sw3', 'every', ['very', 'ever'], [['I play every day.', '🌞'], ['Every bird can sing.', '🐦']]),
  ...sightRounds('g2-sw3', 'once', ['one', 'onto'], [['Once I saw a whale.', '🐋'], ['I ride the bus once a week.', '🚌']]),
  ...sightRounds('g2-sw3', 'thought', ['though', 'through'], [['I thought it was a cat.', '🐱'], ['She thought about her friend.', '🤝']]),
  ...sightRounds('g2-sw3', 'through', ['though', 'throw'], [['The train goes through the hill.', '🚆'], ['We walk through the forest.', '🌲']])
]);

export const G2_STORIES_2 = lesson('g2-story-more', 'g2-storybooks', 'More Storybooks', 'Read a longer story on your own, then answer a question.', '📖', storyRounds('g2-st2', STORIES_2), 2);

export const G2_STORIES_3 = lesson('g2-story-third', 'g2-storybooks', 'Storybook Shelf', 'Read a longer story on your own, then answer a question.', '📖', storyRounds('g2-st3', STORIES_3), 2);
