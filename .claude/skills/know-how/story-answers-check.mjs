#!/usr/bin/env node
// Story Corner's "Hear the answers" button (CUR-23): at each grade, play a
// story to its question as a child would, then press the button and log what
// Luna says. It must say the three answers, each as its own clip, in the order
// they're shown, and never in the browser's voice. At 1st and 2nd grade the
// button waits for a first try, like "Read me the story", so a wrong answer
// goes first there.
//
//   node .claude/skills/know-how/story-answers-check.mjs [port=5199] [grades=0,1,2] [--shot=<out.png>] [--dark] [--fit]
//
// With --fit, it reaches every story's question instead (each grade's tier,
// one story at a time) at the four iPad sizes, and fails one that scrolls or
// runs past the stage (fit-check.mjs only measures a story's opening page).
// About 20 minutes.
// With --shot, it only takes a picture of the first grade's question (before
// any try) and stops: the before and after shots for a review sheet.
// Needs Vite on the port. On the code before CUR-23 there is no button.

import puppeteer from 'puppeteer-core';
import { chromePath } from '../../../scripts/chrome-path.cjs';
import { measure } from './fit-measure.mjs';

const args = process.argv.slice(2);
const port = args.find(a => /^\d+$/.test(a)) ?? '5199';
const grades = (args.find(a => a.startsWith('grades='))?.slice(7) ?? '0,1,2').split(',').map(Number);
const shot = args.find(a => a.startsWith('--shot='))?.slice(7);
const dark = args.includes('--dark');
const fit = args.includes('--fit');
const at = n => `[data-shot="${n}"]`;
const wait = ms => new Promise(r => setTimeout(r, ms));
const names = ['Kindergarten', '1st grade', '2nd grade'];
const results = [];
const ok = (name, pass, detail = '') => {
  results.push(pass);
  console.log(`${pass ? '✅' : '❌'} ${name}${detail !== '' ? `  (${detail})` : ''}`);
};
const mod = path => `(await import(performance.getEntriesByType('resource').map(e => e.name).find(n => n.includes('${path}')) ?? '${path}'))`;

const browser = await puppeteer.launch({ executablePath: chromePath(), headless: true, args: ['--mute-audio'] });
const page = await browser.newPage();
await page.setViewport({ width: 1180, height: 820, deviceScaleFactor: 1, hasTouch: true });
await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: dark ? 'dark' : 'light' }]);
await page.evaluateOnNewDocument(() => {
  window.__browserSpoke = [];
  window.speechSynthesis.speak = u => window.__browserSpoke.push(u.text);
});
await page.goto(`http://localhost:${port}/`, { waitUntil: 'networkidle0' });

const until = async (fn, ms = 12000) => {
  for (let t = 0; t < ms; t += 150) {
    if (await fn()) return true;
    await wait(150);
  }
  return false;
};
async function open(grade) {
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'networkidle0' });
  await page.click(at('open-reading'));
  await page.waitForSelector(at('grade-card'));
  await (await page.$$(at('grade-card')))[grade].click();
  await page.waitForSelector(at('hub'));
  for (const t of await page.$$(at('game-tile'))) if ((await t.evaluate(e => e.textContent)).includes('Story Corner')) await t.click();
  await page.waitForSelector(at('play'));
  await page.click(at('play'));
  await page.waitForSelector(at('stage'));
  await wait(800);
  // what Luna is asked to say, from now on (each part of a sequence is one request)
  await page.evaluate(`(async () => {
    const { pronunciation } = ${mod('/src/utils/pronunciation.ts')};
    window.__said = [];
    if (!pronunciation.__logged) {
      const say = pronunciation.say.bind(pronunciation);
      pronunciation.say = (req, text, opts) => { window.__said.push({ kind: req.kind, text }); return say(req, text, opts); };
      pronunciation.__logged = true;
    }
  })()`);
}
const hunted = () =>
  page.evaluate(() => {
    for (const el of document.querySelectorAll('[data-shot="stage"] *')) {
      const key = Object.keys(el).find(k => k.startsWith('__reactFiber'));
      for (let f = key ? el[key] : null; f; f = f.return) if (f.memoizedProps?.round?.hunt) return f.memoizedProps.round;
    }
    return null;
  });
const buttons = () => page.$$eval(`${at('stage')} button`, bs => bs.map(b => ({ text: b.textContent.trim(), disabled: b.disabled })));
const press = text => page.$$eval(`${at('stage')} button`, (bs, t) => bs.find(b => b.textContent.trim() === t)?.click(), text);

async function toQuestion() {
  const round = await hunted();
  for (let i = 0; i < 8; i++) {
    const b = (await buttons()).find(b => /next line|I have read it/i.test(b.text));
    if (!b) break;
    await press(b.text);
    await wait(500);
  }
  await until(() =>
    page.$$eval(`${at('stage')} p span`, (ss, w) => {
      const s = ss.find(s => s.children.length === 0 && s.textContent.replace(/[^a-zA-Z]/g, '').toLowerCase() === w);
      s?.click();
      return Boolean(s);
    }, round.hunt)
  );
  // the question comes after the word and Luna's "Found it!"
  await until(async () => (await buttons()).some(b => b.text === round.story.answers[0].text), 8000);
  await wait(1500);
  return round;
}

if (fit) {
  const SIZES = [[1180, 820], [820, 1180], [1024, 768], [744, 1133]];
  const storyTile = async () => {
    for (const t of await page.$$(at('game-tile'))) if ((await t.evaluate(e => e.textContent)).includes('Story Corner')) return t;
  };
  let visits = 0;
  for (const [W, H] of SIZES) {
    await page.setViewport({ width: W, height: H, deviceScaleFactor: 1, hasTouch: true });
    for (const grade of grades) {
      await open(grade);
      await page.click(at('shell-back'));
      await page.waitForSelector(at('hub'));
      // the app's own content module, held so one story at a time can be dealt
      const ids = await page.evaluate(async tier => {
        const src = n => performance.getEntriesByType('resource').map(e => e.name).find(u => u.includes(n)) ?? n;
        window.__content = await import(src('/src/apps/reading/engine/content.ts'));
        window.__keep = [...window.__content.MINI_STORIES];
        return window.__keep.filter(s => s.tier === tier).map(s => s.id);
      }, grade + 1);
      for (const id of ids) {
        await page.evaluate(id => {
          const list = window.__content.MINI_STORIES;
          list.length = 0;
          list.push(window.__keep.find(s => s.id === id));
        }, id);
        await (await storyTile()).click();
        await page.waitForSelector(at('play'));
        await page.click(at('play'));
        await page.waitForSelector(at('stage'));
        await wait(800);
        await toQuestion();
        visits++;
        const got = await page.evaluate(measure);
        ok(`${W}×${H} ${names[grade]} "${id}" at its question`, got.length === 0, got.join('; '));
        await page.click(at('shell-back'));
        await page.waitForSelector(at('hub'));
        await wait(150);
      }
      await page.evaluate(() => {
        const list = window.__content.MINI_STORIES;
        list.length = 0;
        list.push(...window.__keep);
      });
    }
  }
  console.log(`${visits} questions measured`);
}

for (const grade of fit ? [] : grades) {
  await open(grade);
  const round = await toQuestion();
  const shown = (await buttons()).map(b => b.text).filter(t => round.story.answers.some(a => a.text === t));

  if (shot) {
    await page.screenshot({ path: shot });
    console.log(shot);
    break;
  }

  const name = names[grade];
  let button = (await buttons()).find(b => b.text === 'Hear the answers');
  ok(`${name}: "Hear the answers" is under the question`, Boolean(button));
  if (!button) continue;

  if (grade > 0) {
    ok(`${name}: it waits for a first try, like "Read me the story"`, button.disabled);
    const wrong = round.story.answers.find(a => !a.correct).text;
    await press(wrong);
    // the miss: the wrong answer said, then Luna's hint
    await wait(6000);
    button = (await buttons()).find(b => b.text === 'Hear the answers');
    ok(`${name}: after a miss it can be pressed`, !button.disabled);
  } else {
    ok(`${name}: it can be pressed at once (the read-along)`, !button.disabled);
  }

  await page.evaluate(() => { window.__said = []; window.__browserSpoke = []; });
  await press('Hear the answers');
  await wait(7000);
  const said = await page.evaluate(() => window.__said);
  const texts = said.map(s => s.text);
  ok(`${name}: it says the three answers, in the order shown`, texts.join(' | ') === shown.join(' | '), texts.join(' | '));
  ok(`${name}: each is a whole line, not words`, said.every(s => s.kind !== 'word'), [...new Set(said.map(s => s.kind))].join(','));
  // every answer has a clip, so the browser's voice never speaks
  const browserSpoke = await page.evaluate(() => window.__browserSpoke);
  ok(`${name}: no answer in the browser's voice`, browserSpoke.length === 0, browserSpoke.join(' | '));
}

await browser.close();
if (!shot) {
  const passed = results.every(Boolean);
  console.log(passed ? '\nALL PASS' : '\nSOME FAILED');
  process.exit(passed ? 0 : 1);
}
