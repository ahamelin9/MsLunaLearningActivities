#!/usr/bin/env node
// Shoots the library at a grade with its first N lessons learned, as a child
// opens it (CUR-7). `ui:shots` shows it only at the start of the path.
//
//   node .claude/skills/know-how/library-shot.mjs <outDir> <label> <light|dark> <WxH> <grade> <learned> [full] [tapN] [fill=<role>]
//
// Needs Vite on 5199. Saves <label>-<theme>-<WxH>-<grade>-<learned>.png.
//   full        also -full.png, the library's whole height
//   tapN        taps the Nth skill card (from 0) first
//   fill=<role> tries a role on the skill tray and the open skill card, without
//               touching src (how the tray's soil was picked against edge)
import { mkdirSync } from 'node:fs';
import puppeteer from 'puppeteer-core';
import { chromePath } from '../../../scripts/chrome-path.cjs';

const [outDir, label, theme, size, grade, learnedArg, ...extra] = process.argv.slice(2);
if (!learnedArg) {
  console.error('usage: library-shot.mjs <outDir> <label> <light|dark> <WxH> <grade> <learned> [full] [tapN] [fill=<role>]');
  process.exit(1);
}
const full = extra.includes('full');
const tap = extra.find(a => /^tap\d+$/.test(a));
const fill = extra.find(a => a.startsWith('fill='))?.slice(5);
const [w, h] = size.split('x').map(Number);
const learned = Number(learnedArg);
mkdirSync(outDir, { recursive: true });
const at = n => `[data-shot="${n}"]`;
const wait = ms => new Promise(r => setTimeout(r, ms));

const browser = await puppeteer.launch({ executablePath: chromePath(), headless: true, args: ['--mute-audio'] });
const page = await browser.newPage();
await page.setViewport({ width: w, height: h });
await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: theme }]);
await page.evaluateOnNewDocument(() => { window.speechSynthesis.speak = () => {}; });
await page.goto('http://localhost:5199/', { waitUntil: 'networkidle0' });
await page.evaluate(async (g, n) => {
  const { lessonsFor } = await import('/src/apps/reading/engine/lessons.ts');
  localStorage.clear();
  const ids = lessonsFor(g).map(l => l.lesson.id).slice(0, n);
  localStorage.setItem('ms_luna_learning_progress_v1', JSON.stringify({ selectedGrade: g, completedLessons: ids, stickers: ['bear:honey', 'cat:blush', 'bunny:mint'] }));
}, grade, learned);
await page.reload({ waitUntil: 'networkidle0' });
await page.click(at('open-reading'));
await page.waitForSelector(at('hub'));
await wait(1500);
if (fill) {
  await page.addStyleTag({ content: `${at('skill-tray')}, ${at('skill-tray')}::before { background: var(--${fill}) !important; } ${at('skill-card')}[aria-expanded="true"] { --skill-bg: var(--${fill}) !important; }` });
  await wait(300);
}
if (tap) {
  const cards = await page.$$(at('skill-card'));
  await cards[Number(tap.slice(3))].click();
  await wait(600);
}
const name = `${outDir}/${label}-${theme}-${size}-${grade}-${learned}${tap ? `-${tap}` : ''}${fill ? `-${fill}` : ''}`;
await page.screenshot({ path: `${name}.png` });
if (full) {
  // the library scrolls in its window: shoot the window's whole height
  const tall = await page.evaluate(() => {
    let el = document.querySelector('[data-shot="hub"]');
    while (el && !(el.scrollHeight > el.clientHeight + 1 && /(auto|scroll)/.test(getComputedStyle(el).overflowY))) el = el.parentElement;
    return el ? el.scrollHeight - el.clientHeight : document.scrollingElement.scrollHeight - innerHeight;
  });
  await page.setViewport({ width: w, height: h + tall });
  await wait(800);
  await page.screenshot({ path: `${name}-full.png` });
}
console.log(name);
await browser.close();
