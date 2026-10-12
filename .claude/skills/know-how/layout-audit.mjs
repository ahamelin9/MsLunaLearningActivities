#!/usr/bin/env node
// The layout audit (DES-10): at the four iPad sizes, visits the library, every
// game's start screen and first round, and the first question of every lesson
// of one grade, and reports:
//   - anything that scrolls on a game or lesson screen (nothing may, mid-round),
//     or runs past the screen: the shell clips what overflows, so a stage too
//     tall for the screen is cut off rather than scrolled;
//   - on the library, whether the next lesson and Luna's Pick show without
//     scrolling, and Play Rug titles that sit on their scenery;
//   - tap targets that overlap, are under their target role (48px chrome, 64px
//     an answer, `data-shot="lesson-choice"`), or sit in the 16px band at the
//     screen's sides and bottom. The header's buttons are left out: they sit
//     8px from the top, as on the boards. So is the bottom band on the
//     library, which scrolls: a card at the fold isn't hugging the edge.
//
//   node .claude/skills/know-how/layout-audit.mjs [port=5199] [grade=0|1|2]
//
// It needs Vite already running on the port (5199 is Claude's; 5173 is Alex's).
// Exits 1 on any problem outside a game's stage, or anything that scrolls
// mid-round. Problems inside the stage (`data-shot="stage"`: the games' and
// lessons' own pieces) and on the Play Rug are listed but don't fail: they
// belong to DES-21, DES-22b/c, DES-23 and GAME-3.

import puppeteer from 'puppeteer-core';

const port = process.argv[2] ?? '5199';
const grade = Number(process.argv[3] ?? 0);
const url = `http://localhost:${port}/`;
const SIZES = [
  [1180, 820],
  [820, 1180],
  [1024, 768],
  [744, 1133]
];
const at = n => `[data-shot="${n}"]`;
const wait = ms => new Promise(r => setTimeout(r, ms));

/** In the page: what this screen gets wrong, each marked as in the stage or not. */
function audit({ screen, midRound, scrolls = false }) {
  const W = innerWidth;
  const H = innerHeight;
  const name = el =>
    (el.getAttribute('data-shot') || el.getAttribute('aria-label') || el.textContent || el.tagName)
      .toString()
      .trim()
      .replace(/\s+/g, ' ')
      .slice(0, 28);
  const visible = el => {
    const b = el.getBoundingClientRect();
    const s = getComputedStyle(el);
    return b.width > 0 && b.height > 0 && s.visibility !== 'hidden' && b.bottom > 0 && b.top < H;
  };
  const inStage = el => Boolean(el.closest('[data-shot="stage"]'));
  const problems = [];
  const add = (el, text) => problems.push({ text, stage: el ? inStage(el) : false });

  if (midRound) {
    for (const el of document.querySelectorAll('*')) {
      const s = getComputedStyle(el);
      if (/(auto|scroll)/.test(s.overflowY) && el.scrollHeight > el.clientHeight + 1)
        problems.push({ text: `scrolls: ${name(el)} by ${el.scrollHeight - el.clientHeight}px`, stage: false, scroll: true });
    }
    if (document.scrollingElement.scrollHeight > H + 1)
      problems.push({ text: `scrolls: the page by ${document.scrollingElement.scrollHeight - H}px`, stage: false, scroll: true });
    const shown = ['shell-play', 'stage'].map(n => document.querySelector(`[data-shot="${n}"]`)).filter(Boolean);
    const taps = [...document.querySelectorAll('button, [role="button"]')].filter(visible);
    for (const el of [...shown, ...taps]) {
      const b = el.getBoundingClientRect();
      if (b.bottom > H + 1 || b.right > W + 1)
        // a game's own piece can come in from off screen (Bubble Sounds' bubbles rise from below)
        problems.push({ text: `cut off: ${name(el)} runs to ${Math.round(b.right)},${Math.round(b.bottom)}`, stage: el.matches('[data-shot="stage"]') ? false : inStage(el) });
    }
  }

  const taps = [...document.querySelectorAll('button, a[href], [role="button"], input, select')].filter(visible);
  for (const el of taps) {
    const b = el.getBoundingClientRect();
    const answer = el.matches('[data-shot="lesson-choice"]');
    const min = answer ? 64 : 48;
    if (b.width < min - 0.5 || b.height < min - 0.5)
      add(el, `small: ${name(el)} ${Math.round(b.width)}×${Math.round(b.height)}${answer ? ' (an answer)' : ''}`);
    // only what's wholly on screen: a list running off the bottom isn't hugging the edge
    if (!el.closest('header') && b.bottom <= H && (b.left < 16 || b.right > W - 16 || (!scrolls && b.bottom > H - 16)))
      add(el, `near the edge: ${name(el)} at ${Math.round(b.left)},${Math.round(b.top)}–${Math.round(b.right)},${Math.round(b.bottom)}`);
  }
  for (let i = 0; i < taps.length; i++)
    for (let j = i + 1; j < taps.length; j++) {
      if (taps[i].contains(taps[j]) || taps[j].contains(taps[i])) continue;
      const a = taps[i].getBoundingClientRect();
      const c = taps[j].getBoundingClientRect();
      if (Math.min(a.right, c.right) - Math.max(a.left, c.left) > 2 && Math.min(a.bottom, c.bottom) - Math.max(a.top, c.top) > 2)
        add(taps[i], `overlapping: ${name(taps[i])} × ${name(taps[j])}`);
    }
  return { screen, problems };
}

/** In the page: the library's first screenful, and the Play Rug's titles. */
function library() {
  const H = innerHeight;
  const header = document.querySelector('header')?.getBoundingClientRect().bottom ?? 0;
  const whole = el => {
    if (!el) return 'missing';
    const b = el.getBoundingClientRect();
    return b.top >= header - 1 && b.bottom <= H + 1 ? null : `cut off at ${Math.round(b.top)}–${Math.round(b.bottom)}`;
  };
  const pick = [...document.querySelectorAll('button')].find(b => b.textContent.includes('Luna’s Pick'));
  const rug = [...document.querySelectorAll('[data-shot="game-tile"]')]
    .filter(t => {
      const title = t.querySelector('[data-shot="tile-title"]').getBoundingClientRect();
      // the drawn pieces of the tile's scenery (its first child), not its whole box
      return [...t.firstElementChild.querySelectorAll('*')]
        .map(el => el.getBoundingClientRect())
        .some(p => p.width > 0 && Math.min(title.right, p.right) - Math.max(title.left, p.left) > 2 && Math.min(title.bottom, p.bottom) - Math.max(title.top, p.top) > 2);
    })
    .map(t => t.querySelector('[data-shot="tile-title"]').textContent.trim());
  return { nextLesson: whole(document.querySelector('[data-shot="lesson-tile"]')), lunasPick: whole(pick), rug };
}

const browser = await puppeteer.launch({
  executablePath: process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: true,
  args: ['--mute-audio', '--autoplay-policy=no-user-gesture-required']
});

let failing = 0;
for (const [width, height] of SIZES) {
  const page = await browser.newPage();
  await page.setViewport({ width, height, deviceScaleFactor: 1, hasTouch: true });
  // the macOS voice stays quiet if a line ever falls back to it
  await page.evaluateOnNewDocument(() => {
    window.speechSynthesis.speak = () => {};
  });
  await page.goto(url, { waitUntil: 'networkidle0' });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'networkidle0' });
  await page.click(at('open-reading'));
  await page.waitForSelector(at('grade-card'));
  await wait(500);
  await (await page.$$(at('grade-card')))[grade].click();
  await page.waitForSelector(at('hub'));
  await wait(900);

  const results = [await page.evaluate(audit, { screen: 'library', midRound: false, scrolls: true })];
  const lib = await page.evaluate(library);

  const open = async (shot, i) => {
    const el = (await page.$$(at(shot)))[i];
    await el.evaluate(e => e.scrollIntoView({ block: 'center' }));
    await el.click();
    await page.waitForSelector(at('shell-intro'));
    await wait(700);
  };
  const play = async () => {
    await page.click(at('play'));
    await page.waitForSelector(at('shell-play'));
    await wait(1200);
  };
  const back = async () => {
    await page.click(at('shell-back'));
    await page.waitForSelector(at('hub'));
    await wait(400);
  };

  const games = await page.$$eval(`${at('game-tile')} ${at('tile-title')}`, els => els.map(el => el.textContent.trim()));
  for (const [i, title] of games.entries()) {
    await open('game-tile', i);
    results.push(await page.evaluate(audit, { screen: `${title}, start`, midRound: false }));
    await play();
    results.push(await page.evaluate(audit, { screen: `${title}, round 1`, midRound: true }));
    await back();
  }
  const lessons = (await page.$$(at('lesson-tile'))).length;
  for (let i = 0; i < lessons; i++) {
    await open('lesson-tile', i);
    await play();
    results.push(await page.evaluate(audit, { screen: `Lesson ${i + 1}, question 1`, midRound: true }));
    await back();
  }

  console.log(`\n=== ${width}×${height}, grade ${['K', '1st', '2nd'][grade]}`);
  const libraryProblems = [lib.nextLesson && `next lesson ${lib.nextLesson}`, lib.lunasPick && `Luna's Pick ${lib.lunasPick}`].filter(Boolean);
  failing += libraryProblems.length;
  console.log(`${libraryProblems.length ? '❌' : '✅'} library: ${libraryProblems.join('; ') || "the next lesson and Luna's Pick show without scrolling"}`);
  if (lib.rug.length) console.log(`   (Play Rug, DES-21) titles on their scenery: ${lib.rug.join(', ')}`);
  for (const r of results) {
    const hard = r.problems.filter(p => !p.stage);
    const soft = r.problems.filter(p => p.stage);
    failing += hard.length;
    if (!hard.length && !soft.length) continue;
    console.log(`${hard.length ? '❌' : '  '} ${r.screen}`);
    for (const p of hard) console.log(`     ${p.text}`);
    for (const p of soft) console.log(`     (stage) ${p.text}`);
  }
  await page.close();
}
await browser.close();

console.log(
  failing
    ? `\n❌ ${failing} problem(s) outside the games' stages, or something scrolls mid-round.`
    : '\n✅ Outside the stages: no scrolling mid-round, no overlaps, no small or edge-hugging targets. (stage) lines are for DES-22b/c, DES-23 and GAME-3.'
);
process.exit(failing ? 1 : 0);
