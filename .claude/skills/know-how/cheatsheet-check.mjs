#!/usr/bin/env node
// The teacher's cheat sheet (CUR-8): is every lesson and game on it?
//
//   node .claude/skills/know-how/cheatsheet-check.mjs [port=5199]
//
// Needs Vite running on the port. With a save playing 1st Grade and a few
// lessons learned, it opens Settings past the grown-up gate, then "What they
// learn" (data-shot open-teaches), and checks:
//   - the sheet opens on the grade being played;
//   - at each grade, every lesson of the path (lessonsFor, engine/lessons.ts)
//     is on it once and nothing else is, numbered as on the path, in its own
//     skill's row, with its title and what it covers (lessonCovers,
//     engine/buckets.ts), which is never empty;
//   - each skill's row shows its name and line from the data, and a bar of its
//     lessons learned in the save;
//   - every game in GAMES is on it with its title and what it practices;
//   - "Back to settings" goes back to Settings.
// Text is read with textContent, since the "Lesson 3" tags are uppercased by
// CSS. It fails with a lesson or a game left off (watched with the sheet
// dropping each skill's last lesson, and the last game; CUR-8).

import puppeteer from 'puppeteer-core';
import { chromePath } from '../../../scripts/chrome-path.cjs';

const port = process.argv.find(a => /^\d+$/.test(a)) ?? '5199';
const at = n => `[data-shot="${n}"]`;
const wait = ms => new Promise(r => setTimeout(r, ms));
const results = [];
const ok = (name, pass, detail = '') => { results.push(pass); console.log(`${pass ? '✅' : '❌'} ${name}${detail ? `  (${detail})` : ''}`); };
const KEY = 'ms_luna_learning_progress_v1';
const LEARNED = ['k-ms-m-s-b-t', 'g1-ph-digraphs', 'g1-bw-magic-e', 'g1-ph-sh-ch', 'g2-wp-vowel-teams'];

const browser = await puppeteer.launch({ executablePath: chromePath(), headless: true, args: ['--mute-audio'] });
const page = await browser.newPage();
await page.setViewport({ width: 1180, height: 820 });
await page.evaluateOnNewDocument(() => { window.speechSynthesis.speak = () => {}; });
await page.goto(`http://localhost:${port}/`, { waitUntil: 'networkidle0' });
await page.evaluate((key, learned) => {
  localStorage.clear();
  localStorage.setItem(key, JSON.stringify({ selectedGrade: 'grade1', completedLessons: learned }));
}, KEY, LEARNED);
await page.reload({ waitUntil: 'networkidle0' });
await page.waitForSelector(at('open-settings'));
await wait(1200);

// past the grown-up gate (SET-1): a 2.3s hold on the gear
const box = await (await page.$(at('open-settings'))).boundingBox();
await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
await page.mouse.down();
await wait(2300);
await page.mouse.up();
await page.waitForSelector(at('settings'));
await page.click(at('open-teaches'));
await page.waitForSelector(at('teaches'));
await wait(400);

const pressed = id => page.$eval(at(`sheet-grade-${id}`), el => el.getAttribute('aria-pressed') === 'true');
ok('it opens on the grade being played (1st Grade)', await pressed('grade1'));

const data = await page.evaluate(async () => {
  const { GRADES, READING_CURRICULUM } = await import('/src/data/readingCurriculum.ts');
  const { lessonsFor } = await import('/src/apps/reading/engine/lessons.ts');
  const { lessonCovers } = await import('/src/apps/reading/engine/buckets.ts');
  const { GAMES } = await import('/src/apps/reading/games/index.ts');
  return {
    grades: GRADES.map(g => ({
      id: g.id,
      title: g.title,
      path: lessonsFor(g.id).map(l => l.lesson.id),
      lessons: READING_CURRICULUM[g.id].flatMap(skill => skill.lessons.map(l => ({
        id: l.id, skill: skill.id, title: l.title, covers: lessonCovers(l)
      }))),
      skills: Object.values(Object.fromEntries(READING_CURRICULUM[g.id].map(s => [s.id, { id: s.id, name: s.name, line: s.description }])))
    })),
    games: GAMES.map(g => ({ id: g.id, title: g.title, objective: g.objective }))
  };
});

for (const grade of data.grades) {
  await page.click(at(`sheet-grade-${grade.id}`));
  await wait(300);
  const rows = await page.$$eval(`${at('sheet-lessons')} tbody tr`, trs => trs.map(tr => ({
    skill: tr.dataset.skill,
    head: tr.querySelector('th').textContent,
    done: Number(tr.querySelector('[role="progressbar"]')?.getAttribute('aria-valuenow')),
    total: Number(tr.querySelector('[role="progressbar"]')?.getAttribute('aria-valuemax')),
    lessons: [...tr.querySelectorAll('[data-lesson]')].map(li => ({ id: li.dataset.lesson, text: li.textContent }))
  })));
  const on = rows.flatMap(r => r.lessons.map(l => ({ ...l, row: r.skill })));
  const ids = on.map(l => l.id);
  const missing = grade.path.filter(id => !ids.includes(id));
  const extra = ids.filter((id, i) => !grade.path.includes(id) || ids.indexOf(id) !== i);
  ok(`${grade.title}: all ${grade.path.length} lessons on the sheet, once each`, missing.length === 0 && extra.length === 0,
    [missing.length && `missing ${missing.join(', ')}`, extra.length && `extra ${extra.join(', ')}`].filter(Boolean).join('; '));

  const wrong = grade.lessons.filter(l => {
    const shown = on.find(x => x.id === l.id);
    const number = grade.path.indexOf(l.id) + 1;
    return !shown || shown.row !== l.skill || !l.covers || !shown.text.includes(`Lesson ${number}`)
      || !shown.text.includes(l.title) || !shown.text.includes(l.covers);
  }).map(l => l.id);
  ok(`${grade.title}: each with its number on the path, its title and what it covers, under its skill`, wrong.length === 0, wrong.join(', '));

  const badSkills = grade.skills.filter(s => {
    const row = rows.find(r => r.skill === s.id);
    const lessons = grade.lessons.filter(l => l.skill === s.id);
    const learned = lessons.filter(l => LEARNED.includes(l.id)).length;
    return !row || !row.head.includes(s.name) || !row.head.includes(s.line) || row.done !== learned || row.total !== lessons.length;
  }).map(s => s.id);
  ok(`${grade.title}: its ${grade.skills.length} skills, each with its name, its line and a bar of lessons learned`,
    badSkills.length === 0 && rows.length === grade.skills.length, badSkills.join(', ') || `${rows.length} rows`);
}

const games = await page.$$eval(`${at('sheet-games')} tbody tr`, trs => trs.map(tr => ({ id: tr.dataset.game, text: tr.textContent })));
const badGames = data.games.filter(g => !games.find(x => x.id === g.id && x.text.includes(g.title) && x.text.includes(g.objective))).map(g => g.id);
ok(`all ${data.games.length} games, each with what it practices`, badGames.length === 0 && games.length === data.games.length, badGames.join(', ') || `${games.length} rows`);

await page.click(at('sheet-back'));
await wait(300);
ok('"Back to settings" goes back to Settings', !(await page.$(at('teaches'))) && !!(await page.$(at('open-teaches'))));

await browser.close();
const passed = results.every(Boolean);
console.log(passed ? '\nALL PASS' : '\nSOME FAILED');
process.exit(passed ? 0 : 1);
