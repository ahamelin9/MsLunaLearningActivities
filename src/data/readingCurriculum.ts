import type { GradeInfo, GradeLevel, ReadingSkill } from '../types/reading';

export const GRADES: GradeInfo[] = [
  {
    id: 'kindergarten',
    title: 'Kindergarten',
    subtitle: 'Letter Sounds & Early Reading',
    description: 'Match letter sounds (like mmmm and ssss), hunt for letters, blend 3-letter words, and explore rhymes!',
    ageRange: 'Ages 4–6',
    badgeEmoji: '🔤',
    color: '#FF6B6B',
    gradient: 'linear-gradient(135deg, #FF6B6B 0%, #FFA07A 100%)'
  },
  {
    id: 'grade1',
    title: '1st Grade',
    subtitle: 'Digraphs, Magic E & Sentences',
    description: 'Master digraphs (sh, ch, th), magic Silent E words, read complete sentences, and enjoy decodable stories!',
    ageRange: 'Ages 6–7',
    badgeEmoji: '🚀',
    color: '#4D96FF',
    gradient: 'linear-gradient(135deg, #4D96FF 0%, #6BCB77 100%)'
  },
  {
    id: 'grade2',
    title: '2nd Grade',
    subtitle: 'Vowel Teams & Story Readers',
    description: 'Learn vowel teams (ai, ea, oa, igh), compound words, read delightful chapter stories, and answer comprehension questions!',
    ageRange: 'Ages 7–8',
    badgeEmoji: '👑',
    color: '#9D4EDD',
    gradient: 'linear-gradient(135deg, #9D4EDD 0%, #FF70A6 100%)'
  }
];

export const READING_CURRICULUM: Record<GradeLevel, ReadingSkill[]> = {
  kindergarten: [
    {
      id: 'k-match-sounds',
      name: 'Match the Sound',
      icon: '👂',
      color: '#A855F7',
      description: 'Listen to the sound! Which letter makes the /mmmm/ or /ssss/ sound?',
      lessons: [
        {
          id: 'k-ms-m-s-b-t',
          skillId: 'k-match-sounds',
          grade: 'kindergarten',
          title: 'Sounds for M, S, B & T',
          description: 'Listen to the letter sounds and find the matching letter.',
          icon: '🎵',
          difficulty: 1,
          starsToEarn: 3,
          questions: [
            {
              id: 'q-k-snd-m',
              type: 'sound-to-letter',
              prompt: 'What letter makes the /mmmm/ sound?',
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
              prompt: 'What letter makes the /ssss/ sound?',
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
              prompt: 'What letter makes the /buh/ sound?',
              speechPrompt: 'What letter makes the buh sound like bear?',
              targetLetter: 'B',
              targetSoundSpoken: 'buh',
              targetSoundName: '/b/',
              hint: 'Buh buh bear and ball!',
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
              prompt: 'What letter makes the /tuh/ sound?',
              speechPrompt: 'What letter makes the tuh sound like turtle?',
              targetLetter: 'T',
              targetSoundSpoken: 'tuh',
              targetSoundName: '/t/',
              hint: 'Tuh tuh tiger and turtle!',
              options: [
                { id: 'opt-f', letter: 'F', isCorrect: false },
                { id: 'opt-t', letter: 'T', isCorrect: true },
                { id: 'opt-l', letter: 'L', isCorrect: false },
                { id: 'opt-m', letter: 'M', isCorrect: false }
              ]
            }
          ]
        }
      ]
    },
    {
      id: 'k-letter-hunter',
      name: 'Letter Hunter',
      icon: '🔍',
      color: '#3B82F6',
      description: 'Look for the letter! Practice spotting uppercase and lowercase letters.',
      lessons: [
        {
          id: 'k-lh-easy',
          skillId: 'k-letter-hunter',
          grade: 'kindergarten',
          title: 'Find A, M, S & B',
          description: 'Hunt and spot the matching letter card.',
          icon: '🔎',
          difficulty: 1,
          starsToEarn: 3,
          questions: [
            {
              id: 'q-k-lh-a',
              type: 'find-letter',
              prompt: 'Look for the letter: A',
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
              prompt: 'Look for the letter: M',
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
              prompt: 'Look for the letter: S',
              speechPrompt: 'Look for the curvy letter S!',
              targetLetter: 'S',
              hint: 'Letter S curves like a snake!',
              options: [
                { id: 'opt-c', letter: 'C', isCorrect: false },
                { id: 'opt-z', letter: 'Z', isCorrect: false },
                { id: 'opt-s', letter: 'S', isCorrect: true },
                { id: 'opt-g', letter: 'G', isCorrect: false }
              ]
            }
          ]
        }
      ]
    },
    {
      id: 'k-blend-words',
      name: 'Blend & Read CVC Words',
      icon: '🧩',
      color: '#FF70A6',
      description: 'Tap each letter sound, blend them together, and find the matching picture!',
      lessons: [
        {
          id: 'k-bw-animals',
          skillId: 'k-blend-words',
          grade: 'kindergarten',
          title: 'Pet & Animal Words',
          description: 'Sound out and read cat, pig, and dog!',
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
                { text: 'c', soundLabel: '/k/', spokenSound: 'c' },
                { text: 'a', soundLabel: '/æ/', spokenSound: 'a' },
                { text: 't', soundLabel: '/t/', spokenSound: 't' }
              ],
              hint: 'It’s a furry pet that purrs!',
              options: [
                { id: 'opt-cat', text: 'Cat', imageEmoji: '🐱', isCorrect: true },
                { id: 'opt-sun', text: 'Sun', imageEmoji: '☀️', isCorrect: false },
                { id: 'opt-pig', text: 'Pig', imageEmoji: '🐷', isCorrect: false }
              ]
            },
            {
              id: 'q-k-bw-pig',
              type: 'blend-and-read',
              prompt: 'Blend the sounds to read the word!',
              speechPrompt: 'Sound out P... I... G! What word does it make?',
              word: 'pig',
              phonemes: [
                { text: 'p', soundLabel: '/p/', spokenSound: 'p' },
                { text: 'i', soundLabel: '/ɪ/', spokenSound: 'i' },
                { text: 'g', soundLabel: '/ɡ/', spokenSound: 'g' }
              ],
              hint: 'An oinking farm friend!',
              options: [
                { id: 'opt-bed', text: 'Bed', imageEmoji: '🛏️', isCorrect: false },
                { id: 'opt-pig', text: 'Pig', imageEmoji: '🐷', isCorrect: true },
                { id: 'opt-dog', text: 'Dog', imageEmoji: '🐶', isCorrect: false }
              ]
            },
            {
              id: 'q-k-bw-dog',
              type: 'blend-and-read',
              prompt: 'Blend the sounds to read the word!',
              speechPrompt: 'Sound out D... O... G! Which picture matches?',
              word: 'dog',
              phonemes: [
                { text: 'd', soundLabel: '/d/', spokenSound: 'd' },
                { text: 'o', soundLabel: '/ɒ/', spokenSound: 'o' },
                { text: 'g', soundLabel: '/ɡ/', spokenSound: 'g' }
              ],
              hint: 'A puppy that barks woof!',
              options: [
                { id: 'opt-dog', text: 'Dog', imageEmoji: '🐶', isCorrect: true },
                { id: 'opt-fox', text: 'Fox', imageEmoji: '🦊', isCorrect: false },
                { id: 'opt-cup', text: 'Cup', imageEmoji: '🥤', isCorrect: false }
              ]
            }
          ]
        },
        {
          id: 'k-bw-everyday',
          skillId: 'k-blend-words',
          grade: 'kindergarten',
          title: 'Everyday Words (Sun, Bed, Cup)',
          description: 'Read and blend common everyday objects.',
          icon: '☀️',
          difficulty: 1,
          starsToEarn: 3,
          questions: [
            {
              id: 'q-k-bw-sun',
              type: 'blend-and-read',
              prompt: 'Blend the sounds to read the word!',
              speechPrompt: 'Sound out S... U... N! What shines in the sky?',
              word: 'sun',
              phonemes: [
                { text: 's', soundLabel: '/s/', spokenSound: 's' },
                { text: 'u', soundLabel: '/ʌ/', spokenSound: 'u' },
                { text: 'n', soundLabel: '/n/', spokenSound: 'n' }
              ],
              hint: 'It shines warm and bright up in the sky!',
              options: [
                { id: 'opt-sun', text: 'Sun', imageEmoji: '☀️', isCorrect: true },
                { id: 'opt-moon', text: 'Moon', imageEmoji: '🌙', isCorrect: false },
                { id: 'opt-hat', text: 'Hat', imageEmoji: '🎩', isCorrect: false }
              ]
            },
            {
              id: 'q-k-bw-bed',
              type: 'blend-and-read',
              prompt: 'Blend the sounds to read the word!',
              speechPrompt: 'Sound out B... E... D! Where do we sleep?',
              word: 'bed',
              phonemes: [
                { text: 'b', soundLabel: '/b/', spokenSound: 'b' },
                { text: 'e', soundLabel: '/ɛ/', spokenSound: 'e' },
                { text: 'd', soundLabel: '/d/', spokenSound: 'd' }
              ],
              hint: 'Where you sleep with a cozy pillow!',
              options: [
                { id: 'opt-bed', text: 'Bed', imageEmoji: '🛏️', isCorrect: true },
                { id: 'opt-car', text: 'Car', imageEmoji: '🚗', isCorrect: false },
                { id: 'opt-cup', text: 'Cup', imageEmoji: '🥤', isCorrect: false }
              ]
            },
            {
              id: 'q-k-bw-cup',
              type: 'blend-and-read',
              prompt: 'Blend the sounds to read the word!',
              speechPrompt: 'Sound out C... U... P! What do you drink from?',
              word: 'cup',
              phonemes: [
                { text: 'c', soundLabel: '/k/', spokenSound: 'c' },
                { text: 'u', soundLabel: '/ʌ/', spokenSound: 'u' },
                { text: 'p', soundLabel: '/p/', spokenSound: 'p' }
              ],
              hint: 'Used to drink warm milk or cold juice!',
              options: [
                { id: 'opt-cup', text: 'Cup', imageEmoji: '🥤', isCorrect: true },
                { id: 'opt-apple', text: 'Apple', imageEmoji: '🍎', isCorrect: false },
                { id: 'opt-box', text: 'Box', imageEmoji: '📦', isCorrect: false }
              ]
            }
          ]
        }
      ]
    },
    {
      id: 'k-sight-words',
      name: 'Sight Word Power',
      icon: '⚡',
      color: '#FFD166',
      description: 'Recognize high-frequency words instantly by sight: see, the, can, big, and like!',
      lessons: [
        {
          id: 'k-sw-starter',
          skillId: 'k-sight-words',
          grade: 'kindergarten',
          title: 'Starter Sight Words',
          description: 'Read the high-frequency sight words: SEE, BIG, and CAN.',
          icon: '👀',
          difficulty: 1,
          starsToEarn: 3,
          questions: [
            {
              id: 'q-k-sw-see',
              type: 'sight-word-reader',
              prompt: 'Read this sight word: SEE',
              speechPrompt: 'Read the sight word SEE: "I see a smiling star!"',
              word: 'see',
              exampleSentence: 'I see a smiling star! ⭐',
              hint: 'S - E - E spells see with your eyes!',
              options: [
                { id: 'opt-see', word: 'see', isCorrect: true },
                { id: 'opt-sun', word: 'sun', isCorrect: false },
                { id: 'opt-she', word: 'she', isCorrect: false }
              ]
            },
            {
              id: 'q-k-sw-big',
              type: 'sight-word-reader',
              prompt: 'Read this sight word: BIG',
              speechPrompt: 'Read the sight word BIG: "The elephant is big!"',
              word: 'big',
              exampleSentence: 'The elephant is very big! 🐘',
              hint: 'B - I - G spells big!',
              options: [
                { id: 'opt-bag', word: 'bag', isCorrect: false },
                { id: 'opt-big', word: 'big', isCorrect: true },
                { id: 'opt-bug', word: 'bug', isCorrect: false }
              ]
            },
            {
              id: 'q-k-sw-can',
              type: 'sight-word-reader',
              prompt: 'Read this sight word: CAN',
              speechPrompt: 'Read the sight word CAN: "I can read books!"',
              word: 'can',
              exampleSentence: 'I can read books! 📚',
              hint: 'C - A - N spells can!',
              options: [
                { id: 'opt-cat', word: 'cat', isCorrect: false },
                { id: 'opt-car', word: 'car', isCorrect: false },
                { id: 'opt-can', word: 'can', isCorrect: true }
              ]
            }
          ]
        }
      ]
    },
    {
      id: 'k-rhyming',
      name: 'Rhyme Matcher',
      icon: '🎵',
      color: '#06D6A0',
      description: 'Match words that sound the same at the end!',
      lessons: [
        {
          id: 'k-rh-pairs',
          skillId: 'k-rhyming',
          grade: 'kindergarten',
          title: 'Rhyme Matcher',
          description: 'Find rhyming words for cat, sun, and fox.',
          icon: '🎩',
          difficulty: 1,
          starsToEarn: 3,
          questions: [
            {
              id: 'q-k-rh-cat',
              type: 'rhyme-match',
              prompt: 'Which word rhymes with CAT?',
              speechPrompt: 'Cat! Which word sounds like cat? Hat or Bed?',
              targetWord: 'CAT',
              targetEmoji: '🐱',
              hint: 'C-AT and H-AT end with the same AT sound!',
              options: [
                { word: 'HAT', emoji: '🎩', isRhyme: true },
                { word: 'DOG', emoji: '🐶', isRhyme: false },
                { word: 'SUN', emoji: '☀️', isRhyme: false }
              ]
            },
            {
              id: 'q-k-rh-sun',
              type: 'rhyme-match',
              prompt: 'Which word rhymes with SUN?',
              speechPrompt: 'Sun! Which word rhymes with sun? Run or Frog?',
              targetWord: 'SUN',
              targetEmoji: '☀️',
              hint: 'S-UN and R-UN both end with UN!',
              options: [
                { word: 'RUN', emoji: '🏃', isRhyme: true },
                { word: 'PIG', emoji: '🐷', isRhyme: false },
                { word: 'CAR', emoji: '🚗', isRhyme: false }
              ]
            },
            {
              id: 'q-k-rh-fox',
              type: 'rhyme-match',
              prompt: 'Which word rhymes with FOX?',
              speechPrompt: 'Fox! What rhymes with fox? Box or Tree?',
              targetWord: 'FOX',
              targetEmoji: '🦊',
              hint: 'F-OX and B-OX have the OX sound!',
              options: [
                { word: 'BOX', emoji: '📦', isRhyme: true },
                { word: 'BALL', emoji: '⚽', isRhyme: false },
                { word: 'BIRD', emoji: '🐦', isRhyme: false }
              ]
            }
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
      color: '#4D96FF',
      description: 'Decode 2-letter teams like SH, CH, TH, and blends like FR and ST!',
      lessons: [
        {
          id: 'g1-ph-digraphs',
          skillId: 'g1-digraphs',
          grade: 'grade1',
          title: 'Ship, Frog & Star',
          description: 'Sound out and decode ship, frog, and star!',
          icon: '🚢',
          difficulty: 1,
          starsToEarn: 3,
          questions: [
            {
              id: 'q-g1-ph-ship',
              type: 'blend-and-read',
              prompt: 'Blend the sounds to read the digraph word!',
              speechPrompt: 'S and H team up to make /sh/. Blend: sh... i... p!',
              word: 'ship',
              phonemes: [
                { text: 'sh', soundLabel: '/ʃ/', spokenSound: 'sh' },
                { text: 'i', soundLabel: '/ɪ/', spokenSound: 'i' },
                { text: 'p', soundLabel: '/p/', spokenSound: 'p' }
              ],
              hint: 'A large boat that sails on the ocean!',
              options: [
                { id: 'opt-ship', text: 'Ship', imageEmoji: '🚢', isCorrect: true },
                { id: 'opt-car', text: 'Car', imageEmoji: '🚗', isCorrect: false },
                { id: 'opt-plane', text: 'Plane', imageEmoji: '✈️', isCorrect: false }
              ]
            },
            {
              id: 'q-g1-ph-frog',
              type: 'blend-and-read',
              prompt: 'Blend the sounds to read the blend word!',
              speechPrompt: 'F and R blend into /fr/. Blend: fr... o... g!',
              word: 'frog',
              phonemes: [
                { text: 'fr', soundLabel: '/fr/', spokenSound: 'fr' },
                { text: 'o', soundLabel: '/ɒ/', spokenSound: 'o' },
                { text: 'g', soundLabel: '/ɡ/', spokenSound: 'g' }
              ],
              hint: 'A green hopper that ribbits near the pond!',
              options: [
                { id: 'opt-frog', text: 'Frog', imageEmoji: '🐸', isCorrect: true },
                { id: 'opt-duck', text: 'Duck', imageEmoji: '🦆', isCorrect: false },
                { id: 'opt-fish', text: 'Fish', imageEmoji: '🐟', isCorrect: false }
              ]
            },
            {
              id: 'q-g1-ph-star',
              type: 'blend-and-read',
              prompt: 'Blend the sounds to read the blend word!',
              speechPrompt: 'S and T blend into /st/. Blend: st... ar!',
              word: 'star',
              phonemes: [
                { text: 'st', soundLabel: '/st/', spokenSound: 'st' },
                { text: 'ar', soundLabel: '/ɑːr/', spokenSound: 'ar' }
              ],
              hint: 'It shines gold in the night sky!',
              options: [
                { id: 'opt-star', text: 'Star', imageEmoji: '⭐', isCorrect: true },
                { id: 'opt-cloud', text: 'Cloud', imageEmoji: '☁️', isCorrect: false },
                { id: 'opt-sun', text: 'Sun', imageEmoji: '☀️', isCorrect: false }
              ]
            }
          ]
        }
      ]
    },
    {
      id: 'g1-magic-e',
      name: 'Magic Silent E Readers',
      icon: '🪄',
      color: '#9D4EDD',
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
              prompt: 'Read this Magic E word: CAKE',
              speechPrompt: 'Read the word CAKE! The silent E makes the A say its name.',
              word: 'cake',
              phonemes: ['/k/', '/eɪ/', '/k/'],
              hint: 'A sweet birthday treat with frosting and candles!',
              options: [
                { id: 'opt-cake', text: 'Cake', imageEmoji: '🎂', isCorrect: true },
                { id: 'opt-cup', text: 'Cup', imageEmoji: '🥤', isCorrect: false },
                { id: 'opt-cookie', text: 'Cookie', imageEmoji: '🍪', isCorrect: false }
              ]
            },
            {
              id: 'q-g1-bw-kite',
              type: 'read-and-match',
              prompt: 'Read this Magic E word: KITE',
              speechPrompt: 'Read the word KITE! The magic E makes I say /aɪ/.',
              word: 'kite',
              phonemes: ['/k/', '/aɪ/', '/t/'],
              hint: 'Flies high in the wind on a string!',
              options: [
                { id: 'opt-kite', text: 'Kite', imageEmoji: '🪁', isCorrect: true },
                { id: 'opt-balloon', text: 'Balloon', imageEmoji: '🎈', isCorrect: false },
                { id: 'opt-plane', text: 'Plane', imageEmoji: '✈️', isCorrect: false }
              ]
            },
            {
              id: 'q-g1-bw-bone',
              type: 'read-and-match',
              prompt: 'Read this Magic E word: BONE',
              speechPrompt: 'Read the word BONE! The magic E makes O say /oʊ/.',
              word: 'bone',
              phonemes: ['/b/', '/oʊ/', '/n/'],
              hint: 'A puppy’s favorite chew toy!',
              options: [
                { id: 'opt-bone', text: 'Bone', imageEmoji: '🦴', isCorrect: true },
                { id: 'opt-ball', text: 'Ball', imageEmoji: '⚽', isCorrect: false },
                { id: 'opt-bowl', text: 'Bowl', imageEmoji: '🥣', isCorrect: false }
              ]
            }
          ]
        }
      ]
    },
    {
      id: 'g1-sentences',
      name: 'Read Sentences & Match',
      icon: '📖',
      color: '#06D6A0',
      description: 'Read full sentences and pick the picture that matches what you read!',
      lessons: [
        {
          id: 'g1-rs-happy-pets',
          skillId: 'g1-sentences',
          grade: 'grade1',
          title: 'Animal Action Sentences',
          description: 'Read sentences about hopping frogs and playful cats.',
          icon: '🐾',
          difficulty: 2,
          starsToEarn: 3,
          questions: [
            {
              id: 'q-g1-rs-frog',
              type: 'sentence-comprehension',
              prompt: 'Read the sentence and find the matching picture!',
              speechPrompt: 'Read: "The green frog jumps high." Which picture shows this?',
              sentence: 'The green frog jumps high.',
              hint: 'Look for the green frog jumping!',
              options: [
                { id: 'opt-frog', text: 'Green frog hopping', imageEmoji: '🐸', isCorrect: true },
                { id: 'opt-cat', text: 'Sleeping cat', imageEmoji: '🐱', isCorrect: false },
                { id: 'opt-bird', text: 'Flying bird', imageEmoji: '🐦', isCorrect: false }
              ]
            },
            {
              id: 'q-g1-rs-cat',
              type: 'sentence-comprehension',
              prompt: 'Read the sentence and find the matching picture!',
              speechPrompt: 'Read: "A cute cat plays with yellow yarn." Which picture matches?',
              sentence: 'A cute cat plays with yellow yarn.',
              hint: 'Look for the playful cat with yarn!',
              options: [
                { id: 'opt-cat', text: 'Playful cat with yarn', imageEmoji: '🐱', isCorrect: true },
                { id: 'opt-dog', text: 'Dog with a bone', imageEmoji: '🐶', isCorrect: false },
                { id: 'opt-bear', text: 'Bear sleeping in cave', imageEmoji: '🐻', isCorrect: false }
              ]
            }
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
      color: '#FF70A6',
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
              prompt: 'Read this vowel team word: TRAIN',
              speechPrompt: 'Read TRAIN! A and I work together to make the /eɪ/ sound.',
              word: 'train',
              phonemes: ['/t/', '/r/', '/eɪ/', '/n/'],
              hint: 'Rides on railroad tracks and goes choo-choo!',
              options: [
                { id: 'opt-train', text: 'Train', imageEmoji: '🚆', isCorrect: true },
                { id: 'opt-truck', text: 'Truck', imageEmoji: '🚚', isCorrect: false },
                { id: 'opt-boat', text: 'Boat', imageEmoji: '⛵', isCorrect: false }
              ]
            },
            {
              id: 'q-g2-wp-boat',
              type: 'read-and-match',
              prompt: 'Read this vowel team word: BOAT',
              speechPrompt: 'Read BOAT! O and A work together to make the long /oʊ/ sound.',
              word: 'boat',
              phonemes: ['/b/', '/oʊ/', '/t/'],
              hint: 'Floats on blue water with a sail!',
              options: [
                { id: 'opt-boat', text: 'Boat', imageEmoji: '⛵', isCorrect: true },
                { id: 'opt-car', text: 'Car', imageEmoji: '🚗', isCorrect: false },
                { id: 'opt-plane', text: 'Plane', imageEmoji: '✈️', isCorrect: false }
              ]
            },
            {
              id: 'q-g2-wp-beach',
              type: 'read-and-match',
              prompt: 'Read this vowel team word: BEACH',
              speechPrompt: 'Read BEACH! E and A make the long /iː/ sound in beach.',
              word: 'beach',
              phonemes: ['/b/', '/iː/', '/tʃ/'],
              hint: 'Sandy place where ocean waves splash under the sun!',
              options: [
                { id: 'opt-beach', text: 'Beach', imageEmoji: '🏖️', isCorrect: true },
                { id: 'opt-forest', text: 'Forest', imageEmoji: '🌲', isCorrect: false },
                { id: 'opt-city', text: 'City', imageEmoji: '🏙️', isCorrect: false }
              ]
            }
          ]
        }
      ]
    },
    {
      id: 'g2-compounds',
      name: 'Compound Word Readers',
      icon: '🧩',
      color: '#118AB2',
      description: 'Read two smaller words joined together into one big exciting word!',
      lessons: [
        {
          id: 'g2-bw-compounds',
          skillId: 'g2-compounds',
          grade: 'grade2',
          title: 'Rainbow, Cupcake & Starfish',
          description: 'Read colorful compound words.',
          icon: '🌈',
          difficulty: 2,
          starsToEarn: 3,
          questions: [
            {
              id: 'q-g2-bw-rainbow',
              type: 'read-and-match',
              prompt: 'Read this compound word: RAINBOW',
              speechPrompt: 'Read RAIN + BOW = RAINBOW! Colorful arch in the sky after rain.',
              word: 'rainbow',
              hint: 'Colorful arc of light in the sky after rain!',
              options: [
                { id: 'opt-rainbow', text: 'Rainbow', imageEmoji: '🌈', isCorrect: true },
                { id: 'opt-umbrella', text: 'Umbrella', imageEmoji: '☂️', isCorrect: false },
                { id: 'opt-cloud', text: 'Cloud', imageEmoji: '☁️', isCorrect: false }
              ]
            },
            {
              id: 'q-g2-bw-cupcake',
              type: 'read-and-match',
              prompt: 'Read this compound word: CUPCAKE',
              speechPrompt: 'Read CUP + CAKE = CUPCAKE! A delicious little cake.',
              word: 'cupcake',
              hint: 'A mini cake in a paper cup with yummy frosting!',
              options: [
                { id: 'opt-cupcake', text: 'Cupcake', imageEmoji: '🧁', isCorrect: true },
                { id: 'opt-donut', text: 'Donut', imageEmoji: '🍩', isCorrect: false },
                { id: 'opt-icecream', text: 'Ice Cream', imageEmoji: '🍦', isCorrect: false }
              ]
            }
          ]
        }
      ]
    },
    {
      id: 'g2-storybooks',
      name: 'Decodable Storybooks',
      icon: '📖',
      color: '#9D4EDD',
      description: 'Read engaging illustrated stories, tap any word to hear it, and answer questions!',
      lessons: [
        {
          id: 'g2-story-luna-space',
          skillId: 'g2-storybooks',
          grade: 'grade2',
          title: 'Luna’s Rocket Adventure',
          description: 'Read about Ms. Luna flying past shiny stars and moons.',
          icon: '🚀',
          difficulty: 3,
          starsToEarn: 5,
          questions: [
            {
              id: 'q-g2-story-1',
              type: 'story-read',
              prompt: 'Read along with Ms. Luna and answer the question!',
              speechPrompt: 'Let’s read the story together! Click on any sentence to hear it read aloud.',
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
                options: [
                  'Into the starry night sky',
                  'Under the deep blue ocean',
                  'To the grocery store'
                ],
                correctIndex: 0,
                explanation: 'Yes! The story says the rocket zoomed into the starry night sky!'
              }
            }
          ]
        }
      ]
    }
  ]
};
