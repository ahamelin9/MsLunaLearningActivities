#!/usr/bin/env node
// Shoots this week's words (CUR-9) past the grown-up gate, for a review
// sheet: Settings with its new row, and the picker with some words picked.
// `ui:shots` reaches Settings but not the picker.
//
//   node .claude/skills/know-how/week-words-shot.mjs <outDir> <label> <light|dark> <WxH> [words=cat,dog,rain] [grade=kindergarten] [tab=<grade>] [scroll=<px>]
//
// Needs Vite on 5199. Saves <label>-<theme>-<WxH>-settings.png (Settings,
// scrolled to its new row) and <label>-<theme>-<WxH>-picker.png (the picker,
// on `tab`'s words, scrolled down by `scroll`). words=none picks nothing;
// words=ten picks the first 10 of the tab's words, a full set.
import { mkdirSync } from 'node:fs';
import puppeteer from 'puppeteer-core';
import { chromePath } from '../../../scripts/chrome-path.cjs';

const [outDir, label, theme, size, ...extra] = process.argv.slice(2);
if (!size) {
  console.error('usage: week-words-shot.mjs <outDir> <label> <light|dark> <WxH> [words=…] [grade=…] [tab=…] [scroll=…]');
  process.exit(1);
}
const opt = (name, fallback) => extra.find(a => a.startsWith(`${name}=`))?.slice(name.length + 1) ?? fallback;
const grade = opt('grade', 'kindergarten');
const tab = opt('tab', grade);
const scroll = Number(opt('scroll', '0'));
const wordsArg = opt('words', 'cat,dog,rain');
const [w, h] = size.split('x').map(Number);
mkdirSync(outDir, { recursive: true });
const at = n => `[data-shot="${n}"]`;
const wait = ms => new Promise(r => setTimeout(r, ms));

const browser = await puppeteer.launch({ executablePath: chromePath(), headless: true, args: ['--mute-audio'] });
const page = await browser.newPage();
await page.setViewport({ width: w, height: h });
await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: theme }]);
await page.evaluateOnNewDocument(() => { window.speechSynthesis.speak = () => {}; });
await page.goto('http://localhost:5199/', { waitUntil: 'networkidle0' });
const words = await page.evaluate(async (wordsArg, tab) => {
  const { PICKABLE_WORDS } = await import('/src/apps/reading/engine/weekWords.ts');
  const { tierFor } = await import('/src/apps/reading/engine/content.ts');
  if (wordsArg === 'none') return [];
  if (wordsArg === 'ten') return PICKABLE_WORDS.filter(x => x.tier === tierFor(tab, 2)).slice(0, 10).map(x => x.word);
  return wordsArg.split(',');
}, wordsArg, tab);
await page.evaluate((g, words) => {
  localStorage.clear();
  localStorage.setItem('ms_luna_learning_progress_v1', JSON.stringify({ selectedGrade: g, settings: { weekWords: words } }));
}, grade, words);
await page.reload({ waitUntil: 'networkidle0' });
await page.waitForSelector(at('open-settings'));
await wait(1200);
const gear = await (await page.$(at('open-settings'))).boundingBox();
await page.mouse.move(gear.x + gear.width / 2, gear.y + gear.height / 2);
await page.mouse.down();
await wait(2300);
await page.mouse.up();
await page.waitForSelector(at('settings'));
await wait(500);
await page.$eval(at('open-week-words'), el => el.scrollIntoView({ block: 'center' }));
await wait(300);
const name = `${outDir}/${label}-${theme}-${size}`;
await page.screenshot({ path: `${name}-settings.png` });
await page.click(at('open-week-words'));
await page.waitForSelector(at('week-words'));
if (tab !== grade) await page.click(at(`week-grade-${tab}`));
await wait(500);
if (scroll) {
  await page.evaluate(px => {
    let el = document.querySelector('[data-shot="week-words"]');
    while (el && !(el.scrollHeight > el.clientHeight + 1 && /(auto|scroll)/.test(getComputedStyle(el).overflowY))) el = el.parentElement;
    (el ?? document.scrollingElement).scrollTop = px;
  }, scroll);
  await wait(300);
}
await page.screenshot({ path: `${name}-picker${tab !== grade ? `-${tab}` : ''}${scroll ? `-${scroll}` : ''}.png` });
console.log(name);
await browser.close();
