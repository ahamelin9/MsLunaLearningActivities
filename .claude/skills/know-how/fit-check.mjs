#!/usr/bin/env node
// Does everything we wrote fit on the screen? (CUR-4, GAME-5, GAME-9)
//
//   node .claude/skills/know-how/fit-check.mjs [port=5199] [what=all] [sizes] [only=Words]
//     what:  lessons | stories | sentences | passages | all
//     sizes: 1180x820,820x1180,1024x768,744x1133 (the default: all four iPads)
//     only:  just the lessons with these words in their title
//
// Needs Vite running on the port. The layout audit only meets what a play happens
// to deal first, so a long story further down a deck could scroll for months
// before anyone sees it. This shows each item on its own: in the page's own
// modules it narrows the pool to that one item, then opens it for real.
//   - In a lesson: every story and sentence round, and the longest other round.
//   - In Story Corner and Words Off the Page: every story and sentence, at its tier.
//   - In Treasure Path: every passage with its longest statement, as both kinds.
// It fails if anything scrolls mid-round or runs past the screen or the stage, and
// names each one, since the fix is usually a line of writing.

import puppeteer from 'puppeteer-core';
import { chromePath } from '../../../scripts/chrome-path.cjs';
import { lessonCard } from './library.mjs';

const args = process.argv.slice(2);
const port = args.find(a => /^\d+$/.test(a)) ?? '5199';
const what = args.find(a => /^(lessons|stories|passages|sentences|all)$/.test(a)) ?? 'all';
const SIZES = (args.find(a => /^\d+x\d+/.test(a)) ?? '1180x820,820x1180,1024x768,744x1133').split(',').map(s => s.split('x').map(Number));
const at = n => `[data-shot="${n}"]`;
const wait = ms => new Promise(r => setTimeout(r, ms));
const GRADES = ['kindergarten', 'grade1', 'grade2'];
const wants = part => what === 'all' || what === part;
// only=<words>: only the lessons whose title has these words, for trying a fix
const only = args.find(a => a.startsWith('only='))?.slice(5);

/** In the page: what scrolls, or runs past the screen or the stage. */
function measure() {
  const H = innerHeight;
  const W = innerWidth;
  const out = [];
  for (const el of document.querySelectorAll('*')) {
    if (/(auto|scroll)/.test(getComputedStyle(el).overflowY) && el.scrollHeight > el.clientHeight + 1) out.push(`scrolls by ${el.scrollHeight - el.clientHeight}px`);
  }
  if (document.scrollingElement.scrollHeight > H + 1) out.push(`the page scrolls by ${document.scrollingElement.scrollHeight - H}px`);
  const stage = document.querySelector('[data-shot="stage"]');
  if (!stage) return ['no stage'];
  const box = stage.getBoundingClientRect();
  if (box.bottom > H + 1) out.push(`the stage runs ${Math.round(box.bottom - H)}px past the screen`);
  for (const el of stage.querySelectorAll('button, p, h2, h3')) {
    const b = el.getBoundingClientRect();
    if (b.width === 0 || b.height === 0) continue;
    const said = (el.getAttribute('aria-label') ?? el.textContent).trim().slice(0, 24);
    if (b.bottom > box.bottom + 1 || b.bottom > H + 1) { out.push(`"${said}" runs ${Math.round(Math.max(b.bottom - box.bottom, b.bottom - H))}px past the stage`); break; }
    if (b.right > W + 1) { out.push(`"${said}" runs past the side`); break; }
  }
  return [...new Set(out)];
}

const browser = await puppeteer.launch({ executablePath: chromePath(), headless: true, args: ['--mute-audio'] });
const page = await browser.newPage();
await page.evaluateOnNewDocument(() => { window.speechSynthesis.speak = () => {}; });
await page.goto(`http://localhost:${port}/`, { waitUntil: 'networkidle0' });

/** A fresh save at this grade with every lesson open, and the page's own data modules in hand. */
const enter = async grade => {
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'networkidle0' });
  await page.click(at('open-reading'));
  await page.waitForSelector(at('grade-card'));
  await (await page.$$(at('grade-card')))[grade].click();
  await page.waitForSelector(at('hub'));
  await page.evaluate(async g => {
    const { lessonsFor } = await import('/src/apps/reading/engine/lessons.ts');
    const key = 'ms_luna_learning_progress_v1';
    const saved = JSON.parse(localStorage.getItem(key));
    saved.completedLessons = lessonsFor(g).map(l => l.lesson.id);
    localStorage.setItem(key, JSON.stringify(saved));
  }, GRADES[grade]);
  await page.reload({ waitUntil: 'networkidle0' });
  await page.click(at('open-reading'));
  await page.waitForSelector(at('hub'));
  await wait(300);
  await page.evaluate(async () => {
    // the very instances the app runs on, whatever their URL carries
    const src = n => performance.getEntriesByType('resource').map(e => e.name).find(u => u.includes(n)) ?? n;
    window.__content = await import(src('/src/apps/reading/engine/content.ts'));
    window.__curriculum = (await import(src('/src/data/readingCurriculum.ts'))).READING_CURRICULUM;
    window.__keep = {};
  });
};

const open = async tile => {
  await tile.evaluate(e => e.scrollIntoView({ block: 'center' }));
  await tile.click();
  await page.waitForSelector(at('shell-intro'));
  await page.click(at('play'));
  await page.waitForSelector(at('stage'));
  await wait(1000);
};
const gameTile = async name => {
  for (const t of await page.$$(at('game-tile'))) {
    if (await t.evaluate((e, n) => e.textContent.includes(n), name)) return t;
  }
  throw new Error(`no game called ${name}`);
};
const back = async () => {
  await page.click(at('shell-back'));
  await page.waitForSelector(at('hub'));
  await wait(150);
};

let checked = 0;
const failures = new Set();
const judge = async (name, W, H) => {
  checked++;
  const got = await page.evaluate(measure);
  if (got.length) {
    failures.add(name);
    console.log(`❌ ${W}×${H} ${name}: ${got.join('; ')}`);
  }
};

/** Index of each item in an array in the page that has this field and value. */
const indexes = (list, field, value) => page.evaluate((a, f, v) => window.__content[a].map((x, i) => (x[f] === v ? i : -1)).filter(i => i >= 0), list, field, value);
const hold = list => page.evaluate(a => { window.__keep[a] = [...window.__content[a]]; }, list);
const release = list => page.evaluate(a => window.__content[a].splice(0, window.__content[a].length, ...window.__keep[a]), list);

for (const [W, H] of SIZES) {
  await page.setViewport({ width: W, height: H, deviceScaleFactor: 1, hasTouch: true });

  for (let grade = 0; grade < 3; grade++) {
    await enter(grade);
    const g = GRADES[grade];

    if (wants('lessons')) {
      const lessons = await page.evaluate(gr =>
        window.__curriculum[gr].flatMap(s => s.lessons).map(l => {
          const long = l.questions.filter(q => /^(story|sentence)/.test(q.type));
          const rest = l.questions.filter(q => !long.includes(q)).sort((a, b) => JSON.stringify(b).length - JSON.stringify(a).length);
          return { id: l.id, title: l.title, rounds: [...long, ...rest.slice(0, 1)].map(q => q.id) };
        }), g);
      for (const [i, lesson] of lessons.entries()) {
        if (only && !lesson.title.includes(only)) continue;
        for (const id of lesson.rounds) {
          await page.evaluate((gr, l, q) => {
            const it = window.__curriculum[gr].flatMap(s => s.lessons).find(x => x.id === l);
            it.__all = it.__all ?? it.questions;
            it.questions = it.__all.filter(x => x.id === q);
          }, g, lesson.id, id);
          // its skill first: the library shows one skill's lessons at a time (CUR-7)
          await open(await lessonCard(page, i));
          await judge(`${g} lesson ${i + 1} "${lesson.title}" ${id}`, W, H);
          await back();
        }
      }
    }

    // the games read these arrays when a play starts, so one item is the whole pool
    const oneByOne = async (list, game, field, value, label) => {
      await hold(list);
      for (const i of await indexes(list, field, value)) {
        const name = await page.evaluate((a, n, l) => {
          const item = window.__keep[a][n];
          window.__content[a].splice(0, window.__content[a].length, item);
          return item[l];
        }, list, i, label);
        await open(await gameTile(game));
        await judge(`${game} "${name}"`, W, H);
        await back();
      }
      await release(list);
    };
    if (wants('stories')) await oneByOne('MINI_STORIES', 'Story Corner', 'tier', grade + 1, 'title');
    if (wants('sentences')) await oneByOne('SENTENCES', 'Words Off the Page', 'tier', grade + 1, 'text');

    if (wants('passages')) {
      await hold('PASSAGES');
      for (const i of await indexes('PASSAGES', 'grade', g)) {
        // its longest of each kind, and a twin so a play has two passages. A
        // stone asks true or false first, then the missing word, about one
        // passage (CUR-15): it answers the claim to reach the gap
        const { id, answer } = await page.evaluate((a, n) => {
          const p = window.__keep[a][n];
          const longest = (list, of) => [...list].sort((x, y) => of(y).length - of(x).length)[0];
          const one = { ...p, truth: [longest(p.truth, t => t.claim)], blanks: [longest(p.blanks, b => b.text)] };
          window.__content[a].splice(0, window.__content[a].length, one, { ...one, id: `${p.id}-twin` });
          return { id: p.id, answer: one.truth[0].isTrue ? 'True' : 'False' };
        }, 'PASSAGES', i);
        await page.evaluate(() => localStorage.removeItem('ms_luna_seen_v1'));
        await open(await gameTile('Treasure Path'));
        if (!(await page.$('[data-shot="treasure-claim"]'))) throw new Error(`Treasure Path "${id}" didn't open on its true or false`);
        await judge(`Treasure Path "${id}", true or false`, W, H);
        let gap = null;
        // a tap while the claim is still read out is ignored, so it tries again
        for (let tries = 0; tries < 8 && !gap; tries++) {
          await page.$$eval('[data-shot="stage"] button[aria-label]', (bs, l) => bs.find(b => b.getAttribute('aria-label') === l)?.click(), answer);
          gap = await page.waitForSelector('[data-shot="treasure-sentence"]', { timeout: 2500 }).catch(() => null);
        }
        if (!gap) throw new Error(`Treasure Path "${id}" never reached its missing word`);
        await wait(600);
        await judge(`Treasure Path "${id}", fill the gap`, W, H);
        await back();
      }
      await release('PASSAGES');
    }
  }
}

await browser.close();
console.log(failures.size ? `\n❌ ${failures.size} don't fit, in ${checked} visits.` : `\n✅ ${checked} visits: everything fits.`);
process.exit(failures.size ? 1 : 0);
