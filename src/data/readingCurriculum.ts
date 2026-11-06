import type { GradeInfo, GradeLevel, Lesson, ReadingSkill } from '../types/reading';
import { phraseChoice, pictureChoice, pictureOf, rhymeChoice } from './lessonChoices';
import {
  K_HUNT_2, K_HUNT_3, K_MORE_ROUNDS, K_RHYME_2, K_SHORT_A, K_SHORT_E_U, K_SHORT_I_O, K_SIGHT_2, K_SIGHT_3, K_SIGHT_4,
  K_SOUNDS_2, K_SOUNDS_3, K_SOUNDS_4, K_SOUNDS_5
} from './lessons/kindergarten';
import {
  G1_L_BLENDS, G1_MAGIC_A, G1_MAGIC_I_O, G1_MORE_ROUNDS, G1_R_BLENDS, G1_RHYMES, G1_S_BLENDS, G1_SENTENCES_2, G1_SENTENCES_3,
  G1_SH_CH, G1_SIGHT_1, G1_SIGHT_2, G1_SIGHT_3, G1_STORIES_1, G1_STORIES_2, G1_TH_WH
} from './lessons/grade1';
import {
  G2_AI_AY, G2_AR, G2_COMPOUNDS_2, G2_EE_EA, G2_ER_IR_UR, G2_IGH, G2_MORE_ROUNDS, G2_OA_OW, G2_OO, G2_OR, G2_OU_OW,
  G2_SIGHT_1, G2_SIGHT_2, G2_SIGHT_3, G2_STORIES_2, G2_STORIES_3
} from './lessons/grade2';

export const GRADES: GradeInfo[] = [
  { id: 'kindergarten', title: 'Kindergarten' },
  { id: 'grade1', title: '1st Grade' },
  { id: 'grade2', title: '2nd Grade' }
];

const FIRST_LESSONS: Record<GradeLevel, ReadingSkill[]> = {
  kindergarten: [
    {
      id: 'k-match-sounds',
      name: 'Match the Sound',
      icon: '👂',
      description: 'Hear a letter sound, then find the letter that makes it.',
      lessons: [
        {
          id: 'k-ms-m-s-b-t',
          skillId: 'k-match-sounds',
          grade: 'kindergarten',
          title: 'First Letter Sounds',
          description: 'Listen to the letter sounds and find the matching letter.',
          icon: '🎵',
          difficulty: 1,
          starsToEarn: 3,
          questions: [
            {
              id: 'q-k-snd-m',
              type: 'sound-to-letter',
              prompt: 'What letter makes this sound?',
              speechPrompt: 'What letter makes the mmmmm sound?',
              targetLetter: 'M',
              targetSoundSpoken: 'mmmmm',
              targetSoundName: '/m/',
              hint: 'Mmm like yummy food!',
              options: [
                { id: 'opt-m', letter: 'M', isCorrect: true },
                { id: 'opt-s', letter: 'S', isCorrect: false },
                { id: 'opt-b', letter: 'B', isCorrect: false },
                { id: 'opt-t', letter: 'T', isCorrect: false }
              ]
            },
            {
              id: 'q-k-snd-s',
              type: 'sound-to-letter',
              prompt: 'What letter makes this sound?',
              speechPrompt: 'What letter makes the sssss sound like a snake?',
              targetLetter: 'S',
              targetSoundSpoken: 'sssss',
              targetSoundName: '/s/',
              hint: 'Sssss like a friendly snake!',
              options: [
                { id: 'opt-a', letter: 'A', isCorrect: false },
                { id: 'opt-s', letter: 'S', isCorrect: true },
                { id: 'opt-p', letter: 'P', isCorrect: false },
                { id: 'opt-d', letter: 'D', isCorrect: false }
              ]
            },
            {
              id: 'q-k-snd-b',
              type: 'sound-to-letter',
              prompt: 'What letter makes this sound?',
              speechPrompt: 'What letter makes the /b/ sound, like bear?',
              targetLetter: 'B',
              targetSoundSpoken: 'b',
              targetSoundName: '/b/',
              hint: 'Listen: /b/, like bear and ball!',
              options: [
                { id: 'opt-b', letter: 'B', isCorrect: true },
                { id: 'opt-d', letter: 'D', isCorrect: false },
                { id: 'opt-p', letter: 'P', isCorrect: false },
                { id: 'opt-t', letter: 'T', isCorrect: false }
              ]
            },
            {
              id: 'q-k-snd-t',
              type: 'sound-to-letter',
              prompt: 'What letter makes this sound?',
              speechPrompt: 'What letter makes the /t/ sound, like turtle?',
              targetLetter: 'T',
              targetSoundSpoken: 't',
              targetSoundName: '/t/',
              hint: 'Listen: /t/, like tiger and turtle!',
              options: [
                { id: 'opt-f', letter: 'F', isCorrect: false },
                { id: 'opt-t', letter: 'T', isCorrect: true },
                { id: 'opt-l', letter: 'L', isCorrect: false },
                { id: 'opt-m', letter: 'M', isCorrect: false }
              ]
            },
            ...K_MORE_ROUNDS['k-ms-m-s-b-t']
          ]
        }
      ]
    },
    {
      id: 'k-letter-hunter',
      name: 'Letter Hunter',
      icon: '🔍',
      description: 'Look for the letter! Practice spotting uppercase and lowercase letters.',
      lessons: [
        {
          id: 'k-lh-easy',
          skillId: 'k-letter-hunter',
          grade: 'kindergarten',
          title: 'Look-Alike Letters',
          description: 'Hunt and spot the matching letter card.',
          icon: '🔎',
          difficulty: 1,
          starsToEarn: 3,
          questions: [
            {
              id: 'q-k-lh-a',
              type: 'find-letter',
              prompt: 'Which letter did Ms. Luna say?',
              speechPrompt: 'Can you find the uppercase letter A?',
              targetLetter: 'A',
              hint: 'Letter A looks like a triangle with legs!',
              options: [
                { id: 'opt-o', letter: 'O', isCorrect: false },
                { id: 'opt-a', letter: 'A', isCorrect: true },
                { id: 'opt-d', letter: 'D', isCorrect: false },
                { id: 'opt-h', letter: 'H', isCorrect: false }
              ]
            },
            {
              id: 'q-k-lh-m',
              type: 'find-letter',
              prompt: 'Which letter did Ms. Luna say?',
              speechPrompt: 'Can you find the letter M?',
              targetLetter: 'M',
              hint: 'Letter M has two mountain peaks!',
              options: [
                { id: 'opt-w', letter: 'W', isCorrect: false },
                { id: 'opt-n', letter: 'N', isCorrect: false },
                { id: 'opt-m', letter: 'M', isCorrect: true },
                { id: 'opt-v', letter: 'V', isCorrect: false }
              ]
            },
            {
              id: 'q-k-lh-s',
              type: 'find-letter',
              prompt: 'Which letter did Ms. Luna say?',
              speechPrompt: 'Can you find the letter S?',
              targetLetter: 'S',
              hint: 'Letter S curves like a snake!',
              options: [
                { id: 'opt-c', letter: 'C', isCorrect: false },
                { id: 'opt-z', letter: 'Z', isCorrect: false },
                { id: 'opt-s', letter: 'S', isCorrect: true },
                { id: 'opt-g', letter: 'G', isCorrect: false }
              ]
            },
            ...K_MORE_ROUNDS['k-lh-easy']
          ]
        }
      ]
    },
    {
      id: 'k-blend-words',
      name: 'Blend & Read CVC Words',
      icon: '🧩',
      description: 'Tap each letter sound, blend them together, and find the matching picture!',
      lessons: [
        {
          id: 'k-bw-animals',
          skillId: 'k-blend-words',
          grade: 'kindergarten',
          title: 'Pet & Animal Words',
          description: 'Sound out and read animal words!',
          icon: '🐱',
          difficulty: 1,
          starsToEarn: 3,
          questions: [
            {
              id: 'q-k-bw-cat',
              type: 'blend-and-read',
              prompt: 'Sound out the letters and read the word!',
              speechPrompt: 'Tap each letter to hear its sound, then blend them into a word!',
              word: 'cat',
              phonemes: [
                { text: 'c', spokenSound: 'c' },
                { text: 'a', spokenSound: 'a' },
                { text: 't', spokenSound: 't' }
              ],
              hint: 'It’s a furry pet that purrs!',
              options: [
                pictureChoice('cat', true),
                pictureChoice('cap', false),
                pictureChoice('pig', false)
              ]
            },
            {
              id: 'q-k-bw-pig',
              type: 'blend-and-read',
              prompt: 'Blend the sounds to read the word!',
              speechPrompt: 'Sound out /p/ /i/ /g/! What word does it make?',
              word: 'pig',
              phonemes: [
                { text: 'p', spokenSound: 'p' },
                { text: 'i', spokenSound: 'i' },
                { text: 'g', spokenSound: 'g' }
              ],
              hint: 'An oinking farm friend!',
              options: [
                pictureChoice('pen', false),
                pictureChoice('pig', true),
                pictureChoice('dog', false)
              ]
            },
            {
              id: 'q-k-bw-dog',
              type: 'blend-and-read',
              prompt: 'Blend the sounds to read the word!',
              speechPrompt: 'Sound out /d/ /o/ /g/! Which picture matches?',
              word: 'dog',
              phonemes: [
                { text: 'd', spokenSound: 'd' },
                { text: 'o', spokenSound: 'o' },
                { text: 'g', spokenSound: 'g' }
              ],
              hint: 'A puppy that barks woof!',
              options: [
                pictureChoice('dog', true),
                pictureChoice('fox', false),
                pictureChoice('duck', false)
              ]
            },
            ...K_MORE_ROUNDS['k-bw-animals']
          ]
        },
        {
          id: 'k-bw-everyday',
          skillId: 'k-blend-words',
          grade: 'kindergarten',
          title: 'Everyday Words (Sun, Bed, Cup)',
          // a step up from Pet & Animal Words: four pictures, where that one
          // has three (Alex, 2026-10-19; CUR-5)
          description: 'Read and blend common everyday objects.',
          icon: '☀️',
          difficulty: 1,
          starsToEarn: 3,
          questions: [
            {
              id: 'q-k-bw-sun',
              type: 'blend-and-read',
              prompt: 'Blend the sounds to read the word!',
              speechPrompt: 'Sound out /s/ /u/ /n/! Which picture matches?',
              word: 'sun',
              phonemes: [
                { text: 's', spokenSound: 's' },
                { text: 'u', spokenSound: 'u' },
                { text: 'n', spokenSound: 'n' }
              ],
              hint: 'It shines warm and bright up in the sky!',
              options: [
                pictureChoice('sun', true),
                pictureChoice('moon', false),
                pictureChoice('sock', false),
                pictureChoice('bug', false)
              ]
            },
            {
              id: 'q-k-bw-bed',
              type: 'blend-and-read',
              prompt: 'Blend the sounds to read the word!',
              speechPrompt: 'Sound out /b/ /e/ /d/! Which picture matches?',
              word: 'bed',
              phonemes: [
                { text: 'b', spokenSound: 'b' },
                { text: 'e', spokenSound: 'e' },
                { text: 'd', spokenSound: 'd' }
              ],
              hint: 'Where you sleep with a cozy pillow!',
              options: [
                pictureChoice('bed', true),
                pictureChoice('bug', false),
                pictureChoice('cup', false),
                pictureChoice('hen', false)
              ]
            },
            {
              id: 'q-k-bw-cup',
              type: 'blend-and-read',
              prompt: 'Blend the sounds to read the word!',
              speechPrompt: 'Sound out /k/ /u/ /p/! Which picture matches?',
              word: 'cup',
              phonemes: [
                { text: 'c', spokenSound: 'c' },
                { text: 'u', spokenSound: 'u' },
                { text: 'p', spokenSound: 'p' }
              ],
              hint: 'Used to drink warm milk or cold juice!',
              options: [
                pictureChoice('cup', true),
                pictureChoice('cap', false),
                pictureChoice('box', false),
                pictureChoice('pup', false)
              ]
            },
            ...K_MORE_ROUNDS['k-bw-everyday']
          ]
        }
      ]
    },
    {
      id: 'k-sight-words',
      name: 'Sight Word Power',
      icon: '⚡',
      description: 'Recognize common words instantly by sight.',
      lessons: [
        {
          id: 'k-sw-starter',
          skillId: 'k-sight-words',
          grade: 'kindergarten',
          title: 'Starter Sight Words',
          description: 'Hear a word, then find it among look-alikes.',
          icon: '👀',
          difficulty: 1,
          starsToEarn: 3,
          questions: [
            {
              id: 'q-k-sw-see',
              type: 'sight-word-reader',
              // none of the lesson's words on screen, not even "the" (CUR-3)
              prompt: 'Which word does Ms. Luna say?',
              speechPrompt: 'Find the sight word SEE: "I see a smiling star!"',
              word: 'see',
              exampleSentence: 'I see a smiling star! ⭐',
              hint: 'Listen closely: see. I see with my eyes!',
              options: [
                { id: 'opt-see', word: 'see', isCorrect: true },
                { id: 'opt-sun', word: 'sun', isCorrect: false },
                { id: 'opt-she', word: 'she', isCorrect: false }
              ]
            },
            // the, like, I and a, which can't be sounded out the way "big"
            // and "can" could (CUR-3); each against two real look-alikes,
            // never a word that sounds the same
            {
              id: 'q-k-sw-the',
              type: 'sight-word-reader',
              // none of the lesson's words on screen, not even "the" (CUR-3)
              prompt: 'Which word does Ms. Luna say?',
              speechPrompt: 'Find the sight word THE: "The moon is up!"',
              word: 'the',
              exampleSentence: 'The moon is up! 🌙',
              hint: 'Listen closely: the. The moon is up!',
              options: [
                { id: 'opt-she', word: 'she', isCorrect: false },
                { id: 'opt-the', word: 'the', isCorrect: true },
                { id: 'opt-then', word: 'then', isCorrect: false }
              ]
            },
            {
              id: 'q-k-sw-like',
              type: 'sight-word-reader',
              // none of the lesson's words on screen, not even "the" (CUR-3)
              prompt: 'Which word does Ms. Luna say?',
              speechPrompt: 'Find the sight word LIKE: "I like red apples!"',
              word: 'like',
              exampleSentence: 'I like red apples! 🍎',
              hint: 'Listen closely: like. I like red apples!',
              options: [
                { id: 'opt-lake', word: 'lake', isCorrect: false },
                { id: 'opt-bike', word: 'bike', isCorrect: false },
                { id: 'opt-like', word: 'like', isCorrect: true }
              ]
            },
            {
              id: 'q-k-sw-i',
              type: 'sight-word-reader',
              // none of the lesson's words on screen, not even "the" (CUR-3)
              prompt: 'Which word does Ms. Luna say?',
              speechPrompt: 'Find the sight word I: "I can hop!"',
              word: 'I',
              exampleSentence: 'I can hop! 🐰',
              hint: 'Listen closely: I. I can hop!',
              options: [
                { id: 'opt-i', word: 'I', isCorrect: true },
                { id: 'opt-it', word: 'it', isCorrect: false },
                { id: 'opt-in', word: 'in', isCorrect: false }
              ]
            },
            {
              id: 'q-k-sw-a',
              type: 'sight-word-reader',
              // none of the lesson's words on screen, not even "the" (CUR-3)
              prompt: 'Which word does Ms. Luna say?',
              speechPrompt: 'Find the sight word A: "I see a bug!"',
              word: 'a',
              exampleSentence: 'I see a bug! 🐞',
              hint: 'Listen closely: a. I see a bug!',
              options: [
                { id: 'opt-at', word: 'at', isCorrect: false },
                { id: 'opt-a', word: 'a', isCorrect: true },
                { id: 'opt-an', word: 'an', isCorrect: false }
              ]
            },
            ...K_MORE_ROUNDS['k-sw-starter']
          ]
        }
      ]
    },
    {
      id: 'k-rhyming',
      name: 'Rhyme Matcher',
      icon: '🎵',
      description: 'Match words that sound the same at the end!',
      lessons: [
        {
          id: 'k-rh-pairs',
          skillId: 'k-rhyming',
          grade: 'kindergarten',
          title: 'Rhyme Matcher',
          description: 'Find the pictures that rhyme.',
          icon: '🎩',
          difficulty: 1,
          starsToEarn: 3,
          questions: [
            {
              id: 'q-k-rh-cat',
              type: 'rhyme-match',
              prompt: 'Which word rhymes with CAT?',
              speechPrompt: 'Cat! Which picture rhymes with cat?',
              targetWord: 'cat',
              targetEmoji: pictureOf('cat'),
              hint: 'Say each picture out loud: dog, hat, sun. Which one ends just like cat?',
              options: [
                rhymeChoice('hat', true),
                rhymeChoice('dog', false),
                rhymeChoice('sun', false)
              ]
            },
            {
              id: 'q-k-rh-sun',
              type: 'rhyme-match',
              prompt: 'Which word rhymes with SUN?',
              speechPrompt: 'Sun! Which picture rhymes with sun?',
              targetWord: 'sun',
              targetEmoji: pictureOf('sun'),
              hint: 'Say each picture out loud: pig, car, run. Which one ends just like sun?',
              options: [
                rhymeChoice('run', true),
                rhymeChoice('pig', false),
                rhymeChoice('car', false)
              ]
            },
            {
              id: 'q-k-rh-fox',
              type: 'rhyme-match',
              prompt: 'Which word rhymes with FOX?',
              speechPrompt: 'Fox! Which picture rhymes with fox?',
              targetWord: 'fox',
              targetEmoji: pictureOf('fox'),
              hint: 'Say each picture out loud: ball, box, bird. Which one ends just like fox?',
              options: [
                rhymeChoice('box', true),
                rhymeChoice('ball', false),
                rhymeChoice('bird', false)
              ]
            },
            ...K_MORE_ROUNDS['k-rh-pairs']
          ]
        }
      ]
    }
  ],

  grade1: [
    {
      id: 'g1-digraphs',
      name: 'Digraphs & Blends Decoder',
      icon: '🔤',
      description: 'Decode 2-letter teams like SH, CH, TH, and blends like FR and ST!',
      lessons: [
        {
          id: 'g1-ph-digraphs',
          skillId: 'g1-digraphs',
          grade: 'grade1',
          title: 'Ship, Frog & Star',
          description: 'Sound out words with letter teams and blends!',
          icon: '🚢',
          difficulty: 1,
          starsToEarn: 3,
          questions: [
            {
              id: 'q-g1-ph-ship',
              type: 'blend-and-read',
              prompt: 'Blend the sounds to read the digraph word!',
              speechPrompt: 'S and H team up to make /sh/. Blend the sounds: /sh/ /i/ /p/!',
              word: 'ship',
              phonemes: [
                { text: 'sh', spokenSound: 'sh' },
                { text: 'i', spokenSound: 'i' },
                { text: 'p', spokenSound: 'p' }
              ],
              hint: 'A large boat that sails on the ocean!',
              options: [
                pictureChoice('ship', true),
                pictureChoice('shell', false),
                pictureChoice('plane', false)
              ]
            },
            {
              id: 'q-g1-ph-frog',
              type: 'blend-and-read',
              prompt: 'Blend the sounds to read the blend word!',
              speechPrompt: 'F and R blend into /fr/. Blend the sounds: /fr/ /o/ /g/!',
              word: 'frog',
              phonemes: [
                { text: 'fr', spokenSound: 'fr' },
                { text: 'o', spokenSound: 'o' },
                { text: 'g', spokenSound: 'g' }
              ],
              hint: 'A green hopper that ribbits near the pond!',
              options: [
                pictureChoice('frog', true),
                pictureChoice('duck', false),
                pictureChoice('fish', false)
              ]
            },
            {
              id: 'q-g1-ph-star',
              type: 'blend-and-read',
              prompt: 'Blend the sounds to read the blend word!',
              speechPrompt: 'S and T blend into /st/. Blend the sounds: /st/ /ar/!',
              word: 'star',
              phonemes: [
                { text: 'st', spokenSound: 'st' },
                { text: 'ar', spokenSound: 'ar' }
              ],
              hint: 'It shines gold in the night sky!',
              options: [
                pictureChoice('star', true),
                pictureChoice('cloud', false),
                pictureChoice('sun', false)
              ]
            },
            ...G1_MORE_ROUNDS['g1-ph-digraphs']
          ]
        }
      ]
    },
    {
      id: 'g1-magic-e',
      name: 'Magic Silent E Readers',
      icon: '🪄',
      description: 'The magic E jumps over the consonant to make the vowel say its long name!',
      lessons: [
        {
          id: 'g1-bw-magic-e',
          skillId: 'g1-magic-e',
          grade: 'grade1',
          title: 'Cake, Kite & Bone',
          description: 'Read words with silent E long vowels.',
          icon: '🎂',
          difficulty: 2,
          starsToEarn: 3,
          questions: [
            {
              id: 'q-g1-bw-cake',
              type: 'read-and-match',
              prompt: 'Read this Magic E word!',
              speechPrompt: 'Read the word, then find its picture. The magic E makes the vowel say its name!',
              word: 'cake',
              hint: 'A sweet birthday treat with frosting and candles!',
              options: [
                pictureChoice('cake', true),
                pictureChoice('cup', false),
                pictureChoice('cookie', false)
              ]
            },
            {
              id: 'q-g1-bw-kite',
              type: 'read-and-match',
              prompt: 'Read this Magic E word!',
              speechPrompt: 'Read the word, then find its picture. The magic E makes the vowel say its name!',
              word: 'kite',
              hint: 'Flies high in the wind on a string!',
              options: [
                pictureChoice('kite', true),
                pictureChoice('balloon', false),
                pictureChoice('key', false)
              ]
            },
            {
              id: 'q-g1-bw-bone',
              type: 'read-and-match',
              prompt: 'Read this Magic E word!',
              speechPrompt: 'Read the word, then find its picture. The magic E makes the vowel say its name!',
              word: 'bone',
              hint: 'A puppy’s favorite chew toy!',
              options: [
                pictureChoice('bone', true),
                pictureChoice('ball', false),
                pictureChoice('bowl', false)
              ]
            },
            ...G1_MORE_ROUNDS['g1-bw-magic-e']
          ]
        }
      ]
    },
    {
      id: 'g1-sentences',
      name: 'Read Sentences & Match',
      icon: '📖',
      description: 'Read full sentences and pick the picture that matches what you read!',
      lessons: [
        {
          id: 'g1-rs-happy-pets',
          skillId: 'g1-sentences',
          grade: 'grade1',
          title: 'Animal Action Sentences',
          description: 'Read sentences about what animals do.',
          icon: '🐾',
          difficulty: 2,
          starsToEarn: 3,
          questions: [
            {
              id: 'q-g1-rs-frog',
              type: 'sentence-comprehension',
              prompt: 'Read the sentence and find the matching picture!',
              speechPrompt: 'Read the sentence. Which picture shows it?',
              sentence: 'The green frog jumps high.',
              hint: 'Tap any word to hear it. Which animal is in the sentence?',
              options: [
                phraseChoice('frog', 'Green frog hopping', true),
                phraseChoice('cat', 'Sleeping cat', false),
                phraseChoice('bird', 'Flying bird', false)
              ]
            },
            {
              id: 'q-g1-rs-cat',
              type: 'sentence-comprehension',
              prompt: 'Read the sentence and find the matching picture!',
              speechPrompt: 'Read the sentence. Which picture shows it?',
              sentence: 'A cute cat plays with yellow yarn.',
              hint: 'Tap any word to hear it. Which animal is in the sentence?',
              options: [
                phraseChoice('cat', 'Playful cat with yarn', true),
                phraseChoice('dog', 'Dog with a bone', false),
                phraseChoice('bear', 'Bear sleeping in cave', false)
              ]
            },
            ...G1_MORE_ROUNDS['g1-rs-happy-pets']
          ]
        }
      ]
    }
  ],

  grade2: [
    {
      id: 'g2-vowel-teams',
      name: 'Vowel Team Readers',
      icon: '✨',
      description: 'When two vowels go walking, the first one does the talking! (ai, ea, oa)',
      lessons: [
        {
          id: 'g2-wp-vowel-teams',
          skillId: 'g2-vowel-teams',
          grade: 'grade2',
          title: 'Train, Boat & Beach',
          description: 'Read words with vowel teams AI, OA, and EA.',
          icon: '🚆',
          difficulty: 2,
          starsToEarn: 3,
          questions: [
            {
              id: 'q-g2-wp-train',
              type: 'read-and-match',
              prompt: 'Read this vowel team word!',
              speechPrompt: 'Read the word, then find its picture. When two vowels go walking, the first one does the talking!',
              word: 'train',
              hint: 'Rides on railroad tracks and goes choo-choo!',
              options: [
                pictureChoice('train', true),
                pictureChoice('truck', false),
                pictureChoice('boat', false)
              ]
            },
            {
              id: 'q-g2-wp-boat',
              type: 'read-and-match',
              prompt: 'Read this vowel team word!',
              speechPrompt: 'Read the word, then find its picture. When two vowels go walking, the first one does the talking!',
              word: 'boat',
              hint: 'Floats on blue water with a sail!',
              options: [
                pictureChoice('boat', true),
                pictureChoice('car', false),
                pictureChoice('bike', false)
              ]
            },
            {
              id: 'q-g2-wp-beach',
              type: 'read-and-match',
              prompt: 'Read this vowel team word!',
              speechPrompt: 'Read the word, then find its picture. When two vowels go walking, the first one does the talking!',
              word: 'beach',
              hint: 'Sandy place where ocean waves splash under the sun!',
              options: [
                pictureChoice('beach', true),
                pictureChoice('forest', false),
                pictureChoice('bread', false)
              ]
            },
            ...G2_MORE_ROUNDS['g2-wp-vowel-teams']
          ]
        }
      ]
    },
    {
      id: 'g2-compounds',
      name: 'Compound Word Readers',
      icon: '🧩',
      description: 'Read two smaller words joined together into one big exciting word!',
      lessons: [
        {
          id: 'g2-bw-compounds',
          skillId: 'g2-compounds',
          grade: 'grade2',
          // its two questions (CUR-1): no emoji draws a starfish, so the
          // title lost it rather than the lesson gaining one
          title: 'Rainbow & Cupcake',
          description: 'Read colorful compound words.',
          icon: '🌈',
          difficulty: 2,
          starsToEarn: 3,
          questions: [
            {
              id: 'q-g2-bw-rainbow',
              type: 'read-and-match',
              prompt: 'Read this compound word!',
              speechPrompt: 'Read the two little words, then put them together. Which picture is it?',
              word: 'rainbow',
              hint: 'Colorful arc of light in the sky after rain!',
              options: [
                pictureChoice('rainbow', true),
                pictureChoice('rose', false),
                pictureChoice('cloud', false)
              ]
            },
            {
              id: 'q-g2-bw-cupcake',
              type: 'read-and-match',
              prompt: 'Read this compound word!',
              speechPrompt: 'Read the two little words, then put them together. Which picture is it?',
              word: 'cupcake',
              hint: 'A mini cake in a paper cup with yummy frosting!',
              options: [
                pictureChoice('cupcake', true),
                pictureChoice('donut', false),
                pictureChoice('cookie', false)
              ]
            },
            ...G2_MORE_ROUNDS['g2-bw-compounds']
          ]
        }
      ]
    },
    {
      id: 'g2-storybooks',
      name: 'Decodable Storybooks',
      icon: '📖',
      description: 'Read short stories on your own, then answer questions about them.',
      lessons: [
        {
          id: 'g2-story-luna-space',
          skillId: 'g2-storybooks',
          grade: 'grade2',
          title: 'Luna’s Rocket Adventure',
          description: 'Read about Ms. Luna flying past shiny stars and moons.',
          icon: '🚀',
          difficulty: 3,
          perPlay: 2,
          // 3, as every lesson, for its one story (CUR-1; it paid 5); PRG-1
          // makes every lesson's stars follow how it was played
          starsToEarn: 3,
          questions: [
            {
              id: 'q-g2-story-1',
              type: 'story-read',
              prompt: 'Read the story, then answer the question!',
              speechPrompt: 'Read the story yourself first, then answer my question. If you get stuck, I can help!',
              title: 'Luna’s Rocket Adventure',
              imageEmoji: '🚀',
              sentences: [
                { id: 's1', text: 'Ms. Luna hopped inside her shiny silver rocket ship.' },
                { id: 's2', text: '3, 2, 1... Blast off! The rocket zoomed into the starry night sky.' },
                { id: 's3', text: 'She visited a friendly glowing moon made of soft yellow cheese.' },
                { id: 's4', text: 'Luna waved to the sparkling stars before flying safely home.' }
              ],
              comprehensionQuestion: {
                question: 'Where did Ms. Luna zoom in her shiny rocket?',
                options: ['Up into space', 'Under the sea', 'To the store'],
                correctIndex: 0,
                explanation: 'Yes! The rocket zoomed into the starry night sky, way up in space!'
              }
            },
            ...G2_MORE_ROUNDS['g2-story-luna-space']
          ]
        }
      ]
    }
  ]
};

/** Skills that begin with the lessons added in CUR-4. */
const LATER_SKILLS: Omit<ReadingSkill, 'lessons'>[] = [
  { id: 'g1-rhymes', name: 'Rhyme Matcher', icon: '🎵', description: 'Match words that sound the same at the end!' },
  { id: 'g1-sight-words', name: 'Sight Word Power', icon: '⚡', description: 'Recognize common words instantly by sight.' },
  { id: 'g1-stories', name: 'Little Storybooks', icon: '📖', description: 'Read little stories on your own, then answer a question.' },
  { id: 'g2-sight-words', name: 'Sight Word Power', icon: '⚡', description: 'Recognize common words instantly by sight.' },
  { id: 'g2-r-vowels', name: 'Vowels with R', icon: '🚗', description: 'When R comes after a vowel, it changes the vowel’s sound.' }
];

/** Lessons on the path after a grade's first ones: a skill's lessons needn't sit together. */
function thenOn(grade: GradeLevel, lessons: Lesson[]): ReadingSkill[] {
  const skills = [...FIRST_LESSONS[grade], ...LATER_SKILLS];
  return lessons.map(lesson => {
    const skill = skills.find(s => s.id === lesson.skillId);
    if (!skill) throw new Error('Lesson "' + lesson.id + '" has no skill "' + lesson.skillId + '"');
    return { id: skill.id, name: skill.name, icon: skill.icon, description: skill.description, lessons: [lesson] };
  });
}

/**
 * Each grade's lessons, in the order they open: new letters, then words that
 * use them, with sight words and rhymes in between. A grade's first lessons
 * stay where they were, so an older save's progress still fits (CUR-4).
 */
export const READING_CURRICULUM: Record<GradeLevel, ReadingSkill[]> = {
  kindergarten: [
    ...FIRST_LESSONS.kindergarten,
    ...thenOn('kindergarten', [
      K_SOUNDS_2, K_HUNT_2, K_SHORT_A, K_SIGHT_2, K_SOUNDS_3, K_SHORT_I_O, K_HUNT_3, K_SIGHT_3, K_RHYME_2,
      K_SOUNDS_4, K_SHORT_E_U, K_SIGHT_4, K_SOUNDS_5
    ])
  ],
  grade1: [
    ...FIRST_LESSONS.grade1,
    ...thenOn('grade1', [
      G1_SH_CH, G1_SIGHT_1, G1_TH_WH, G1_L_BLENDS, G1_STORIES_1, G1_R_BLENDS, G1_SIGHT_2, G1_S_BLENDS, G1_SENTENCES_2,
      G1_MAGIC_A, G1_RHYMES, G1_MAGIC_I_O, G1_SIGHT_3, G1_SENTENCES_3, G1_STORIES_2
    ])
  ],
  grade2: [
    ...FIRST_LESSONS.grade2,
    ...thenOn('grade2', [
      G2_AI_AY, G2_SIGHT_1, G2_EE_EA, G2_STORIES_2, G2_OA_OW, G2_IGH, G2_SIGHT_2, G2_OO, G2_OU_OW, G2_STORIES_3,
      G2_AR, G2_OR, G2_SIGHT_3, G2_ER_IR_UR, G2_COMPOUNDS_2
    ])
  ]
};
