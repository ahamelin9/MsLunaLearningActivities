#!/usr/bin/env node
// Does the library stay short? (CUR-7)
//
//   node .claude/skills/know-how/library-fit-check.mjs [port=5199]
//
// Needs Vite running on the port. At each grade, at the four iPad sizes, at
// the start, the middle and one lesson from the end of the path, it opens the
// library as a child would and checks:
//   - it opens at its top (Luna and the welcome row showing), with the whole
//     lesson card up next already on screen;
//   - the top of the Play Shelf (its heading and a third of its first row) is
//     at most a third of a screen further down.
// At the start of the path it also taps each skill in turn: its tray of
// lessons must open in the row right under it, with the notch under its
// middle (the "tab and tray"; on a portrait iPad the second row of skills
// flows on under the tray). In light and dark, the tray stands apart from the
// page (at least 1.3:1; the accent's soft fill it had first was 1.06:1 in
// light, too close to see) and shares one fill with its notch and the card.
// The ticket's own bar, "within one screen of scrolling", was met by the
// library before CUR-7 too: it showed every lesson card and scrolled itself
// down to the one up next (CUR-4), past Luna, and at the start of a grade the
// Play Shelf was up to 975px down. This bar fails that library at 29 of 36
// (opened scrolled down, or the Play Shelf too far below).

import puppeteer from 'puppeteer-core';
import { chromePath } from '../../../scripts/chrome-path.cjs';

const port = process.argv.find(a => /^\d+$/.test(a)) ?? '5199';
const SIZES = [[1180, 820], [820, 1180], [1366, 1024], [744, 1133]];
const GRADES = ['kindergarten', 'grade1', 'grade2'];
const at = n => `[data-shot="${n}"]`;
const wait = ms => new Promise(r => setTimeout(r, ms));
const url = `http://localhost:${port}/`;

const browser = await puppeteer.launch({ executablePath: chromePath(), headless: true, args: ['--mute-audio'] });
const page = await browser.newPage();
await page.evaluateOnNewDocument(() => { window.speechSynthesis.speak = () => {}; });
let fails = 0;
for (const grade of GRADES) {
  await page.setViewport({ width: 1180, height: 820 });
  await page.goto(url, { waitUntil: 'networkidle0' });
  const total = await page.evaluate(async g => (await import('/src/apps/reading/engine/lessons.ts')).lessonsFor(g).length, grade);
  for (const learned of [0, Math.floor(total / 2), total - 1]) {
    for (const [w, h] of SIZES) {
      await page.setViewport({ width: w, height: h });
      await page.goto(url, { waitUntil: 'networkidle0' });
      await page.evaluate(async (g, n) => {
        const { lessonsFor } = await import('/src/apps/reading/engine/lessons.ts');
        localStorage.clear();
        const ids = lessonsFor(g).map(l => l.lesson.id).slice(0, n);
        localStorage.setItem('ms_luna_learning_progress_v1', JSON.stringify({ selectedGrade: g, completedLessons: ids }));
      }, grade, learned);
      await page.reload({ waitUntil: 'networkidle0' });
      await page.click(at('open-reading'));
      await page.waitForSelector(at('hub'));
      await wait(900);
      const r = await page.evaluate(() => {
        // the library scrolls in its window, or the page does
        let box = document.querySelector('[data-shot="hub"]');
        while (box && !(box.scrollHeight > box.clientHeight + 1 && /(auto|scroll)/.test(getComputedStyle(box).overflowY))) box = box.parentElement;
        const bottom = box ? box.getBoundingClientRect().bottom : innerHeight;
        const screen = box ? box.clientHeight : innerHeight;
        const next = document.querySelector('[data-shot="lesson-tile"]:not([data-state~="done"]):not([data-state~="locked"])');
        const shelf = document.querySelector('[data-shot="game-tile"]')?.getBoundingClientRect();
        return {
          screen,
          scrolled: Math.round(box ? box.scrollTop : scrollY),
          next: next ? Math.max(0, Math.round(next.getBoundingClientRect().bottom - bottom)) : null,
          shelf: shelf ? Math.max(0, Math.round(shelf.top + shelf.height / 3 - bottom)) : null
        };
      });
      const ok = r.scrolled === 0 && r.next === 0 && r.shelf !== null && r.shelf <= r.screen / 3;
      if (!ok) fails++;
      const where = px => (px === null ? 'missing' : px === 0 ? 'on screen' : `${px}px down`);
      console.log(`${ok ? '✅' : '❌'} ${grade}, ${learned} of ${total} done, ${w}×${h}: ${r.scrolled ? `opens scrolled ${r.scrolled}px down, ` : ''}the lesson up next ${where(r.next)}, the Play Shelf ${where(r.shelf)} (a third of the screen is ${Math.round(r.screen / 3)}px)`);

      // the tab and tray (Alex, 2026-11-08): tapping each skill in turn, its
      // lessons' tray sits in the row right under it (nothing between them),
      // its notch under the card's middle, and it's the only one open
      if (learned !== 0) continue;
      const off = [];
      const skills = await page.$$(at('skill-card'));
      for (const [k, skill] of skills.entries()) {
        await skill.click();
        await wait(250);
        const t = await skill.evaluate(card => {
          const tray = document.querySelector('[data-shot="skill-tray"]');
          if (!tray) return { missing: true };
          const c = card.getBoundingClientRect();
          const tr = tray.getBoundingClientRect();
          const notch = getComputedStyle(tray, '::before');
          const notchMiddle = tr.left + parseFloat(notch.left) + parseFloat(notch.width) / 2;
          // any other skill card between the open one's bottom and the tray
          const between = [...document.querySelectorAll('[data-shot="skill-card"]')].some(o => {
            const r = o.getBoundingClientRect();
            return o !== card && r.top >= c.bottom - 1 && r.bottom <= tr.top + 1;
          });
          const open = [...document.querySelectorAll('[data-shot="skill-card"]')].filter(o => o.getAttribute('aria-expanded') === 'true');
          return { apart: Math.round(Math.abs(notchMiddle - (c.left + c.width / 2))), below: tr.top > c.bottom, between, onlyOpen: open.length === 1 && open[0] === card };
        });
        if (t.missing || t.apart > 2 || !t.below || t.between || !t.onlyOpen) off.push(`skill ${k + 1}: ${JSON.stringify(t)}`);
      }
      if (off.length) fails++;
      console.log(`${off.length ? '❌' : '✅'} ${grade}, ${w}×${h}: each of the ${skills.length} skills opens its tray right under it, the notch under its middle${off.length ? `: ${off.join('; ')}` : ''}`);

      // the tray stands out from the page (Alex, 2026-11-08: the accent's soft
      // fill, 1.06:1 on the page in light, was hard to see), in light and
      // dark, and shares its fill with the open card and its notch. Once per
      // grade: the colours don't change with the size
      if (w !== SIZES[0][0]) continue;
      for (const theme of ['light', 'dark']) {
        const c = await page.evaluate(th => {
          const html = document.documentElement;
          const was = html.getAttribute('data-theme');
          html.setAttribute('data-theme', th);
          const tray = document.querySelector('[data-shot="skill-tray"]');
          const card = document.querySelector('[data-shot="skill-card"][aria-expanded="true"]');
          const probe = document.createElement('div');
          probe.style.background = 'var(--ground)';
          tray.parentElement.append(probe);
          const lum = rgb => {
            const [r, g, b] = rgb.match(/[\d.]+/g).slice(0, 3).map(n => {
              const s = Number(n) / 255;
              return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
            });
            return 0.2126 * r + 0.7152 * g + 0.0722 * b;
          };
          const fills = { tray: getComputedStyle(tray).backgroundColor, notch: getComputedStyle(tray, '::before').backgroundColor, card: getComputedStyle(card).backgroundColor, page: getComputedStyle(probe).backgroundColor };
          probe.remove();
          if (was === null) html.removeAttribute('data-theme');
          else html.setAttribute('data-theme', was);
          const [a, b] = [lum(fills.tray), lum(fills.page)].sort((x, y) => y - x);
          return { ...fills, ratio: Math.round(((a + 0.05) / (b + 0.05)) * 100) / 100 };
        }, theme);
        const ok = c.ratio >= 1.3 && c.tray === c.notch && c.tray === c.card;
        if (!ok) fails++;
        console.log(`${ok ? '✅' : '❌'} ${grade}, ${theme}: the tray is ${c.ratio}:1 on the page (at least 1.3), ${c.tray === c.card && c.tray === c.notch ? 'one fill with its notch and the open card' : `not the open card's fill: ${JSON.stringify(c)}`}`);
      }
    }
  }
}
await browser.close();
console.log(fails ? `\n${fails} FAILED` : '\nALL PASS');
process.exit(fails ? 1 : 0);
