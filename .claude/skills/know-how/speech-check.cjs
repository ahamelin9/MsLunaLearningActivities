// Silent browser check for Ms. Luna: opens a game or lesson, runs a scenario,
// and reports every utterance, when each clip played (and whether it was cut
// off), and anything that fell back to the browser voice.
//
// Copy this file to the scratchpad, edit CONFIG and scenario(), then, from the
// repo root, with a dev server already running on 5199:
//
//   node_modules/.bin/vite --port 5199 --strictPort   (in the background)
//   node <copy>/speech-check.cjs
//
// Muted, and speechSynthesis is stubbed, so it never talks over anyone.
// See SKILL.md in this folder for the reasoning and the pitfalls.

const { createRequire } = require('node:module');
const { join } = require('node:path');
const puppeteer = createRequire(join(process.cwd(), 'package.json'))('puppeteer-core');
// the one place every check finds Chrome: the Mac's, or a cloud session's Chromium (OPS-10)
const { chromePath } = require(join(process.cwd(), 'scripts', 'chrome-path.cjs'));

const CONFIG = {
  url: 'http://localhost:5199/',
  chrome: chromePath(),
  grade: 0, // 0 Kindergarten, 1 1st grade, 2 2nd grade
  kind: 'game', // 'game' (the play rug) or 'lesson'
  title: 'Letter Cookies' // as on its tile (a lesson's tile has its number too)
};

const sleep = ms => new Promise(r => setTimeout(r, ms));

/** What to do once play has started. Return anything you want printed. */
async function scenario(page, h) {
  // Example: try each cookie until the right one is eaten, then listen. Game
  // pieces are found by data-shot and read by data-state (OPS-9).
  const mark = await h.mark();
  const cookie = '[data-shot="cookie"]';
  const n = (await page.$$(cookie)).length;
  for (let c = 0; c < n; c++) {
    await (await page.$$(cookie))[c].evaluate(el => el.click());
    await sleep(500);
    if (await page.$(`${cookie}[data-state~="right"]`)) break;
    await sleep(2200);
  }
  await sleep(4500);
  return h.timeline(mark);
}

// ---------- the harness: rarely needs editing ----------

(async () => {
  const browser = await puppeteer.launch({ executablePath: CONFIG.chrome, headless: true, args: ['--mute-audio'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1180, height: 820, hasTouch: true });

  await page.evaluateOnNewDocument(() => {
    // the browser's own voice is recorded, never spoken
    window.__browserSpoke = [];
    Object.defineProperty(window, 'speechSynthesis', {
      configurable: true,
      value: { speak: u => window.__browserSpoke.push(u.text), cancel() {}, pause() {}, resume() {}, getVoices: () => [], addEventListener() {}, removeEventListener() {} }
    });
    // every clip that starts, when it ends, and whether something stopped it
    window.__said = [];
    window.__plays = [];
    // each decoded clip's line, set where it is fetched (below)
    window.__clipText = new WeakMap();
    const start = AudioBufferSourceNode.prototype.start;
    const stop = AudioBufferSourceNode.prototype.stop;
    AudioBufferSourceNode.prototype.start = function (...a) {
      const rec = { what: window.__clipText.get(this.buffer) ?? '?', t0: performance.now(), dur: (this.buffer?.duration ?? 0) * 1000, end: null, cut: false };
      window.__plays.push(rec);
      this.addEventListener('ended', () => { rec.end = rec.end ?? performance.now(); });
      this.__rec = rec;
      return start.apply(this, a);
    };
    AudioBufferSourceNode.prototype.stop = function (...a) {
      if (this.__rec && this.__rec.end == null) { this.__rec.end = performance.now(); this.__rec.cut = true; }
      return stop.apply(this, a);
    };
  });

  await page.goto(CONFIG.url, { waitUntil: 'networkidle0' });
  await page.evaluate(() => localStorage.clear()); // a fresh child
  await page.reload({ waitUntil: 'networkidle0' });

  // the app's own speech module (same instance under Vite): log each line
  // asked for, and give each decoded clip its line where it is fetched, so a
  // clip carries its own label when it starts. (Swapping playBuffer for each
  // line, as this did before OPS-9, stuck every clip to the first line once
  // two lines overlapped.)
  await page.evaluate(async () => {
    const { pronunciation } = await import('/src/utils/pronunciation.ts');
    const say = pronunciation.say;
    pronunciation.say = function (r, text, o) {
      window.__said.push(String(text));
      return say.call(this, r, text, o);
    };
    const fetchClip = pronunciation.fetchClip;
    pronunciation.fetchClip = async function (req) {
      const buffer = await fetchClip.call(this, req);
      if (buffer) window.__clipText.set(buffer, String(req.text));
      return buffer;
    };
  });

  // from home to the game, by the data-shot names (know-how, "Selectors that work")
  const at = n => `[data-shot="${n}"]`;
  await page.click(at('open-reading'));
  await page.waitForSelector(at('grade-card'));
  await (await page.$$(at('grade-card')))[CONFIG.grade].click();
  await page.waitForSelector(at('hub'));
  let opened = false;
  for (const tile of await page.$$(at(CONFIG.kind === 'lesson' ? 'lesson-tile' : 'game-tile'))) {
    if ((await tile.evaluate(el => el.textContent)).includes(CONFIG.title)) { await tile.click(); opened = true; break; }
  }
  if (!opened) throw new Error(`no ${CONFIG.kind} titled "${CONFIG.title}" at grade ${CONFIG.grade}`);
  await page.click(at('play'));
  await page.waitForSelector(at('shell-play'));
  await sleep(2500); // the round's opening line

  const h = {
    /** a point in time to measure from */
    mark: () => page.evaluate(() => performance.now()),
    /** everything said since the start (texts) */
    said: () => page.evaluate(() => window.__said.slice()),
    /** clips since `mark`, as "text@start–end(cut)", plus whether any overlapped */
    timeline: async mark => {
      const plays = await page.evaluate(m => window.__plays.filter(p => p.t0 >= m).map(p => ({ ...p, end: p.end ?? p.t0 + p.dur })), mark);
      let overlap = false;
      for (let i = 0; i < plays.length; i++)
        for (let j = i + 1; j < plays.length; j++)
          if (plays[j].t0 < plays[i].end - 30 && plays[i].t0 < plays[j].end - 30) overlap = true;
      return {
        clips: plays.map(p => `${p.what}@${Math.round(p.t0 - mark)}–${Math.round(p.end - mark)}${p.cut ? '(cut)' : ''}`),
        overlap,
        cut: plays.some(p => p.cut)
      };
    }
  };

  try {
    const result = await scenario(page, h);
    const robot = await page.evaluate(() => window.__browserSpoke);
    console.log(JSON.stringify(result, null, 2));
    console.log(robot.length ? `❌ fell back to the browser voice: ${JSON.stringify(robot)}` : '✅ every line played a clip');
  } finally {
    await browser.close();
  }
})().catch(err => {
  console.error(err);
  process.exit(1);
});
