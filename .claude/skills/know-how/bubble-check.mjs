#!/usr/bin/env node
// Bubble Sounds' bubbles (GAME-3): smooth and fair.
//
//   node .claude/skills/know-how/bubble-check.mjs [port=5199]
//
// Needs Vite running on the port. At kindergarten and 2nd grade, at the
// widest and the narrowest iPad, it watches the water for 20 s, sampling every
// frame, and checks:
//   - no two bubbles ever overlap;
//   - every bubble stays inside the water (none cut off at the bottom or top);
//   - a bubble with the round's sound is on screen at every moment;
//   - the bubbles move without a React update per frame: React commits only
//     when a bubble comes or goes (under 120 in 20 s; counted by a stub of its
//     devtools hook), while the bubbles themselves move every frame;
//   - (GAME-7) the answer is clearly fewer of the bubbles than the about half
//     it was: at the default dial (tier 1 at K, aiming at 1 in 3; tier 3 at
//     2nd, aiming at 1 in 5), no more than 12 points over the aim, the most
//     `bubble-share-sim.mjs` finds in any 20 s stretch.
// On a phone (DES-32a): taps aren't held for a double-tap zoom, a bubble pops
// as a finger lands on it, one tap counts once, and Enter still pops one.
// It fails on the commit before GAME-3, where bubbles moved by a state update
// every 60 ms, could overlap and hide one another, and about half were the
// answer.

import puppeteer from 'puppeteer-core';
import { chromePath } from '../../../scripts/chrome-path.cjs';

const port = process.argv.find(a => /^\d+$/.test(a)) ?? '5199';
const at = n => `[data-shot="${n}"]`;
const wait = ms => new Promise(r => setTimeout(r, ms));
const results = [];
const ok = (name, pass, detail = '') => { results.push(pass); console.log(`${pass ? '✅' : '❌'} ${name}${detail ? `  (${detail})` : ''}`); };

const browser = await puppeteer.launch({ executablePath: chromePath(), headless: true, args: ['--mute-audio'] });

for (const [w, h] of [[1180, 820], [744, 1133]]) {
  for (const grade of [0, 2]) {
    const page = await browser.newPage();
    await page.setViewport({ width: w, height: h });
    await page.evaluateOnNewDocument(() => {
      window.speechSynthesis.speak = () => {};
      // React reports every commit to its devtools hook: a stub counts them
      window.__commits = 0;
      window.__REACT_DEVTOOLS_GLOBAL_HOOK__ = {
        supportsFiber: true,
        isDisabled: false,
        renderers: new Map(),
        inject: () => 1,
        checkDCE: () => {},
        onScheduleFiberRoot: () => {},
        onCommitFiberRoot: () => { window.__commits += 1; },
        onCommitFiberUnmount: () => {},
        onPostCommitFiberRoot: () => {}
      };
    });
    await page.goto(`http://localhost:${port}/`, { waitUntil: 'networkidle0' });
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: 'networkidle0' });
    await page.click(at('open-reading'));
    await page.waitForSelector(at('grade-card'));
    await (await page.$$(at('grade-card')))[grade].click();
    await page.waitForSelector(at('hub'));
    for (const t of await page.$$(at('game-tile'))) {
      if ((await t.evaluate(e => e.textContent)).includes('Bubble Sounds')) { await t.click(); break; }
    }
    await page.waitForSelector(at('play'));
    await page.click(at('play'));
    await page.waitForSelector('[aria-label^="bubble "]');
    await wait(1500);

    const r = await page.evaluate(() => new Promise(done => {
      const first = document.querySelector('[aria-label^="bubble "]');
      const tank = first.parentElement.parentElement;
      // the round's sound, from the game's props
      const key = Object.keys(first).find(k => k.startsWith('__reactFiber'));
      let target = null;
      for (let f = first[key]; f; f = f.return) if (f.memoizedProps?.round?.letter) { target = f.memoizedProps.round.letter.letter; break; }
      let frames = 0, overlaps = 0, outside = 0, noTarget = 0, moves = 0, childChanges = 0, seen = 0, answers = 0;
      const where = new Map();
      const observer = new MutationObserver(list => { childChanges += list.filter(m => m.type === 'childList').length; });
      observer.observe(tank, { childList: true });
      const t0 = performance.now();
      const commits0 = window.__commits;
      const sample = () => {
        frames += 1;
        const water = tank.getBoundingClientRect();
        const live = [...tank.querySelectorAll('[aria-label^="bubble "]')].filter(b => !b.getAttribute('data-state')?.match(/right|wrong/));
        const boxes = live.map(b => b.getBoundingClientRect());
        for (let i = 0; i < boxes.length; i++) {
          const a = boxes[i];
          if (a.top < water.top - 1 || a.bottom > water.bottom + 1 || a.left < water.left - 1 || a.right > water.right + 1) outside += 1;
          for (let j = i + 1; j < boxes.length; j++) {
            const b = boxes[j];
            if (a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom) overlaps += 1;
          }
          const was = where.get(live[i]);
          if (was !== undefined && was !== a.top) moves += 1;
          where.set(live[i], a.top);
        }
        if (!live.some(b => b.getAttribute('aria-label') === `bubble ${target}`)) noTarget += 1;
        seen += live.length;
        answers += live.filter(b => b.getAttribute('aria-label') === `bubble ${target}`).length;
        if (performance.now() - t0 < 20000) requestAnimationFrame(sample);
        else { observer.disconnect(); done({ target, frames, overlaps, outside, noTarget, moves, childChanges, commits: window.__commits - commits0, seen, answers }); }
      };
      requestAnimationFrame(sample);
    }));
    const where = `${w}×${h}, ${['K', '', '2nd'][grade]}`;
    ok(`${where}: no two bubbles overlap`, r.overlaps === 0, `${r.overlaps} overlapping in ${r.frames} frames`);
    ok(`${where}: every bubble stays in the water`, r.outside === 0, `${r.outside} outside`);
    ok(`${where}: a "${r.target}" bubble is always on screen`, r.noTarget === 0, `${r.noTarget} frames without one`);
    ok(`${where}: they move every frame, React only when one comes or goes`, r.moves > r.frames && r.commits < 120, `${r.moves} moves, ${r.commits} React commits in 20 s`);
    const aim = grade === 0 ? 1 / 3 : 1 / 5;
    ok(`${where}: the answer is clearly fewer of the bubbles (GAME-7)`, r.answers / r.seen <= aim + 0.12, `${Math.round((r.answers / r.seen) * 100)}% of those on screen, aim ${Math.round(aim * 100)}%`);
    await page.close();
  }
}

// ── on a phone (DES-32a): a bubble pops as a finger lands on it ──
// Safari on a phone (the page laid out wider than the screen) held a tap's
// click until the bubble had risen from under the finger, then dropped it.
// So a bubble pops on the pointer going down, and its click is the
// keyboard's alone. Chrome doesn't hold taps, so the check is the finger
// down with no lift yet: the old onClick never saw that.
{
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 660, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  await page.evaluateOnNewDocument(() => { window.speechSynthesis.speak = () => {}; });
  await page.goto(`http://localhost:${port}/`, { waitUntil: 'networkidle0' });
  await page.evaluate(() => { localStorage.clear(); localStorage.setItem('ms_luna_learning_progress_v1', JSON.stringify({ selectedGrade: 'kindergarten', completedLessons: [] })); });
  await page.reload({ waitUntil: 'networkidle0' });
  await page.click(at('open-reading'));
  await page.waitForSelector(at('hub'));
  for (const t of await page.$$(at('game-tile'))) {
    if ((await t.evaluate(e => e.textContent)).includes('Bubble Sounds')) { await t.evaluate(e => e.click()); break; }
  }
  await page.waitForSelector(at('play'));
  await page.click(at('play'));
  await page.waitForSelector('[aria-label^="bubble "]');
  await wait(2000);
  // a bubble of the round's sound, well inside the water; and the tally
  const aim = () => page.evaluate(() => {
    const first = document.querySelector('[aria-label^="bubble "]');
    const key = Object.keys(first).find(k => k.startsWith('__reactFiber'));
    let target = null;
    for (let f = first[key]; f; f = f.return) if (f.memoizedProps?.round?.letter) { target = f.memoizedProps.round.letter.letter; break; }
    const b = [...document.querySelectorAll(`[aria-label="bubble ${target}"]`)].find(e => !e.dataset.state && parseFloat(getComputedStyle(e.parentElement).opacity) > 0.9);
    if (!b) return null;
    b.dataset.aim = String(performance.now());
    const r = b.getBoundingClientRect();
    return { x: r.x + r.width / 2, y: r.y + r.height / 2, id: b.dataset.aim, action: getComputedStyle(b).touchAction };
  });
  const tally = () => page.evaluate(() => Number(document.querySelector('[aria-label$=" popped"]')?.getAttribute('aria-label').match(/^\d+/)?.[0] ?? -1));
  const stateOf = id => page.evaluate(id => document.querySelector(`[data-aim="${id}"]`)?.dataset.state ?? 'none', id);
  const cdp = await page.createCDPSession();

  const one = await aim();
  ok('phone: taps aren\'t held for a double-tap zoom (touch-action)', one?.action === 'manipulation', one?.action);
  const before = await tally();
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: one.x, y: one.y }] });
  await wait(150);
  const downState = await stateOf(one.id);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await wait(400);
  ok('phone: a bubble pops as the finger lands, before it lifts', downState === 'right', `state while held: ${downState}`);
  ok('… and one tap counts once', (await tally()) === before + 1, `${before} → ${await tally()} popped`);

  const two = await aim();
  await page.evaluate(id => document.querySelector(`[data-aim="${id}"]`).focus(), two.id);
  const beforeKey = await tally();
  await page.keyboard.press('Enter');
  await wait(400);
  ok('… and Enter still pops a bubble, once', (await stateOf(two.id)) === 'right' && (await tally()) === beforeKey + 1, `${beforeKey} → ${await tally()}`);
  await page.close();
}

await browser.close();
const passed = results.every(Boolean);
console.log(passed ? '\nALL PASS' : '\nSOME FAILED');
process.exit(passed ? 0 : 1);
