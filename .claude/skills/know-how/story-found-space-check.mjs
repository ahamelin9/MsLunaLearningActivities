#!/usr/bin/env node
// Does Story Corner's found word keep its space? (BUG-34)
//
//   node .claude/skills/know-how/story-found-space-check.mjs [port=5199] [stories=6]
//
// Needs Vite on the port. At Kindergarten it plays a few stories to the
// hunted word and taps it, then measures, on the word's line, the gap from
// its highlight to the next word's first letter, against the line's ordinary
// gaps (one word's last letter to the next one's first). The highlight must
// stand at least half a space off the next word. Before BUG-34 the found word
// turned inline-block, which drops the space inside it, so the highlight
// touched the next word (0px). A hunted word that ends its line has no next
// word, so the check moves on to the next story.

import puppeteer from 'puppeteer-core';
import { chromePath } from '../../../scripts/chrome-path.cjs';

const args = process.argv.slice(2);
const port = args.find(a => /^\d+$/.test(a)) ?? '5199';
const want = Number(args.find(a => a.startsWith('stories='))?.slice(8) ?? 6);
const at = n => `[data-shot="${n}"]`;
const wait = ms => new Promise(r => setTimeout(r, ms));
const results = [];
const ok = (name, pass, detail = '') => {
  results.push(pass);
  console.log(`${pass ? '✅' : '❌'} ${name}${detail !== '' ? `  (${detail})` : ''}`);
};
const until = async (fn, ms = 12000) => {
  for (let t = 0; t < ms; t += 150) {
    if (await fn()) return true;
    await wait(150);
  }
  return false;
};

const browser = await puppeteer.launch({ executablePath: chromePath(), headless: true, args: ['--mute-audio'] });
const page = await browser.newPage();
await page.setViewport({ width: 1180, height: 820, hasTouch: true });
await page.evaluateOnNewDocument(() => { window.speechSynthesis.speak = () => {}; });
await page.goto(`http://localhost:${port}/`, { waitUntil: 'networkidle0' });

let measured = 0;
for (let tries = 0; measured < want && tries < want * 3; tries++) {
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'networkidle0' });
  await page.click(at('open-reading'));
  await page.waitForSelector(at('grade-card'));
  await (await page.$$(at('grade-card')))[0].click();
  await page.waitForSelector(at('hub'));
  for (const t of await page.$$(at('game-tile'))) if ((await t.evaluate(e => e.textContent)).includes('Story Corner')) await t.click();
  await page.waitForSelector(at('play'));
  await page.click(at('play'));
  await page.waitForSelector(at('stage'));
  await wait(800);

  const round = await page.evaluate(() => {
    for (const el of document.querySelectorAll('[data-shot="stage"] *')) {
      const key = Object.keys(el).find(k => k.startsWith('__reactFiber'));
      for (let f = key ? el[key] : null; f; f = f.return) if (f.memoizedProps?.round?.hunt) return { hunt: f.memoizedProps.round.hunt, id: f.memoizedProps.round.story.id };
    }
    return null;
  });
  for (let i = 0; i < 8; i++) {
    const more = await page.$$eval(`${at('stage')} button`, bs => {
      const b = bs.find(b => /next line|I have read it/i.test(b.textContent));
      b?.click();
      return Boolean(b);
    });
    if (!more) break;
    await wait(500);
  }
  await until(() =>
    page.$$eval(`${at('stage')} p span`, (ss, w) => {
      const s = ss.find(s => s.children.length === 0 && s.textContent.replace(/[^a-zA-Z]/g, '').toLowerCase() === w);
      s?.click();
      return Boolean(s);
    }, round.hunt)
  );
  await page.waitForSelector(`${at('stage')} p [data-state="right"]`);
  // the pop has to end before the box is its real size
  await wait(1200);

  const got = await page.evaluate(() => {
    const found = document.querySelector('[data-shot="stage"] p [data-state="right"]');
    const line = found.closest('p');
    // a word's letters, without the space after them
    const letters = el => {
      const text = [...el.childNodes].find(n => n.nodeType === 3 && n.textContent.trim()) ?? el.firstChild;
      const r = document.createRange();
      const start = text.textContent.search(/\S/);
      r.setStart(text, start);
      r.setEnd(text, text.textContent.trimEnd().length);
      return r.getBoundingClientRect();
    };
    const words = [...line.querySelectorAll('[data-state], span')].filter((w, i, a) => a.indexOf(w) === i && w.textContent.trim());
    const order = [...line.querySelectorAll('*')].filter(w => words.includes(w));
    const k = order.indexOf(found);
    const next = order[k + 1];
    if (!next || Math.abs(next.getBoundingClientRect().top - found.getBoundingClientRect().top) > 4) return null;
    const ordinary = [];
    for (let i = 1; i < order.length; i++) {
      if (i === k || i === k + 1) continue;
      const a = letters(order[i - 1]);
      const b = letters(order[i]);
      if (Math.abs(a.top - b.top) < 4) ordinary.push(b.left - a.right);
    }
    ordinary.sort((x, y) => x - y);
    return {
      pair: `${found.textContent.trim()} ${next.textContent.trim()}`,
      gap: Math.round(letters(next).left - found.getBoundingClientRect().right),
      space: ordinary.length ? Math.round(ordinary[Math.floor(ordinary.length / 2)]) : null
    };
  });
  if (!got) continue;
  measured++;
  const space = got.space ?? 6;
  ok(`"${round.id}": the highlight on "${got.pair}" stands off the next word`, got.gap >= space / 2, `${got.gap}px, a space is ${space}px`);
}
ok(`${want} found words measured`, measured === want, `${measured}`);

await browser.close();
const passed = results.every(Boolean);
console.log(passed ? '\nALL PASS' : '\nSOME FAILED');
process.exit(passed ? 0 : 1);
