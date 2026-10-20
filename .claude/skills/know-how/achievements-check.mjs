#!/usr/bin/env node
// Achievements worked out in one place (PRG-3).
//
//   node .claude/skills/know-how/achievements-check.mjs [port=5199]
//
// Needs Vite running on the port. Drives the app's own save
// (`utils/storage.ts`, the instance the page loaded) and reads
// `unlockedAchievements`:
//   - a game finished, no lesson: "First Word Wonder" (a lesson's) stays locked;
//     a lesson finished: it unlocks;
//   - Super Star Champion at 30 stars, not at 27 (PRG-1's 30, not the old 50);
//   - "Phonics Explorer" unlocks when progress is saved, not only when the
//     Trophy room opens: since PRG-2 for a lesson that sounds out words
//     (blend and read), not for another kind, and never for points;
//   - no points in the save, and an older save's points are dropped (PRG-2);
//   - a save from before, with 5 lessons done and nothing unlocked, loads
//     with "First Word Wonder" and "Master Reader";
//   - the Trophy room works nothing out: no achievement rule is read outside
//     `utils/storage.ts` (a look at the source).
// It fails on the commit before PRG-3.

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import puppeteer from 'puppeteer-core';
import { chromePath } from '../../../scripts/chrome-path.cjs';

const port = process.argv.find(a => /^\d+$/.test(a)) ?? '5199';
const KEY = 'ms_luna_learning_progress_v1';
const results = [];
const ok = (name, pass, detail = '') => { results.push(pass); console.log(`${pass ? '✅' : '❌'} ${name}${detail ? `  (${detail})` : ''}`); };

const browser = await puppeteer.launch({ executablePath: chromePath(), headless: true, args: ['--mute-audio'] });
const page = await browser.newPage();
await page.evaluateOnNewDocument(() => { window.speechSynthesis.speak = () => {}; });
await page.goto(`http://localhost:${port}/`, { waitUntil: 'networkidle0' });

/** runs steps against a fresh save in the page; returns unlocked after each */
const run = steps => page.evaluate(async list => {
  localStorage.clear();
  const src = performance.getEntriesByType('resource').map(e => e.name).find(n => n.includes('/src/utils/storage.ts')) ?? '/src/utils/storage.ts';
  const { storageService } = await import(src);
  storageService.resetProgress();
  const out = [];
  for (const s of list) {
    if (s.game) storageService.recordGameCompletion({ gameId: s.game, starsEarned: s.stars ?? 1 });
    if (s.lesson) storageService.recordLessonCompletion(s.lesson, s.stars ?? 1, s.skill ?? 'k-match-sounds');
    out.push({
      unlocked: storageService.getProgress().unlockedAchievements.slice(),
      stars: storageService.getProgress().totalStars,
      saved: localStorage.getItem('ms_luna_learning_progress_v1')
    });
  }
  return out;
}, steps);

let r = await run([{ game: 'letter-jar' }, { lesson: 'k-lesson-x' }]);
ok('a game alone leaves "First Word Wonder" locked', !r[0].unlocked.includes('first_step'), r[0].unlocked.join(', ') || 'none');
ok('… a lesson unlocks it', r[1].unlocked.includes('first_step'), r[1].unlocked.join(', '));

// 9 games at 3 stars = 27, a 10th = 30
r = await run(Array.from({ length: 10 }, (_, i) => ({ game: `game-${i}`, stars: 3 })));
ok('Super Star Champion not at 27 stars', !r[8].unlocked.includes('super_star'), `${r[8].stars} stars: ${r[8].unlocked.join(', ')}`);
ok('… and at 30', r[9].unlocked.includes('super_star'), `${r[9].stars} stars`);

r = await run([{ game: 'letter-jar' }, { lesson: 'k-lesson-x', skill: 'k-match-sounds' }, { lesson: 'k-bw-animals', skill: 'k-blend-words' }]);
ok('"Phonics Explorer" stays locked for a game and a lesson that doesn\'t sound out words', !r[1].unlocked.includes('sound_explorer'), r[1].unlocked.join(', '));
ok('… and unlocks, when progress is saved, for one that does', r[2].unlocked.includes('sound_explorer'), r[2].unlocked.join(', '));
ok('no points in the save (PRG-2)', r.every(x => !/points/i.test(x.saved)), r.map(x => x.saved.match(/"\w*[Pp]oints":\d+/)?.[0] ?? '-').join(' '));

// an older save: 5 lessons done, nothing unlocked
await page.evaluate(key => {
  localStorage.setItem(key, JSON.stringify({ completedLessons: ['a', 'b', 'c', 'd', 'e'], unlockedAchievements: [], totalStars: 0, totalPoints: 0, streakDays: 1 }));
}, KEY);
await page.reload({ waitUntil: 'networkidle0' });
const loaded = await page.evaluate(async () => {
  const src = performance.getEntriesByType('resource').map(e => e.name).find(n => n.includes('/src/utils/storage.ts')) ?? '/src/utils/storage.ts';
  const { storageService } = await import(src);
  return storageService.getProgress().unlockedAchievements;
});
ok('an older save loads with what it has earned', loaded.includes('first_step') && loaded.includes('bookworm'), loaded.join(', '));
const kept = await page.evaluate(async key => {
  const src = performance.getEntriesByType('resource').map(e => e.name).find(n => n.includes('/src/utils/storage.ts')) ?? '/src/utils/storage.ts';
  const { storageService } = await import(src);
  storageService.recordGameCompletion({ gameId: 'letter-jar', starsEarned: 1 });
  return { inMemory: 'totalPoints' in storageService.getProgress(), saved: localStorage.getItem(key) };
}, KEY);
ok('… with its points dropped (PRG-2)', !kept.inMemory && !/points/i.test(kept.saved), kept.saved.match(/"\w*[Pp]oints":\d+/)?.[0] ?? 'none');

await browser.close();

// the rules are read in the save only
const files = [];
const walk = dir => {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) walk(p);
    else if (/\.(ts|tsx)$/.test(f)) files.push(p);
  }
};
walk(join(process.cwd(), 'src'));
const readers = files.filter(f => !f.endsWith(join('utils', 'storage.ts')) && !f.endsWith(join('data', 'achievements.ts')) && /\.requirement\(/.test(readFileSync(f, 'utf8')));
ok('no achievement rule is read outside utils/storage.ts', readers.length === 0, readers.map(f => f.replace(process.cwd() + '/', '')).join(', ') || 'none');

const passed = results.every(Boolean);
console.log(passed ? '\nALL PASS' : '\nSOME FAILED');
process.exit(passed ? 0 : 1);
