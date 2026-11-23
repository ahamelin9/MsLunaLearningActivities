#!/usr/bin/env node
// Does the recording page save a take where git ignores it? (VOX-7)
//
//   node .claude/skills/know-how/record-check.mjs <stand-in.wav> [port=5199]
//
// Needs Vite on the port (`npm run dev`: the save is a dev-server plugin,
// scripts/voice/takes-server.mjs). The page's microphone is a stand-in that
// plays the given WAV on a loop, so no one has to speak: headless Chrome on
// the Mac hangs on any microphone request, even its own fake one (2026-11-22),
// so `getUserMedia` is replaced with a stream of the clip. The real microphone
// is Alex's to try.
// It records one slot that has no take yet, and drops it again at the end,
// so Alex's own takes are never touched. It checks:
//   - the page shows the pilot's 8 sounds, 4 slots each;
//   - a take recorded and stopped is saved as a WAV that isn't silent, the
//     page says so, and its Hear button plays it back from the dev server;
//   - git ignores the takes folder;
//   - the save refuses a name that isn't a take, and a body that isn't a WAV.

import puppeteer from 'puppeteer-core';
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { chromePath } from '../../../scripts/chrome-path.cjs';

const standIn = process.argv.slice(2).find(a => a.endsWith('.wav'));
const port = process.argv.slice(2).find(a => /^\d+$/.test(a)) ?? '5199';
if (!standIn) {
  console.error('usage: node .claude/skills/know-how/record-check.mjs <stand-in.wav> [port]');
  process.exit(1);
}
const TAKES = resolve('scripts/voice/takes');
const results = [];
const ok = (name, pass, detail = '') => {
  results.push(pass);
  console.log(`${pass ? '✅' : '❌'} ${name}${detail !== '' ? `  (${detail})` : ''}`);
};
const wait = ms => new Promise(r => setTimeout(r, ms));

const browser = await puppeteer.launch({
  executablePath: chromePath(),
  headless: true,
  args: ['--autoplay-policy=no-user-gesture-required']
});
const page = await browser.newPage();
await page.evaluateOnNewDocument(clip => {
  navigator.mediaDevices.getUserMedia = async () => {
    const context = new AudioContext();
    const bytes = Uint8Array.from(atob(clip), c => c.charCodeAt(0));
    const source = context.createBufferSource();
    source.buffer = await context.decodeAudioData(bytes.buffer);
    source.loop = true;
    const out = context.createMediaStreamDestination();
    source.connect(out);
    source.start();
    return out.stream;
  };
}, readFileSync(standIn).toString('base64'));
const errors = [];
page.on('pageerror', e => errors.push(e.message));
await page.goto(`http://localhost:${port}/?record`, { waitUntil: 'networkidle0' });
await page.waitForSelector('[data-shot="record-card"]');

// VOX-8: every sound, in 7 groups with a progress bar each, one group shown
const groups = await page.$$('[data-shot="record-group"]');
const bars = await page.$$('[data-shot="record-group"] [role="progressbar"]');
const first = await page.$$('[data-shot="record-card"]');
ok('7 groups, each with its progress bar; the first shows its 5 short vowels', groups.length === 7 && bars.length === 7 && first.length === 5, `${groups.length} groups, ${bars.length} bars, ${first.length} cards`);
const counts = [];
for (const g of groups) {
  await (await g.$('button')).click();
  await wait(100);
  counts.push((await page.$$('[data-shot="record-card"]')).length);
}
ok("the groups hold all 59 sounds, the pilot's 8 last", counts.reduce((a, b) => a + b, 0) === 59 && counts.at(-1) === 8, counts.join(' + '));
// back to the first group: the pilot's slots all hold Alex's takes
await (await groups[0].$('button')).click();
await wait(100);
const cards = await page.$$('[data-shot="record-card"]');
const slots = await page.$$('[data-shot="record-take"]');
ok('… 4 slots a sound', slots.length === cards.length * 4, `${cards.length} cards, ${slots.length} slots`);

// a slot with no take yet, so none of Alex's is overwritten
const before = new Set(await page.evaluate(() => fetch('/__takes').then(r => r.json())));
let name = null;
for (const s of slots.reverse()) {
  const n = await s.evaluate(e => e.getAttribute('data-take'));
  if (!before.has(n)) {
    name = n;
    await s.click();
    break;
  }
}
if (!name) {
  ok('a free slot to test with', false, 'every slot has a take: nothing tested, nothing touched');
} else {
  await wait(2500);
  const live = await page.$(`[data-take="${name}"]`);
  ok('… it records: the button says Stop', (await live.evaluate(e => e.textContent)).includes('Stop'));
  // the space bar stops it, as Alex would
  await page.keyboard.press('Space');
  let saved = false;
  for (let t = 0; t < 40 && !saved; t++) {
    await wait(100);
    saved = (await page.evaluate(() => fetch('/__takes').then(r => r.json()))).includes(name);
  }
  ok(`the space bar stops it and it's saved as ${name}`, saved);
  const path = join(TAKES, name);
  if (saved && existsSync(path)) {
    const wav = readFileSync(path);
    const rate = wav.readUInt32LE(24);
    let peak = 0;
    for (let i = 44; i + 1 < wav.length; i += 2) peak = Math.max(peak, Math.abs(wav.readInt16LE(i)));
    const seconds = (wav.length - 44) / 2 / rate;
    ok('… a 16-bit mono WAV, not silent', wav.readUInt16LE(22) === 1 && wav.readUInt16LE(34) === 16 && peak > 1000, `${rate} Hz, ${seconds.toFixed(1)} s, peak ${peak}`);
  }
  const note = await page.evaluate(n => document.querySelector(`[data-take="${n}"]`).closest('li').textContent, name);
  ok('… the page says it was saved', /Saved|Too loud|Very quiet/.test(note), note.replace(/\s+/g, ' ').trim());
  const heard = await page.evaluate(async n => {
    const r = await fetch(`/__takes/${n}`);
    return r.ok && r.headers.get('content-type') === 'audio/wav';
  }, name);
  ok('… and the dev server plays it back', heard);
  await page.evaluate(n => fetch(`/__takes/${n}`, { method: 'DELETE' }), name);
  ok('… the test take is dropped again', !existsSync(path));
}

let ignored = false;
try {
  execFileSync('git', ['check-ignore', '-q', 'scripts/voice/takes/sound__B__take1.wav']);
  ignored = true;
} catch {}
ok('git ignores the takes folder', ignored);

const refused = await page.evaluate(async () => [
  (await fetch('/__takes/notes.txt', { method: 'PUT', body: 'hi' })).status,
  (await fetch('/__takes/sound__B__take1.wav', { method: 'PUT', body: 'not a wav at all' })).status
]);
ok('the save refuses a name that isn’t a take, and a body that isn’t a WAV', refused[0] === 400 && refused[1] === 400, refused.join(', '));

ok('no page errors', errors.length === 0, errors.join(' | '));
await browser.close();
const passed = results.every(Boolean);
console.log(passed ? '\nALL PASS' : '\nSOME FAILED');
process.exit(passed ? 0 : 1);
