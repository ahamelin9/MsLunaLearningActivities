#!/usr/bin/env node
// Does Luna's voice stay at the right speed, and never doubled (VOX-6)?
//
//   node .claude/skills/know-how/audio-engine-check.mjs [port=5199]
//
// Needs Vite on the port. The teacher heard her "like a demon" on a classroom
// whiteboard. Every clip is clean, so the causes are in playback, and this
// checks each guard in a browser:
//   - no context that plays is made before a tap (clips decode offline), then
//     one context for the voice and the effects, made with bigger buffers
//     ('playback') and a limiter in front of the speakers;
//   - a fresh one at the next tap after the output device changes, the page
//     comes back, the system suspends it, or its clock runs at the wrong speed
//     (a real clock doesn't trip it), and never outside a tap;
//   - one of Luna's clips at a time, and Words Off the Page's read-back stops
//     when something cuts in, instead of reading on under it;
//   - a tab older than the last voice render still finds a clip it removed;
//   - the browser's own voice, if it's ever reached, is a woman's.
// It fails on the commit before VOX-6's fix (two contexts made at load, no
// fresh one, two clips at once, a removed clip lost, a man's voice).

import puppeteer from 'puppeteer-core';
import { chromePath } from '../../../scripts/chrome-path.cjs';

const port = process.argv.find(a => /^\d+$/.test(a)) ?? '5199';
const at = n => `[data-shot="${n}"]`;
const wait = ms => new Promise(r => setTimeout(r, ms));
let failed = 0;
const ok = (what, pass, got = '') => {
  console.log(`${pass ? '✅' : '❌'} ${what}${pass ? '' : `  (got ${got})`}`);
  if (!pass) failed += 1;
};

// browser=firefox runs it in Gecko too (Firefox installed in /Applications, or
// FIREFOX=<path>): another engine's Web Audio, as on a whiteboard's own PC
const firefox = process.argv.includes('browser=firefox');
const browser = firefox
  ? await puppeteer.launch({
      browser: 'firefox',
      executablePath: process.env.FIREFOX ?? '/Applications/Firefox.app/Contents/MacOS/firefox',
      headless: true,
      // without it, a Firefox already open hands the launch to itself and exits
      args: ['--no-remote'],
      extraPrefsFirefox: { 'media.autoplay.default': 0, 'media.autoplay.blocking_policy': 0, 'media.volume_scale': '0.0' }
    })
  : await puppeteer.launch({ executablePath: chromePath(), headless: true, args: ['--mute-audio', '--autoplay-policy=no-user-gesture-required'] });
console.log(`in ${firefox ? 'Firefox' : 'Chrome'} ${await browser.version()}`);
const page = await browser.newPage();
await page.setViewport({ width: 1180, height: 820 });
const errors = [];
page.on('pageerror', e => errors.push(e.message));

await page.evaluateOnNewDocument(() => {
  window.speechSynthesis.speak = () => {};
  // every context the page makes, how, and which one each sound is made on
  window.__made = [];
  const Real = window.AudioContext;
  window.AudioContext = class extends Real {
    constructor(...args) {
      // an iPad allows only a few contexts: the check can make it refuse one
      if (window.__refuse) throw new Error('refused');
      super(...args);
      window.__made.push({ ctx: this, options: args[0] ?? null });
    }
  };
  window.webkitAudioContext = window.AudioContext;
  window.__soundsOn = [];
  for (const name of ['createBufferSource', 'createOscillator']) {
    const real = BaseAudioContext.prototype[name];
    BaseAudioContext.prototype[name] = function (...a) {
      if (!(this instanceof OfflineAudioContext)) window.__soundsOn.push({ kind: name, ctx: this });
      return real.apply(this, a);
    };
  }
  // how many of Luna's clips play at once, at most
  window.__live = 0;
  window.__most = 0;
  const start = AudioBufferSourceNode.prototype.start;
  AudioBufferSourceNode.prototype.start = function (...a) {
    window.__live += 1;
    window.__most = Math.max(window.__most, window.__live);
    let done = false;
    const end = () => { if (!done) { done = true; window.__live -= 1; } };
    this.addEventListener('ended', end);
    // a stopped clip reports its end a moment later: it's over when stop() is called
    this.__end = end;
    return start.apply(this, a);
  };
  const stop = AudioBufferSourceNode.prototype.stop;
  AudioBufferSourceNode.prototype.stop = function (...a) {
    this.__end?.();
    return stop.apply(this, a);
  };
});

/** a module of the app, the same copy the app runs (Vite may add a ?t= after an edit) */
const mod = path => `(await import(performance.getEntriesByType('resource').map(e => e.name).find(n => n.includes('${path}')) ?? '${path}'))`;
const engineState = () => page.evaluate(`(async () => {
  const m = ${mod('/src/utils/audioEngine.ts')};
  return { made: m.audioEngine.made, reason: m.audioEngine.lastReason, contexts: window.__made.length };
})()`);
const tapLuna = async () => { await page.click('[data-shot="hub"] [data-mood]'); await wait(900); };
const lastSoundIsOnNewest = () => page.evaluate(() => {
  const newest = window.__made[window.__made.length - 1]?.ctx;
  const last = window.__soundsOn.filter(s => s.kind === 'createBufferSource').pop();
  return !!newest && last?.ctx === newest;
});

await page.goto(`http://localhost:${port}/`, { waitUntil: 'networkidle0' });
await page.evaluate(() => { localStorage.clear(); localStorage.setItem('ms_luna_learning_progress_v1', JSON.stringify({ selectedGrade: 'grade1' })); });
await page.reload({ waitUntil: 'networkidle0' });
await wait(1500);

// ── before a tap, then one engine ──
let made = await page.evaluate(() => window.__made.length);
ok('no context that plays is made before a tap', made === 0, `${made} made at load`);
const warmed = await page.evaluate(`(async () => ${mod('/src/utils/voiceClips.ts')}.voiceClips.buffers.size)()`);
ok('the letter sounds are decoded before a tap all the same', warmed > 20, `${warmed} clips decoded`);

await page.click(at('open-reading'));
await page.waitForSelector(at('hub'));
await wait(1500);
await tapLuna();
const one = await page.evaluate(() => ({
  contexts: window.__made.length,
  hint: window.__made[0]?.options?.latencyHint ?? null,
  on: [...new Set(window.__soundsOn.map(s => s.ctx))].length,
  kinds: [...new Set(window.__soundsOn.map(s => s.kind))].join('+')
}));
ok('one context for the voice and the effects', one.contexts === 1 && one.on === 1 && one.kinds.includes('createBufferSource') && one.kinds.includes('createOscillator'), JSON.stringify(one));
ok('made with bigger buffers ("playback"), so a busy machine doesn\'t stutter', one.hint === 'playback', one.hint);
const limiter = await page.evaluate(`(async () => {
  const out = ${mod('/src/utils/audioEngine.ts')}.audioEngine.get()?.out;
  return out instanceof DynamicsCompressorNode ? { threshold: out.threshold.value, ratio: out.ratio.value } : String(out?.constructor?.name);
})()`);
ok('a limiter stands in front of the speakers', typeof limiter === 'object' && limiter.threshold <= 0 && limiter.ratio >= 12, JSON.stringify(limiter));

// ── a fresh engine after anything that can leave it at the wrong rate ──
const freshAfter = async (what, reason, cause) => {
  const before = await engineState();
  const firstCtx = await page.evaluate(() => window.__made.length - 1);
  await cause();
  // a sound outside a tap keeps the old one, which can still start
  await page.evaluate(`(async () => ${mod('/src/utils/audio.ts')}.soundManager.playPop())()`);
  const between = await engineState();
  ok(`${what}: nothing new until the next tap`, between.contexts === before.contexts, JSON.stringify(between));
  await tapLuna();
  const after = await engineState();
  const oldClosed = await page.evaluate(i => window.__made[i]?.ctx.state === 'closed', firstCtx);
  ok(`${what}: the next tap makes a fresh one ("${reason}") and closes the old`, after.contexts === before.contexts + 1 && after.reason === reason && oldClosed, JSON.stringify({ before, after, oldClosed }));
  ok(`${what}: Luna's line plays on the fresh one`, await lastSoundIsOnNewest());
};

await freshAfter('the sound moves to another output', 'device', () =>
  page.evaluate(() => navigator.mediaDevices.dispatchEvent(new Event('devicechange'))));
await freshAfter('the page comes back from the background', 'returned', () =>
  page.evaluate(() => document.dispatchEvent(new Event('visibilitychange'))));
await freshAfter('the system suspends it (a call, Siri)', 'interrupted', () =>
  page.evaluate(() => window.__made[window.__made.length - 1].ctx.suspend()));

// the clock: a real one is left alone; one running 8% slow (44.1 against 48 kHz) is replaced
const pop = () => page.evaluate(`(async () => ${mod('/src/utils/audio.ts')}.soundManager.playPop())()`);
let before = await engineState();
await pop(); await wait(3300); await pop(); await wait(200); await pop();
await tapLuna();
let after = await engineState();
ok('a clock at the right speed leaves the engine alone', after.contexts === before.contexts, JSON.stringify({ before, after }));

/** the newest context's clock, made to run at `speed` from now on, measured from now */
const clockAt = speed => page.evaluate(async speed => {
  const src = performance.getEntriesByType('resource').map(e => e.name).find(n => n.includes('/src/utils/audioEngine.ts')) ?? '/src/utils/audioEngine.ts';
  (await import(src)).audioEngine.clock = null;
  const ctx = window.__made[window.__made.length - 1].ctx;
  const t0 = performance.now();
  const c0 = ctx.currentTime;
  ctx.getOutputTimestamp = () => {
    const wall = performance.now();
    return { contextTime: c0 + ((wall - t0) / 1000) * speed, performanceTime: wall };
  };
}, speed);

// a clock that stopped (the machine slept) is not a wrong rate
before = await engineState();
await clockAt(0.02);
await pop(); await wait(3300); await pop();
await tapLuna();
after = await engineState();
ok('a clock that stopped (the machine slept) leaves the engine alone', after.contexts === before.contexts, JSON.stringify({ before, after }));

await freshAfter('its clock runs 8% slow', 'clock', async () => {
  await clockAt(44100 / 48000);
  await pop(); await wait(3300); await pop();
});

// a clock that's always off makes a fresh one at most once a minute, not every tap
before = await engineState();
await clockAt(44100 / 48000);
await pop(); await wait(3300); await pop();
await tapLuna();
after = await engineState();
ok('a clock still off right after: no second fresh one within the minute', after.contexts === before.contexts, JSON.stringify({ before, after }));

// a browser that refuses a new context keeps the old one playing
before = await engineState();
await page.evaluate(() => { window.__refuse = true; navigator.mediaDevices.dispatchEvent(new Event('devicechange')); });
await tapLuna();
await page.evaluate(() => { window.__refuse = false; });
after = await engineState();
const keptOld = await page.evaluate(() => window.__made[window.__made.length - 1].ctx.state !== 'closed');
ok('a browser that refuses a new context keeps the old one, and Luna still talks', after.contexts === before.contexts && keptOld && await lastSoundIsOnNewest(), JSON.stringify({ before, after, keptOld }));

// ── one clip at a time ──
await wait(2500);
await page.evaluate(`(async () => {
  // sources on contexts closed above never report their end: count afresh
  window.__live = 0;
  window.__most = 0;
  const { pronunciation } = ${mod('/src/utils/pronunciation.ts')};
  pronunciation.speakWord('cat');
  pronunciation.speakWord('dog', { interrupt: false });
})()`);
await wait(2000);
const most = await page.evaluate(() => window.__most);
ok('one of Luna\'s clips at a time, even when a line doesn\'t interrupt', most === 1, `${most} at once`);

// ── a removed clip, in a tab older than the last render ──
const stale = await page.evaluate(`(async () => {
  const { voiceClips } = ${mod('/src/utils/voiceClips.ts')};
  const { audioEngine } = ${mod('/src/utils/audioEngine.ts')};
  const real = await voiceClips.manifest('af_heart');
  const key = 'word|cat|normal';
  if (!real.clips[key]) return 'no clip for cat';
  const old = { ...real, clips: { ...real.clips, [key]: 'gone0000000000000.m4a' } };
  voiceClips.manifests.set('af_heart', Promise.resolve(old));
  voiceClips.fetchedAt.set('af_heart', 0);
  const buffer = await voiceClips.get(audioEngine.decodeContext?.() ?? new OfflineAudioContext(1, 1, 48000), 'af_heart', 'word', 'cat', 'normal');
  voiceClips.manifests.delete('af_heart');
  return buffer ? 'found' : 'lost';
})()`);
ok('a tab older than the last render still finds a clip it removed', stale === 'found', stale);

// ── Words Off the Page: the read-back stops when something cuts in ──
await page.evaluate(`(async () => {
  const { pronunciation } = ${mod('/src/utils/pronunciation.ts')};
  window.__said = [];
  const say = pronunciation.say.bind(pronunciation);
  pronunciation.say = (req, text, opts) => { window.__said.push(req.kind + ':' + text); return say(req, text, opts); };
})()`);
let opened = false;
for (const t of await page.$$(at('game-tile'))) {
  if ((await t.evaluate(e => e.textContent)).includes('Words Off the Page')) { await t.click(); opened = true; break; }
}
if (opened) {
  await page.waitForSelector(at('play'));
  await page.click(at('play'));
  await page.waitForSelector(at('stage'));
  await wait(1200);
  const words = await page.evaluate(() => {
    const el = document.querySelector('[data-shot="stage"] button');
    const key = Object.keys(el).find(k => k.startsWith('__reactFiber'));
    for (let f = el[key]; f; f = f.return) if (f.memoizedProps?.round?.words) return f.memoizedProps.round.words;
    return null;
  });
  for (const word of words ?? []) {
    const tiles = await page.$$('[data-shot="stage"] button');
    for (const t of tiles) {
      const label = await t.evaluate(e => (e.getAttribute('aria-label') ? null : e.textContent.trim()));
      if (label === word) { await t.click(); break; }
    }
    await wait(250);
  }
  // the read-back starts 650 ms after the last word; let one word play, then cut in
  await page.waitForFunction(n => window.__said.filter(s => s.startsWith('word:')).length >= n + 1, { timeout: 8000 }, words?.length ?? 0).catch(() => {});
  await wait(150);
  await page.evaluate(() => { window.__cut = window.__said.length; });
  const hear = await page.$$('[data-shot="stage"] button');
  for (const b of hear) {
    if ((await b.evaluate(e => e.textContent)).includes('Hear the whole sentence')) { await b.click(); break; }
  }
  await wait(3000);
  const after = await page.evaluate(() => window.__said.slice(window.__cut));
  const readOn = after.filter(s => s.startsWith('word:'));
  ok('Words Off the Page: its read-back stops when the sentence cuts in', words && after.length > 0 && readOn.length === 0, JSON.stringify(after));
} else {
  ok('Words Off the Page is on the shelf', false, 'not found');
}

// ── the browser's own voice: a woman's ──
const picked = await page.evaluate(`(async () => {
  const { pronunciation } = ${mod('/src/utils/pronunciation.ts')};
  const Real = window.SpeechSynthesisUtterance;
  const speak = window.speechSynthesis.speak;
  let got = null;
  window.SpeechSynthesisUtterance = class { constructor(text) { this.text = text; } };
  window.speechSynthesis.speak = u => { got = u.voice?.name ?? null; };
  const keep = pronunciation.browserVoices;
  pronunciation.browserVoices = [
    { name: 'Microsoft David - English (United States)', lang: 'en-US' },
    { name: 'Microsoft Mark - English (United States)', lang: 'en-US' },
    { name: 'Microsoft Zira - English (United States)', lang: 'en-US' }
  ];
  pronunciation.speakWithBrowser('hello');
  pronunciation.browserVoices = keep;
  window.SpeechSynthesisUtterance = Real;
  window.speechSynthesis.speak = speak;
  return got;
})()`);
ok('the browser\'s voice, if it\'s ever reached, is a woman\'s (Zira over David on Windows)', picked?.includes('Zira'), picked);

ok('no page errors', errors.length === 0, errors.join(' | '));
await browser.close();
console.log(failed ? `\n${failed} failed` : '\nALL PASS');
process.exit(failed ? 1 : 0);
