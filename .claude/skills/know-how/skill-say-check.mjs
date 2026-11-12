#!/usr/bin/env node
// Does Luna say a skill's name when its card is tapped? (CUR-10)
//
//   node .claude/skills/know-how/skill-say-check.mjs [port=5199]
//
// Needs Vite running on the port. In a muted Chrome, at each grade, it opens
// the library from home and taps every skill card (data-shot skill-card) in
// turn, logging every line said (pronunciation.say's text), the clips that
// start (AudioBufferSourceNode; the pops are oscillators, so these are only
// her voice) and anything handed to the browser's voice. Each tap must:
//   - open that skill (aria-expanded);
//   - say its line, the skill's `said` from the data (bucketsFor), which is
//     the name on its card;
//   - play it from a rendered clip: a clip starts, nothing falls back to the
//     browser's voice.
// Then with Luna muted (the mute beside her, a grown-up's hold; SET-2) a tap
// on each card of the last grade still opens it and plays no clip at all.
// It fails on the commit before CUR-10, where a tap said nothing, and with a
// line not rendered yet (watched: before `voice:render`, every tap fell back).

import puppeteer from 'puppeteer-core';
import { chromePath } from '../../../scripts/chrome-path.cjs';

const port = process.argv.find(a => /^\d{4,}$/.test(a)) ?? '5199';
const at = n => `[data-shot="${n}"]`;
const wait = ms => new Promise(r => setTimeout(r, ms));
const results = [];
const ok = (name, pass, detail = '') => { results.push(pass); console.log(`${pass ? '✅' : '❌'} ${name}${detail ? `  (${detail})` : ''}`); };
const GRADES = ['kindergarten', 'grade1', 'grade2'];

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

/** A fresh library at a grade, opened from home, with every line said logged. */
async function library(grade) {
  await page.goto(`http://localhost:${port}/`, { waitUntil: 'networkidle0' });
  await page.evaluate(g => {
    localStorage.clear();
    localStorage.setItem('ms_luna_learning_progress_v1', JSON.stringify({ selectedGrade: g }));
  }, grade);
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
  await page.click(at('open-reading'));
  await page.waitForSelector(at('hub'));
  // let her greeting finish before the taps
  await wait(6000);
}

/** Taps the nth skill card and returns what was said and played. */
async function tapCard(i, ms = 2500) {
  const before = await page.evaluate(() => ({ said: window.__said.length, starts: window.__starts, spoke: window.__browserSpoke.length }));
  const card = (await page.$$(at('skill-card')))[i];
  await card.evaluate(e => e.scrollIntoView({ block: 'center' }));
  await card.click();
  await wait(ms);
  const after = await page.evaluate(() => ({ said: window.__said.slice(), starts: window.__starts, spoke: window.__browserSpoke.slice() }));
  return {
    said: after.said.slice(before.said),
    clips: after.starts - before.starts,
    fellBack: after.spoke.slice(before.spoke),
    open: await card.evaluate(e => e.getAttribute('aria-expanded') === 'true'),
    name: await card.evaluate(e => e.textContent)
  };
}

const lines = grade => page.evaluate(async g => {
  const { bucketsFor } = await import('/src/apps/reading/engine/buckets.ts');
  return bucketsFor(g).map(b => ({ name: b.name, said: b.said.text }));
}, grade);

for (const grade of GRADES) {
  await library(grade);
  const want = await lines(grade);
  const cards = (await page.$$(at('skill-card'))).length;
  ok(`${grade}: a card for each of its ${want.length} skills`, cards === want.length, `${cards} cards`);
  for (let i = 0; i < cards; i++) {
    const r = await tapCard(i);
    const line = want[i].said;
    const pass = r.open && r.said.length === 1 && r.said[0] === line && line === `${want[i].name}!` && r.name.includes(want[i].name) && r.clips >= 1 && r.fellBack.length === 0;
    ok(`${grade}: "${want[i].name}" says "${line}" from a rendered clip`, pass,
      `said ${JSON.stringify(r.said)}, ${r.clips} clip(s), browser voice ${JSON.stringify(r.fellBack)}, open ${r.open}`);
  }
}

// muted (SET-2: the mute beside her is a grown-up's 1.5s hold): the taps
// still open the skills, and nothing plays
const box = await (await page.$(at('luna-mute'))).boundingBox();
await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
await page.mouse.down();
await wait(2300);
await page.mouse.up();
await wait(500);
ok('a hold on the mute mutes her', (await page.$eval(at('luna-mute'), el => el.getAttribute('aria-label'))) === 'Unmute Ms. Luna');
const cards = (await page.$$(at('skill-card'))).length;
const muted = [];
for (let i = 0; i < cards; i++) muted.push(await tapCard(i, 1200));
ok(`muted, a tap on each of the ${cards} cards opens it and plays nothing`,
  muted.every(r => r.open && r.clips === 0 && r.fellBack.length === 0),
  muted.map(r => `${r.clips} clip(s)${r.fellBack.length ? ', browser voice' : ''}`).join(' · '));

await browser.close();
const failed = results.filter(r => !r).length;
console.log(`\n${failed ? `${failed} FAILED` : 'ALL PASS'} (${results.length} checks)`);
process.exit(failed ? 1 : 0);
