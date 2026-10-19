#!/usr/bin/env node
// The one answer path (FB-1, BUG-1): does every game's own line (the choice,
// "That is G", a sentence read back) play in full before Luna reacts?
//
//   node .claude/skills/know-how/answer-check.mjs [port=5199] [grade=0] [--only <title words>]
//
// Needs Vite running on the port. In a muted Chrome, for each of the 8 games
// it taps the stage's pieces in turn (Words Off the Page in the round's own
// order, read from its props) until it has seen right and wrong answers, and
// logs every answer the shell says before reacting: the shell's speakSequence
// calls that carry an onEnd. An answer passes when that onEnd came (its last
// clip ended by itself; a line cut short never reports its end, and then the
// watchdog reacts instead), no clip was cut while it played, and Luna's
// reaction (a clip) started after it ended. With the shell reacting at once
// instead, the game's line still ends but Luna's line is lost or cuts it.
// It fails on the commit before FB-1, where most games spoke and reacted at
// once (no answer sequence at all, and the game's clip cut by Luna's line).

import puppeteer from 'puppeteer-core';
import { chromePath } from '../../../scripts/chrome-path.cjs';

const port = process.argv.slice(2).find(a => /^\d{4,}$/.test(a)) ?? '5199';
const grade = Number(process.argv.slice(2).find(a => /^[012]$/.test(a)) ?? 0);
const at = n => `[data-shot="${n}"]`;
const wait = ms => new Promise(r => setTimeout(r, ms));
const results = [];
const ok = (name, pass, detail = '') => { results.push(pass); console.log(`${pass ? '✅' : '❌'} ${name}${detail ? `  (${detail})` : ''}`); };

// found on the shelf by a part of each title (What’s Missing? has a curly apostrophe)
const ALL = ['Letter Jar', 'Bubble Sounds', 'Letter Cookies', 'Muddled Cards', 'Words Off the Page', 'Missing', 'Treasure Path', 'Story Corner'];
const only = process.argv.indexOf('--only');
const GAMES = only === -1 ? ALL : ALL.filter(t => t.includes(process.argv[only + 1]));

const browser = await puppeteer.launch({
  executablePath: chromePath(),
  headless: true,
  args: ['--mute-audio', '--autoplay-policy=no-user-gesture-required']
});

async function open(title) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1180, height: 820, hasTouch: false });
  await page.evaluateOnNewDocument(() => {
    window.__browserSpoke = [];
    window.speechSynthesis.speak = u => window.__browserSpoke.push(u.text);
    // every clip: when it started, and whether something stopped it early
    window.__plays = [];
    const start = AudioBufferSourceNode.prototype.start;
    const stop = AudioBufferSourceNode.prototype.stop;
    AudioBufferSourceNode.prototype.start = function (...a) {
      const rec = { t0: performance.now(), end: null, cut: false };
      window.__plays.push(rec);
      this.addEventListener('ended', () => { rec.end = rec.end ?? performance.now(); });
      this.__rec = rec;
      return start.apply(this, a);
    };
    AudioBufferSourceNode.prototype.stop = function (...a) {
      if (this.__rec && this.__rec.end == null) { this.__rec.end = performance.now(); this.__rec.cut = true; }
      return stop.apply(this, a);
    };
  });
  await page.goto(`http://localhost:${port}/`, { waitUntil: 'networkidle0' });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'networkidle0' });
  // the answers: the shell's speakSequence calls with an onEnd (GameShell's sayThen)
  await page.evaluate(async () => {
    const src = performance.getEntriesByType('resource').map(e => e.name).find(n => n.includes('/src/utils/pronunciation.ts')) ?? '/src/utils/pronunciation.ts';
    const { pronunciation } = await import(src);
    window.__answers = [];
    window.__saidLog = [];
    const say = pronunciation.say.bind(pronunciation);
    pronunciation.say = (req, text, o) => { window.__saidLog.push([Math.round(performance.now()), String(text)]); return say(req, text, o); };
    const seq = pronunciation.speakSequence.bind(pronunciation);
    pronunciation.speakSequence = (parts, opts) => {
      if (opts?.onEnd && /GameShell/.test(new Error().stack ?? '')) {
        const rec = { what: parts.map(p => p.text ?? p.name ?? p.word ?? `/${p.sound}/`).join(' '), t0: performance.now(), ended: null };
        window.__answers.push(rec);
        const onEnd = opts.onEnd;
        opts = { ...opts, onEnd: () => { rec.ended = rec.ended ?? performance.now(); onEnd(); } };
      }
      return seq(parts, opts);
    };
  });
  await page.click(at('open-reading'));
  await page.waitForSelector(at('grade-card'));
  await (await page.$$(at('grade-card')))[grade].click();
  await page.waitForSelector(at('hub'));
  let found = false;
  for (const t of await page.$$(at('game-tile'))) {
    if ((await t.evaluate(e => e.textContent)).includes(title)) { await t.click(); found = true; break; }
  }
  if (!found) { await page.close(); return null; }
  await page.waitForSelector(at('play'));
  await page.click(at('play'));
  await page.waitForSelector(at('stage'));
  await wait(2500);
  return page;
}

// the pieces: the stage's buttons, but not its prompt pills ("Say it again"),
// and Story Corner's words while it hunts (spans in its lines)
const PIECES = `${at('stage')} button:not([data-variant="prompt"]):not([disabled]), ${at('stage')} [data-state="huntable"] > span`;
const answering = page => page.evaluate(() => window.__answers.some(a => a.ended == null && performance.now() - a.t0 < 8000));
const settle = async page => {
  for (let i = 0; i < 40 && (await answering(page)); i++) await wait(200);
  await wait(500);
};

/** Words Off the Page: tap its tiles in the round's own order, read from the round's props. */
async function buildRight(page) {
  const words = await page.evaluate(() => {
    // from a tile up to the game's Play, whose props hold the round
    const el = [...document.querySelectorAll('[data-shot="stage"] button')].find(b => b.textContent.trim());
    if (!el) return null;
    const key = Object.keys(el).find(k => k.startsWith('__reactFiber'));
    for (let f = el[key]; f; f = f.return) if (f.memoizedProps?.round?.words) return f.memoizedProps.round.words;
    return null;
  });
  if (!words) return;
  for (const w of words) {
    const tiles = await page.$$(PIECES);
    for (const t of tiles) {
      if ((await t.evaluate(e => e.textContent.trim())) === w) { await t.click(); await wait(250); break; }
    }
  }
}

for (const title of GAMES) {
  const page = await open(title);
  if (!page) { console.log(`– ${title}: not on this grade's shelf`); continue; }
  const deadline = Date.now() + 120000;
  let k = 0;
  const rounds = () => page.evaluate(() => document.querySelector('[data-shot="round-pips"]')?.getAttribute('aria-label'));
  const first = await rounds();
  while (Date.now() < deadline && !(await page.$(at('shell-reward')))) {
    const seen = await page.evaluate(() => window.__answers.length);
    if ((await rounds()) !== first && seen >= 2) break;
    if (title === 'Words Off the Page') {
      await buildRight(page);
      await settle(page);
      await wait(2500);
      continue;
    }
    const pieces = await page.$$(PIECES);
    if (!pieces.length) { await wait(500); continue; }
    await pieces[k % pieces.length].click().catch(() => {});
    k += 1;
    await wait(250);
    await settle(page);
  }
  await wait(1500);
  const { answers, plays, robot } = await page.evaluate(() => ({ answers: window.__answers, plays: window.__plays, robot: window.__browserSpoke }));
  const whole = answers.filter(a => a.ended != null);
  const cutDuring = answers.filter(a => plays.some(p => p.cut && p.t0 >= a.t0 - 5 && p.end <= (a.ended ?? a.t0 + 8000)));
  ok(`${title}: every answer's own line ended by itself before Luna reacted (${whole.length} of ${answers.length})`,
    answers.length > 0 && whole.length === answers.length, answers.filter(a => a.ended == null).map(a => a.what).join(' | '));
  ok(`${title}: no clip cut while an answer was said`, cutDuring.length === 0, cutDuring.map(a => a.what).join(' | '));
  // Luna's reaction: a clip that starts after the line ended (and not before)
  const reacted = whole.filter(a => plays.some(p => p.t0 >= a.ended - 5 && p.t0 <= a.ended + 2500));
  ok(`${title}: Luna's reaction started after each line (${reacted.length} of ${whole.length})`,
    whole.length > 0 && reacted.length === whole.length, whole.filter(a => !reacted.includes(a)).map(a => a.what).join(' | '));
  if (robot.length) ok(`${title}: nothing fell back to the browser voice`, false, robot.join(' | '));
  if (process.env.DEBUG) console.log(JSON.stringify({ answers, plays: plays.map(p => [Math.round(p.t0), Math.round(p.end), p.cut]), said: await page.evaluate(() => window.__saidLog ?? []) }));
  console.log(`   said first: ${[...new Set(answers.map(a => a.what))].slice(0, 6).join(' · ')}`);
  await page.close();
}

await browser.close();
const passed = results.length > 0 && results.every(Boolean);
console.log(passed ? '\nALL PASS' : '\nSOME FAILED');
process.exit(passed ? 0 : 1);
