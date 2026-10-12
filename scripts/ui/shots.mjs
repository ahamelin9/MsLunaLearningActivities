#!/usr/bin/env node
// Screenshots every screen of the Learning Pad at the four iPad sizes, so a
// design change can be judged before and after, and compares two sets.
//
//   npm run ui:shots                          -> screenshots/latest/
//   npm run ui:shots -- --label before        -> screenshots/before/
//   npm run ui:shots -- --label after         -> screenshots/after/
//   npm run ui:shots -- --diff before after   -> screenshots/diff-before-after/
//   npm run ui:shots -- --kit --label kit     -> screenshots/kit/kit/{light,dark}.png, the tokens (DES-20),
//                                                and components-{light,dark}.png (DES-7a)
//   npm run ui:shots -- --reduced-motion      -> the same run with Reduce Motion on; fails if anything still moves (DES-6)
//   npm run ui:shots -- --theme dark --label after-dark
//                                             -> the same run in the dark roles (DES-8): data-theme="dark" on <html>.
//                                                Until DES-16 only what's on roles turns dark
//
// It starts its own Vite dev server and drives the Chrome already installed
// on this machine (puppeteer-core downloads no browser of its own). Set
// CHROME_PATH to use a different one. Each size runs from a fresh start:
// its own browser profile with localStorage cleared, the way a new child
// first meets the app.
//
// The same tree gives the same pixels on every run, so a pure refactor can be
// proven with --diff (0 changed screens):
//  - the page runs on its own clock (installPageClock). Time moves only when
//    the script moves it, timers fire in a fixed order, Math.random is seeded,
//    and Luna's clips "play" for their own length on that clock without a
//    sound. Network speed and machine load can't change a frame.
//  - CSS animations stand still on the browser's clock. Before each shot,
//    endless ones are held at their start and the rest are finished, then two
//    real frames are painted. The confetti canvas never draws.
//  - --diff exits 1 when any screen differs, so it can gate a refactor.
//  - everything is found by `data-shot="…"` attributes, never by a class
//    name, so moving styles into CSS modules can't break the run.

import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';
import { createServer } from 'vite';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');

/** The iPads the app has to look right on, landscape and portrait. */
const VIEWPORTS = [
  { width: 1180, height: 820 }, // iPad Air / iPad 10th gen, landscape
  { width: 820, height: 1180 }, // the same, portrait
  { width: 1024, height: 768 }, // iPad 9th gen, landscape
  { width: 744, height: 1133 } // iPad mini, portrait
];

const CHROME_PATH =
  process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

/** App time a screen gets before its shot: its entrance and its first line. */
const SETTLE_MS = 900;
/** How far the page clock moves between looks while waiting for something. */
const STEP_MS = 50;
/** A right answer's explanation can run up to 7 s before it settles (useAnswer). */
const ANSWER_MS = 8000;
/** Every run starts at the same moment: 9:41 AM on a Monday, in UTC. */
const CLOCK_START = Date.UTC(2026, 9, 12, 9, 41);
const RANDOM_SEED = 20261012;
/** A pixel differs when any channel moves by more than this (0–255). */
const DIFF_THRESHOLD = 8;

function parseArgs(argv) {
  const name = /^[\w.-]+$/;
  const usage = () => {
    console.error(
      'Usage: npm run ui:shots -- [--label <name>]\n' +
        '       npm run ui:shots -- --kit [--label <name>]\n' +
        '       npm run ui:shots -- --reduced-motion [--label <name>]\n' +
        '       npm run ui:shots -- --theme light|dark [--label <name>]\n' +
        '       npm run ui:shots -- --diff <label-a> <label-b>\n' +
        'Labels use letters, digits, . _ - only.'
    );
    process.exit(1);
  };
  const d = argv.indexOf('--diff');
  if (d !== -1) {
    const [a, b] = argv.slice(d + 1, d + 3);
    if (!name.test(a ?? '') || !name.test(b ?? '')) usage();
    return { mode: 'diff', a, b };
  }
  const kit = argv.includes('--kit');
  const reduced = argv.includes('--reduced-motion');
  const t = argv.indexOf('--theme');
  const theme = t === -1 ? 'light' : argv[t + 1];
  if (theme !== 'light' && theme !== 'dark') usage();
  const i = argv.indexOf('--label');
  const label = i === -1 ? (kit ? 'kit' : 'latest') : argv[i + 1];
  if (!label || !name.test(label)) usage();
  return { mode: kit ? 'kit' : 'shoot', label, reduced, theme };
}

const slug = text =>
  text
    .toLowerCase()
    .replace(/[’']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

const at = name => `[data-shot="${name}"]`;

const launchChrome = () =>
  puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: [
      // Luna's sound effects still run, but nothing comes out of the speakers
      '--autoplay-policy=no-user-gesture-required',
      '--mute-audio',
      // four pages run side by side; none of them may be slowed as a background tab
      '--disable-background-timer-throttling',
      '--disable-renderer-backgrounding',
      '--disable-backgrounding-occluded-windows'
    ]
  });

// ---------------------------------------------------------------------------
// In the page. These run in the browser, so they must not use anything from
// this file's scope: puppeteer sends them over as source text.
// ---------------------------------------------------------------------------

/**
 * Puts the page on a clock the script moves (`window.__pageClock.advance`),
 * installed before any of the app's code runs. Date, performance.now,
 * setTimeout, setInterval and requestAnimationFrame all read it. Before every
 * step it waits for fetches, clip decodes, fonts and images in flight, so how
 * fast they arrive can't change what happens next.
 */
function installPageClock({ start, seed }) {
  const realSetTimeout = window.setTimeout.bind(window);
  const realFrame = window.requestAnimationFrame.bind(window);
  const RealDate = Date;

  // a seeded Math.random (mulberry32), so every run deals the same rounds
  let state = seed >>> 0;
  Math.random = () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  // ---- the clock ----
  let now = 0;
  function PageDate(...args) {
    if (!new.target) return new RealDate(start + now).toString();
    return args.length ? new RealDate(...args) : new RealDate(start + now);
  }
  PageDate.prototype = RealDate.prototype;
  PageDate.now = () => start + now;
  PageDate.parse = RealDate.parse;
  PageDate.UTC = RealDate.UTC;
  window.Date = PageDate;
  performance.now = () => now;

  const timers = new Map();
  let nextId = 1;
  let order = 0;
  const schedule = (fn, ms, args, repeat) => {
    const id = nextId++;
    if (typeof fn !== 'function') return id;
    const delay = Math.max(0, Number(ms) || 0);
    timers.set(id, { at: now + (repeat ? Math.max(1, delay) : delay), order: order++, fn, args, every: repeat ? Math.max(1, delay) : 0 });
    return id;
  };
  const cancel = id => void timers.delete(id);
  window.setTimeout = (fn, ms, ...args) => schedule(fn, ms, args, false);
  window.setInterval = (fn, ms, ...args) => schedule(fn, ms, args, true);
  window.clearTimeout = cancel;
  window.clearInterval = cancel;
  window.requestAnimationFrame = fn => {
    const frame = (Math.floor(now / 16) + 1) * 16;
    return schedule(() => fn(frame), frame - now, [], false);
  };
  window.cancelAnimationFrame = cancel;

  // ---- what the clock waits for ----
  let inFlight = 0;
  const track = promise => {
    inFlight += 1;
    const done = () => (inFlight -= 1);
    promise.then(done, done);
    return promise;
  };
  const realFetch = window.fetch;
  window.fetch = function (...args) {
    return track(realFetch.apply(this, args));
  };
  for (const method of ['arrayBuffer', 'blob', 'json', 'text']) {
    const real = Response.prototype[method];
    Response.prototype[method] = function () {
      return track(real.call(this));
    };
  }
  const realDecode = BaseAudioContext.prototype.decodeAudioData;
  BaseAudioContext.prototype.decodeAudioData = function (...args) {
    return track(realDecode.apply(this, args));
  };
  const realResume = AudioContext.prototype.resume;
  AudioContext.prototype.resume = function () {
    return track(realResume.call(this));
  };

  // ---- Luna's voice, on the clock ----
  // A clip ends after its own length, and stopping it ends it at once, as in
  // a browser. Nothing reaches the speakers.
  const playing = new WeakMap();
  AudioBufferSourceNode.prototype.start = function () {
    const ms = (this.buffer ? this.buffer.duration : 0) * 1000;
    playing.set(this, schedule(() => this.dispatchEvent(new Event('ended')), ms, [], false));
  };
  AudioBufferSourceNode.prototype.stop = function () {
    if (!playing.has(this)) throw new DOMException('stop() before start()', 'InvalidStateError');
    cancel(playing.get(this));
    schedule(() => this.dispatchEvent(new Event('ended')), 0, [], false);
  };
  // The browser voice is Luna's fallback for a line with no clip. It "speaks"
  // on the clock too.
  let utterance = null;
  Object.defineProperty(window, 'speechSynthesis', {
    configurable: true,
    value: {
      speaking: false,
      pending: false,
      paused: false,
      onvoiceschanged: null,
      getVoices: () => [],
      addEventListener() {},
      removeEventListener() {},
      pause() {},
      resume() {},
      speak(next) {
        utterance = next;
        next.dispatchEvent(new Event('start'));
        schedule(() => utterance === next && next.dispatchEvent(new Event('end')), 400 + 60 * next.text.length, [], false);
      },
      cancel() {
        utterance = null;
      }
    }
  });

  // ---- moving the clock ----
  const turn = () => new Promise(r => realSetTimeout(r, 0));
  const settled = () =>
    inFlight === 0 && document.fonts.status === 'loaded' && [...document.images].every(img => img.complete);

  /** Lets everything in flight land, and React finish what it started. */
  async function quiet() {
    const giveUp = RealDate.now() + 30_000;
    for (let calm = 0; calm < 3; ) {
      await turn();
      calm = settled() ? calm + 1 : 0;
      if (RealDate.now() > giveUp) throw new Error(`the page never went quiet (${inFlight} requests in flight)`);
    }
  }

  /** Moves the clock on by `ms`, firing every timer due on the way, in order. */
  async function advance(ms) {
    const until = now + ms;
    await quiet();
    for (let fired = 0; ; fired++) {
      if (fired > 50_000) throw new Error('a timer loop never let the page clock move on');
      let dueId = null;
      let due = null;
      for (const [id, timer] of timers) {
        if (timer.at > until) continue;
        if (!due || timer.at < due.at || (timer.at === due.at && timer.order < due.order)) {
          due = timer;
          dueId = id;
        }
      }
      if (!due) break;
      now = Math.max(now, due.at);
      if (due.every) {
        due.at = now + due.every;
        due.order = order++;
      } else {
        timers.delete(dueId);
      }
      try {
        due.fn(...due.args);
      } catch (err) {
        realSetTimeout(() => {
          throw err;
        });
      }
      await quiet();
    }
    now = until;
    await quiet();
  }

  /**
   * Waits for two real frames. CSS animations run on the browser's own clock,
   * and an animation finished from script is only on screen once the next
   * frame is painted; a shot taken sooner can catch the app window mid-zoom.
   */
  const painted = () =>
    new Promise(done => {
      realSetTimeout(done, 1000); // in case a frame never comes
      realFrame(() => realFrame(done));
    });

  // the confetti canvas never draws: its 120 pieces would differ frame to frame
  HTMLCanvasElement.prototype.getContext = () => null;

  window.__pageClock = { advance, quiet, painted };
}

/** True when the element is on the page and takes up space. */
function shown(selector) {
  const el = document.querySelector(selector);
  if (!el) return false;
  const box = el.getBoundingClientRect();
  return box.width > 0 && box.height > 0;
}

/** Holds endless animations at their start and finishes the rest. */
/** Animations still running or looping: under reduced motion there must be none (DES-6). */
function stillMoving() {
  return document
    .getAnimations()
    .filter(a => {
      const t = a.effect?.getComputedTiming?.();
      // the run's frozen animation clock keeps even a 0ms one "running", so
      // what counts is a loop or a duration of a frame or more (an old
      // reduced-motion block's 0.01ms can't be seen)
      return t && a.playState !== 'finished' && (t.iterations === Infinity || Number(t.duration) >= 16);
    })
    .map(a => {
      const t = a.effect.getComputedTiming();
      return `${a.animationName || a.transitionProperty || 'an animation'} (${t.duration}ms × ${t.iterations})`;
    });
}

function holdAnimations() {
  for (const animation of document.getAnimations()) {
    try {
      if (animation.effect?.getComputedTiming().endTime === Infinity) {
        animation.pause();
        animation.currentTime = 0;
      } else {
        animation.finish();
      }
    } catch {
      // an animation that can't be finished is left as it is
    }
  }
}

/** The round's label ("Round 2 of 5"), or null once the round pips are gone. */
function roundLabel() {
  return document.querySelector('[data-shot="round-pips"]')?.getAttribute('aria-label') ?? null;
}

/** True once the round has moved on from `round`: the next round, or the reward. */
function roundMoved(round) {
  const label = document.querySelector('[data-shot="round-pips"]')?.getAttribute('aria-label') ?? null;
  return Boolean(document.querySelector('[data-shot="shell-reward"]')) || label !== round;
}

/** True once a choice was right: the win veil, the next round, or the reward. */
function answerWon(round) {
  const label = document.querySelector('[data-shot="round-pips"]')?.getAttribute('aria-label') ?? null;
  return Boolean(document.querySelector('[data-shot="win-veil"], [data-shot="shell-reward"]')) || label !== round;
}

/**
 * Compares two PNGs pixel by pixel. Returns how many differ and, if any do,
 * an overlay: the second screen faded, every differing pixel red, and a red
 * box around them all so a single pixel can still be found.
 */
async function comparePngs(aBase64, bBase64, threshold) {
  const pixels = async base64 => {
    const blob = await (await fetch(`data:image/png;base64,${base64}`)).blob();
    const bitmap = await createImageBitmap(blob, { colorSpaceConversion: 'none', premultiplyAlpha: 'none' });
    const ctx = new OffscreenCanvas(bitmap.width, bitmap.height).getContext('2d');
    ctx.drawImage(bitmap, 0, 0);
    return ctx.getImageData(0, 0, bitmap.width, bitmap.height);
  };
  const [a, b] = await Promise.all([pixels(aBase64), pixels(bBase64)]);
  if (a.width !== b.width || a.height !== b.height) {
    return { differing: b.width * b.height, note: `size changed from ${a.width}×${a.height} to ${b.width}×${b.height}`, overlay: null };
  }

  const out = new ImageData(b.width, b.height);
  let differing = 0;
  let [left, top, right, bottom] = [b.width, b.height, -1, -1];
  for (let i = 0; i < b.data.length; i += 4) {
    const changed =
      Math.abs(a.data[i] - b.data[i]) > threshold ||
      Math.abs(a.data[i + 1] - b.data[i + 1]) > threshold ||
      Math.abs(a.data[i + 2] - b.data[i + 2]) > threshold ||
      Math.abs(a.data[i + 3] - b.data[i + 3]) > threshold;
    if (changed) {
      differing += 1;
      const x = (i / 4) % b.width;
      const y = Math.floor(i / 4 / b.width);
      [left, top, right, bottom] = [Math.min(left, x), Math.min(top, y), Math.max(right, x), Math.max(bottom, y)];
      out.data.set([255, 0, 0, 255], i);
    } else {
      const grey = b.data[i] * 0.3 + b.data[i + 1] * 0.59 + b.data[i + 2] * 0.11;
      const faded = 255 - (255 - grey) * 0.3;
      out.data.set([faded, faded, faded, 255], i);
    }
  }
  if (differing === 0) return { differing, note: '', overlay: null };

  const canvas = new OffscreenCanvas(b.width, b.height);
  const ctx = canvas.getContext('2d');
  ctx.putImageData(out, 0, 0);
  ctx.strokeStyle = 'rgb(255, 0, 0)';
  ctx.lineWidth = 2;
  ctx.strokeRect(left - 6, top - 6, right - left + 13, bottom - top + 13);
  const png = await canvas.convertToBlob({ type: 'image/png' });
  const overlay = await new Promise(done => {
    const reader = new FileReader();
    reader.onload = () => done(String(reader.result).split(',')[1]);
    reader.readAsDataURL(png);
  });
  const share = ((differing / (b.width * b.height)) * 100).toFixed(differing < 100 ? 4 : 2);
  return {
    differing,
    note: `${differing.toLocaleString('en-US')} pixel${differing === 1 ? '' : 's'} (${share}%) between x ${left}–${right}, y ${top}–${bottom}`,
    overlay
  };
}

// ---------------------------------------------------------------------------
// Driving the app
// ---------------------------------------------------------------------------

/** The moves every run makes, all on the page clock. */
function driver(page) {
  const advance = ms => page.evaluate(ms => window.__pageClock.advance(ms), ms);
  const quiet = () => page.evaluate(() => window.__pageClock.quiet());

  /** Moves the clock on until `test(arg)` holds in the page; false if it never does within `withinMs`. */
  const waitFor = async (test, arg, withinMs) => {
    await quiet();
    for (let waited = 0; ; waited += STEP_MS) {
      if (await page.evaluate(test, arg)) return true;
      if (waited >= withinMs) return false;
      await advance(STEP_MS);
    }
  };
  const until = async (name, withinMs = 15_000) => {
    if (!(await waitFor(shown, at(name), withinMs))) throw new Error(`${at(name)} never appeared`);
  };
  const gone = async (name, withinMs = 15_000) => {
    const hidden = await waitFor(selector => !document.querySelector(selector), at(name), withinMs);
    if (!hidden) throw new Error(`${at(name)} never went away`);
  };
  const click = async (name, nth = 0) => {
    await until(name);
    const targets = await page.$$(at(name));
    if (!targets[nth]) throw new Error(`there is no ${at(name)} number ${nth + 1}`);
    await targets[nth].click();
  };
  const scrollTo = name =>
    page.$eval(at(name), el => el.scrollIntoView({ block: 'start', behavior: 'instant' }));

  return { advance, quiet, waitFor, until, gone, click, scrollTo };
}

/** One run through the app at one size. */
async function shootViewport(browser, url, viewport, outDir, reduced = false, theme = 'light') {
  const size = `${viewport.width}x${viewport.height}`;
  const dir = join(outDir, size);
  mkdirSync(dir, { recursive: true });

  const context = await browser.createBrowserContext();
  const page = await context.newPage();
  await page.setViewport({ ...viewport, deviceScaleFactor: 1, hasTouch: true });
  await page.emulateTimezone('UTC');
  // DES-6: the iPad's own Reduce Motion, so every screen must stand still
  if (reduced) await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  const moving = [];
  await page.evaluateOnNewDocument(installPageClock, { start: CLOCK_START, seed: RANDOM_SEED });
  // CSS animations would otherwise run on the browser's real clock; standing
  // still, each one is only ever where holdAnimations puts it
  const devtools = await page.createCDPSession();
  await devtools.send('Animation.enable');
  await devtools.send('Animation.setPlaybackRate', { playbackRate: 0 });
  const drive = driver(page);
  const { advance, quiet, until, gone, click, scrollTo } = drive;

  let n = 0;
  let step = 'start';
  const shot = async name => {
    step = name;
    // the pointer rests off to the side, so nothing is caught mid-hover
    await page.mouse.move(viewport.width - 1, viewport.height - 1);
    await advance(SETTLE_MS);
    if (reduced) {
      const still = await page.evaluate(stillMoving);
      if (still.length) moving.push(`${name}: ${still.join(', ')}`);
    }
    await page.evaluate(holdAnimations);
    await quiet();
    await page.evaluate(() => window.__pageClock.painted());
    const file = `${String(++n).padStart(2, '0')}-${name}.png`;
    await page.screenshot({ path: join(dir, file) });
    console.log(`  ${size}  ${file}`);
  };

  try {
    // ---- a fresh start ----
    await page.goto(url, { waitUntil: 'networkidle0' });
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: 'networkidle0' });
    // DES-8: index.html pins the app light, and nothing changes it until DES-16
    await page.evaluate(theme => document.documentElement.setAttribute('data-theme', theme), theme);
    await until('home');
    await shot('home');

    // ---- into the Reading app, which asks for a grade first ----
    await click('open-reading');
    await until('grade-select');
    await shot('grade-select');

    await click('grade-card'); // the first card: Kindergarten
    await until('hub');
    await shot('hub-top');
    await scrollTo('hub-rug');
    await shot('hub-rug');
    await scrollTo('hub-tin');
    await shot('hub-tin');
    await scrollTo('hub');

    // ---- the grown-up screens ----
    await click('open-settings');
    await until('settings');
    await shot('settings');
    await click('modal-close');
    await gone('settings');

    // The Trophy room: since DES-9b it opens from the library's sticker tin;
    // the run still looks on the home screen too, and skips the shot (keeping
    // its number) when nothing opens it. Either way the run then goes home and
    // back into Reading, as it has since DES-8: the trip deals the next random
    // numbers, so keeping it keeps every game's rounds the same run to run.
    let trophiesHere = await page.evaluate(shown, at('open-trophies'));
    if (!trophiesHere) {
      await click('app-home');
      await until('home');
      trophiesHere = await page.evaluate(shown, at('open-trophies'));
    }
    if (trophiesHere) {
      await click('open-trophies');
      await until('trophies');
      await shot('trophies');
      await click('modal-close');
      await gone('trophies');
    } else {
      n += 1;
      console.log(`  ${size}  ${String(n).padStart(2, '0')}-trophies.png skipped: nothing opens the Trophy room yet`);
    }
    if (await page.evaluate(shown, at('app-home'))) {
      await click('app-home');
      await until('home');
    }
    await click('open-reading');
    await until('hub');

    // ---- every game: its start screen and its first round ----
    const titles = await page.$$eval(`${at('game-tile')} ${at('tile-title')}`, els =>
      els.map(el => el.textContent.trim())
    );
    for (const [i, title] of titles.entries()) {
      const name = `game-${slug(title)}`;
      step = name;
      await click('game-tile', i);
      await until('shell-intro');
      await shot(`${name}-intro`);
      await click('play');
      await until('shell-play');
      await shot(`${name}-play`);
      await click('shell-back');
      await until('hub');
    }

    // ---- the first lesson, played through to its reward ----
    step = 'lesson';
    await click('lesson-tile');
    await until('shell-intro');
    await shot('lesson-intro');
    await click('play');
    await until('shell-play');
    await shot('lesson-play');
    step = 'lesson-solve';
    await solveLesson(page, drive);
    await until('shell-reward');
    await shot('reward');
    step = 'reduced motion';
    if (moving.length) throw new Error(`still moving with reduced motion:\n  ${moving.join('\n  ')}`);
  } catch (err) {
    await page.screenshot({ path: join(dir, `FAILED-${step}.png`) }).catch(() => {});
    throw new Error(`${size}, at "${step}": ${err.message}`);
  } finally {
    await context.close();
  }
}

/**
 * Answers every question of a lesson by trying its choices in turn. A choice
 * is said aloud first; a right one then brings the win veil and the next
 * round, and a wrong one only Luna's comfort, so the next choice is tried.
 */
async function solveLesson(page, { click, waitFor }) {
  for (let guard = 0; guard < 30; guard++) {
    if (await page.evaluate(shown, at('shell-reward'))) return;
    const round = await page.evaluate(roundLabel);
    const count = (await page.$$(at('lesson-choice'))).length;
    if (count === 0) throw new Error(`this lesson question has no ${at('lesson-choice')} buttons to try`);

    let won = false;
    for (let i = 0; i < count && !won; i++) {
      await click('lesson-choice', i);
      won = await waitFor(answerWon, round, ANSWER_MS);
    }
    if (!won) throw new Error(`no choice was right in "${round}"`);
    if (!(await waitFor(roundMoved, round, 10_000))) throw new Error(`"${round}" never moved on`);
  }
  throw new Error('the lesson never reached its reward screen');
}

async function shoot(label, reduced = false, theme = 'light') {
  const outDir = join(ROOT, 'screenshots', label);
  rmSync(outDir, { recursive: true, force: true });

  const server = await createServer({ root: ROOT, logLevel: 'error', server: { open: false } });
  await server.listen();
  const url = server.resolvedUrls.local[0];
  const browser = await launchChrome();

  // the four sizes run side by side, each in its own fresh profile
  const started = Date.now();
  const results = await Promise.allSettled(
    VIEWPORTS.map(viewport => shootViewport(browser, url, viewport, outDir, reduced, theme))
  );
  await browser.close();
  await server.close();

  const failures = results.filter(r => r.status === 'rejected');
  for (const f of failures) console.error(`\nui:shots failed — ${f.reason.message}`);
  if (failures.length) process.exit(1);
  const secs = Math.round((Date.now() - started) / 1000);
  console.log(
    `\nDone in ${secs}s: screenshots/${label}/${theme === 'dark' ? ' (dark)' : ''}${reduced ? ' (reduced motion: nothing kept moving on any screen)' : ''}`
  );
}

/**
 * The Kit page (DES-20), light and dark, as full-page shots at 1180×820 in
 * screenshots/<label>/kit/: the Tokens tab as {light,dark}.png and the
 * Components tab as components-{light,dark}.png (DES-7a). One-off animations
 * are shown at their end and loops at their start (DES-7b). Only that folder is
 * replaced, so the kit can sit beside a label's screens, and --diff compares it
 * like another size.
 */
async function shootKit(label) {
  const outDir = join(ROOT, 'screenshots', label, 'kit');
  rmSync(outDir, { recursive: true, force: true });
  mkdirSync(outDir, { recursive: true });

  const server = await createServer({ root: ROOT, logLevel: 'error', server: { open: false } });
  await server.listen();
  const url = server.resolvedUrls.local[0];
  const browser = await launchChrome();
  const page = await browser.newPage();
  await page.setViewport({ width: 1180, height: 820, deviceScaleFactor: 1 });
  // motion demos stand still, so the same tokens give the same pixels
  const devtools = await page.createCDPSession();
  await devtools.send('Animation.enable');
  await devtools.send('Animation.setPlaybackRate', { playbackRate: 0 });
  for (const tab of ['tokens', 'components']) {
    for (const mode of ['light', 'dark']) {
      const file = tab === 'tokens' ? `${mode}.png` : `${tab}-${mode}.png`;
      await page.goto(`${url}?kit&tab=${tab}&mode=${mode}`, { waitUntil: 'networkidle0' });
      await page.waitForSelector(at('kit-page'));
      // one-off animations (a pop, stars landing) show their end, loops their start
      await page.evaluate(() => {
        for (const a of document.getAnimations()) {
          const { iterations, endTime } = a.effect.getComputedTiming();
          if (iterations !== Infinity) a.currentTime = endTime;
        }
      });
      await page.evaluate(() => document.fonts.ready.then(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))));
      await page.screenshot({ path: join(outDir, file), fullPage: true });
      console.log(`  kit  ${file}`);
    }
  }
  await browser.close();
  await server.close();
  console.log(`\nDone: screenshots/${label}/kit/`);
}

// ---------------------------------------------------------------------------
// Comparing two runs
// ---------------------------------------------------------------------------

const folders = dir =>
  readdirSync(dir, { withFileTypes: true })
    .filter(e => e.isDirectory())
    .map(e => e.name);
const pngs = dir => (existsSync(dir) ? readdirSync(dir).filter(f => f.endsWith('.png')) : []);

async function diff(a, b) {
  const [dirA, dirB] = [a, b].map(label => join(ROOT, 'screenshots', label));
  for (const [label, dir] of [[a, dirA], [b, dirB]]) {
    if (!existsSync(dir)) {
      console.error(`No screenshots/${label}/ yet. Make it with: npm run ui:shots -- --label ${label}`);
      process.exit(1);
    }
  }
  const outName = `diff-${a}-${b}`;
  const outDir = join(ROOT, 'screenshots', outName);
  rmSync(outDir, { recursive: true, force: true });

  const sizes = [...new Set([...folders(dirA), ...folders(dirB)])].sort();
  console.log(`Comparing screenshots/${a}/ with screenshots/${b}/ (a pixel differs past ${DIFF_THRESHOLD} per channel)\n`);

  const browser = await launchChrome();
  const page = await browser.newPage();
  let changed = 0;
  for (const size of sizes) {
    const files = [...new Set([...pngs(join(dirA, size)), ...pngs(join(dirB, size))])].sort();
    const lines = [];
    for (const file of files) {
      const [fileA, fileB] = [join(dirA, size, file), join(dirB, size, file)];
      if (!existsSync(fileA) || !existsSync(fileB)) {
        lines.push(`    ${file}  only in ${existsSync(fileA) ? a : b}`);
        continue;
      }
      const result = await page.evaluate(
        comparePngs,
        readFileSync(fileA).toString('base64'),
        readFileSync(fileB).toString('base64'),
        DIFF_THRESHOLD
      );
      if (result.differing === 0) continue;
      lines.push(`    ${file}  ${result.note}`);
      if (result.overlay) {
        mkdirSync(join(outDir, size), { recursive: true });
        writeFileSync(join(outDir, size, file), Buffer.from(result.overlay, 'base64'));
      }
    }
    console.log(`  ${size}  ${lines.length} of ${files.length} screens differ`);
    for (const line of lines) console.log(line);
    changed += lines.length;
  }
  await browser.close();

  if (changed) {
    console.log(`\n${changed} changed screen${changed === 1 ? '' : 's'} at ${sizes.length} sizes. Red overlays: screenshots/${outName}/`);
    process.exit(1);
  }
  console.log(`\n0 changed screens at ${sizes.length} sizes.`);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!existsSync(CHROME_PATH)) {
    console.error(`Chrome not found at ${CHROME_PATH}. Set CHROME_PATH to a Chrome or Chromium binary.`);
    process.exit(1);
  }
  if (args.mode === 'diff') await diff(args.a, args.b);
  else if (args.mode === 'kit') await shootKit(args.label);
  else await shoot(args.label, args.reduced, args.theme);
  // a puppeteer run can keep the process alive after it's done
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
