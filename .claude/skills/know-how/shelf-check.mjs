#!/usr/bin/env node
// The squishy shelf (PRG-5a), played for real.
//
//   node .claude/skills/know-how/shelf-check.mjs [port=5199]
//
// Needs Vite running on the port. From a fresh save at Kindergarten:
//   - finishing Lesson 1 puts a squishy on the shelf: the done screen shows
//     "New squishy for your shelf", the squishy drawn (no emoji), and "See my
//     shelf" opens the shelf at "1 of 18" with that kind found and "New";
//   - finishing a game puts another there ("2 of 18"), and the game's done
//     screen shows the shelf on its right, the new one picked out "New"
//     (PRG-9), where a lesson's shows its lessons bar and no shelf;
//   - the library's Squishy Shelf card says "2 of 18 found", draws them, opens
//     the shelf, and "My trophies" is still beside it;
//   - on the shelf a found squishy says its line, one still to find its clue;
//   - no emoji on the home screen, the library, the shelf or the done screen;
//   - six kinds to a plank, the top of the arch a "?" that gives its line;
//   - a save with the 18 old stickers loads with 18 squishies, the same 8 kinds
//     they were before PRG-5b, so nobody's shelf is suddenly full;
//   - a full shelf: Pearl Moon at the top of the arch, with her own line, and a
//     kind found in super rare wears its look.
// The squishy data's own rules (the odds, old saves) are squishy-check.mjs.

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
await page.evaluateOnNewDocument(() => { window.speechSynthesis.speak = () => {}; });
await page.goto(`http://localhost:${port}/`, { waitUntil: 'networkidle0' });
await page.evaluate(() => localStorage.clear());
await page.reload({ waitUntil: 'networkidle0' });

/** every line Luna is asked to say, from the page's own speech module */
const hookSpeech = () => page.evaluate(async () => {
  const src = performance.getEntriesByType('resource').map(e => e.name).find(n => n.includes('/src/utils/pronunciation.ts')) ?? '/src/utils/pronunciation.ts';
  const { pronunciation } = await import(src);
  window.__said = window.__said ?? [];
  if (pronunciation.__hooked) return;
  pronunciation.__hooked = true;
  const say = pronunciation.say.bind(pronunciation);
  pronunciation.say = (req, text, o) => { window.__said.push(String(text)); return say(req, text, o); };
});
const emoji = sel => page.evaluate(s => {
  const el = document.querySelector(s);
  return el ? (el.innerText.match(/\p{Extended_Pictographic}/gu) ?? []).join('') : 'missing';
}, sel);
const round = () => page.evaluate(() => document.querySelector('[data-shot="round-pips"]')?.getAttribute('aria-label') ?? null);
const intoLibrary = async () => { await page.click(at('shell-back')); await page.waitForSelector(at('hub')); await wait(600); };

ok('no emoji on the home screen', (await emoji('body')) === '', await emoji('body'));
await page.click(at('open-reading'));
await page.waitForSelector(at('grade-card'));
await (await page.$$(at('grade-card')))[0].click();
await page.waitForSelector(at('hub'));
await wait(600);
await hookSpeech();

// ---- Lesson 1 ----
const open = async (kind, title) => {
  for (const t of await page.$$(at(kind))) if ((await t.evaluate(e => e.textContent)).includes(title)) { await t.click(); break; }
  await page.waitForSelector(at('play'));
  await page.click(at('play'));
  await page.waitForSelector(at('shell-play'));
};
await open('lesson-tile', 'First Letter Sounds');
for (let r = 0; r < 8 && !(await page.$(at('shell-reward'))); r++) {
  await page.waitForSelector(at('lesson-choice'));
  await wait(700);
  const now = await round();
  const right = await page.evaluate(() => {
    const el = document.querySelector('[data-shot="lesson-choice"]');
    const key = Object.keys(el).find(k => k.startsWith('__reactFiber'));
    for (let f = el[key]; f; f = f.return) {
      const list = f.memoizedProps?.question?.options;
      if (Array.isArray(list)) { const o = list.find(x => x.isCorrect ?? x.isRhyme); return o.letter ? `letter ${o.letter}` : o.text ?? o.word; }
    }
    return null;
  });
  await page.evaluate(l => [...document.querySelectorAll('[data-shot="lesson-choice"]')].find(e => (e.getAttribute('aria-label') ?? e.textContent).trim() === l)?.click(), right);
  for (let t = 0; t < 80 && !(await page.$(at('shell-reward'))) && (await round()) === now; t++) await wait(200);
}
await page.waitForSelector(at('shell-reward'), { timeout: 20000 });
await wait(1200);
const reward = await page.evaluate(() => {
  const panel = document.querySelector('[data-shot="done-squishy"]');
  return { text: panel?.innerText ?? '', drawn: Boolean(panel?.querySelector('svg')) };
});
ok('the done screen: "New squishy for your shelf", drawn', /new squishy for your shelf/i.test(reward.text) && reward.drawn, reward.text.replace(/\s+/g, ' '));
ok('no emoji on the done screen', (await emoji(at('shell-reward'))) === '', await emoji(at('shell-reward')));
ok('a lesson\'s done screen shows its lessons bar, and no shelf (PRG-9)', await page.evaluate(() => /your lessons/i.test(document.querySelector('[data-shot="shell-reward"]').innerText) && !document.querySelector('[data-shot="done-shelf"]')));
await page.click(at('see-shelf'));
await page.waitForSelector(at('shelf'), { timeout: 5000 }).catch(() => {});
const count1 = await page.$eval(at('shelf-count'), e => e.textContent.trim()).catch(() => 'no shelf');
ok('"See my shelf" opens it at 1 of 18, with "New"', count1 === '1 of 18' && (await page.evaluate(() => [...document.querySelectorAll('[data-shot="shelf-kind"]')].some(k => k.textContent.includes('New')))), count1);
const shelfKinds = await page.evaluate(() => [...document.querySelectorAll('[data-shot="shelf-kind"]')].map(k => ({
  found: !k.querySelector('[data-state~="ghost"], [data-state~="mystery"]'),
  dots: getComputedStyle(k.querySelector('[role="img"]')).visibility === 'visible'
})));
ok('as on the board, only a kind found shows its colour dots', shelfKinds.length === 18 && shelfKinds.every(k => k.dots === k.found), JSON.stringify(shelfKinds.filter(k => k.dots !== k.found)));
const shelfKey = await page.$eval(at('shelf'), e => e.textContent);
ok('the key says what a grey shape and a "?" slot mean', /an easy one, coming soon/.test(shelfKey) && /a hard one, a mystery/.test(shelfKey), shelfKey.slice(-160));
// six kinds a plank is tight on a small iPad: nothing scrolls, but one can still run off the end
const viewport = page.viewport();
for (const [width, height] of [[1180, 820], [820, 1180], [1024, 768], [744, 1133]]) {
  await page.setViewport({ width, height });
  await wait(300);
  const past = await page.evaluate(() => [...document.querySelectorAll('[data-shot="shelf-kind"]')].filter(k => {
    const plank = k.parentElement.nextElementSibling.getBoundingClientRect();
    const box = k.getBoundingClientRect();
    return box.left < plank.left - 1 || box.right > plank.right + 1;
  }).length);
  ok(`every kind stays on its plank at ${width}×${height}`, past === 0, `${past} past it`);
}
await page.setViewport(viewport);
await wait(300);
await page.click(at('shell-back'));
await page.waitForSelector(at('hub'));
await wait(600);

// ---- a game ----
await open('game-tile', 'Letter Cookies');
for (let r = 0; r < 8 && !(await page.$(at('shell-reward'))); r++) {
  await page.waitForSelector(at('cookie'));
  await wait(1000);
  const now = await round();
  const answer = await page.evaluate(() => {
    const el = document.querySelector('[data-shot="cookie"]');
    const key = Object.keys(el).find(k => k.startsWith('__reactFiber'));
    for (let f = el[key]; f; f = f.return) if (f.memoizedProps?.round?.answer) return f.memoizedProps.round.answer;
    return null;
  });
  await page.evaluate(a => document.querySelector(`[data-shot="cookie"][aria-label="letter ${a}"]`)?.click(), answer);
  for (let t = 0; t < 80 && !(await page.$(at('shell-reward'))) && (await round()) === now; t++) await wait(200);
}
await page.waitForSelector(at('shell-reward'), { timeout: 20000 });
await wait(1500);
const gameShelf = await page.evaluate(() => {
  const s = document.querySelector('[data-shot="done-shelf"]');
  return {
    text: s?.innerText.replace(/\s+/g, ' ') ?? 'no shelf',
    kinds: s ? s.querySelectorAll('[data-shot="shelf-kind"]').length : 0,
    newOn: [...(s?.querySelectorAll('[data-shot="shelf-kind"]') ?? [])].find(k => k.textContent.includes('New'))?.querySelector('button')?.getAttribute('aria-label') ?? ''
  };
});
ok('a game\'s done screen shows the shelf, 2 of 18, the new one picked out (PRG-9)', /2 of 18/i.test(gameShelf.text) && gameShelf.kinds === 18 && /bear/i.test(gameShelf.newOn), `${gameShelf.text}; New on ${gameShelf.newOn}`);
await intoLibrary();

// ---- the library's card ----
const card = await page.evaluate(() => {
  const c = document.querySelector('[data-shot="hub-tin"]');
  return { text: c?.innerText ?? '', drawn: c ? c.querySelectorAll('svg').length : 0, trophies: Boolean(document.querySelector('[data-shot="open-trophies"]')) };
});
ok('the library card: "2 of 18 found", drawn; the header\'s stars still open the trophies', /2 of 18/.test(card.text) && card.drawn >= 2 && card.trophies, card.text.replace(/\s+/g, ' '));
ok('no emoji on the library', (await emoji(at('hub'))) === '', await emoji(at('hub')));
await page.click(at('open-shelf'));
await page.waitForSelector(at('shelf'));
await wait(400);
ok('the card opens the shelf at 2 of 18', (await page.$eval(at('shelf-count'), e => e.textContent.trim())) === '2 of 18');
ok('no emoji on the shelf', (await emoji(at('shelf'))) === '', await emoji(at('shelf')));

// ---- taps on the shelf ----
const lines = await page.evaluate(async () => {
  const { SQUISHY_KINDS } = await import('/src/apps/reading/engine/squishies.ts');
  return SQUISHY_KINDS.map(k => ({ name: k.name, line: k.line, hint: k.hint }));
});
const kinds = await page.$$(`${at('shelf-kind')} button`);
const labels = await Promise.all(kinds.map(k => k.evaluate(e => e.getAttribute('aria-label'))));
const foundAt = labels.findIndex(l => l && !l.startsWith('Not found'));
const missingAt = labels.findIndex(l => l && l.startsWith('Not found'));
await page.evaluate(() => { window.__said = []; });
await kinds[foundAt].click();
await wait(500);
let said = await page.evaluate(() => window.__said.slice());
ok('a found squishy says its line', lines.some(l => said.includes(l.line)), said.join(' | '));
await page.evaluate(() => { window.__said = []; });
await kinds[missingAt].click();
await wait(500);
said = await page.evaluate(() => window.__said.slice());
ok('one still to find gives its clue', lines.some(l => said.includes(l.hint)), said.join(' | '));
const planks = await page.evaluate(() => {
  const tops = [...document.querySelectorAll('[data-shot="shelf-kind"]')].map(k => Math.round(k.parentElement.getBoundingClientRect().top));
  return Object.values(tops.reduce((n, t) => ({ ...n, [t]: (n[t] ?? 0) + 1 }), {}));
});
ok('six kinds to a plank, three planks', planks.length === 3 && planks.every(n => n === 6), planks.join(', '));
const shelfLines = await page.evaluate(async () => (await import('/src/apps/reading/engine/squishies.ts')).SHELF_LINES);
await page.evaluate(() => { window.__said = []; });
const special = await page.$('button[aria-label="Something special"]');
ok('the top of the arch is a "?" before the shelf is full', Boolean(special) && (await special.evaluate(b => b.textContent.trim())) === '?');
await special.click();
await wait(500);
said = await page.evaluate(() => window.__said.slice());
ok('its line says something special will live there', said.includes(shelfLines.top), said.join(' | '));

// ---- an old save ----
await page.evaluate(key => {
  const saved = JSON.parse(localStorage.getItem(key));
  saved.stickers = ['magnifier', 'jar', 'bubble', 'cookie', 'cards', 'quill', 'lamp', 'headphones', 'chest', 'basket', 'book', 'moon', 'star', 'leaf', 'cat', 'rainbow', 'cupcake', 'crown'];
  localStorage.setItem(key, JSON.stringify(saved));
}, KEY);
await page.reload({ waitUntil: 'networkidle0' });
await page.click(at('open-reading'));
await page.waitForSelector(at('hub'));
await wait(600);
const saved = await page.evaluate(async () => {
  const src = performance.getEntriesByType('resource').map(e => e.name).find(n => n.includes('/src/utils/storage.ts')) ?? '/src/utils/storage.ts';
  const { storageService } = await import(src);
  return storageService.getProgress().stickers;
});
const hub = await page.evaluate(() => document.querySelector('[data-shot="hub-tin"]')?.innerText ?? '');
ok('18 old stickers load as 18 squishies, the same 8 kinds as before', saved.length === 18 && saved.every(s => s.includes(':')) && /8 of 18/.test(hub), `${saved.length}; ${hub.replace(/\s+/g, ' ')}`);

// ---- a full shelf ----
await page.evaluate(async key => {
  const { SQUISHY_KINDS } = await import('/src/apps/reading/engine/squishies.ts');
  const saved = JSON.parse(localStorage.getItem(key));
  saved.stickers = [...SQUISHY_KINDS.map(k => `${k.kind}:${k.usual}`), 'moon:honey', 'cloud:honey', 'heart:honey', 'cat:honey'];
  localStorage.setItem(key, JSON.stringify(saved));
}, KEY);
await page.reload({ waitUntil: 'networkidle0' });
await page.click(at('open-reading'));
await page.waitForSelector(at('hub'));
await page.click(at('open-shelf'));
await page.waitForSelector(at('shelf'));
await wait(400);
await hookSpeech();
ok('a full shelf says 18 of 18', (await page.$eval(at('shelf-count'), e => e.textContent.trim())) === '18 of 18');
const pearl = await page.$('button[aria-label="Pearl Moon"]');
ok('Pearl Moon sits at the top of a full shelf, drawn', Boolean(pearl) && (await pearl.evaluate(b => Boolean(b.querySelector('svg')))));
ok('no "?" left at the top', !(await page.$('button[aria-label="Something special"]')));
await page.evaluate(() => { window.__said = []; });
await pearl.click();
await wait(500);
said = await page.evaluate(() => window.__said.slice());
ok('she has her own line', said.includes(shelfLines.pearl), said.join(' | '));
const looks = await page.evaluate(() => Object.fromEntries(['Little Moon', 'Cloud', 'Heart', 'Mochi Cat'].map(n => [n, document.querySelector(`button[aria-label^="${n},"]`)?.getAttribute('aria-label')])));
ok('a kind found in super rare wears its look', looks['Little Moon'] === 'Little Moon, swirl' && looks.Cloud === 'Cloud, shimmer' && looks.Heart === 'Heart, glow' && looks['Mochi Cat'] === 'Mochi Cat, glow', JSON.stringify(looks));

await browser.close();
const passed = results.every(Boolean);
console.log(passed ? '\nALL PASS' : '\nSOME FAILED');
process.exit(passed ? 0 : 1);
