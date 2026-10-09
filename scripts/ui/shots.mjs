#!/usr/bin/env node
// Screenshots every screen of the Learning Pad at the four iPad sizes, so a
// design change can be judged before and after.
//
//   npm run ui:shots                      -> screenshots/latest/
//   npm run ui:shots -- --label before    -> screenshots/before/
//   npm run ui:shots -- --label after     -> screenshots/after/
//
// It starts its own Vite dev server and drives the Chrome already installed
// on this machine (puppeteer-core downloads no browser of its own). Set
// CHROME_PATH to use a different one. Each size runs from a fresh start:
// its own browser profile with localStorage cleared, the way a new child
// first meets the app.

import { existsSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';
import { createServer } from 'vite';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');

/** The iPads the app has to look right on, landscape and portrait. */
const VIEWPORTS = [
  { width: 1180, height: 820 }, // iPad Air / iPad 10th gen, landscape
  { width: 820, height: 1180 }, // the same, portrait
  { width: 1024, height: 768 }, // iPad 9th gen, landscape
  { width: 744, height: 1133 } // iPad mini, portrait
];

const CHROME_PATH =
  process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

/** Long enough for a screen's entrance animation to finish. */
const SETTLE_MS = 900;

function parseLabel(argv) {
  const i = argv.indexOf('--label');
  const label = i === -1 ? 'latest' : argv[i + 1];
  if (!label || !/^[\w.-]+$/.test(label)) {
    console.error('Usage: npm run ui:shots -- [--label <name>]   (letters, digits, . _ - only)');
    process.exit(1);
  }
  return label;
}

const sleep = ms => new Promise(r => setTimeout(r, ms));
const slug = text =>
  text
    .toLowerCase()
    .replace(/[’']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

/** One run through the app at one size. */
async function shootViewport(browser, url, viewport, outDir) {
  const size = `${viewport.width}x${viewport.height}`;
  const dir = join(outDir, size);
  mkdirSync(dir, { recursive: true });

  const context = await browser.createBrowserContext();
  const page = await context.newPage();
  await page.setViewport({ ...viewport, deviceScaleFactor: 1, hasTouch: true });

  let n = 0;
  let step = 'start';
  const shot = async name => {
    step = name;
    await page.evaluate(() => document.fonts.ready);
    await sleep(SETTLE_MS);
    // the pointer rests off to the side, so nothing is caught mid-hover
    await page.mouse.move(viewport.width - 1, viewport.height - 1);
    const file = `${String(++n).padStart(2, '0')}-${name}.png`;
    await page.screenshot({ path: join(dir, file) });
    console.log(`  ${size}  ${file}`);
  };
  const click = async selector => {
    await page.waitForSelector(selector, { visible: true });
    await page.click(selector);
  };
  const scrollTo = selector =>
    page.$eval(selector, el => el.scrollIntoView({ block: 'start', behavior: 'instant' }));

  try {
    // ---- a fresh start ----
    await page.goto(url, { waitUntil: 'networkidle0' });
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: 'networkidle0' });
    await page.waitForSelector('.home-screen-container');
    await shot('home');

    // ---- into the Reading app, which asks for a grade first ----
    await click('.ipad-reading-app-card');
    await page.waitForSelector('.grade-select-page');
    await shot('grade-select');

    await click('.grade-card-item'); // Kindergarten
    await page.waitForSelector('.reading-hub');
    await shot('hub-top');
    await scrollTo('.hub-rug');
    await shot('hub-rug');
    await scrollTo('.hub-tin');
    await shot('hub-tin');
    await scrollTo('.reading-hub');

    // ---- the grown-up screens ----
    await click('[aria-label="Settings"]');
    await page.waitForSelector('[aria-label="Settings and Preferences"]');
    await shot('settings');
    await click('.modal-close-btn');
    await page.waitForSelector('[aria-label="Settings and Preferences"]', { hidden: true });

    await click('[aria-label="Trophy Room"]');
    await page.waitForSelector('.trophy-modal-card');
    await shot('trophies');
    await click('.modal-close-btn');
    await page.waitForSelector('.trophy-modal-card', { hidden: true });

    // ---- every game: its start screen and its first round ----
    const titles = await page.$$eval('.hub-rug .game-thing:not(.nook) .thing-title', els =>
      els.map(el => el.textContent.trim())
    );
    for (const [i, title] of titles.entries()) {
      const name = `game-${slug(title)}`;
      step = name;
      const tiles = await page.$$('.hub-rug .game-thing:not(.nook)');
      await tiles[i].click();
      await page.waitForSelector('.game-shell.phase-intro');
      await shot(`${name}-intro`);
      await click('.play-button');
      await page.waitForSelector('.game-shell.phase-play');
      await shot(`${name}-play`);
      await click('.shell-back');
      await page.waitForSelector('.reading-hub');
    }

    // ---- the first lesson, played through to its reward ----
    step = 'lesson';
    await click('.hub-lessons .game-thing');
    await page.waitForSelector('.game-shell.phase-intro');
    await shot('lesson-intro');
    await click('.play-button');
    await page.waitForSelector('.game-shell.phase-play');
    await shot('lesson-play');
    step = 'lesson-solve';
    await solveLesson(page);
    await shot('reward');
  } catch (err) {
    await page.screenshot({ path: join(dir, `FAILED-${step}.png`) }).catch(() => {});
    throw new Error(`${size}, at "${step}": ${err.message}`);
  } finally {
    await context.close();
  }
}

/**
 * Answers every question of a lesson by trying its choices in turn: a wrong
 * one makes the shell flash a miss, the right one a win, and the round then
 * moves on by itself.
 */
async function solveLesson(page) {
  const roundIndex = () =>
    page.evaluate(() =>
      [...document.querySelectorAll('.round-pips .pip')].findIndex(p => p.classList.contains('current'))
    );

  for (let guard = 0; guard < 30; guard++) {
    if (await page.$('.game-shell.phase-reward')) return;
    const round = await roundIndex();
    const count = (await page.$$('.lesson-choice')).length;
    if (count === 0) throw new Error('this lesson question has no .lesson-choice buttons to try');

    for (let i = 0; i < count; i++) {
      const choices = await page.$$('.lesson-choice');
      await choices[i].click();
      // the shell flashes once the child's choice has been said aloud
      const outcome = await page
        .waitForFunction(
          () => {
            const shell = document.querySelector('.game-shell');
            if (shell?.classList.contains('flash-win')) return 'win';
            if (shell?.classList.contains('flash-miss')) return 'miss';
            return false;
          },
          { timeout: 10_000 }
        )
        .then(h => h.jsonValue());
      if (outcome === 'win') break;
      await page.waitForFunction(() => !document.querySelector('.game-shell.flash-miss'));
    }

    await page.waitForFunction(
      r =>
        document.querySelector('.game-shell.phase-reward') ||
        [...document.querySelectorAll('.round-pips .pip')].findIndex(p => p.classList.contains('current')) !== r,
      { timeout: 10_000 },
      round
    );
  }
  throw new Error('the lesson never reached its reward screen');
}

async function main() {
  const label = parseLabel(process.argv.slice(2));
  if (!existsSync(CHROME_PATH)) {
    console.error(`Chrome not found at ${CHROME_PATH}. Set CHROME_PATH to a Chrome or Chromium binary.`);
    process.exit(1);
  }

  const outDir = join(ROOT, 'screenshots', label);
  rmSync(outDir, { recursive: true, force: true });

  const server = await createServer({ root: ROOT, logLevel: 'error', server: { open: false } });
  await server.listen();
  const url = server.resolvedUrls.local[0];

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    // Luna's voice plays, so speech ends and the app moves on as it would,
    // but nothing comes out of the speakers.
    args: ['--autoplay-policy=no-user-gesture-required', '--mute-audio']
  });

  // the four sizes run side by side, each in its own fresh profile
  const started = Date.now();
  const results = await Promise.allSettled(
    VIEWPORTS.map(viewport => shootViewport(browser, url, viewport, outDir))
  );
  await browser.close();
  await server.close();

  const failures = results.filter(r => r.status === 'rejected');
  for (const f of failures) console.error(`\nui:shots failed — ${f.reason.message}`);
  if (failures.length) process.exit(1);
  const secs = Math.round((Date.now() - started) / 1000);
  console.log(`\nDone in ${secs}s: screenshots/${label}/`);
}

main();
