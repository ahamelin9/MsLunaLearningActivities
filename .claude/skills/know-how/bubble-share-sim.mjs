#!/usr/bin/env node
// Bubble Sounds' answer share (GAME-7): what share of the bubbles in the water
// are the answer, at each tier, under the spawn rule in
// games/BubbleSounds/BubbleSounds.tsx:
//   - one bubble comes in every crossing ÷ lanes, the answer or not dealt from
//     a shuffled bag (ANSWER_BAG: so many answers in so many bubbles);
//   - whenever no answer is left on screen, the next bubble is the answer, at
//     once if it isn't time for one, outside that rhythm, so popping fast
//     never turns every bubble into the answer;
//   - they cross in the same time.
//
//   node .claude/skills/know-how/bubble-share-sim.mjs            # check
//   node .claude/skills/know-how/bubble-share-sim.mjs --before   # the rule before GAME-7: fails
//   node .claude/skills/know-how/bubble-share-sim.mjs --chance   # a coin flip instead of the bag: fails
//
// It simulates two hours of water per tier for a child who never pops, and one
// who pops each answer about 2.5 s after it appears, and checks:
//   - nobody popping, the answer's share of the bubbles on screen is within
//     4 points of the tier's aim (AIM);
//   - popping never pushes it more than 4 points over the aim;
//   - no 20 s stretch (a short play) is more than 12 points over the aim;
//   - an answer is on screen at every moment.
// Keep ANSWER_BAG in step with the game.

const AIM = { 1: 1 / 3, 2: 1 / 4, 3: 1 / 5 };
const ANSWER_BAG = { 1: { answers: 2, of: 7 }, 2: { answers: 1, of: 6 }, 3: { answers: 1, of: 10 } };
// the water has 6 lanes at all four iPad sizes (2026-10-18); a bubble takes
// about these many seconds to rise through it, by tier (round.speed)
const LANES = 6;
const CROSS = { 1: 8.5, 2: 6.3, 3: 5 };
const STEP = 0.05;
const STRETCH = 20;
const rule = process.argv.includes('--before') ? 'before' : process.argv.includes('--chance') ? 'chance' : 'bag';

function simulate(tier, popAfter, seed0 = 20261018) {
  let seed = seed0;
  const rand = () => ((seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296);
  const { answers: k, of: n } = ANSWER_BAG[tier];
  let bag = [];
  const deal = () => {
    if (rule === 'chance') return rand() < k / n;
    if (!bag.length) {
      bag = Array.from({ length: n }, (_, i) => i < k);
      for (let i = n - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [bag[i], bag[j]] = [bag[j], bag[i]]; }
    }
    return bag.pop();
  };
  const gap = CROSS[tier] / LANES;
  let water = [], due = 0, onScreen = 0, answers = 0, empty = 0;
  let stretchOn = 0, stretchAnswers = 0, stretchStart = 0, worst = 0;
  for (let t = 0; t < 7200; t += STEP) {
    water = water.filter(b => t - b.born < CROSS[tier] && !(b.answer && popAfter && t - b.born >= popAfter));
    const none = !water.some(b => b.answer);
    if (rule === 'before') {
      // before GAME-7: 38% at every tier, and the answer whenever fewer than two
      if (t >= due) {
        water.push({ born: t, answer: water.filter(b => b.answer).length < 2 || rand() < 0.38 });
        due = t + gap;
      }
    } else if (t >= due) {
      // as in the game: one bubble a frame, and with no answer left it is the answer
      water.push({ born: t, answer: none || deal() });
      due = t + gap;
    } else if (none) water.push({ born: t, answer: true });
    const a = water.filter(b => b.answer).length;
    onScreen += water.length; answers += a;
    stretchOn += water.length; stretchAnswers += a;
    if (!a) empty += 1;
    if (t - stretchStart >= STRETCH) {
      worst = Math.max(worst, stretchAnswers / stretchOn);
      stretchOn = stretchAnswers = 0;
      stretchStart = t;
    }
  }
  return { share: answers / onScreen, worst, empty };
}

const pct = x => `${Math.round(x * 100)}%`;
let failed = false;
for (const tier of [1, 2, 3]) {
  const aim = AIM[tier];
  const still = simulate(tier, 0);
  const popping = simulate(tier, 2.5);
  const checks = [
    [Math.abs(still.share - aim) <= 0.04, `nobody popping, ${pct(still.share)} of the bubbles on screen are the answer`],
    [popping.share <= aim + 0.04, `popping each answer after 2.5 s, ${pct(popping.share)}`],
    [Math.max(still.worst, popping.worst) <= aim + 0.12, `the most in any ${STRETCH} s stretch, ${pct(Math.max(still.worst, popping.worst))}`],
    [!still.empty && !popping.empty, `${still.empty + popping.empty} moments with no answer on screen`]
  ];
  for (const [pass, line] of checks) {
    if (!pass) failed = true;
    console.log(`${pass ? '✅' : '❌'} tier ${tier} (aim ${pct(aim)}): ${line}`);
  }
}
if (rule === 'bag') console.log('(before GAME-7 the answer was about half at every tier: --before)');
process.exit(failed ? 1 : 0);
