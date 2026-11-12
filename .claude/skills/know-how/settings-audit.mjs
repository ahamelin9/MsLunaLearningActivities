#!/usr/bin/env node
// Does every setting in the Teacher's corner do something you can hear or see?
//
//   node .claude/skills/know-how/settings-audit.mjs [port=5199]
//
// Needs Vite on the port. Alex (2026-11-11): "some of them don't really do
// anything". In a muted Chrome that counts the pops (OscillatorNode starts),
// Luna's clips (AudioBufferSourceNode starts, with each clip's length) and
// which speed of clip she fetched, it opens the library at Kindergarten and,
// through the corner's own buttons (opened by the 1.5s hold on the apple):
//   - Sound effects off: a skill card tap still speaks, with no pop; on: pops;
//   - Ms. Luna's voice off: the tap pops, with no clip; on: a clip;
//   - Voice speed: a line ("Letter sounds!"), a word (cat) and a letter sound
//     (m) at Beginner, Normal and Quick: which speed of clip, and how long;
//   - Which voice: gone (DES-30), as there was one voice and nothing to pick;
//   - Less motion: the page's motion (`data-reduced-motion`, a 700ms move at 0);
//   - Day or night: Dark and Light change the page;
//   - Grade: 1st Grade changes the library's skills;
//   - Reset all progress: stars, squishies, lessons and the decks go, the
//     settings (this week's words) stay.
// Each line says what changed. Nothing may fall back to the browser's voice.

import puppeteer from 'puppeteer-core';
import { chromePath } from '../../../scripts/chrome-path.cjs';

const port = process.argv.find(a => /^\d{4,}$/.test(a)) ?? '5199';
const at = n => `[data-shot="${n}"]`;
const wait = ms => new Promise(r => setTimeout(r, ms));
const results = [];
const ok = (name, pass, detail = '') => { results.push(pass); console.log(`${pass ? '✅' : '❌'} ${name}${detail ? `  (${detail})` : ''}`); };
const note = (name, detail) => console.log(`ℹ️  ${name}  (${detail})`);
const PROGRESS = 'ms_luna_learning_progress_v1';

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
  window.__osc = 0;
  window.__clips = [];
  const osc = OscillatorNode.prototype.start;
  OscillatorNode.prototype.start = function (...a) { window.__osc += 1; return osc.apply(this, a); };
  const buf = AudioBufferSourceNode.prototype.start;
  AudioBufferSourceNode.prototype.start = function (...a) {
    window.__clips.push(Math.round((this.buffer?.duration ?? 0) * 100) / 100);
    return buf.apply(this, a);
  };
});

await page.goto(`http://localhost:${port}/`, { waitUntil: 'networkidle0' });
await page.evaluate(key => {
  localStorage.clear();
  localStorage.setItem(key, JSON.stringify({ selectedGrade: 'kindergarten' }));
}, PROGRESS);
await page.reload({ waitUntil: 'networkidle0' });
await page.click(at('open-reading'));
await page.waitForSelector(at('hub'));
await wait(6000); // her greeting

// the modules the page loaded (a hot-reloaded copy has ?t=), and which speed
// of clip each request asks for
await page.evaluate(async () => {
  const loaded = name => performance.getEntriesByType('resource').map(e => e.name).find(n => n.includes(name)) ?? name;
  const { voiceClips } = await import(loaded('/src/utils/voiceClips.ts'));
  window.__pron = (await import(loaded('/src/utils/pronunciation.ts'))).pronunciation;
  window.__buckets = [];
  const get = voiceClips.get.bind(voiceClips);
  voiceClips.get = (ctx, voice, kind, value, bucket) => {
    window.__buckets.push(`${kind}:${bucket}`);
    return get(ctx, voice, kind, value, bucket);
  };
});

async function openCorner() {
  const apple = await (await page.$(at('open-settings'))).boundingBox();
  await page.mouse.move(apple.x + apple.width / 2, apple.y + apple.height / 2);
  await page.mouse.down();
  await wait(2300);
  await page.mouse.up();
  await page.waitForSelector(at('settings'));
  await wait(400);
}
const closeCorner = async () => {
  await page.click('button[aria-label="Close the Teacher’s corner"]');
  await page.waitForSelector(at('settings'), { hidden: true });
  await wait(300);
};
const inCorner = async (fn) => { await openCorner(); await fn(); await wait(200); await closeCorner(); };
const flip = label => page.click(`${at('settings')} [role="switch"][aria-label="${label}"]`);
const pick = (group, label) => page.evaluate((g, l) => {
  const b = [...document.querySelectorAll(`[data-shot="settings"] [role="group"][aria-label="${g}"] button`)].find(x => x.textContent.trim() === l);
  b.click();
}, group, label);

/** Runs `act`, waits for it to finish, and says what played. */
async function heard(act, ms = 2600) {
  await page.evaluate(() => { window.__osc = 0; window.__clips = []; window.__buckets = []; window.__browserSpoke = []; });
  await act();
  await wait(ms);
  return page.evaluate(() => ({ pops: window.__osc, clips: window.__clips.slice(), buckets: window.__buckets.slice(), robot: window.__browserSpoke.length }));
}
let card = 0;
const tapSkill = () => page.evaluate(i => {
  const cards = document.querySelectorAll('[data-shot="skill-card"]');
  cards[i % cards.length].click();
}, card++);
const say = parts => page.evaluate(p => new Promise(done => window.__pron.speakSequence(p, { onEnd: done })), parts);

// ── Sound effects ──────────────────────────────────────────────────────────
let r = await heard(tapSkill);
ok('everything on: a skill card tap pops and Luna speaks', r.pops > 0 && r.clips.length > 0, `${r.pops} pop sounds, ${r.clips.length} clip(s)`);
await inCorner(() => flip('Sound effects'));
r = await heard(tapSkill);
ok('Sound effects off: no pop, and Luna still speaks', r.pops === 0 && r.clips.length > 0, `${r.pops} pop sounds, ${r.clips.length} clip(s)`);
await inCorner(() => flip('Sound effects'));
r = await heard(tapSkill);
ok('… back on: it pops again', r.pops > 0, `${r.pops} pop sounds`);

// ── Ms. Luna's voice ───────────────────────────────────────────────────────
await inCorner(() => flip('Ms. Luna’s voice'));
r = await heard(tapSkill);
ok('Ms. Luna’s voice off: the tap pops, and she says nothing', r.pops > 0 && r.clips.length === 0 && r.robot === 0, `${r.pops} pop sounds, ${r.clips.length} clip(s)`);
await inCorner(() => flip('Ms. Luna’s voice'));
r = await heard(tapSkill);
ok('… back on: she speaks again', r.clips.length > 0, `${r.clips.length} clip(s)`);

// ── Voice speed ────────────────────────────────────────────────────────────
const speeds = {};
for (const speed of ['Beginner', 'Normal', 'Quick']) {
  await inCorner(() => pick('Voice speed', speed));
  speeds[speed] = {};
  for (const [what, parts] of [['line', [{ text: 'Letter sounds!' }]], ['word', [{ word: 'cat' }]], ['sound', [{ sound: 'M' }]]]) {
    const h = await heard(() => say(parts), 300);
    speeds[speed][what] = { bucket: h.buckets[0]?.split(':')[1], secs: h.clips[0], robot: h.robot };
  }
}
for (const what of ['line', 'word', 'sound']) {
  const row = ['Beginner', 'Normal', 'Quick'].map(s => `${s} ${speeds[s][what].bucket} ${speeds[s][what].secs}s`).join(' · ');
  const [b, n, q] = ['Beginner', 'Normal', 'Quick'].map(s => speeds[s][what].secs);
  // within 5% is the same clip, near enough
  const slower = b > n * 1.05;
  const quicker = q < n * 0.95;
  if (what === 'line') ok('Voice speed changes Luna’s lines: Beginner slower, Quick quicker', slower && quicker, row);
  else if (what === 'word') ok('Voice speed: a word is slower at Beginner (Quick keeps it at natural pace)', slower && !quicker, row);
  // a letter sound is one tuned clip (VOX), the same at every speed: a finding, not a fault
  else note(`Voice speed: a letter sound is ${slower || quicker ? 'changed' : 'the same at every speed'}`, row);
}
ok('… never the browser’s voice', Object.values(speeds).every(s => Object.values(s).every(x => x.robot === 0 && x.secs > 0)));
await inCorner(() => pick('Voice speed', 'Normal'));

// ── Which voice (taken out in DES-30: one rendered voice, nothing to pick) ─
await openCorner();
const whichVoice = await page.evaluate(() => [...document.querySelectorAll('[data-shot="settings"] *')].some(e => e.textContent.trim() === 'Which voice'));
await closeCorner();
ok('no "Which voice" row (one rendered voice, nothing to pick; DES-30)', !whichVoice);

// ── Less motion ────────────────────────────────────────────────────────────
const motion = () => page.evaluate(async () => {
  const loaded = performance.getEntriesByType('resource').map(e => e.name).find(n => n.includes('/src/utils/motion.ts')) ?? '/src/utils/motion.ts';
  const { motionMs } = await import(loaded);
  return { attr: document.documentElement.hasAttribute('data-reduced-motion'), celebrate: motionMs('celebrate') };
});
const m0 = await motion();
await inCorner(() => flip('Less motion'));
const m1 = await motion();
await inCorner(() => flip('Less motion'));
const m2 = await motion();
ok('Less motion stops the moves (a 700ms move becomes 0), and off brings them back',
  !m0.attr && m0.celebrate > 0 && m1.attr && m1.celebrate === 0 && !m2.attr && m2.celebrate === m0.celebrate,
  `off ${m0.celebrate}ms → on ${m1.celebrate}ms → off ${m2.celebrate}ms`);

// ── Day or night ───────────────────────────────────────────────────────────
const look = () => page.evaluate(() => ({ theme: document.documentElement.dataset.theme, bg: getComputedStyle(document.body).backgroundColor }));
await inCorner(() => page.click(at('theme-dark')));
const dark = await look();
await inCorner(() => page.click(at('theme-light')));
const light = await look();
await inCorner(() => page.click(at('theme-match')));
ok('Day or night: Dark and Light change the page', dark.theme === 'dark' && light.theme === 'light' && dark.bg !== light.bg, `dark ${dark.bg} · light ${light.bg}`);

// ── Grade ──────────────────────────────────────────────────────────────────
const skills = () => page.$$eval(at('skill-card'), els => els.map(e => e.textContent.replace(/\d+ of \d+/g, '').trim()).join(' | '));
const kSkills = await skills();
await inCorner(() => pick('Grade', '1st Grade'));
await page.waitForSelector(at('hub'));
await wait(800);
const firstSkills = await skills();
ok('Grade: 1st Grade changes the library', firstSkills !== kSkills && firstSkills.length > 0, firstSkills.slice(0, 90));
await inCorner(() => pick('Grade', 'Kindergarten'));

// ── Reset all progress ─────────────────────────────────────────────────────
await page.evaluate(key => {
  const p = JSON.parse(localStorage.getItem(key));
  p.totalStars = 7;
  p.stickers = ['cat:caramel', 'ball:oat'];
  p.settings = { ...p.settings, weekWords: ['cat', 'dog'] };
  localStorage.setItem(key, JSON.stringify(p));
  // a game's memory of what it has dealt (engine/deck.ts)
  if (!localStorage.getItem('ms_luna_seen_v1')) localStorage.setItem('ms_luna_seen_v1', JSON.stringify({ 'whats-missing': ['cat'] }));
}, PROGRESS);
await page.reload({ waitUntil: 'networkidle0' });
await page.click(at('open-reading'));
await page.waitForSelector(at('hub'));
await wait(1500);
const before = await page.evaluate(key => ({ p: JSON.parse(localStorage.getItem(key)), seen: localStorage.getItem('ms_luna_seen_v1') }), PROGRESS);
await openCorner();
await page.evaluate(() => [...document.querySelectorAll('[data-shot="settings"] button')].find(b => b.textContent.includes('Reset all progress')).click());
await wait(200);
await page.evaluate(() => [...document.querySelectorAll('[data-shot="settings"] button')].find(b => b.textContent.includes('Yes, reset everything')).click());
await wait(2000);
const after = await page.evaluate(key => ({ p: JSON.parse(localStorage.getItem(key)), seen: localStorage.getItem('ms_luna_seen_v1') }), PROGRESS);
ok('Reset all progress: stars, squishies and the decks go; this week’s words stay',
  before.p.totalStars === 7 && !!before.seen && after.p.totalStars === 0 && after.p.stickers.length === 0 && !after.seen && after.p.settings.weekWords.join() === 'cat,dog',
  `stars ${before.p.totalStars} → ${after.p.totalStars}, squishies ${before.p.stickers.length} → ${after.p.stickers.length}, decks ${before.seen ? 'kept' : 'none'} → ${after.seen ? 'kept' : 'gone'}, words ${after.p.settings.weekWords.join(', ')}`);

await browser.close();
const failed = results.filter(x => !x).length;
console.log(`\n${failed ? `${failed} FAILED` : 'ALL PASS'} (${results.length} checks)`);
process.exit(failed ? 1 : 0);
