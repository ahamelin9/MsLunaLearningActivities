#!/usr/bin/env node
// Does Luna's beak move only while one of her clips is playing? (DES-15)
//
//   node .claude/skills/know-how/luna-talk-check.mjs [port=5199]
//
// Needs Vite running on the port. In a muted Chrome it logs every clip as it
// starts and ends (AudioBufferSourceNode), and every 20ms whether a Luna on
// screen is talking (`[data-mood][data-state~="talking"]`) and whether her
// beak's animation is running. She speaks on the library (tapped), on Letter
// Jar's start screen (the mission) and in its first round (the cue, then an
// answer). Fails if she talks with no clip playing, allowing one frame either
// side for React to catch up. Works on the old LunaOwl too, which also set
// data-state="talking", so a run against older code shows it can fail.

import puppeteer from 'puppeteer-core';
import { chromePath } from '../../../scripts/chrome-path.cjs';

const port = process.argv[2] ?? '5199';
const GRACE_MS = 60;
const at = n => `[data-shot="${n}"]`;
const wait = ms => new Promise(r => setTimeout(r, ms));

const browser = await puppeteer.launch({
  executablePath: chromePath(),
  headless: true,
  args: ['--mute-audio', '--autoplay-policy=no-user-gesture-required']
});
const page = await browser.newPage();
await page.setViewport({ width: 1180, height: 820 });
await page.evaluateOnNewDocument(() => {
  // the macOS voice must never talk over anyone; a fallback is logged instead
  window.__browserSpoke = [];
  window.speechSynthesis.speak = u => window.__browserSpoke.push(u.text);
  window.__clips = 0;
  window.__lastClipEnd = -1e9;
  window.__samples = [];
  const start = AudioBufferSourceNode.prototype.start;
  AudioBufferSourceNode.prototype.start = function (...args) {
    window.__clips += 1;
    let done = false;
    const end = () => {
      if (done) return;
      done = true;
      window.__clips -= 1;
      window.__lastClipEnd = performance.now();
    };
    this.addEventListener('ended', end);
    const stop = this.stop.bind(this);
    this.stop = (...a) => {
      try {
        stop(...a);
      } finally {
        end();
      }
    };
    return start.apply(this, args);
  };
  setInterval(() => {
    const lunas = [...document.querySelectorAll('[data-mood]')];
    const talking = lunas.some(el => /\btalking\b/.test(el.getAttribute('data-state') ?? ''));
    // the beak's wrapper: the group around her beak path (new Luna), if any
    const beakMoving = lunas.some(el =>
      [...el.querySelectorAll('g')].some(g => g.getAnimations().some(a => a.playState === 'running' && a.animationName === 'luna-talk'))
    );
    window.__samples.push({ t: performance.now(), clips: window.__clips, sinceEnd: performance.now() - window.__lastClipEnd, talking, beakMoving });
  }, 20);
});

await page.goto(`http://localhost:${port}/`, { waitUntil: 'networkidle0' });
await page.evaluate(() => localStorage.clear());
await page.reload({ waitUntil: 'networkidle0' });
await page.click(at('open-reading'));
await page.waitForSelector(at('grade-card'));
await wait(1500);
await page.click(at('grade-card'));
await page.waitForSelector(at('hub'));
await wait(2500);
// tap Luna on the library: she says a line
await page.click('[data-shot="hub"] [data-mood]');
await wait(4000);
// Letter Jar: the mission on the start screen, then the round's cue and an answer
const tiles = await page.$$(at('game-tile'));
await tiles[0].evaluate(el => el.scrollIntoView({ block: 'center' }));
await tiles[0].click();
await page.waitForSelector(at('play'));
await wait(5000);
await page.click(at('play'));
await page.waitForSelector(at('shell-play'));
await wait(4000);
const letter = await page.$('[data-shot="stage"] button[aria-label^="letter"], [data-shot="shell-play"] button[aria-label^="letter"]');
if (letter) await letter.click();
await wait(5000);

const { samples, fellBack } = await page.evaluate(() => ({ samples: window.__samples, fellBack: window.__browserSpoke }));
await browser.close();

const clipTime = samples.filter(s => s.clips > 0).length;
const talkTime = samples.filter(s => s.talking).length;
const bad = samples.filter(s => s.talking && s.clips === 0 && s.sinceEnd > GRACE_MS);
const beakWithoutTalking = samples.filter(s => s.beakMoving && !s.talking);
const covered = samples.filter(s => s.clips > 0 && s.talking).length;

console.log(`${samples.length} samples every 20ms: a clip playing in ${clipTime}, Luna talking in ${talkTime}, both in ${covered}`);
if (fellBack.length) console.log(`(browser voice used for: ${fellBack.join(' | ')})`);
if (bad.length) {
  const first = bad[0].t;
  console.log(`❌ talking with no clip playing in ${bad.length} samples (${bad.length * 20}ms), first at ${Math.round(first)}ms`);
}
if (beakWithoutTalking.length) console.log(`❌ the beak moving while not talking in ${beakWithoutTalking.length} samples`);
const ok = !bad.length && !beakWithoutTalking.length && clipTime > 0 && covered > 0;
if (ok) console.log('✅ her beak moved only while a clip was playing');
else if (!clipTime) console.log('❌ no clip played at all: nothing was proven');
process.exit(ok ? 0 : 1);
