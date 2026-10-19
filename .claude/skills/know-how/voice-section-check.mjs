#!/usr/bin/env node
// Settings' voice section (SET-3): with one rendered voice, no picker; and an
// older save with the old accent setting still loads. Also its grade list
// (SET-4): the buttons come from the curriculum's GRADES.
//
//   node .claude/skills/know-how/voice-section-check.mjs [port=5199]
//
// Needs Vite running on the port. It opens Settings (a 1.5s hold on the gear)
// on a save written the old way, with `voiceLanguage`, and checks:
//   - no page error while it loads, and the app works (Settings opens);
//   - with only af_heart rendered, no "Accent" or "Voice" group shows, and
//     the privacy line and "Which voice" still do;
//   - the save no longer carries `voiceLanguage` once anything is saved.
// It fails on the commit before SET-3, where "American" and "Luna (warm)" showed.

import puppeteer from 'puppeteer-core';
import { chromePath } from '../../../scripts/chrome-path.cjs';

const port = process.argv.find(a => /^\d+$/.test(a)) ?? '5199';
const at = n => `[data-shot="${n}"]`;
const wait = ms => new Promise(r => setTimeout(r, ms));
const KEY = 'ms_luna_learning_progress_v1';
const results = [];
const ok = (name, pass, detail = '') => { results.push(pass); console.log(`${pass ? '✅' : '❌'} ${name}${detail ? `  (${detail})` : ''}`); };

const browser = await puppeteer.launch({ executablePath: chromePath(), headless: true, args: ['--mute-audio'] });
const page = await browser.newPage();
await page.setViewport({ width: 1180, height: 820 });
const errors = [];
page.on('pageerror', e => errors.push(e.message));
await page.evaluateOnNewDocument(() => { window.speechSynthesis.speak = () => {}; });
await page.goto(`http://localhost:${port}/`, { waitUntil: 'networkidle0' });
// an older save: the accent was its own setting
await page.evaluate(key => localStorage.setItem(key, JSON.stringify({
  selectedGrade: 'kindergarten',
  settings: { soundEnabled: true, speechEnabled: true, speechRate: 0.95, reducedMotion: false, voiceId: 'af_heart', voiceLanguage: 'en-GB' }
})), KEY);
await page.reload({ waitUntil: 'networkidle0' });

const box = await (await page.waitForSelector(at('open-settings'))).boundingBox();
await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
await page.mouse.down();
await wait(2300);
await page.mouse.up();
await page.waitForSelector(at('settings'));
await wait(1500);

const groups = await page.$$eval('[data-shot="settings"] [role="group"]', els => els.map(e => e.getAttribute('aria-label')));
const text = await page.$eval(at('settings'), el => el.textContent);
ok('the old save loads with no page error, and Settings opens', errors.length === 0, errors.join(' | '));
ok('with one rendered voice, no accent or voice picker', !groups.includes('Accent') && !groups.includes('Voice'), groups.join(', '));
ok('… "Which voice" and the privacy line still show', text.includes('Which voice') && text.includes('nothing is sent to a server'));

// SET-4: the grade buttons are the curriculum's own list, GRADES, in order
const grades = await page.evaluate(async () => (await import('/src/data/readingCurriculum.ts')).GRADES.map(g => g.title));
const buttons = await page.$$eval('[data-shot="settings"] [role="group"][aria-label="Grade"] button', els => els.map(e => e.textContent.trim()));
ok('the grade buttons are GRADES\' titles, in order (SET-4)', JSON.stringify(buttons) === JSON.stringify(grades), buttons.join(', '));

// any save (here, Less motion on and off) writes the settings back
await page.click(at('less-motion'));
await wait(300);
await page.click(at('less-motion'));
await wait(300);
const saved = await page.evaluate(key => JSON.parse(localStorage.getItem(key)).settings, KEY);
ok('the save no longer carries voiceLanguage', !('voiceLanguage' in saved), JSON.stringify(saved));

await browser.close();
const passed = results.every(Boolean);
console.log(passed ? '\nALL PASS' : '\nSOME FAILED');
process.exit(passed ? 0 : 1);
