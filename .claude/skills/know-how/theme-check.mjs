#!/usr/bin/env node
// Light and dark (DES-16): does the app follow the iPad, the Settings choice
// and the home screen's day/night button?
//
//   node .claude/skills/know-how/theme-check.mjs [port=5199]
//
// Needs Vite running on the port. It expects:
//   - with the iPad set to dark, the page opens dark before the app runs (the
//     inline script), and back to light, it turns light with no reload;
//   - home shows the moon and stars at night and the sun by day;
//   - the stars twinkle, and stand still with reduced motion;
//   - the day/night button turns day into night and back, and the choice
//     survives a reload (and beats the iPad's own setting);
//   - Settings' Light / Dark / Match the system override the iPad, survive a
//     reload, and "Match the system" follows it again.
// It fails on the commit before DES-16, where index.html pinned the app light.

import puppeteer from 'puppeteer-core';
import { chromePath } from '../../../scripts/chrome-path.cjs';

const port = process.argv.find(a => /^\d+$/.test(a)) ?? '5199';
const at = n => `[data-shot="${n}"]`;
const wait = ms => new Promise(r => setTimeout(r, ms));
const results = [];
const ok = (name, pass, detail = '') => { results.push(pass); console.log(`${pass ? '✅' : '❌'} ${name}${detail ? `  (${detail})` : ''}`); };

const browser = await puppeteer.launch({ executablePath: chromePath(), headless: true, args: ['--mute-audio'] });
const page = await browser.newPage();
await page.setViewport({ width: 1180, height: 820 });
await page.evaluateOnNewDocument(() => { window.speechSynthesis.speak = () => {}; });

const ipad = mode => page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: mode }]);
const theme = () => page.evaluate(() => document.documentElement.getAttribute('data-theme'));
const showing = sel => page.$eval(sel, el => el.checkVisibility()).catch(() => false);
const saved = () => page.evaluate(() => JSON.parse(localStorage.getItem('ms_luna_learning_progress_v1') || '{}').settings?.theme);
const reload = async () => { await page.reload({ waitUntil: 'networkidle0' }); await page.waitForSelector(at('home')); };
const moon = at('moon');
const sun = at('sun');
const star = at('star');

// ---- the iPad set to dark, from a fresh start ----
await ipad('dark');
// the inline script sets the mode before any module runs: read it at the first
// moment the document exists
await page.evaluateOnNewDocument(() => {
  document.addEventListener('readystatechange', () => {
    if (document.readyState === 'interactive' && !window.__firstTheme) window.__firstTheme = document.documentElement.getAttribute('data-theme');
  });
});
await page.goto(`http://localhost:${port}/`, { waitUntil: 'networkidle0' });
await page.evaluate(() => localStorage.clear());
await reload();
ok('iPad dark: dark before the app runs (no flash)', (await page.evaluate(() => window.__firstTheme)) === 'dark', await page.evaluate(() => window.__firstTheme));
ok('iPad dark: the app is dark', (await theme()) === 'dark');
ok('home at night: the moon shows', await showing(moon));
ok('home at night: the stars show', await showing(star));
ok('home at night: no sun', !(await showing(sun)));
const twinkle = await page.$eval(star, el => getComputedStyle(el).animationName).catch(() => 'none');
ok('the stars twinkle', twinkle !== 'none', twinkle);
await page.evaluate(() => document.documentElement.setAttribute('data-reduced-motion', ''));
const still = await page.$eval(star, el => getComputedStyle(el).animationName).catch(() => '?');
ok('… and stand still with reduced motion', still === 'none', still);
await page.evaluate(() => document.documentElement.removeAttribute('data-reduced-motion'));

await ipad('light');
await wait(300);
ok('iPad back to light: light with no reload', (await theme()) === 'light');
ok('home by day: the sun shows, no moon', (await showing(sun)) && !(await showing(moon)));

// ---- the day/night button ----
const label = () => page.$eval(at('day-night'), el => el.getAttribute('aria-label'));
ok('by day the button offers night', (await label()) === 'Turn it to night', await label());
await page.click(at('day-night'));
await wait(300);
ok('a tap turns day into night', (await theme()) === 'dark' && (await showing(moon)));
ok('… and offers day', (await label()) === 'Turn it to day', await label());
await reload();
ok('night survives a reload (the iPad is light)', (await theme()) === 'dark', `saved: ${await saved()}`);
await page.click(at('day-night'));
await wait(300);
ok('a second tap turns night back into day', (await theme()) === 'light');
await ipad('dark');
await reload();
ok('day survives a reload, over the iPad\'s dark', (await theme()) === 'light', `saved: ${await saved()}`);

// ---- Settings, behind the gate ----
async function openSettings() {
  const box = await (await page.$(at('open-settings'))).boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await wait(2300);
  await page.mouse.up();
  await page.waitForSelector(at('settings'));
  await wait(500);
}
const pressed = name => page.$eval(at(`theme-${name}`), el => el.getAttribute('aria-pressed'));
await openSettings();
ok('Settings shows Light picked (the button\'s choice)', (await pressed('light')) === 'true');
await page.click(at('theme-dark'));
await wait(300);
ok('Settings: Dark turns it dark at once', (await theme()) === 'dark');
await page.click(at('theme-light'));
await wait(300);
ok('Settings: Light turns it light, over the iPad\'s dark', (await theme()) === 'light');
await reload();
ok('Light survives a reload', (await theme()) === 'light', `saved: ${await saved()}`);
await openSettings();
await page.click(at('theme-match'));
await wait(300);
ok('Settings: Match the system follows its dark', (await theme()) === 'dark');
await ipad('light');
await wait(300);
ok('… and its light, with no reload', (await theme()) === 'light');
await reload();
ok('Match the system survives a reload', (await saved()) === 'match', `saved: ${await saved()}`);

await browser.close();
const passed = results.every(Boolean);
console.log(passed ? '\nALL PASS' : '\nSOME FAILED');
process.exit(passed ? 0 : 1);
