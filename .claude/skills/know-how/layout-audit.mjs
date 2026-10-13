#!/usr/bin/env node
// The layout audit (DES-10): at the four iPad sizes, visits Grade Select
// (DES-9c), the library, every game's start screen and first round, the
// first question of every lesson of one grade, and Lesson 1's done screen,
// played through (DES-22d), and reports:
//   - more than one owl on a screen: the kit's Luna and owl emoji (DES-12);
//   - anything that scrolls on a game or lesson screen (nothing may, mid-round),
//     or runs past the screen: the shell clips what overflows, so a stage too
//     tall for the screen is cut off rather than scrolled;
//   - on the library, whether the next lesson and Luna's Pick show without
//     scrolling, and Play Shelf titles that sit on their pictures (since
//     DES-21 a failure: every game is a kit Tile, its name under its picture);
//   - tap targets that overlap, are under their target role (48px chrome, 64px
//     an answer, `data-shot="lesson-choice"`), or sit in the 16px band at the
//     screen's sides and bottom. The header's buttons are left out: they sit
//     8px from the top, as on the boards. So is the bottom band on the
//     library, which scrolls: a card at the fold isn't hugging the edge.
// Lessons open in order (PRG-7), so before the lessons it marks every lesson
// of the grade done, which keeps them all open.
//
//   node .claude/skills/know-how/layout-audit.mjs [port=5199] [grade=0|1|2]
//
// It needs Vite already running on the port (5199 is Claude's; 5173 is Alex's).
// Exits 1 on any problem outside a game's stage, or anything that scrolls
// mid-round. Problems inside the stage (`data-shot="stage"`: the games' and
// lessons' own pieces) are listed but don't fail: they belong to DES-22b/c,
// DES-23 and GAME-3.

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
    const shown = ['shell-play', 'stage', 'shell-reward'].map(n => document.querySelector(`[data-shot="${n}"]`)).filter(Boolean);
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

  // one Luna per screen (DES-12): the kit's Luna (her root carries data-mood),
  // and any owl emoji, which a child reads as her too
  const lunas = [...document.querySelectorAll('[data-mood]')].filter(visible).length;
  const owls = (document.body.innerText.match(/🦉/gu) ?? []).length;
  if (lunas + owls > 1) problems.push({ text: `two owls: ${lunas} Luna${lunas === 1 ? '' : 's'} and ${owls} owl emoji`, stage: false });
  return { screen, problems };
}

/** In the page: the library's first screenful, and the Play Shelf's titles. */
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
  const results = [await page.evaluate(audit, { screen: 'Grade Select', midRound: false })];
  await (await page.$$(at('grade-card')))[grade].click();
  await page.waitForSelector(at('hub'));
  await wait(900);

  results.push(await page.evaluate(audit, { screen: 'library', midRound: false, scrolls: true }));
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
  // Lessons open in order (PRG-7), so a fresh save opens only the first. Mark
  // every lesson of this grade done (done lessons stay open), then come back
  // in from home, so each one can be visited.
  await page.evaluate(async g => {
    const { lessonsFor } = await import('/src/apps/reading/engine/lessons.ts');
    const key = 'ms_luna_learning_progress_v1';
    const saved = JSON.parse(localStorage.getItem(key));
    saved.completedLessons = lessonsFor(['kindergarten', 'grade1', 'grade2'][g]).map(l => l.lesson.id);
    localStorage.setItem(key, JSON.stringify(saved));
  }, grade);
  await page.reload({ waitUntil: 'networkidle0' });
  await page.click(at('open-reading'));
  await page.waitForSelector(at('hub'));
  await wait(400);
  const lessons = (await page.$$(at('lesson-tile'))).length;
  const locked = await page.$$eval(`${at('lesson-tile')}[data-state~="locked"]`, els => els.length);
  if (locked) throw new Error(`${locked} lesson(s) still locked after marking every lesson done`);
  for (let i = 0; i < lessons; i++) {
    await open('lesson-tile', i);
    await play();
    results.push(await page.evaluate(audit, { screen: `Lesson ${i + 1}, question 1`, midRound: true }));
    await back();
  }

  // the done screen (DES-22d): Lesson 1 played through, each choice tried in
  // turn until the round moves on (as lesson-order-check.mjs does)
  await open('lesson-tile', 0);
  await play();
  const shownNow = sel => page.evaluate(q => !!document.querySelector(q), sel);
  const round = () => page.evaluate(() => document.querySelector('[data-shot="round-pips"]')?.getAttribute('aria-label') ?? null);
  for (let guard = 0; guard < 40 && !(await shownNow(at('shell-reward'))); guard++) {
    const now = await round();
    const count = (await page.$$(at('lesson-choice'))).length;
    let moved = false;
    for (let c = 0; c < count && !moved; c++) {
      const choice = (await page.$$(at('lesson-choice')))[c];
      if (!choice) break;
      await choice.click().catch(() => {});
      for (let t = 0; t < 40 && !moved; t++) {
        await wait(200);
        moved = (await shownNow(`${at('win-veil')}, ${at('shell-reward')}`)) || (await round()) !== now;
      }
    }
    for (let t = 0; t < 60 && !(await shownNow(at('shell-reward'))) && (await round()) === now; t++) await wait(200);
  }
  await wait(1500);
  results.push(
    (await shownNow(at('shell-reward')))
      ? await page.evaluate(audit, { screen: 'Lesson 1, done screen', midRound: true })
      : { screen: 'Lesson 1, done screen', problems: [{ text: 'never reached it', stage: false }] }
  );

  console.log(`\n=== ${width}×${height}, grade ${['K', '1st', '2nd'][grade]}`);
  const libraryProblems = [
    lib.nextLesson && `next lesson ${lib.nextLesson}`,
    lib.lunasPick && `Luna's Pick ${lib.lunasPick}`,
    lib.rug.length && `Play Shelf titles on their pictures: ${lib.rug.join(', ')}`
  ].filter(Boolean);
  failing += libraryProblems.length;
  console.log(`${libraryProblems.length ? '❌' : '✅'} library: ${libraryProblems.join('; ') || "the next lesson and Luna's Pick show without scrolling"}`);
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
    : '\n✅ Outside the stages: no scrolling mid-round, no overlaps, no small or edge-hugging targets, and one Luna per screen. (stage) lines are for DES-22b/c, DES-23 and GAME-3.'
);
process.exit(failing ? 1 : 0);
