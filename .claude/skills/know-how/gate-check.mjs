#!/usr/bin/env node
// The grown-up gate (SET-1): can a child tapping around open Settings or
// change the grade?
//
//   node .claude/skills/know-how/gate-check.mjs [port=5199] [--reduced-motion]
//
// Needs Vite running on the port. For the home screen's gear, the library's
// gear and the library's grade button (data-shot open-settings, change-grade),
// it expects:
//   - (and for Luna's mute, SET-2: a tap and a 1s hold leave her voice on, a
//     2.3s hold turns it off; a game then says she's resting; one tap gives
//     her voice back and the note goes)
//   - a quick tap opens nothing, and shows "Grown-ups: press and hold";
//   - a 1s hold opens nothing, with the ring part-filled meanwhile
//     (--hold-progress between 0 and 1);
//   - a 2.3s hold opens Settings, or Grade Select for the grade.
// With --reduced-motion the same holds: the wait keeps its length, and the
// ring still fills. It fails on the commit before SET-1, where a tap opened
// them.

import puppeteer from 'puppeteer-core';
import { chromePath } from '../../../scripts/chrome-path.cjs';

const port = process.argv.find(a => /^\d+$/.test(a)) ?? '5199';
const reduced = process.argv.includes('--reduced-motion');
const at = n => `[data-shot="${n}"]`;
const wait = ms => new Promise(r => setTimeout(r, ms));
const results = [];
const ok = (name, pass, detail = '') => { results.push(pass); console.log(`${pass ? '✅' : '❌'} ${name}${detail ? `  (${detail})` : ''}`); };

const browser = await puppeteer.launch({ executablePath: chromePath(), headless: true, args: ['--mute-audio'] });
const page = await browser.newPage();
await page.setViewport({ width: 1180, height: 820 });
await page.evaluateOnNewDocument(() => { window.speechSynthesis.speak = () => {}; });
await page.goto(`http://localhost:${port}/`, { waitUntil: 'networkidle0' });
await page.evaluate(() => localStorage.clear());
await page.reload({ waitUntil: 'networkidle0' });
if (reduced) await page.evaluate(() => document.documentElement.setAttribute('data-reduced-motion', ''));

const shown = sel => page.evaluate(s => !!document.querySelector(s), sel);
const note = name => page.$eval(`${at(name)} + [role="status"]`, el => el.textContent.trim()).catch(() => '');
const ring = name => page.$eval(at(name), el => Number(getComputedStyle(el).getPropertyValue('--hold-progress')) || 0);

/** Presses `name` for `ms`, reading the ring halfway; returns the ring then. */
async function press(name, ms) {
  const box = await (await page.$(at(name))).boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await wait(ms / 2);
  const mid = await ring(name).catch(() => 0);
  await wait(ms / 2);
  await page.mouse.up();
  await wait(300);
  return mid;
}

async function gate(where, name, opens, close) {
  await press(name, 80);
  ok(`${where}: a quick tap opens nothing`, !(await shown(at(opens))));
  ok(`${where}: … and says "Grown-ups: press and hold"`, (await note(name)) === 'Grown-ups: press and hold', await note(name));
  const mid = await press(name, 1000);
  ok(`${where}: a 1s hold opens nothing`, !(await shown(at(opens))));
  ok(`${where}: … while the ring fills part-way`, mid > 0.1 && mid < 0.5, `halfway through: ${mid.toFixed(2)}`);
  await press(name, 2300);
  ok(`${where}: a 2.3s hold opens it`, await shown(at(opens)));
  await close();
}

const closeModal = async () => {
  await page.click(at('modal-close'));
  await wait(800);
};

console.log(reduced ? '(reduced motion)' : '(full motion)');
await page.waitForSelector(at('open-settings'));
await gate('home gear', 'open-settings', 'settings', closeModal);

await page.click(at('open-reading'));
await page.waitForSelector(at('grade-card'));
await (await page.$$(at('grade-card')))[0].click();
await page.waitForSelector(at('hub'));
await wait(1500);
await gate('library gear', 'open-settings', 'settings', closeModal);
await gate('grade button', 'change-grade', 'grade-select', async () => {
  await (await page.$$(at('grade-card')))[0].click();
  await page.waitForSelector(at('hub'));
  await wait(800);
});

// ---- SET-2: Luna's mute is behind the gate too, and a game says she's resting ----
const voice = () => page.evaluate(() => JSON.parse(localStorage.getItem('ms_luna_learning_progress_v1') || '{}').settings?.speechEnabled);
await press('luna-mute', 80);
ok('Luna\'s mute: a quick tap leaves her voice on', (await voice()) !== false);
ok('… and says "Grown-ups: press and hold"', (await note('luna-mute')) === 'Grown-ups: press and hold', await note('luna-mute'));
await press('luna-mute', 1000);
ok('… a 1s hold leaves it on too', (await voice()) !== false);
await press('luna-mute', 2300);
ok('… a 2.3s hold turns her voice off', (await voice()) === false, `speechEnabled ${await voice()}`);
const openGame = async () => {
  await (await page.$$(at('game-tile')))[0].click();
  await page.waitForSelector(at('play'));
  await page.click(at('play'));
  await page.waitForSelector(at('stage'));
  await wait(800);
};
await openGame();
const resting = await page.$eval(at('luna-resting'), el => el.textContent.trim()).catch(() => '');
ok('muted, a game says "Ms. Luna is resting. Ask a grown-up!"', resting === 'Ms. Luna is resting. Ask a grown-up!', resting);
await page.click(at('shell-back'));
await page.waitForSelector(at('hub'));
await wait(600);
await page.click(at('luna-mute'));
await wait(300);
ok('one tap gives her voice back', (await voice()) === true);
await openGame();
ok('… and the game shows no resting note', !(await shown(at('luna-resting'))));

// ---- SET-5: past the gate, what each game and lesson teaches ----
await page.click(at('shell-back')).catch(() => {});
await page.waitForSelector(at('hub'));
await wait(600);
await press('open-settings', 2300);
await page.waitForSelector(at('settings'));
await page.click(at('open-teaches'));
await page.waitForSelector(at('teaches'));
const teaches = await page.$eval(at('teaches'), el => el.textContent);
const objectives = await page.evaluate(async () => {
  const { GAMES } = await import('/src/apps/reading/games/index.ts');
  const { lessonsFor } = await import('/src/apps/reading/engine/lessons.ts');
  return [...GAMES, ...['kindergarten', 'grade1', 'grade2'].flatMap(g => lessonsFor(g))].map(x => x.objective);
});
const missing = objectives.filter(o => !teaches.includes(o));
ok(`past the gate, Settings lists what all ${objectives.length} games and lessons teach (SET-5)`, missing.length === 0, missing.join(' | '));
await page.click('[data-shot="teaches"] button');
await wait(300);
ok('… and "Back to settings" goes back', !(await shown(at('teaches'))) && (await shown(at('open-teaches'))));
await page.click(at('modal-close'));
await wait(600);

await browser.close();
const passed = results.every(Boolean);
console.log(passed ? '\nALL PASS' : '\nSOME FAILED');
process.exit(passed ? 0 : 1);
