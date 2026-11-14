#!/usr/bin/env node
// What does Luna say to a miss in What's Missing? (BUG-33)
//
//   node .claude/skills/know-how/missing-lines-check.mjs [port=5199]
//
// Needs Vite on the port. A wrong choice is never on the desk (distractors.ts,
// "on screen"), so nothing Luna says to a miss may tell the child it is.
//   - her own lines for the game (engine/luna.ts): the first miss's says the
//     word was not on her desk, and none says "still on the desk". She picks a
//     first-miss line at random from these and the general ones, so they're
//     read from the bank, not waited for in a play;
//   - in play, at Kindergarten (no countdown to make a miss of its own), for
//     three rounds: it notes the desk while it's looked at, taps the two
//     choices that weren't on it, and hears the second miss's spoken clue
//     (the shell's speakSequence): "<word> was not on my desk…". Nothing she
//     says in those rounds may say "still on the desk".
// It fails on the code before BUG-33, where both lines did.

import puppeteer from 'puppeteer-core';
import { chromePath } from '../../../scripts/chrome-path.cjs';

const port = process.argv.find(a => /^\d{4,}$/.test(a)) ?? '5199';
const at = n => `[data-shot="${n}"]`;
const wait = ms => new Promise(r => setTimeout(r, ms));
const results = [];
const ok = (name, pass, detail = '') => {
  results.push(pass);
  console.log(`${pass ? '✅' : '❌'} ${name}${detail !== '' ? `  (${detail})` : ''}`);
};
async function until(fn, ms = 8000) {
  for (let t = 0; t < ms; t += 100) {
    if (await fn()) return true;
    await wait(100);
  }
  return false;
}
const STILL = /still on (the|my) desk/i;

const browser = await puppeteer.launch({ executablePath: chromePath(), headless: true, args: ['--mute-audio'] });
const page = await browser.newPage();
await page.setViewport({ width: 1180, height: 820 });
const errors = [];
page.on('pageerror', e => errors.push(e.message));
await page.evaluateOnNewDocument(() => (window.speechSynthesis.speak = () => {}));
await page.goto(`http://localhost:${port}/`, { waitUntil: 'networkidle0' });
await page.evaluate(() => localStorage.clear());
await page.reload({ waitUntil: 'networkidle0' });

// ---- her lines for the game, from the bank ----
const lines = await page.evaluate(async () => {
  const { PER_GAME } = await import('/src/apps/reading/engine/luna.ts');
  return Object.fromEntries(Object.entries(PER_GAME['whats-missing'] ?? {}).map(([kind, ls]) => [kind, ls.map(l => l.text)]));
});
const all = Object.values(lines).flat();
ok(
  'her first-miss line for the game says it was not on her desk',
  (lines.missFirst ?? []).some(l => /was not on my desk/.test(l)),
  (lines.missFirst ?? []).join(' · ')
);
ok('none of her lines for the game says "still on the desk"', all.length > 0 && !all.some(l => STILL.test(l)), all.filter(l => STILL.test(l)).join(' · '));

// ---- in play: the clue after a second miss ----
// every sequence Luna says, as text: her line and the clue come in one
await page.evaluate(async () => {
  const src = performance.getEntriesByType('resource').map(e => e.name).find(n => n.includes('/src/utils/pronunciation.ts')) ?? '/src/utils/pronunciation.ts';
  const { pronunciation } = await import(src);
  window.__said = [];
  const seq = pronunciation.speakSequence.bind(pronunciation);
  pronunciation.speakSequence = (parts, opts) => {
    window.__said.push(parts.map(p => p.text ?? p.word ?? p.name ?? `/${p.sound}/`).join(' '));
    return seq(parts, opts);
  };
  const { soundManager } = await import('/src/utils/audio.ts');
  const speak = soundManager.speak.bind(soundManager);
  soundManager.speak = (text, ...rest) => {
    window.__said.push(String(text));
    return speak(text, ...rest);
  };
});
await page.click(at('open-reading'));
await page.waitForSelector(at('grade-card'));
await (await page.$$(at('grade-card')))[0].click();
await page.waitForSelector(at('hub'));
await wait(400);
for (const t of await page.$$(at('game-tile'))) {
  if ((await t.evaluate(e => e.textContent)).includes('What')) {
    await t.evaluate(e => e.scrollIntoView({ block: 'center' }));
    await t.click();
    break;
  }
}
await page.waitForSelector(at('play'));
await page.click(at('play'));
await page.waitForSelector(at('stage'));

const talking = () => page.$('[data-mood][data-state="talking"]').then(Boolean);
const quiet = () => until(async () => !(await talking()), 10000);
const looking = () => page.evaluate(() => document.body.innerText.includes('Memorize'));
const flash = () => page.$eval(at('stage'), e => e.getAttribute('data-flash')).catch(() => null);
const choices = () => page.$$eval(`${at('stage')} button[data-kind]`, bs => bs.map(b => b.getAttribute('aria-label')));
const tap = label => page.$$eval(`${at('stage')} button[data-kind]`, (bs, l) => bs.find(b => b.getAttribute('aria-label') === l)?.click(), label);
/** Taps until the stage flashes as it should (a tap while an answer is said is ignored). */
async function tapFor(label, want) {
  for (let i = 0; i < 6; i++) {
    await quiet();
    await wait(400);
    await tap(label);
    if (await until(async () => (await flash()) === want, 1500)) return true;
  }
  return false;
}

const clues = [];
for (let round = 0; round < 3; round++) {
  // the whole desk, while it's looked at
  if (!(await until(looking, 20000))) break;
  await wait(300);
  const desk = await page.$$eval(`${at('stage')} [title]`, es => es.map(e => e.getAttribute('title')));
  await page.waitForSelector(`${at('stage')} button[data-kind]`, { timeout: 15000 });
  const shown = await choices();
  const wrong = shown.filter(c => !desk.includes(c));
  const answer = shown.filter(c => desk.includes(c));
  if (wrong.length !== 2 || answer.length !== 1) {
    clues.push([round + 1, '', [`desk ${desk.join(', ')}; choices ${shown.join(', ')}`]]);
    break;
  }
  await page.evaluate(() => (window.__said = []));
  const first = await tapFor(wrong[0], 'miss');
  const second = first && (await tapFor(wrong[1], 'miss'));
  await quiet();
  const said = await page.evaluate(() => window.__said);
  clues.push([wrong[1], second ? (said.find(s => s.includes(`${wrong[1]} `) && /desk|there any more|take away/.test(s)) ?? '') : 'the tap missed', said]);
  await tapFor(answer[0], 'win');
  await until(async () => !(await looking()), 3000);
}

ok(
  'a second miss: the spoken clue says the word was not on her desk, three rounds',
  clues.length === 3 && clues.every(([w, clue]) => clue.includes(`${w} was not on my desk`)),
  clues.map(([, clue]) => `"${clue}"`).join(' · ')
);
const heard = clues.flatMap(([, , said]) => said);
ok('nothing she says in those rounds says "still on the desk"', heard.length > 0 && !heard.some(s => STILL.test(s)), heard.filter(s => STILL.test(s)).join(' · '));
ok('no page errors', errors.length === 0, errors.join(' | '));
await browser.close();
const passed = results.every(Boolean);
console.log(passed ? '\nALL PASS' : '\nSOME FAILED');
process.exit(passed ? 0 : 1);
