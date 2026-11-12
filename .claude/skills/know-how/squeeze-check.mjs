#!/usr/bin/env node
// Does a squishy say its line on the first squeeze only? (BUG-30)
//
//   node .claude/skills/know-how/squeeze-check.mjs [port=5199]
//
// Needs Vite running on the port. Alex (2026-11-11): squeezing a squishy again
// and again said its line every time, "which sounds like too much". With a
// save holding Mochi Cat, Squish Ball and Bear, in a muted Chrome that counts
// Luna's clips (AudioBufferSourceNode starts; the pops are oscillators) and
// logs what she says, it squeezes, 1.8s apart:
//   - the library's Squishy Shelf card: Mochi Cat 3 times, then Squish Ball;
//   - Luna's Squishy Shelf: Mochi Cat 3 times, a squishy still to find 3
//     times (its clue), then Squish Ball;
//   - after leaving the shelf: the library's Mochi Cat, then the shelf's again;
//   - a game's done screen (Letter Cookies, played through): the new squishy
//     3 times, then Mochi Cat on its shelf 3 times.
// Every squeeze must squish (or wobble, one still to find); the first squeeze
// of each says its line (or clue) with a clip, the later ones play nothing,
// and coming back to a screen, the first squeeze says it again. Nothing may
// fall back to the browser's voice. It fails on the commit before BUG-30,
// where every squeeze spoke.

import puppeteer from 'puppeteer-core';
import { chromePath } from '../../../scripts/chrome-path.cjs';

const port = process.argv.find(a => /^\d{4,}$/.test(a)) ?? '5199';
const at = n => `[data-shot="${n}"]`;
const wait = ms => new Promise(r => setTimeout(r, ms));
const results = [];
const ok = (name, pass, detail = '') => { results.push(pass); console.log(`${pass ? '✅' : '❌'} ${name}${detail ? `  (${detail})` : ''}`); };
const OWNED = ['cat:caramel', 'ball:oat', 'bear:toffee'];

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
});

await page.goto(`http://localhost:${port}/`, { waitUntil: 'networkidle0' });
await page.evaluate(owned => {
  localStorage.clear();
  localStorage.setItem('ms_luna_learning_progress_v1', JSON.stringify({ selectedGrade: 'kindergarten', stickers: owned }));
}, OWNED);
await page.reload({ waitUntil: 'networkidle0' });
// wrap the clip player the page actually loaded (a hot-reloaded copy has ?t=)
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
const kinds = await page.evaluate(async () => {
  const { SQUISHY_KINDS } = await import('/src/apps/reading/engine/squishies.ts');
  return Object.fromEntries(SQUISHY_KINDS.map(k => [k.kind, { name: k.name, line: k.line, hint: k.hint }]));
});

/** Squeezes the button `find` picks, `times` times, and says what each squeeze did. */
async function squeeze(find, times = 1) {
  const out = [];
  for (let i = 0; i < times; i++) {
    const before = await page.evaluate(() => ({ said: window.__said.length, starts: window.__starts, spoke: window.__browserSpoke.length }));
    const el = await page.evaluateHandle(find);
    if (!(await el.evaluate(e => !!e))) throw new Error(`nothing to squeeze: ${find}`);
    await el.evaluate(e => e.scrollIntoView({ block: 'center' }));
    await el.click();
    await wait(60);
    const moved = await el.evaluate(e => /squish|wobble/.test(e.dataset.state ?? ''));
    await wait(1800);
    const after = await page.evaluate(() => ({ said: window.__said.slice(), starts: window.__starts, spoke: window.__browserSpoke.slice() }));
    out.push({ moved, said: after.said.slice(before.said), clips: after.starts - before.starts, fellBack: after.spoke.slice(before.spoke) });
  }
  return out;
}

/** The first squeeze speaks `line` with a clip, the rest are silent; all of them squish. */
function once(name, r, line) {
  const [first, ...rest] = r;
  const pass = r.every(x => x.moved && x.fellBack.length === 0) && first.clips >= 1 && first.said.join(' ').includes(line.slice(0, 12)) && rest.every(x => x.clips === 0 && x.said.length === 0);
  ok(name, pass, r.map((x, i) => `#${i + 1}: ${x.moved ? 'squished' : 'still'}, ${x.clips} clip(s)${x.said.length ? ` "${x.said.join(' ')}"` : ''}${x.fellBack.length ? ', browser voice' : ''}`).join(' · '));
}
const says = (name, r, line) =>
  ok(name, r[0].moved && r[0].clips >= 1 && r[0].said.join(' ').includes(line.slice(0, 12)) && r[0].fellBack.length === 0, `${r[0].clips} clip(s) "${r[0].said.join(' ')}"`);

const found = name => new Function(`return [...document.querySelectorAll('button[aria-label^="${name}, "]')].find(b => b.closest('${at('hub')}, ${at('shelf')}, ${at('shell-reward')}'))`);
const inPlace = (place, name) => new Function(`return [...document.querySelectorAll('${place} button[aria-label^="${name}, "]')][0]`);

// ── the library's Squishy Shelf card ───────────────────────────────────────
await page.click(at('open-reading'));
await page.waitForSelector(at('hub'));
await wait(6000); // her greeting
once('library card: Mochi Cat says her line on the first squeeze only', await squeeze(found(kinds.cat.name), 3), kinds.cat.line);
says('… and Squish Ball still says his on his first', await squeeze(found(kinds.ball.name)), kinds.ball.line);

// ── Luna's Squishy Shelf ───────────────────────────────────────────────────
await page.click(at('open-shelf'));
await page.waitForSelector(at('shelf'));
await wait(1500);
once('shelf: Mochi Cat on the first squeeze only', await squeeze(inPlace(at('shelf'), kinds.cat.name), 3), kinds.cat.line);
const ghost = () => document.querySelector('[data-shot="shelf"] button[aria-label^="Not found yet"]');
const ghostName = await page.evaluate(() => document.querySelector('[data-shot="shelf"] button[aria-label^="Not found yet"]').getAttribute('aria-label'));
const ghostKind = Object.values(kinds).find(k => ghostName.endsWith(k.name)) ?? null;
const ghostRuns = await squeeze(ghost, 3);
// a "?" is a mystery: its clue is whichever kind it holds, so match any clue
const clue = ghostKind?.hint ?? Object.values(kinds).map(k => k.hint).find(h => ghostRuns[0].said.join(' ').includes(h.slice(0, 12))) ?? '???';
once(`shelf: one still to find (${ghostName}) gives its clue once`, ghostRuns, clue);
says('shelf: Squish Ball still says his line on his first', await squeeze(inPlace(at('shelf'), kinds.ball.name)), kinds.ball.line);

// ── leaving and coming back ────────────────────────────────────────────────
await page.click(at('shell-back'));
await page.waitForSelector(at('hub'));
await wait(1500);
says('back on the library, Mochi Cat speaks again on her first squeeze', await squeeze(found(kinds.cat.name)), kinds.cat.line);
await page.click(at('open-shelf'));
await page.waitForSelector(at('shelf'));
await wait(1500);
says('the shelf opened again: Mochi Cat speaks again on her first squeeze', await squeeze(inPlace(at('shelf'), kinds.cat.name)), kinds.cat.line);

// ── a game's done screen ───────────────────────────────────────────────────
await page.click(at('shell-back'));
await page.waitForSelector(at('hub'));
for (const t of await page.$$(at('game-tile'))) if ((await t.evaluate(e => e.textContent)).includes('Letter Cookies')) { await t.click(); break; }
await page.waitForSelector(at('play'));
await page.click(at('play'));
const round = () => page.evaluate(() => document.querySelector('[data-shot="round-pips"]')?.getAttribute('aria-label') ?? null);
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
await page.waitForSelector(at('done-squishy'), { timeout: 30000 });
// the stars land, Luna's finish line, a visiting moon leaves
await wait(9000);
const won = await page.evaluate(() => document.querySelector('[data-shot="done-squishy"] button').getAttribute('aria-label'));
const wonKind = Object.values(kinds).find(k => won.startsWith(k.name));
once(`done screen: the new squishy (${won.split(':')[0]}) on its first squeeze only`, await squeeze(() => document.querySelector('[data-shot="done-squishy"] button'), 3), wonKind.line);
const shelfCat = inPlace(at('done-shelf'), kinds.cat.name);
const catRuns = await squeeze(shelfCat, 3);
if (wonKind === kinds.cat) {
  // the same squishy has spoken on this screen already
  ok('done screen: Mochi Cat on the shelf, already heard as the new one, only squishes', catRuns.every(x => x.moved && x.clips === 0));
} else {
  once('done screen: Mochi Cat on its shelf on the first squeeze only', catRuns, kinds.cat.line);
}

await browser.close();
const failed = results.filter(r => !r).length;
console.log(`\n${failed ? `${failed} FAILED` : 'ALL PASS'} (${results.length} checks)`);
process.exit(failed ? 1 : 0);
