// The Dolch sight words, in Dolch's order, a lesson of 10 at a time (CUR-27a–c;
// the teacher, 2026-11-21: "K (1–50), 1st (1–100), 2nd (100–250)"). Each word
// has 2 look-alikes, the wrong answers, and 2 sentences with a picture, so a
// lesson is 20 questions, one play. The word is heard, never shown: its
// sentence appears once it's found (BUG-27). Dolch's list ends at 220; what
// goes on to 250 waits for the teacher.

import { sightRounds } from '../lessonRounds';
import type { SightWordReaderQuestion } from '@/types/reading';

/** A word, its two look-alikes, and its two sentences with their pictures. */
export type SightRow = [word: string, lookAlikes: [string, string], sentences: [line: string, picture: string][]];

/** Kindergarten: Dolch 1–50, the 40 pre-primer words, then the first 10 primer words. */
export const K_DOLCH: SightRow[][] = [
  // lesson 1: a, and, away, big, blue, can, come, down, find, for
  [
    ['a', ['at', 'an'], [['A bird can sing.', '🐦'], ['I have a red ball.', '⚽']]],
    ['and', ['an', 'end'], [['I see a cat and a dog.', '🐱'], ['Mom and I bake a cake.', '🎂']]],
    ['away', ['way', 'awake'], [['The bird flew away.', '🐦'], ['The boat sails away.', '⛵']]],
    ['big', ['bag', 'dig'], [['The elephant is big.', '🐘'], ['I have a big box.', '📦']]],
    ['blue', ['blew', 'glue'], [['The whale is blue.', '🐳'], ['My car is blue.', '🚙']]],
    ['can', ['cat', 'man'], [['I can hop.', '🐰'], ['A bird can fly.', '🐦']]],
    ['come', ['came', 'home'], [['Come and play!', '🛝'], ['Come here, puppy!', '🐶']]],
    ['down', ['town', 'dog'], [['The ball rolls down the hill.', '⚽'], ['Sit down, please.', '🪑']]],
    ['find', ['fine', 'kind'], [['Can you find the cat?', '🐱'], ['I find a shell.', '🐚']]],
    ['for', ['four', 'far'], [['This gift is for you.', '🎁'], ['We wait for the bus.', '🚌']]]
  ],
  // lesson 2: funny, go, help, here, I, in, is, it, jump, little
  [
    ['funny', ['bunny', 'fuzzy'], [['The clown is funny.', '🤡'], ['Dad tells a funny joke.', '😂']]],
    ['go', ['no', 'got'], [['Let’s go to the park!', '🛝'], ['The cars go fast.', '🚗']]],
    ['help', ['held', 'yelp'], [['Can you help me?', '🙋'], ['I help Mom cook.', '🍳']]],
    ['here', ['her', 'hear'], [['Come here!', '👋'], ['My cat is here.', '🐱']]],
    ['I', ['it', 'in'], [['I can see a frog.', '🐸'], ['I like to read.', '📖']]],
    ['in', ['is', 'on'], [['The fish is in the bowl.', '🐟'], ['The bird is in the tree.', '🐦']]],
    ['is', ['in', 'as'], [['The sun is hot.', '☀️'], ['My dog is big.', '🐶']]],
    ['it', ['is', 'at'], [['I can see it.', '👀'], ['It is a fun game.', '🎮']]],
    ['jump', ['jam', 'bump'], [['The frog can jump.', '🐸'], ['The kids jump and play.', '🤸']]],
    ['little', ['litter', 'title'], [['The mouse is little.', '🐭'], ['I have a little fish.', '🐟']]]
  ],
  // lesson 3: look, make, me, my, not, one, play, red, run, said
  [
    ['look', ['book', 'lock'], [['Look at the big bug!', '🐛'], ['Look, it is snowing!', '❄️']]],
    ['make', ['made', 'cake'], [['We make a snowman.', '⛄'], ['I make my bed.', '🛏️']]],
    ['me', ['my', 'we'], [['Come with me.', '🤝'], ['Look at me!', '😀']]],
    ['my', ['me', 'by'], [['This is my cat.', '🐱'], ['I love my mom.', '🥰']]],
    ['not', ['nut', 'note'], [['The soup is not hot.', '🍲'], ['It is not raining.', '☀️']]],
    ['one', ['on', 'own'], [['I have one cookie.', '🍪'], ['One bird is in the tree.', '🐦']]],
    ['play', ['plan', 'clay'], [['Let’s play ball!', '⚽'], ['We play tag at recess.', '🏃']]],
    ['red', ['rod', 'bed'], [['The apple is red.', '🍎'], ['A fire truck is red.', '🚒']]],
    ['run', ['ran', 'sun'], [['I can run fast.', '🏃'], ['Dogs like to run.', '🐕']]],
    ['said', ['sad', 'paid'], [['Mom said yes!', '👍'], ['The cow said moo.', '🐄']]]
  ],
  // lesson 4: see, the, three, to, two, up, we, where, yellow, you
  [
    ['see', ['sun', 'she'], [['I see a red ball.', '⚽'], ['I see the moon.', '🌙']]],
    ['the', ['she', 'then'], [['The cat is on the bed.', '🐱'], ['The sun is up.', '☀️']]],
    ['three', ['tree', 'there'], [['I have three pets.', '🐾'], ['Three ducks swim.', '🦆']]],
    ['to', ['top', 'do'], [['We go to the zoo.', '🦁'], ['I go to bed.', '🛏️']]],
    ['two', ['too', 'tow'], [['I have two hands.', '✋'], ['Two cats nap.', '🐱']]],
    ['up', ['us', 'cup'], [['The kite goes up.', '🪁'], ['Look up at the stars.', '⭐']]],
    ['we', ['wet', 'me'], [['We can run fast.', '🏃'], ['We go to school.', '🏫']]],
    ['where', ['were', 'there'], [['Where is my hat?', '🎩'], ['Where is the cat?', '🐱']]],
    ['yellow', ['yell', 'hello'], [['The sun is yellow.', '☀️'], ['A banana is yellow.', '🍌']]],
    ['you', ['your', 'yes'], [['I see you!', '👋'], ['You can jump high.', '🐸']]]
  ],
  // lesson 5: all, am, are, at, ate, be, black, brown, but, came
  [
    ['all', ['ball', 'add'], [['We all clap.', '👏'], ['The cake is all gone.', '🎂']]],
    ['am', ['an', 'ham'], [['I am five.', '🖐️'], ['I am happy.', '😀']]],
    ['are', ['arm', 'ear'], [['We are friends.', '🤝'], ['You are my best friend.', '🤗']]],
    ['at', ['it', 'an'], [['Look at the moon.', '🌙'], ['We play at the park.', '🛝']]],
    ['ate', ['at', 'gate'], [['I ate an apple.', '🍎'], ['The dog ate my sock.', '🧦']]],
    ['be', ['bee', 'bed'], [['Be kind.', '💛'], ['I want to be a cook.', '👩‍🍳']]],
    ['black', ['back', 'block'], [['The cat is black.', '🐈‍⬛'], ['The night sky is black.', '🌃']]],
    ['brown', ['crown', 'brain'], [['The bear is brown.', '🐻'], ['Toast is brown.', '🍞']]],
    ['but', ['bat', 'bug'], [['It is cold, but I have a hat.', '🧣'], ['I am small, but I am fast.', '🐭']]],
    ['came', ['come', 'game'], [['The bus came.', '🚌'], ['Grandma came to visit.', '👵']]]
  ]
];

/** 1st grade's lessons 6–10: Dolch 51–100, the rest of the primer words, then the 1st-grade list's first eight. Lessons 1–5 are Kindergarten's. */
export const G1_DOLCH_MORE: SightRow[][] = [
  // lesson 1: did, do, eat, four, get, good, have, he, into, like
  [
    ['did', ['dig', 'kid'], [['I did my homework.', '📝'], ['Did you see the dog?', '🐶']]],
    ['do', ['dog', 'go'], [['What do you like?', '🙂'], ['I can do it!', '💪']]],
    ['eat', ['ear', 'seat'], [['We eat lunch at noon.', '🥪'], ['Cows eat grass.', '🐄']]],
    ['four', ['for', 'flour'], [['I have four cats.', '🐱'], ['A chair has four legs.', '🪑']]],
    ['get', ['got', 'net'], [['Can you get the ball?', '⚽'], ['I get up at seven.', '⏰']]],
    ['good', ['food', 'gold'], [['This cake is good.', '🍰'], ['Good night, Mom!', '🌙']]],
    ['have', ['has', 'gave'], [['I have a red bike.', '🚲'], ['We have two cats.', '🐱']]],
    ['he', ['she', 'her'], [['He has a red cap.', '🧢'], ['He can kick the ball.', '⚽']]],
    ['into', ['onto', 'in'], [['The frog jumps into the pond.', '🐸'], ['Put the toys into the box.', '🧸']]],
    ['like', ['lake', 'bike'], [['I like my blue hat.', '🎩'], ['Do you like apples?', '🍎']]]
  ],
  // lesson 2: must, new, no, now, on, our, out, please, pretty, ran
  [
    ['must', ['most', 'much'], [['You must wash your hands.', '🧼'], ['We must be quiet.', '🤫']]],
    ['new', ['now', 'few'], [['I have new shoes.', '👟'], ['We got a new puppy.', '🐶']]],
    ['no', ['not', 'on'], [['I have no hat.', '🎩'], ['No, thank you!', '🙂']]],
    ['now', ['new', 'how'], [['Go to bed now.', '🛏️'], ['It is raining now.', '🌧️']]],
    ['on', ['off', 'no'], [['The cat sits on the bed.', '🐱'], ['Put on your hat.', '🎩']]],
    ['our', ['out', 'your'], [['This is our house.', '🏠'], ['Our dog is brown.', '🐶']]],
    ['out', ['our', 'cut'], [['The cat ran out the door.', '🐱'], ['Let’s go out to play.', '🛝']]],
    ['please', ['place', 'plate'], [['Please pass the bread.', '🍞'], ['Can I have one, please?', '🍪']]],
    ['pretty', ['party', 'puppy'], [['The flower is pretty.', '🌸'], ['She has a pretty dress.', '👗']]],
    ['ran', ['run', 'rain'], [['The dog ran fast.', '🐕'], ['I ran to the bus.', '🚌']]]
  ],
  // lesson 3: ride, saw, say, she, so, soon, that, there, they, this
  [
    ['ride', ['rode', 'hide'], [['I ride my bike.', '🚲'], ['We ride the bus to school.', '🚌']]],
    ['saw', ['was', 'sew'], [['I saw a big bear.', '🐻'], ['We saw the moon.', '🌙']]],
    ['say', ['day', 'saw'], [['What did you say?', '🗣️'], ['Say hello to Pip!', '👋']]],
    ['she', ['he', 'see'], [['She has a pet dog.', '🐶'], ['She can swim fast.', '🏊']]],
    ['so', ['to', 'sun'], [['I am so happy!', '😀'], ['It is so cold.', '🥶']]],
    ['soon', ['moon', 'spoon'], [['We will eat soon.', '🍽️'], ['The bus will come soon.', '🚌']]],
    ['that', ['what', 'than'], [['I want that toy.', '🧸'], ['Look at that bird!', '🐦']]],
    ['there', ['three', 'here'], [['There is a bug on me!', '🐛'], ['The park is over there.', '🛝']]],
    ['they', ['then', 'the'], [['They play in the park.', '🛝'], ['They like to sing.', '🎵']]],
    ['this', ['thin', 'his'], [['This apple is red.', '🍎'], ['I like this song.', '🎵']]]
  ],
  // lesson 4: too, under, want, was, well, went, what, white, who, will
  [
    ['too', ['two', 'toe'], [['I want to come too!', '🙋'], ['This soup is too hot.', '🍲']]],
    ['under', ['thunder', 'uncle'], [['The cat is under the bed.', '🐱'], ['My shoes are under the table.', '👟']]],
    ['want', ['went', 'wait'], [['I want a cookie.', '🍪'], ['Do you want to play?', '⚽']]],
    ['was', ['saw', 'wash'], [['The cat was on the bed.', '🐱'], ['It was a sunny day.', '☀️']]],
    ['well', ['will', 'bell'], [['I feel well today.', '😀'], ['She sings very well.', '🎤']]],
    ['went', ['want', 'tent'], [['We went to the zoo.', '🦁'], ['Pip went to bed.', '🛏️']]],
    ['what', ['that', 'wet'], [['What is in the box?', '📦'], ['What is your name?', '🙂']]],
    ['white', ['write', 'while'], [['Snow is white.', '❄️'], ['The milk is white.', '🥛']]],
    ['who', ['how', 'why'], [['Who is at the door?', '🚪'], ['Who has my hat?', '🎩']]],
    ['will', ['well', 'hill'], [['I will help you.', '🤝'], ['It will rain today.', '🌧️']]]
  ],
  // lesson 5: with, yes, after, again, an, any, as, ask, by, could
  [
    ['with', ['wish', 'will'], [['Come and play with me.', '⚽'], ['I eat with a spoon.', '🥄']]],
    ['yes', ['yet', 'eyes'], [['Yes, I can!', '👍'], ['Yes, you can have one.', '🍪']]],
    ['after', ['always', 'other'], [['We play after school.', '🛝'], ['I brush my teeth after lunch.', '🪥']]],
    ['again', ['against', 'gain'], [['Let’s play that game again.', '🎮'], ['Sing that song again.', '🎵']]],
    ['an', ['and', 'in'], [['I have an orange.', '🍊'], ['It is an egg.', '🥚']]],
    ['any', ['many', 'and'], [['Do you have any pets?', '🐾'], ['I do not want any broccoli.', '🥦']]],
    ['as', ['at', 'has'], [['I am as tall as Dad.', '📏'], ['She is as fast as a cat.', '🐱']]],
    ['ask', ['ash', 'mask'], [['Ask Mom for help.', '🙋'], ['Can I ask a question?', '❓']]],
    ['by', ['my', 'buy'], [['Sit by me.', '🪑'], ['The cat sleeps by the fire.', '🔥']]],
    ['could', ['cloud', 'cold'], [['I could see the moon last night.', '🌙'], ['She could run very fast.', '🏃']]]
  ]
];

/** 1st grade: Dolch 1–100, Kindergarten's five lessons as a review, then five more. */
export const G1_DOLCH: SightRow[][] = [...K_DOLCH, ...G1_DOLCH_MORE];

/** 2nd grade: Dolch 101–220 (the 1st-grade list's rest, the 2nd- and 3rd-grade lists), then a 13th lesson of the five words it taught before that aren't Dolch words, until the teacher says what goes on to 250. */
export const G2_DOLCH: SightRow[][] = [
  // lesson 1: every, fly, from, give, giving, had, has, her, him, his
  [
    ['every', ['very', 'ever'], [['I play every day.', '🌞'], ['Every bird can sing.', '🐦']]],
    ['fly', ['try', 'fry'], [['Birds can fly high.', '🐦'], ['I want to fly a kite.', '🪁']]],
    ['from', ['form', 'frog'], [['This card is from Grandma.', '💌'], ['The bus came from the city.', '🚌']]],
    ['give', ['live', 'gave'], [['Please give me the ball.', '⚽'], ['I give my dog a bone.', '🦴']]],
    ['giving', ['living', 'given'], [['We are giving Mom flowers.', '💐'], ['Thank you for giving me a hug.', '🤗']]],
    ['had', ['has', 'hat'], [['I had a big lunch.', '🥪'], ['We had fun at the park.', '🛝']]],
    ['has', ['had', 'his'], [['The cat has a long tail.', '🐱'], ['Pip has a new kite.', '🪁']]],
    ['her', ['he', 'hen'], [['She has her book.', '📖'], ['Ann hugs her dog.', '🐶']]],
    ['him', ['his', 'hum'], [['I gave him a cookie.', '🍪'], ['We sang Happy Birthday to him.', '🎂']]],
    ['his', ['has', 'hit'], [['Dad has his hat.', '🎩'], ['Sam rides his bike.', '🚲']]]
  ],
  // lesson 2: how, just, know, let, live, may, of, old, once, open
  [
    ['how', ['who', 'hot'], [['How old are you?', '🎂'], ['How do birds fly?', '🐦']]],
    ['just', ['jump', 'must'], [['I just woke up.', '🥱'], ['It is just a little bug.', '🐞']]],
    ['know', ['now', 'knot'], [['I know your name.', '🙂'], ['Do you know the way home?', '🏠']]],
    ['let', ['lot', 'leg'], [['Let me help you.', '🤝'], ['Mom let us stay up late.', '🌙']]],
    ['live', ['life', 'give'], [['I live in a blue house.', '🏠'], ['Fish live in water.', '🐟']]],
    ['may', ['way', 'many'], [['May I have some juice?', '🧃'], ['It may snow today.', '❄️']]],
    ['of', ['off', 'if'], [['I have a cup of milk.', '🥛'], ['I see a lot of stars.', '⭐']]],
    ['old', ['cold', 'odd'], [['My dog is very old.', '🐕'], ['This is an old book.', '📖']]],
    ['once', ['one', 'onto'], [['Once I saw a whale.', '🐋'], ['I ride the bus once a week.', '🚌']]],
    ['open', ['oven', 'often'], [['Please open the door.', '🚪'], ['The store is open.', '🏪']]]
  ],
  // lesson 3: over, put, round, some, stop, take, thank, them, then, think
  [
    ['over', ['oven', 'ever'], [['The cow jumped over the moon.', '🐄'], ['The game is over.', '🏁']]],
    ['put', ['pet', 'but'], [['Put your coat on.', '🧥'], ['I put the toys away.', '🧸']]],
    ['round', ['sound', 'road'], [['The ball is round.', '⚽'], ['A pizza is round.', '🍕']]],
    ['some', ['come', 'same'], [['I have some grapes.', '🍇'], ['Can I have some milk?', '🥛']]],
    ['stop', ['step', 'spot'], [['Stop at the red light.', '🚦'], ['The bus will stop here.', '🚏']]],
    ['take', ['make', 'tale'], [['Take your hat with you.', '🎩'], ['I take the bus to school.', '🚌']]],
    ['thank', ['think', 'than'], [['Thank you for the gift!', '🎁'], ['Say thank you to Grandma.', '👵']]],
    ['them', ['then', 'the'], [['I gave them some apples.', '🍎'], ['I like them a lot.', '🥰']]],
    ['then', ['them', 'than'], [['First we eat, then we play.', '🍽️'], ['I brushed my teeth, then I went to bed.', '🛏️']]],
    ['think', ['thank', 'thing'], [['I think it will rain.', '🌧️'], ['Think before you answer.', '🤔']]]
  ],
  // lesson 4: walk, were, when, always, around, because, been, before, best, both
  [
    ['walk', ['talk', 'wall'], [['We walk to school.', '🚶'], ['I walk my dog every day.', '🐕']]],
    ['were', ['where', 'wear'], [['We were at the beach.', '🏖️'], ['They were very tired.', '😴']]],
    ['when', ['then', 'went'], [['When can we go?', '🚗'], ['I sing when I am happy.', '😀']]],
    ['always', ['away', 'also'], [['Luna always stays up late.', '🌙'], ['I always wear my hat.', '🎩']]],
    ['around', ['round', 'arrow'], [['We ran around the tree.', '🌳'], ['The moon goes around the earth.', '🌍']]],
    ['because', ['became', 'before'], [['I smile because I am happy.', '😀'], ['We stay in because it is raining.', '🌧️']]],
    ['been', ['bean', 'bee'], [['I have been to the zoo.', '🦁'], ['Where have you been?', '🤔']]],
    ['before', ['behind', 'because'], [['Wash your hands before lunch.', '🧼'], ['Brush your teeth before bed.', '🪥']]],
    ['best', ['rest', 'bent'], [['You are my best friend.', '🤝'], ['This is the best day ever!', '🎉']]],
    ['both', ['bath', 'booth'], [['We both like ice cream.', '🍦'], ['Hold it with both hands.', '🙌']]]
  ],
  // lesson 5: buy, call, cold, does, don’t, fast, first, five, found, gave
  [
    ['buy', ['by', 'boy'], [['Let’s buy some bread.', '🍞'], ['I want to buy a toy.', '🧸']]],
    ['call', ['tall', 'cell'], [['I will call you later.', '📞'], ['Call the dog to come in.', '🐕']]],
    ['cold', ['could', 'hold'], [['The ice is cold.', '🧊'], ['It is cold outside today.', '🥶']]],
    ['does', ['goes', 'done'], [['Does your cat like milk?', '🐱'], ['He does his homework.', '📝']]],
    ['don’t', ['won’t', 'done'], [['I don’t like rain.', '🌧️'], ['Don’t touch the hot stove!', '🔥']]],
    ['fast', ['last', 'fist'], [['The car is very fast.', '🏎️'], ['Cheetahs run fast.', '🐆']]],
    ['first', ['fist', 'fast'], [['I was first in line.', '🥇'], ['First, wash your hands.', '🧼']]],
    ['five', ['fire', 'fine'], [['I have five fingers on each hand.', '🖐️'], ['I see five ducks.', '🦆']]],
    ['found', ['sound', 'fond'], [['I found my lost shoe.', '👟'], ['We found a shell at the beach.', '🐚']]],
    ['gave', ['give', 'game'], [['Dad gave me a hug.', '🤗'], ['She gave the dog a bath.', '🛁']]]
  ],
  // lesson 6: goes, green, its, made, many, off, or, pull, read, right
  [
    ['goes', ['does', 'gets'], [['The bus goes to town.', '🚌'], ['My cat goes outside to play.', '🐈']]],
    ['green', ['grain', 'greet'], [['The grass is green.', '🌱'], ['A frog is green.', '🐸']]],
    ['its', ['it', 'is'], [['The dog wags its tail.', '🐕'], ['The bird is in its nest.', '🪺']]],
    ['made', ['make', 'mad'], [['I made a card for Mom.', '💌'], ['We made a big snowman.', '⛄']]],
    ['many', ['money', 'any'], [['I see many stars.', '⭐'], ['How many eggs do you have?', '🥚']]],
    ['off', ['of', 'odd'], [['Turn off the light.', '💡'], ['Take off your shoes.', '👟']]],
    ['or', ['our', 'on'], [['Do you want milk or juice?', '🥛'], ['Is it a cat or a dog?', '🐶']]],
    ['pull', ['pill', 'full'], [['Pull the rope!', '🪢'], ['I pull the door open.', '🚪']]],
    ['read', ['red', 'road'], [['I read a book every night.', '📖'], ['Can you read this sign?', '🪧']]],
    ['right', ['night', 'ride'], [['Turn right at the park.', '➡️'], ['You got it right!', '✅']]]
  ],
  // lesson 7: sing, sit, sleep, tell, their, these, those, upon, us, use
  [
    ['sing', ['sink', 'song'], [['Birds sing in the morning.', '🐦'], ['Let’s sing a song!', '🎵']]],
    ['sit', ['sat', 'set'], [['Please sit down.', '🪑'], ['Sit next to me.', '🤝']]],
    ['sleep', ['sheep', 'steep'], [['I sleep in my bed.', '🛏️'], ['Cats sleep a lot.', '🐈']]],
    ['tell', ['tall', 'bell'], [['Tell me a story.', '📖'], ['Can you tell me the time?', '🕒']]],
    ['their', ['three', 'thing'], [['The birds left their nest.', '🪹'], ['They love their dog.', '🐶']]],
    ['these', ['those', 'three'], [['These shoes are new.', '👟'], ['Are these your crayons?', '🖍️']]],
    ['those', ['these', 'hose'], [['Those clouds look like sheep.', '☁️'], ['Look at those big trucks!', '🚚']]],
    ['upon', ['open', 'upper'], [['Once upon a time, there was a king.', '👑'], ['The cat sat upon a pillow.', '🛋️']]],
    ['us', ['use', 'up'], [['Come with us!', '👋'], ['Mom read to us.', '📖']]],
    ['use', ['us', 'used'], [['Use a pencil to write.', '✏️'], ['We use soap to wash.', '🧼']]]
  ],
  // lesson 8: very, wash, which, why, wish, work, would, write, your, about
  [
    ['very', ['every', 'vest'], [['The sun is very hot.', '☀️'], ['My kitten is very small.', '🐱']]],
    ['wash', ['wish', 'was'], [['Wash your hands.', '🧼'], ['We wash the car.', '🚗']]],
    ['which', ['witch', 'wish'], [['Which one do you want?', '🤔'], ['Which hat is yours?', '🎩']]],
    ['why', ['who', 'way'], [['Why is the sky blue?', '🌤️'], ['Why are you sad?', '😢']]],
    ['wish', ['wash', 'with'], [['I wish I could fly.', '🪽'], ['Make a wish!', '🌠']]],
    ['work', ['word', 'walk'], [['Dad goes to work.', '💼'], ['We work hard at school.', '🏫']]],
    ['would', ['world', 'word'], [['I would like some cake.', '🎂'], ['Would you like to play?', '⚽']]],
    ['write', ['white', 'right'], [['I can write my name.', '✏️'], ['Write a note to your friend.', '💌']]],
    ['your', ['you', 'our'], [['Is this your bag?', '🎒'], ['Brush your hair.', '🪮']]],
    ['about', ['above', 'around'], [['This book is about a whale.', '🐋'], ['We talk about the stars.', '⭐']]]
  ],
  // lesson 9: better, bring, carry, clean, cut, done, draw, drink, eight, fall
  [
    ['better', ['butter', 'letter'], [['I feel better now.', '😀'], ['This one is better.', '👍']]],
    ['bring', ['ring', 'brick'], [['Bring your coat.', '🧥'], ['Please bring me a cup.', '🥤']]],
    ['carry', ['cherry', 'curry'], [['Can you carry this box?', '📦'], ['I carry my bag to school.', '🎒']]],
    ['clean', ['clear', 'lean'], [['My room is clean.', '🧹'], ['Clean up your toys.', '🧸']]],
    ['cut', ['cat', 'cup'], [['Cut the paper in half.', '✂️'], ['Mom cut the cake.', '🎂']]],
    ['done', ['gone', 'dome'], [['I am done with my lunch.', '🍽️'], ['Is the cake done?', '🎂']]],
    ['draw', ['drew', 'straw'], [['I like to draw cats.', '🎨'], ['Draw a big sun.', '☀️']]],
    ['drink', ['drank', 'think'], [['Drink your water.', '💧'], ['I drink milk at lunch.', '🥛']]],
    ['eight', ['night', 'edge'], [['A spider has eight legs.', '🕷️'], ['I go to bed at eight.', '🕗']]],
    ['fall', ['ball', 'full'], [['Leaves fall from the trees.', '🍂'], ['Don’t fall off the swing!', '🛝']]]
  ],
  // lesson 10: far, full, got, grow, hold, hot, hurt, if, keep, kind
  [
    ['far', ['for', 'car'], [['The moon is far away.', '🌙'], ['My school is not far.', '🏫']]],
    ['full', ['fall', 'pull'], [['My cup is full.', '🥤'], ['I am full after dinner.', '🍽️']]],
    ['got', ['get', 'hot'], [['I got a new book.', '📖'], ['We got wet in the rain.', '🌧️']]],
    ['grow', ['glow', 'row'], [['Plants grow in the sun.', '🌱'], ['I will grow up tall.', '📏']]],
    ['hold', ['cold', 'hole'], [['Hold my hand.', '🤝'], ['Can you hold the baby chick?', '🐥']]],
    ['hot', ['hat', 'got'], [['The soup is hot.', '🍲'], ['It is hot in the summer.', '☀️']]],
    ['hurt', ['hut', 'hunt'], [['I hurt my knee.', '🩹'], ['Did the bee sting hurt?', '🐝']]],
    ['if', ['it', 'of'], [['Ask me if you need help.', '🙋'], ['We can play if it is sunny.', '☀️']]],
    ['keep', ['kept', 'deep'], [['You can keep this toy.', '🧸'], ['Keep your room clean.', '🧹']]],
    ['kind', ['find', 'kid'], [['Be kind to your friends.', '💛'], ['The nurse is very kind.', '👩‍⚕️']]]
  ],
  // lesson 11: laugh, light, long, much, myself, never, only, own, pick, seven
  [
    ['laugh', ['lamb', 'launch'], [['The joke made me laugh.', '😂'], ['Babies laugh a lot.', '👶']]],
    ['light', ['night', 'lift'], [['Turn on the light.', '💡'], ['A feather is very light.', '🪶']]],
    ['long', ['song', 'lung'], [['A snake is long.', '🐍'], ['We waited a long time.', '⏳']]],
    ['much', ['such', 'must'], [['Thank you very much!', '🙏'], ['How much is this?', '💵']]],
    ['myself', ['himself', 'mystery'], [['I can tie my shoes myself.', '👟'], ['I made this by myself.', '🎨']]],
    ['never', ['ever', 'newer'], [['I never eat bugs.', '🐛'], ['Never run with scissors.', '✂️']]],
    ['only', ['lonely', 'own'], [['I have only one sock.', '🧦'], ['There is only one cookie left.', '🍪']]],
    ['own', ['down', 'owl'], [['I have my own room.', '🛏️'], ['She has her own bike.', '🚲']]],
    ['pick', ['pack', 'kick'], [['Pick a card.', '🃏'], ['We pick apples in the fall.', '🍎']]],
    ['seven', ['even', 'seen'], [['A week has seven days.', '📅'], ['I am seven years old.', '🎂']]]
  ],
  // lesson 12: shall, show, six, small, start, ten, today, together, try, warm
  [
    ['shall', ['shell', 'small'], [['Shall we go to the park?', '🛝'], ['Shall I help you?', '🤝']]],
    ['show', ['snow', 'shoe'], [['Show me your picture.', '🖼️'], ['We went to a puppet show.', '🎭']]],
    ['six', ['sit', 'fix'], [['An ant has six legs.', '🐜'], ['I have six crayons.', '🖍️']]],
    ['small', ['smell', 'mall'], [['A mouse is small.', '🐭'], ['I have a small cup.', '☕']]],
    ['start', ['star', 'smart'], [['The race will start soon.', '🏁'], ['Let’s start the game.', '🎲']]],
    ['ten', ['tan', 'net'], [['I can count to ten.', '🔟'], ['I have ten toes.', '🦶']]],
    ['today', ['tonight', 'Tuesday'], [['Today is a sunny day.', '☀️'], ['What day is today?', '📅']]],
    ['together', ['gather', 'tomorrow'], [['We sing together.', '🎵'], ['Let’s clean up together.', '🧹']]],
    ['try', ['tray', 'cry'], [['Try again!', '💪'], ['I will try a new food.', '🍽️']]],
    ['warm', ['worm', 'farm'], [['My coat is warm.', '🧥'], ['The sun feels warm.', '☀️']]]
  ],
  // lesson 13: friend, people, should, thought, through
  [
    ['friend', ['found', 'fried'], [['Pip is my best friend.', '🤝'], ['My friend has a red bike.', '🚲']]],
    ['people', ['purple', 'puzzle'], [['Many people ride the bus.', '🚌'], ['People like to play in the park.', '🛝']]],
    ['should', ['shout', 'shoulder'], [['You should wear a coat.', '🧥'], ['We should brush our teeth.', '🪥']]],
    ['thought', ['though', 'through'], [['I thought it was a cat.', '🐱'], ['She thought about her friend.', '🤝']]],
    ['through', ['though', 'throw'], [['The train goes through the hill.', '🚆'], ['We walk through the forest.', '🌲']]]
  ]
];

/** Lesson ids say their place in words, as the first ones always have ("g1-sw-first"). */
export const ORDINALS = ['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth', 'eleventh', 'twelfth', 'thirteenth'];

/** A lesson's questions, its words in order, two each. */
export const sightLesson = (lesson: string, rows: SightRow[]): SightWordReaderQuestion[] =>
  rows.flatMap(([word, lookAlikes, sentences]) => sightRounds(lesson, word, lookAlikes, sentences));
