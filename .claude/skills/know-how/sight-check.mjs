#!/usr/bin/env node
// The sight-word lesson (CUR-3, BUG-27): real sight words, heard and never shown.
//
//   node .claude/skills/know-how/sight-check.mjs [port=5199] [--runs 20]
//
// Needs Vite running on the port. Marks Kindergarten's lessons done so
// "Starter Sight Words" opens (as lesson-shot.mjs does), plays its rounds,
// reading each round's question from React, and checks:
//   - its words are the, see, like, I and a, one round each;
//   - each wrong answer is a different real word;
//   - the word is on screen only as one of the answers until it's found: not
//     in the cue ("?"), the prompt, or Luna's line on her perch, read at the
//     round's start (her line from the round before is still up) and after
//     each of two misses;
//   - once found, the example sentence shows with the word marked.
// Luna's lines are picked at random, so `--runs 20` plays it 20 times and
// prints only what failed. It fails on the commit before CUR-3 (see, big,
// can), and with `--runs 20` on the commit before BUG-27, when a line like
// "Are you a wizard?" could stay up in the "a" round.

import puppeteer from 'puppeteer-core';
import { chromePath } from '../../../scripts/chrome-path.cjs';

const runsAt = process.argv.indexOf('--runs');
const runs = runsAt > 0 ? Number(process.argv[runsAt + 1]) : 1;
// the port is the number that isn't --runs' count
const port = process.argv.slice(2).find((a, i, all) => /^\d+$/.test(a) && all[i - 1] !== '--runs') ?? '5199';
const at = n => `[data-shot="${n}"]`;
const wait = ms => new Promise(r => setTimeout(r, ms));
const results = [];
const ok = (name, pass, detail = '') => {
  results.push(pass);
  if (runs === 1 || !pass) console.log(`${pass ? '✅' : '❌'} ${name}${detail ? `  (${detail})` : ''}`);
};

const browser = await puppeteer.launch({ executablePath: chromePath(), headless: true, args: ['--mute-audio'] });

/** everything a child can read in the play (the stage, Luna's perch), minus the answers */
const screenWords = page => page.evaluate(() => {
  const clone = document.querySelector('[data-shot="shell-play"]').cloneNode(true);
  clone.querySelectorAll('[data-shot="lesson-choice"]').forEach(b => b.remove());
  return clone.textContent.split(/[^A-Za-z']+/).filter(Boolean).map(w => w.toLowerCase());
});

const choose = (page, word) =>
  page.evaluate(w => [...document.querySelectorAll('[data-shot="lesson-choice"]')].find(b => b.textContent.trim() === w).click(), word);

async function play(run) {
  const tag = runs > 1 ? `run ${run}, ` : '';
  const page = await browser.newPage();
  await page.setViewport({ width: 1180, height: 820 });
  await page.evaluateOnNewDocument(() => { window.speechSynthesis.speak = () => {}; });
  await page.goto(`http://localhost:${port}/`, { waitUntil: 'networkidle0' });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'networkidle0' });
  await page.click(at('open-reading'));
  await page.waitForSelector(at('grade-card'));
  await (await page.$$(at('grade-card')))[0].click();
  await page.waitForSelector(at('hub'));
  await page.evaluate(async () => {
    const { lessonsFor } = await import('/src/apps/reading/engine/lessons.ts');
    const key = 'ms_luna_learning_progress_v1';
    const saved = JSON.parse(localStorage.getItem(key));
    saved.completedLessons = lessonsFor('kindergarten').map(l => l.lesson.id);
    localStorage.setItem(key, JSON.stringify(saved));
  });
  await page.reload({ waitUntil: 'networkidle0' });
  await page.click(at('open-reading'));
  await page.waitForSelector(at('hub'));
  await wait(400);
  for (const t of await page.$$(at('lesson-tile'))) {
    if ((await t.evaluate(e => e.textContent)).includes('Starter Sight Words')) { await t.click(); break; }
  }
  await page.waitForSelector(at('play'));
  await page.click(at('play'));

  const words = [];
  for (let round = 0; round < 8; round++) {
    const live = await page.waitForSelector(at('lesson-choice'), { timeout: 8000 }).catch(() => null);
    if (!live) break;
    await wait(900);
    const r = await page.evaluate(() => {
      const first = document.querySelector('[data-shot="lesson-choice"]');
      const key = Object.keys(first).find(k => k.startsWith('__reactFiber'));
      let q = null;
      for (let f = first[key]; f; f = f.return) if (f.memoizedProps?.question?.word) { q = f.memoizedProps.question; break; }
      return { word: q.word, options: q.options.map(o => o.word), pips: document.querySelector('[data-shot="round-pips"]')?.getAttribute('aria-label') };
    });
    const word = r.word.toLowerCase();
    words.push(r.word);
    const shown = async when => {
      const rest = await screenWords(page);
      ok(`${tag}"${r.word}": not on screen ${when}, except as an answer`, !rest.includes(word), `the screen also reads: ${rest.join(' ')}`);
    };
    await shown('at the round\'s start');
    const wrong = r.options.filter(o => o !== r.word);
    ok(`${tag}"${r.word}": two different wrong answers, neither the word`, wrong.length === 2 && new Set(wrong).size === 2 && !wrong.some(w => w.toLowerCase() === word), wrong.join(', '));
    // two misses, reading Luna's line after each (the answer's word is said
    // first, then her reaction)
    for (const [i, miss] of wrong.entries()) {
      await choose(page, miss);
      await wait(2600);
      await shown(`after miss ${i + 1}`);
    }
    await choose(page, r.word);
    await wait(900);
    const marked = await page.evaluate(() => [...document.querySelectorAll('[data-state="key"]')].map(e => e.textContent.trim()));
    ok(`${tag}"${r.word}": once found, the sentence marks it`, marked.some(m => m.replace(/[^A-Za-z']/g, '').toLowerCase() === word), `marked: ${marked.join(', ')}`);
    await page.waitForFunction(p => {
      const pips = document.querySelector('[data-shot="round-pips"]');
      return !pips || pips.getAttribute('aria-label') !== p || document.querySelector('[data-shot="shell-reward"]');
    }, { timeout: 15000 }, r.pips).catch(() => {});
    if (await page.$(at('shell-reward'))) break;
  }
  const want = ['the', 'see', 'like', 'i', 'a'];
  ok(`${tag}the lesson teaches the, see, like, I and a, one round each`, words.length === 5 && want.every(w => words.map(x => x.toLowerCase()).includes(w)), words.join(', '));
  await page.close();
}

for (let run = 1; run <= runs; run++) {
  const before = results.length;
  await play(run);
  if (runs > 1) console.log(`run ${run}: ${results.slice(before).every(Boolean) ? '✅' : '❌'} (${results.slice(before).length} checks)`);
}

await browser.close();
const passed = results.every(Boolean);
console.log(passed ? `\nALL PASS${runs > 1 ? ` (${runs} runs)` : ''}` : '\nSOME FAILED');
process.exit(passed ? 0 : 1);
