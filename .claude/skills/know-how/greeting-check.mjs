#!/usr/bin/env node
// When does Luna say her library greeting? (DES-21)
//
//   node .claude/skills/know-how/greeting-check.mjs [port=5199]
//
// Needs Vite running on the port. In a muted Chrome it logs every line said
// (pronunciation.say's text) and counts clip starts (AudioBufferSourceNode),
// step by step; clip labels stick (know-how), so lines are matched by what
// was said, not by the clip. Expects:
//   - after Grade Select: only "Let's start Kindergarten!", no greeting;
//   - opened from home: her greeting, with its clip(s);
//   - a tap on her: the same greeting again;
//   - back from a game: no greeting;
//   - the header's grade (data-shot="change-grade"): Grade Select with that
//     grade picked; picking 1st returns to the library on 1st, no greeting;
//   - the mute beside her (data-shot="luna-mute") stops her mid-line, keeps
//     her taps silent, matches Settings' "Ms. Luna's voice", and unmutes;
//   - nothing falls back to the browser voice.
// It fails on the commit before DES-21, where she greeted no one.

import puppeteer from 'puppeteer-core';
import { chromePath } from '../../../scripts/chrome-path.cjs';

const port = process.argv[2] ?? '5199';
const at = n => `[data-shot="${n}"]`;
const wait = ms => new Promise(r => setTimeout(r, ms));
// the grown-up gate (SET-1): press and hold for --dur-hold (2s), then let go
const hold = async selector => {
  const box = await (await page.$(selector)).boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await wait(2300);
  await page.mouse.up();
};

const browser = await puppeteer.launch({
  executablePath: chromePath(),
  headless: true,
  args: ['--mute-audio', '--autoplay-policy=no-user-gesture-required']
});
const page = await browser.newPage();
await page.setViewport({ width: 1180, height: 820 });
await page.evaluateOnNewDocument(() => {
  window.__browserSpoke = [];
  window.speechSynthesis.speak = u => window.__browserSpoke.push(u.text);
  window.__starts = 0;
  const start = AudioBufferSourceNode.prototype.start;
  AudioBufferSourceNode.prototype.start = function (...args) {
    window.__starts += 1;
    return start.apply(this, args);
  };
});

await page.goto(`http://localhost:${port}/`, { waitUntil: 'networkidle0' });
const greets = await page.evaluate(async () =>
  (await import('/src/apps/reading/engine/luna.ts')).GENERAL.greet.map(l => l.text.replace(/[…]/g, '...'))
);
// a line may be said in parts ("Shh…" is its own clip), so match by words
const norm = t => t.toLowerCase().replace(/\bsh+\b/g, '').replace(/[^a-z ]/g, '').replace(/\s+/g, ' ').trim();
const isGreeting = t => norm(t).length > 0 && greets.some(g => norm(g).includes(norm(t)));

await page.evaluate(() => localStorage.clear());
await page.reload({ waitUntil: 'networkidle0' });
// wrap the clip player the page actually loaded (a hot-reloaded copy has ?t=)
await page.evaluate(async () => {
  const src = performance.getEntriesByType('resource').map(e => e.name).find(n => n.includes('/src/utils/pronunciation.ts')) ?? '/src/utils/pronunciation.ts';
  const { pronunciation } = await import(src);
  window.__said = [];
  const say = pronunciation.say.bind(pronunciation);
  pronunciation.say = (req, text, opts) => {
    window.__said.push(text);
    return say(req, text, opts);
  };
});

const step = async (name, act, ms) => {
  const before = await page.evaluate(() => ({ said: window.__said.length, starts: window.__starts }));
  await act();
  await wait(ms);
  const after = await page.evaluate(() => ({ said: window.__said.slice(), starts: window.__starts }));
  const said = after.said.slice(before.said);
  return { name, said, clips: after.starts - before.starts, greeting: said.filter(isGreeting) };
};

await page.click(at('open-reading'));
await page.waitForSelector(at('grade-card'));
await wait(2500);
const grade = await step('after Grade Select', async () => {
  await page.click(at('grade-card'));
  await page.waitForSelector(at('hub'));
}, 3500);
const home = await step('from home', async () => {
  await page.click(at('app-home'));
  await page.waitForSelector(at('open-reading'));
  await page.click(at('open-reading'));
  await page.waitForSelector(at('hub'));
}, 4500);
const tap = await step('tap Luna', () => page.click('[data-shot="hub"] [data-mood]'), 4500);
const game = await step('back from a game', async () => {
  await page.click(at('game-tile'));
  await page.waitForSelector(at('shell-intro'));
  await wait(2500);
  await page.click(at('shell-back'));
  await page.waitForSelector(at('hub'));
}, 3500);

// the header's grade: Grade Select with the current grade picked, then 1st
let picked = null;
const change = await step('changing grade from the header', async () => {
  await hold(at('change-grade'));
  await page.waitForSelector(at('grade-select'));
  await wait(2500);
  picked = await page.$$eval(at('grade-card'), els => els.map(el => el.getAttribute('aria-pressed')));
  await (await page.$$(at('grade-card')))[1].click();
  await page.waitForSelector(at('hub'));
}, 3500);
const nowShows = await page.$eval(at('change-grade'), el => el.textContent.trim()).catch(() => null);

// the mute beside her (Alex, 2026-10-12): it stops her mid-line, keeps her
// taps silent, is the same setting as Settings' "Ms. Luna's voice", and
// unmutes her again
const talking = () => page.evaluate(() => !!document.querySelector('[data-shot="hub"] [data-mood][data-state~="talking"]'));
await page.click('[data-shot="hub"] [data-mood]');
let talkingBefore = false;
for (let i = 0; i < 40 && !talkingBefore; i++) {
  await wait(50);
  talkingBefore = await talking();
}
await page.click(at('luna-mute'));
await wait(150);
const talkingAfter = await talking();
const mutedLabel = await page.$eval(at('luna-mute'), el => el.getAttribute('aria-label'));
const mutedTap = await step('tap Luna while muted', () => page.click('[data-shot="hub"] [data-mood]'), 2500);
await hold(at('open-settings'));
await page.waitForSelector(at('settings'));
const settingsSwitch = await page.$eval('[role="switch"][aria-label="Ms. Luna’s voice"]', el => el.getAttribute('aria-checked'));
await page.click(at('modal-close'));
await wait(600);
await page.click(at('luna-mute'));
await wait(300);
const unmutedLabel = await page.$eval(at('luna-mute'), el => el.getAttribute('aria-label'));
const unmutedTap = await step('tap Luna after unmuting', () => page.click('[data-shot="hub"] [data-mood]'), 3500);

for (const r of [grade, home, tap, game, change, mutedTap, unmutedTap])
  console.log(`${r.name}: said ${JSON.stringify(r.said)}, ${r.clips} clip start(s), greeting ${r.greeting.length ? 'yes' : 'none'}`);
const spoke = await page.evaluate(() => window.__browserSpoke);
const once = list => JSON.stringify([...new Set(list)]);
const checks = [
  ['after Grade Select: no greeting, "Let’s start Kindergarten!" said', grade.greeting.length === 0 && grade.said.some(t => /start Kindergarten/.test(t))],
  ['from home: her greeting, with its clip(s)', home.greeting.length >= 1 && home.greeting.length === home.said.length && home.clips >= 1],
  ['tap Luna: the same greeting again, with its clip(s)', once(tap.said) === once(home.said) && tap.clips >= 1],
  ['back from a game: no greeting', game.greeting.length === 0],
  [`the header's grade opens Grade Select with Kindergarten picked (${JSON.stringify(picked)})`, JSON.stringify(picked) === '["true","false","false"]'],
  [`picking 1st returns to the library on 1st ("${nowShows}"), "Let’s start First Grade!" said, no greeting`, nowShows === '1st Grade' && change.greeting.length === 0 && change.said.some(t => /start First Grade/.test(t))],
  [`the mute stops her mid-line (talking before: ${talkingBefore}, after: ${talkingAfter}) and becomes "${mutedLabel}"`, talkingBefore && !talkingAfter && mutedLabel === 'Unmute Ms. Luna'],
  [`while muted, a tap on her plays no clip (${mutedTap.clips}), and Settings' "Ms. Luna’s voice" is off (aria-checked ${settingsSwitch})`, mutedTap.clips === 0 && settingsSwitch === 'false'],
  [`unmuting ("${unmutedLabel}") brings her voice back: a tap plays a clip (${unmutedTap.clips})`, unmutedLabel === 'Mute Ms. Luna' && unmutedTap.clips >= 1],
  ['no line fell back to the browser voice', spoke.length === 0]
];
for (const [what, ok] of checks) console.log(`${ok ? '✅' : '❌'} ${what}`);
if (spoke.length) console.log('browser voice:', spoke);
await browser.close();
process.exit(checks.every(([, ok]) => ok) ? 0 : 1);
