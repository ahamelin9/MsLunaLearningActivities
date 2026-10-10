// OPS-6: a tab whose voice index predates a voice:render finds the new clip
// without a reload. Serves an old index (one line's key removed) first, then
// the real one. Silent: muted, speechSynthesis stubbed.
//
// From the repo root, with your own vite on 5198 (node_modules/.bin/vite
// --port 5198 --strictPort, in the background; pkill -f "vite --port 5198"
// afterwards):  node .claude/skills/know-how/stale-index-check.cjs

const { createRequire } = require('node:module');
const { join } = require('node:path');
const fs = require('node:fs');
const puppeteer = createRequire(join(process.cwd(), 'package.json'))('puppeteer-core');

const URL_ = 'http://localhost:5198/';
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const LINE = 'Which letter did Ms. Luna say?';
const NEVER = 'Zorblax quibbles the purple teapot.'; // in neither index
const sleep = ms => new Promise(r => setTimeout(r, ms));

const real = fs.readFileSync('public/voice/af_heart/manifest.json', 'utf8');
const oldIndex = JSON.parse(real);
const key = `text|${LINE}|normal`;
if (!oldIndex.clips[key]) throw new Error(`real index has no ${key}`);
delete oldIndex.clips[key];
const stale = JSON.stringify(oldIndex);

(async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: true,
    args: ['--mute-audio', '--autoplay-policy=no-user-gesture-required']
  });
  const page = await browser.newPage();

  let serve = 'old';
  const fetches = [];
  await page.setRequestInterception(true);
  page.on('request', req => {
    if (req.url().includes('/voice/af_heart/manifest.json')) {
      fetches.push({ at: Date.now(), served: serve });
      req.respond({ status: 200, contentType: 'application/json', body: serve === 'old' ? stale : real });
    } else req.continue();
  });

  await page.evaluateOnNewDocument(() => {
    window.__browserSpoke = [];
    Object.defineProperty(window, 'speechSynthesis', {
      configurable: true,
      value: { speak: u => window.__browserSpoke.push(u.text), cancel() {}, pause() {}, resume() {}, getVoices: () => [], addEventListener() {}, removeEventListener() {} }
    });
    window.__plays = [];
    const start = AudioBufferSourceNode.prototype.start;
    AudioBufferSourceNode.prototype.start = function (...a) {
      window.__plays.push({ dur: this.buffer?.duration ?? 0 });
      return start.apply(this, a);
    };
  });

  await page.goto(URL_, { waitUntil: 'networkidle0' });

  // the app's own speech module; speak and wait for the clip or the fallback
  const speak = text =>
    page.evaluate(async text => {
      const { pronunciation } = await import('/src/utils/pronunciation.ts');
      const plays = window.__plays.length;
      const robot = window.__browserSpoke.length;
      pronunciation.speakText(text);
      for (let i = 0; i < 100; i++) {
        if (window.__plays.length > plays) return 'clip';
        if (window.__browserSpoke.length > robot) return 'browser voice';
        await new Promise(r => setTimeout(r, 50));
      }
      return 'nothing';
    }, text);

  const results = [];
  const step = async (label, text, want) => {
    const before = fetches.length;
    const got = await speak(text);
    const refetched = fetches.length - before;
    results.push({ ok: got === want, label, got, want, indexFetches: refetched });
  };

  // the tab opens on the old index
  await page.evaluate(async () => {
    const { pronunciation } = await import('/src/utils/pronunciation.ts');
    await pronunciation.init();
  });
  const loaded = fetches.map(f => f.served).join(',');

  // control: just after the load, the throttle holds, so the old index is all
  // there is and the line falls back (proves the old index lacks it)
  await step('new line, right after load (old index)', LINE, 'browser voice');

  // voice:render lands; the tab is not reloaded
  serve = 'new';
  await sleep(5500);
  await step('new line after voice:render, same tab', LINE, 'clip');
  await step('same line again', LINE, 'clip');

  // a line no index has: falls back, and refetches at most once per few seconds
  await step('line in neither index (within 5 s of the last fetch)', NEVER, 'browser voice');
  await sleep(5500);
  await step('line in neither index (after 5 s)', NEVER, 'browser voice');
  for (let i = 0; i < 4; i++) await step(`line in neither index, quick tap ${i + 1}`, NEVER, 'browser voice');

  await browser.close();

  console.log(`index fetched at load: ${loaded}`);
  for (const r of results)
    console.log(`${r.ok ? '✅' : '❌'} ${r.label}: ${r.got} (index fetches: ${r.indexFetches})`);
  const tapsAfter = results.slice(-4).reduce((n, r) => n + r.indexFetches, 0);
  console.log(`${tapsAfter === 0 ? '✅' : '❌'} quick taps on a missing line refetched the index ${tapsAfter} times`);
  console.log(`total index fetches: ${fetches.length} (${fetches.map(f => f.served).join(',')})`);
  if (!results.every(r => r.ok) || tapsAfter) process.exit(1);
})().catch(err => {
  console.error(err);
  process.exit(1);
});
