#!/usr/bin/env node
// Luna's perch and the shell's flash, in a real game (DES-22a).
//
//   node .claude/skills/know-how/perch-check.mjs [port=5199]
//
// Needs Vite running on the port. In a muted Chrome it plays Feed Luna (the
// game with its own Luna on the stage) at Kindergarten and checks:
//   - the start screen: one Luna, on the perch, her bubble with a tail, and
//     the mission said;
//   - in play: one Luna, on the stage; the perch's bubble has no tail, and a
//     tap on its line says the line again (a clip plays);
//   - a wrong cookie turns the stage's edge the try-again colour, and from
//     the second miss "Hear my clue" shows; a tap on it says the hint;
//   - the right cookie turns the edge the right colour, pops the win
//     sparkle (data-shot="win-veil") and takes "Hear my clue" away;
//   - played to the end, a game's done screen (DES-22d) says "All done!",
//     has no lessons bar, offers "Another game", and its header is the
//     game's name alone;
//   - nothing falls back to the browser voice.
// Lines are matched by what was said (clip labels stick; know-how), and
// clips are counted.

import puppeteer from 'puppeteer-core';
import { chromePath } from '../../../scripts/chrome-path.cjs';

const port = process.argv[2] ?? '5199';
const at = n => `[data-shot="${n}"]`;
const wait = ms => new Promise(r => setTimeout(r, ms));
const results = [];
const ok = (name, pass, detail = '') => {
  results.push(pass);
  console.log(`${pass ? '✅' : '❌'} ${name}${detail ? `  (${detail})` : ''}`);
};

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
  // every value the stage's data-flash takes, as it happens (a miss clears in 500ms)
  window.__flashes = [];
  new MutationObserver(list => {
    for (const m of list) {
      const v = m.target.getAttribute?.('data-flash');
      // the edge is read once its colour change has run (--dur-quick)
      if (m.attributeName === 'data-flash' && v) {
        const f = { v, edge: null };
        window.__flashes.push(f);
        setTimeout(() => { f.edge = getComputedStyle(m.target).borderTopColor; }, 300);
      }
    }
  }).observe(document, { subtree: true, attributes: true, attributeFilter: ['data-flash'] });
});

await page.goto(`http://localhost:${port}/`, { waitUntil: 'networkidle0' });
await page.evaluate(() => localStorage.clear());
await page.reload({ waitUntil: 'networkidle0' });
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
const role = name => page.evaluate(n => {
  const p = document.createElement('span');
  p.style.color = `var(--${n})`;
  document.body.append(p);
  const c = getComputedStyle(p).color;
  p.remove();
  return c;
}, name);
const step = async (act, ms) => {
  const before = await page.evaluate(() => ({ said: window.__said.length, starts: window.__starts }));
  await act();
  await wait(ms);
  const after = await page.evaluate(() => ({ said: window.__said.slice(), starts: window.__starts }));
  return { said: after.said.slice(before.said), clips: after.starts - before.starts };
};

// into Feed Luna, at Kindergarten
await page.click(at('open-reading'));
await page.waitForSelector(at('grade-card'));
await page.click(at('grade-card'));
await page.waitForSelector(at('hub'));
const tiles = await page.$$(at('game-tile'));
let feed = null;
for (const t of tiles) if ((await t.evaluate(e => e.textContent)).includes('Feed Luna')) feed = t;
const intro = await step(async () => {
  await feed.click();
  await page.waitForSelector(at('shell-intro'));
}, 3000);

// the start screen
const start = await page.evaluate(() => {
  const shell = document.querySelector('[data-shot="shell-intro"]');
  const lunas = [...shell.querySelectorAll('[data-mood]')];
  return {
    lunas: lunas.length,
    onPerch: lunas.every(l => !l.closest('[data-tint]')),
    tail: Boolean(shell.querySelector('[data-variant="left"]')),
    line: shell.querySelector('[data-variant] p')?.textContent ?? ''
  };
});
ok('start screen: one Luna, on the perch', start.lunas === 1 && start.onPerch, `${start.lunas}`);
ok('… her bubble has a tail', start.tail);
ok('… and she says the mission', intro.said.some(t => start.line.replace(/…/g, '...').startsWith(t.slice(0, 12))), intro.said.join(' | '));

// in play
await page.click(at('play'));
await page.waitForSelector(at('stage'));
await wait(3000);
const play = await page.evaluate(() => {
  const lunas = [...document.querySelectorAll('[data-mood]')];
  const bare = document.querySelector('[data-variant="none"]');
  return {
    lunas: lunas.length,
    onStage: lunas.every(l => l.closest('[data-shot="stage"]')),
    bare: Boolean(bare) && bare.children.length === 1,
    line: document.querySelector('button[aria-label^="Hear Ms. Luna again"]')?.textContent ?? ''
  };
});
ok('in play: one Luna, on the stage', play.lunas === 1 && play.onStage, `${play.lunas}`);
ok('… the perch\'s bubble has no tail', play.bare);
const again = await step(() => page.click('button[aria-label^="Hear Ms. Luna again"]'), 3500);
const norm = t => t.toLowerCase().replace(/[^a-z ]/g, '');
ok('… a tap on her line says it again', again.said.some(t => norm(play.line).startsWith(norm(t).slice(0, 10))) && again.clips > 0, `${again.said.join(' | ')}; ${again.clips} clip(s)`);

// miss twice (cookies are tried in turn; a right one wins the round, so try the next round's)
const tryAgain = await role('try-again-edge');
const right = await role('right');
let misses = 0;
let clue = null;
for (let tries = 0; tries < 12 && !clue; tries++) {
  const cookies = await page.$$('[data-shot="stage"] button[aria-label^="letter"]');
  if (!cookies.length) { await wait(500); continue; }
  const pick = cookies[misses % cookies.length];
  const n = await page.evaluate(() => window.__flashes.length);
  await pick.click();
  for (let t = 0; t < 80 && (await page.evaluate(() => window.__flashes.length)) === n; t++) await wait(50);
  await wait(400);
  const f = await page.evaluate(() => window.__flashes.at(-1));
  if (f?.v === 'miss') misses += 1;
  else misses = 0;
  await wait(1500);
  clue = await page.evaluateHandle(() => [...document.querySelectorAll('button')].find(b => b.textContent.trim() === 'Hear my clue')).then(h => h.asElement());
}
const flashes = await page.evaluate(() => window.__flashes);
const miss = flashes.find(f => f.v === 'miss');
ok('a miss turns the stage\'s edge the try-again colour', miss?.edge === tryAgain, `${miss?.edge} vs ${tryAgain}`);
ok('from the second miss, "Hear my clue" shows', Boolean(clue));
if (clue) {
  const hint = await step(() => clue.click(), 4000);
  ok('… and a tap on it says the hint', hint.said.length > 0 && hint.clips > 0, `${hint.said.join(' | ')}; ${hint.clips} clip(s)`);
}

// win a round: try every cookie until the edge turns right
let won = null;
for (let tries = 0; tries < 12 && !won; tries++) {
  const cookies = await page.$$('[data-shot="stage"] button[aria-label^="letter"]');
  for (const c of cookies) {
    const n = await page.evaluate(() => window.__flashes.length);
    await c.click().catch(() => {});
    for (let t = 0; t < 80 && (await page.evaluate(() => window.__flashes.length)) === n; t++) await wait(50);
    await wait(400);
    const f = await page.evaluate(() => window.__flashes.at(-1));
    if (f?.v === 'win') {
      won = {
        edge: f.edge,
        veil: await page.$(at('win-veil')).then(Boolean),
        clue: await page.evaluate(() => [...document.querySelectorAll('button')].some(b => b.textContent.trim() === 'Hear my clue'))
      };
      break;
    }
    await wait(1500);
  }
}
ok('a win turns the stage\'s edge the right colour', won?.edge === right, `${won?.edge} vs ${right}`);
ok('… and pops the win sparkle', Boolean(won?.veil));
ok('… and "Hear my clue" goes once the round is won, as on the board', won?.clue === false);
// play on to the done screen: every cookie in turn, round after round
for (let tries = 0; tries < 40 && !(await page.$(at('shell-reward'))); tries++) {
  const cookies = await page.$$('[data-shot="stage"] button[aria-label^="letter"]');
  for (const c of cookies) {
    if (await page.$(at('shell-reward'))) break;
    await c.click().catch(() => {});
    await wait(2200);
  }
}
await wait(1200);
const done = await page.evaluate(() => {
  const r = document.querySelector('[data-shot="shell-reward"]');
  return r && {
    title: r.querySelector('h2')?.textContent.trim(),
    header: document.querySelector('header h1')?.textContent.trim(),
    lessons: Boolean(r.querySelector('[role="progressbar"]')) || /your lessons/i.test(r.textContent),
    another: [...r.querySelectorAll('button')].some(b => b.textContent.trim() === 'Another game')
  };
});
ok('a game\'s done screen: "All done!", no lessons bar, "Another game", the game\'s name in the header',
  done?.title === 'All done!' && !done.lessons && done.another && done.header === 'Feed Luna the Letter', JSON.stringify(done));
ok('nothing fell back to the browser voice', (await page.evaluate(() => window.__browserSpoke.length)) === 0);

await browser.close();
console.log(results.every(Boolean) ? '\nALL PASS' : '\nSOME FAILED');
process.exit(results.every(Boolean) ? 0 : 1);
