// Second grade's lessons beyond the first three, and the rounds that grow those
// three (CUR-4c): vowel teams, letters bossed by R, compound words, sight words
// and longer stories. Written for Alex to review all at once.

import type { Lesson, LessonQuestion } from '../../types/reading';
import { readRounds, storyRounds, type StoryRow } from '../lessonRounds';
import { G2_DOLCH, ORDINALS, sightLesson } from './dolch';

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
    questions: [
      { question: 'Where were they in the morning?', answers: ['At the beach', 'Back at home', 'In the forest'], because: 'Yes! The train took them all the way to the beach.' },
      { question: 'When did they get on the train?', answers: ['At night', 'In the morning', 'At lunch'], because: 'Yes! They took the train at night.' },
      { question: 'What did they look at from the window?', answers: ['The moon', 'A rainbow', 'A plane'], because: 'That’s right! They looked at the moon.' },
      { question: 'Who fell asleep on the train?', answers: ['Pip', 'Luna', 'The driver'], because: 'Yes! Pip fell asleep, but Luna stayed awake.' }
    ]
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
    questions: [
      { question: 'Why did they make a snowman?', answers: ['To guard their fort', 'To give to a friend', 'To sell at a store'], because: 'That’s right! The snowman stood by the fort to guard the door.' },
      { question: 'What happened in the night?', answers: ['It snowed', 'It rained', 'It was windy'], because: 'Yes! It snowed all night.' },
      { question: 'What did Mia and Theo build first?', answers: ['A fort', 'A snowman', 'A sled'], because: 'That’s right! First a fort, then a snowman.' },
      { question: 'How did their toes feel?', answers: ['Cold', 'Hot', 'Sticky'], because: 'Yes! Their toes were cold, but they kept playing.' }
    ]
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
    questions: [
      { question: 'How did Nora find out where the kitten lived?', answers: ['She saw a sign', 'Luna told her', 'The kitten showed her'], because: 'Yes! A sign on a tree said a kitten was lost.' },
      { question: 'What was the weather when Nora heard the meow?', answers: ['Rainy', 'Sunny', 'Snowy'], because: 'Yes! She heard a meow in the rain.' },
      { question: 'What did Nora give the kitten?', answers: ['Warm milk', 'A ball', 'A fish'], because: 'That’s right! She dried it and gave it warm milk.' },
      { question: 'How did Nora feel when she saw the sign?', answers: ['Sad', 'Angry', 'Sleepy'], because: 'Yes! She was sad to give the kitten back, but she did.' }
    ]
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
    questions: [
      { question: 'What helped Pip learn to ride?', answers: ['Luna held the seat', 'He had a new helmet', 'He rode down a hill'], because: 'That’s right! Luna held the seat until Pip could ride alone.' },
      { question: 'Why did Pip get a bike?', answers: ['It was his birthday', 'He won a race', 'He found it'], because: 'Yes! He got it for his birthday.' },
      { question: 'What happened at first?', answers: ['He fell over', 'He rode very fast', 'He went home'], because: 'That’s right! At first he wobbled and fell in the grass.' },
      { question: 'How did Pip feel at the end?', answers: ['Happy', 'Scared', 'Tired'], because: 'Yes! He laughed, so he was happy.' }
    ]
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
    questions: [
      { question: 'Why did the bees come back?', answers: ['The flowers had opened', 'It started to rain', 'Luna called them'], because: 'Yes! The bright flowers opened, and the bees came to them.' },
      { question: 'What was wrong in the garden?', answers: ['It had few bees', 'It had no water', 'It had too many weeds'], because: 'Yes! There were not many bees.' },
      { question: 'What did Luna plant?', answers: ['Flowers', 'Trees', 'Carrots'], because: 'That’s right! She planted bright flowers in long rows.' },
      { question: 'When did Luna water them?', answers: ['Every morning', 'Every night', 'Once a week'], because: 'Yes! She watered them each morning.' }
    ]
  },
  {
    title: 'The Hot Air Balloon',
    picture: '🎈',
    lines: [
      'Ben and his grandma rode in a big red balloon.',
      'It rose slowly over the trees and the town.',
      'From up high, the cars looked as small as toys.',
      'A bird flew right past them and flapped its wings.',
      'When they came down, Ben said, “Can we go again?”'
    ],
    questions: [
      { question: 'What color was the balloon?', answers: ['Red', 'Blue', 'Yellow'], because: 'Yes! It was a big red balloon.' },
      { question: 'Who rode with Ben?', answers: ['His grandma', 'His teacher', 'His dog'], because: 'That’s right! Ben rode with his grandma.' },
      { question: 'Why did the cars look small?', answers: ['They were far below', 'They were toy cars', 'It was dark'], because: 'Yes! From up high, the cars looked as small as toys.' },
      { question: 'How did Ben feel about the ride?', answers: ['He loved it', 'He was scared', 'He was bored'], because: 'Yes! He wanted to go again.' }
    ]
  },
  {
    title: 'Pip’s Trip to the City',
    picture: '🏙️',
    lines: [
      'Pip took a bus to the big city with his aunt.',
      'The buildings were so tall that he had to tip his head back.',
      'They ate noodles at a busy little shop.',
      'Then they rode an elevator to the top of a tower.',
      'Pip could see the whole city, and even the river.'
    ],
    questions: [
      { question: 'How did Pip get to the city?', answers: ['On a bus', 'On a train', 'In a boat'], because: 'Yes! He took a bus with his aunt.' },
      { question: 'What did they eat?', answers: ['Noodles', 'Pizza', 'Soup'], because: 'That’s right! They ate noodles at a little shop.' },
      { question: 'Why did Pip tip his head back?', answers: ['To see the tall buildings', 'To look at a bird', 'To catch the rain'], because: 'Yes! The buildings were so tall.' },
      { question: 'What could Pip see from the top?', answers: ['All of the city', 'Only clouds', 'His house'], because: 'Yes! He could see the whole city, and the river too.' }
    ]
  },
  {
    title: 'The Camping Trip',
    picture: '🏕️',
    lines: [
      'Ella and her dad set up a tent by the lake.',
      'They cooked corn over the fire for dinner.',
      'When it got dark, they heard an owl say, “Hoo, hoo!”',
      'Ella was a little scared, so Dad held her hand.',
      'They counted stars until Ella fell asleep.'
    ],
    questions: [
      { question: 'Where did they put the tent?', answers: ['Near the lake', 'In the yard', 'On a hill'], because: 'Yes! They set up the tent by the lake.' },
      { question: 'What did they cook?', answers: ['Corn', 'Fish', 'Eggs'], because: 'That’s right! They cooked corn over the fire.' },
      { question: 'What sound did they hear?', answers: ['An owl', 'A dog', 'A train'], because: 'Yes! An owl said, “Hoo, hoo!”' },
      { question: 'What helped Ella when she was scared?', answers: ['Holding Dad’s hand', 'Singing a song', 'Going home'], because: 'Yes! Dad held her hand.' }
    ]
  },
  {
    title: 'Luna and the Comet',
    picture: '☄️',
    lines: [
      'One night Luna saw a bright light race across the sky.',
      '“What is that?” she asked her friend Pip.',
      '“It is a comet,” said Pip. “It has a long, shiny tail.”',
      'They made a wish as it zoomed by.',
      'Luna wished to see another comet very soon.'
    ],
    questions: [
      { question: 'When did Luna see the light?', answers: ['At night', 'In the morning', 'At lunch'], because: 'Yes! She saw it one night.' },
      { question: 'What was the bright light?', answers: ['A comet', 'A plane', 'A firefly'], because: 'That’s right! Pip said it was a comet.' },
      { question: 'What does a comet have?', answers: ['A long tail', 'Wings', 'Wheels'], because: 'Yes! A comet has a long, shiny tail.' },
      { question: 'What did Luna wish for?', answers: ['One more comet', 'A rocket', 'A new nest'], because: 'Yes! She wished to see another comet soon.' }
    ]
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
    questions: [
      { question: 'What happened to Ivy’s boat?', answers: ['It got stuck on a rock', 'It sank to the bottom', 'It won the race'], because: 'Yes! Ivy’s boat got stuck, and then she freed it.' },
      { question: 'What were the boats made of?', answers: ['Paper', 'Wood', 'Leaves'], because: 'Yes! The children made boats out of paper.' },
      { question: 'Where did they race the boats?', answers: ['On a stream', 'In a bathtub', 'At the beach'], because: 'That’s right! They set them on the stream.' },
      { question: 'How did the race end?', answers: ['Everyone was happy', 'Sam’s boat sank', 'Ivy went home sad'], because: 'Yes! They cheered for both boats.' }
    ]
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
    questions: [
      { question: 'What did Maya paint last?', answers: ['A rainbow', 'A blue whale', 'A yellow sun'], because: 'That’s right! When the rain stopped, she painted the rainbow.' },
      { question: 'Why did Maya stay inside?', answers: ['It was raining', 'She was sick', 'It was night'], because: 'Yes! Rain fell all day.' },
      { question: 'What did Maya find?', answers: ['Old paints', 'A puppy', 'A book'], because: 'That’s right! She found an old box of paint.' },
      { question: 'How did Maya feel at first?', answers: ['Bored', 'Scared', 'Sleepy'], because: 'Yes! She felt bored until she found the paint.' }
    ]
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
    questions: [
      { question: 'What does Leo do to help?', answers: ['He washes the carrots', 'He cuts up the beans', 'He sets the table'], because: 'Yes! Leo washes the carrots, and Grandpa cuts them.' },
      { question: 'When does Grandpa make soup?', answers: ['On Sundays', 'On Mondays', 'On Leo’s birthday'], because: 'Yes! Every Sunday, Grandpa makes soup.' },
      { question: 'What goes in the soup?', answers: ['Carrots, beans and rice', 'Apples and cheese', 'Fish and bread'], because: 'That’s right! Carrots, beans, rice and a little salt.' },
      { question: 'How do we know Leo likes the soup?', answers: ['He asks for more', 'He makes a face', 'He gives it to the dog'], because: 'Yes! Leo always asks for a second bowl.' }
    ]
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
    questions: [
      { question: 'Why could Luna not fall asleep?', answers: ['The sun was too bright', 'A dog was barking', 'Her tree was shaking'], because: 'That’s right! The bright sun kept her awake.' },
      { question: 'When does Luna like to be awake?', answers: ['At night', 'In the morning', 'At lunchtime'], because: 'Yes! Luna likes to stay up at night.' },
      { question: 'What did Luna put over her eyes?', answers: ['A leaf blanket', 'A hat', 'Her wing'], because: 'That’s right! She pulled her leaf blanket over her eyes.' },
      { question: 'Who helped Luna fall asleep?', answers: ['A bird that sang', 'Pip', 'The sun'], because: 'Yes! A little bird sang her a quiet song.' }
    ]
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
    questions: [
      { question: 'What helped Ana feel brave?', answers: ['Her mom’s smile', 'Her gold crown', 'A big red curtain'], because: 'Yes! Ana saw her mom smile, and then she felt brave.' },
      { question: 'Who was Ana in the play?', answers: ['The queen', 'A cat', 'A tree'], because: 'Yes! Ana was the queen.' },
      { question: 'What did Ana wear?', answers: ['A dress and a crown', 'A hat and boots', 'A cape and a mask'], because: 'That’s right! A gold crown and a long red dress.' },
      { question: 'How did Ana feel before the show?', answers: ['Nervous', 'Sleepy', 'Hungry'], because: 'Yes! Her knees began to shake, so she was nervous.' }
    ]
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
    questions: [
      { question: 'What did Pip learn about the moon?', answers: ['It goes around the earth', 'It is made of rock', 'It comes out by day'], because: 'Yes! His book said the moon goes around the earth.' },
      { question: 'Where did Pip find the book?', answers: ['In the library', 'At school', 'Under his bed'], because: 'Yes! He found it at the library.' },
      { question: 'Where did Pip and Luna look at the moon?', answers: ['From a hill', 'From a boat', 'From a window'], because: 'That’s right! They looked up from the hill.' },
      { question: 'What did the moon look like?', answers: ['A smile', 'A ball', 'A boat'], because: 'Yes! It was thin, like a smile in the sky.' }
    ]
  },
  {
    title: 'The New Neighbor',
    picture: '🏡',
    lines: [
      'A truck stopped at the empty house next door.',
      'A boy carried in boxes, one after another.',
      'Lily baked cookies with her mom and took them over.',
      'The boy smiled and said his name was Omar.',
      'Soon Lily and Omar were riding bikes together.'
    ],
    questions: [
      { question: 'What stopped at the empty house?', answers: ['A truck', 'A bus', 'A bike'], because: 'Yes! A truck stopped next door.' },
      { question: 'What did Lily bring?', answers: ['Cookies', 'Flowers', 'A toy'], because: 'That’s right! She baked cookies and took them over.' },
      { question: 'What was the boy’s name?', answers: ['Omar', 'Pip', 'Sam'], because: 'Yes! His name was Omar.' },
      { question: 'How did the story end?', answers: ['They became friends', 'Omar moved away', 'Lily lost her bike'], because: 'Yes! Lily and Omar rode bikes together.' }
    ]
  },
  {
    title: 'The Class Pet',
    picture: '🐹',
    lines: [
      'Our class has a hamster named Peanut.',
      'Each Friday, one child takes him home for the weekend.',
      'This week it was Carlos’s turn.',
      'He gave Peanut fresh water and seeds every day.',
      'On Monday, Peanut came back to school happy and fat.'
    ],
    questions: [
      { question: 'What kind of pet is Peanut?', answers: ['A hamster', 'A fish', 'A bird'], because: 'Yes! Peanut is a hamster.' },
      { question: 'When does a child take Peanut home?', answers: ['On Friday', 'On Monday', 'Every night'], because: 'That’s right! Each Friday, for the weekend.' },
      { question: 'What did Carlos give Peanut?', answers: ['Seeds and water', 'Milk and bread', 'Carrots and cheese'], because: 'Yes! Fresh water and seeds every day.' },
      { question: 'How was Peanut when he came back?', answers: ['Happy and well fed', 'Sick', 'Lost'], because: 'Yes! Peanut came back happy and fat.' }
    ]
  },
  {
    title: 'Fixing the Fence',
    picture: '🔨',
    lines: [
      'The wind knocked down part of the fence in the yard.',
      'Without it, the goats could walk right out!',
      'Ruby and her mom got wood, nails and a hammer.',
      'They worked all morning until the fence stood tall again.',
      'The goats watched them and chewed the grass.'
    ],
    questions: [
      { question: 'What knocked the fence down?', answers: ['The wind', 'The goats', 'A truck'], because: 'Yes! The wind knocked it down.' },
      { question: 'Why did they need the fence?', answers: ['To keep the goats in', 'To keep the sun out', 'To hold up the house'], because: 'That’s right! Without it, the goats could walk out.' },
      { question: 'What did they use to fix it?', answers: ['A hammer and nails', 'Glue and tape', 'String'], because: 'Yes! Wood, nails and a hammer.' },
      { question: 'How long did they work?', answers: ['All morning', 'All night', 'One minute'], because: 'Yes! They worked all morning.' }
    ]
  },
  {
    title: 'Luna’s Lost Glasses',
    picture: '👓',
    lines: [
      'Luna could not find her glasses anywhere.',
      'She looked in her nest and under the leaves.',
      'Without them, every book looked blurry.',
      'Pip laughed and pointed at her head.',
      'Her glasses had been on top of her head the whole time!'
    ],
    questions: [
      { question: 'What did Luna lose?', answers: ['Her glasses', 'Her book', 'Her hat'], because: 'Yes! She lost her glasses.' },
      { question: 'Why did she need them?', answers: ['To read her books', 'To fly at night', 'To keep warm'], because: 'That’s right! Without them, every book looked blurry.' },
      { question: 'Who found them?', answers: ['Pip', 'Luna', 'A bird'], because: 'Yes! Pip pointed at them.' },
      { question: 'Where were the glasses?', answers: ['On her head', 'In her nest', 'Under the leaves'], because: 'Yes! They were on top of her head the whole time.' }
    ]
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
    questions: [
      { question: 'How did Owen find the mouse?', answers: ['He followed the crumbs', 'He heard it squeak', 'His cat showed him'], because: 'Yes! Owen followed the crumbs to the hole behind the couch.' },
      { question: 'What was the mouse eating?', answers: ['Cheese', 'Bread', 'Apples'], because: 'Yes! Something was eating the cheese.' },
      { question: 'Where was the hole?', answers: ['Behind a couch', 'Under the bed', 'In the kitchen'], because: 'That’s right! It was behind the couch.' },
      { question: 'What did Owen’s dad do with the mouse?', answers: ['Let it go in the field', 'Kept it as a pet', 'Gave it to the cat'], because: 'Yes! Dad gently took it out to the field.' }
    ]
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
    questions: [
      { question: 'What did Rosa do in the storm?', answers: ['She helped the horses', 'She picked the corn', 'She fixed the barn'], because: 'That’s right! Rosa helped her dad lead the horses inside.' },
      { question: 'Where does Rosa live?', answers: ['On a farm', 'In a city', 'On a boat'], because: 'Yes! The storm came over her farm.' },
      { question: 'What shook the barn?', answers: ['Thunder', 'A horse', 'A tractor'], because: 'That’s right! Thunder shook the barn.' },
      { question: 'How was the corn in the morning?', answers: ['Wet but standing', 'Blown away', 'Dry and brown'], because: 'Yes! The corn was wet, but still standing.' }
    ]
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
    questions: [
      { question: 'Why did Kim ask her mom to stop?', answers: ['To help the turtle', 'To buy some food', 'To look at the pond'], because: 'Yes! Kim wanted to help the turtle get off the road.' },
      { question: 'How did the turtle cross the road?', answers: ['Very slowly', 'Very fast', 'By hopping'], because: 'Yes! It crossed very slowly.' },
      { question: 'Who carried the turtle?', answers: ['Kim’s mom', 'Kim', 'A man in a car'], because: 'That’s right! Her mom carried it to the grass.' },
      { question: 'Where did the turtle go?', answers: ['To the pond', 'Into the road', 'Up a tree'], because: 'Yes! It walked off toward the pond.' }
    ]
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
    questions: [
      { question: 'Why did nobody say a word about her birthday?', answers: ['They planned a surprise', 'They forgot about it', 'They were asleep'], because: 'That’s right! Her friends were hiding to surprise her.' },
      { question: 'How did Luna feel on the way home?', answers: ['A little sad', 'Very happy', 'Angry'], because: 'Yes! She flew home feeling a little bit sad.' },
      { question: 'What happened when she opened the door?', answers: ['Her friends jumped out', 'The house was empty', 'It started to rain'], because: 'That’s right! The lights came on, and they shouted, “Surprise!”' },
      { question: 'What was on top of the cake?', answers: ['A moon', 'A star', 'A candle'], because: 'Yes! A moon was drawn on top.' }
    ]
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
    questions: [
      { question: 'What does the light do for the boats?', answers: ['It shows the way home', 'It keeps them warm', 'It helps catch fish'], because: 'Yes! The light shows the boats the way back home.' },
      { question: 'Who turns on the light?', answers: ['Mr. Grant', 'Luna', 'A fisher'], because: 'Yes! Mr. Grant climbs up each night and turns it on.' },
      { question: 'What happened one foggy night?', answers: ['The light stopped working', 'A boat sank', 'It snowed'], because: 'That’s right! The light went out.' },
      { question: 'How did the story end?', answers: ['All boats got home', 'The boats got lost', 'He fell asleep'], because: 'Yes! He fixed it fast, and the boats came safely in.' }
    ]
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
    questions: [
      { question: 'How did they fix their problem?', answers: ['They took turns', 'They asked a grown-up', 'They went home'], because: 'Yes! Tara and Jay took turns on the swing.' },
      { question: 'Where were Tara and Jay?', answers: ['In a park', 'At school', 'At the beach'], because: 'Yes! They were at the park.' },
      { question: 'How many swings were left?', answers: ['One', 'Two', 'Five'], because: 'That’s right! Only one swing was left.' },
      { question: 'Who swung first?', answers: ['Tara', 'Jay', 'Nobody'], because: 'Yes! Jay said, “You swing first,” so Tara went first.' }
    ]
  },
  {
    title: 'The Lemonade Stand',
    picture: '🍋',
    lines: [
      'Jada and Leo made a lemonade stand on a hot day.',
      'They squeezed lemons and added sugar and ice.',
      'At first, nobody stopped to buy a cup.',
      'Then Leo made a big sign that said, “Cold Lemonade!”',
      'Soon a long line of thirsty people was waiting.'
    ],
    questions: [
      { question: 'What was the weather like?', answers: ['Hot', 'Snowy', 'Rainy'], because: 'Yes! It was a hot day.' },
      { question: 'What did they put in the lemonade?', answers: ['Lemons and sugar', 'Milk and honey', 'Oranges and salt'], because: 'That’s right! Lemons, sugar and ice.' },
      { question: 'Why did nobody stop at first?', answers: ['They had no sign yet', 'It was raining', 'The lemonade was sour'], because: 'Yes! People came once Leo made a sign.' },
      { question: 'What happened after Leo made the sign?', answers: ['Many people came', 'The stand fell down', 'They went home'], because: 'Yes! A long line of people was waiting.' }
    ]
  },
  {
    title: 'The Spelling Bee',
    picture: '🐝',
    lines: [
      'Eli practiced his spelling words every night.',
      'At the spelling bee, his hands felt cold.',
      'His last word was “garden.”',
      'He closed his eyes and spelled it slowly, letter by letter.',
      'Everyone clapped, because he got it right!'
    ],
    questions: [
      { question: 'When did Eli practice?', answers: ['Every night', 'Every morning', 'Never'], because: 'Yes! He practiced every night.' },
      { question: 'How did Eli feel at the spelling bee?', answers: ['Nervous', 'Sleepy', 'Silly'], because: 'That’s right! His hands felt cold, so he was nervous.' },
      { question: 'What was Eli’s last word?', answers: ['Garden', 'Flower', 'Rabbit'], because: 'Yes! His last word was garden.' },
      { question: 'Why did everyone clap?', answers: ['He spelled it right', 'He fell down', 'He sang a song'], because: 'Yes! He got it right!' }
    ]
  },
  {
    title: 'Pip Plants a Tree',
    picture: '🌳',
    lines: [
      'On Earth Day, Pip planted a small apple tree.',
      'He dug a deep hole and gave it lots of water.',
      'The tree grew a little taller every year.',
      'After four years, it had its first red apples.',
      'Pip shared them with Luna under its shade.'
    ],
    questions: [
      { question: 'What kind of tree did Pip plant?', answers: ['An apple tree', 'A pine tree', 'A palm tree'], because: 'Yes! A small apple tree.' },
      { question: 'When did he plant it?', answers: ['Earth Day', 'His birthday', 'At night'], because: 'That’s right! He planted it on Earth Day.' },
      { question: 'How long until the first apples?', answers: ['Four years', 'One day', 'One week'], because: 'Yes! After four years, it had apples.' },
      { question: 'What did Pip do with the apples?', answers: ['He shared them', 'He sold them', 'He threw them away'], because: 'Yes! He shared them with Luna.' }
    ]
  },
  {
    title: 'The Rescue Puppy',
    picture: '🐶',
    lines: [
      'The Lee family went to the animal shelter.',
      'Many dogs barked, but one small puppy sat very still.',
      'It had one floppy ear and big brown eyes.',
      'Mina knelt down, and the puppy licked her hand.',
      'They took it home and named it Lucky.'
    ],
    questions: [
      { question: 'Where did the family go?', answers: ['An animal shelter', 'A pet store', 'A farm'], because: 'Yes! They went to the animal shelter.' },
      { question: 'What was special about the puppy?', answers: ['One ear flopped down', 'It had spots', 'It was very loud'], because: 'That’s right! It had one floppy ear.' },
      { question: 'What did the puppy do to Mina?', answers: ['Gave her a lick', 'Ran away', 'Barked at her'], because: 'Yes! The puppy licked her hand.' },
      { question: 'What did they name the puppy?', answers: ['Lucky', 'Spot', 'Max'], because: 'Yes! They named it Lucky.' }
    ]
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
export const G2_SIGHT_1 = lesson('g2-sw-first', 'g2-sight-words', 'Sight Words 1', 'Hear a word, then find it among look-alikes.', '👀', sightLesson('g2-sw1', G2_DOLCH[0]));

export const G2_SIGHT_2 = lesson('g2-sw-second', 'g2-sight-words', 'Sight Words 2', 'Hear a word, then find it among look-alikes.', '👀', sightLesson('g2-sw2', G2_DOLCH[1]));

export const G2_SIGHT_3 = lesson('g2-sw-third', 'g2-sight-words', 'Sight Words 3', 'Hear a word, then find it among look-alikes.', '👀', sightLesson('g2-sw3', G2_DOLCH[2]));

/** Sight Words 4 on: the rest of Dolch 101–220, then the 13th lesson (CUR-27c), 10 words a lesson. */
export const G2_SIGHT_MORE: Lesson[] = G2_DOLCH.slice(3).map((rows, i) =>
  lesson(`g2-sw-${ORDINALS[i + 3]}`, 'g2-sight-words', `Sight Words ${i + 4}`, 'Hear a word, then find it among look-alikes.', '👀', sightLesson(`g2-sw${i + 4}`, rows))
);

export const G2_STORIES_2 = lesson('g2-story-more', 'g2-storybooks', 'More Storybooks', 'Read a longer story on your own, then answer some questions.', '📖', storyRounds('g2-st2', STORIES_2), 5);

export const G2_STORIES_3 = lesson('g2-story-third', 'g2-storybooks', 'Storybook Shelf', 'Read a longer story on your own, then answer some questions.', '📖', storyRounds('g2-st3', STORIES_3), 5);
