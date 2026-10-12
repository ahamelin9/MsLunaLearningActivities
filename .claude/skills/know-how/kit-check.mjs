// The kit's behaviour on the Kit page, in a real browser. DES-7a: the press, a
// disabled button, the Modal (focus in and back, Escape, the X, the dim) and
// the focus ring. DES-7b: Choice's wrong wobble and right pop (and under
// reduced motion), ListenCue keeping its answer hidden and rippling, StarRow
// landing. DES-7c: ProgressBar's count and fill, LessonCard's states (the
// "Up next" tag centred even under reduced motion, a locked card wobbling),
// Squishy's squish, ghost and colours, the shimmering tag. DES-15: Luna's 8
// moods all differ, her palette colours, the blink, the talk (held, and
// following the voice), pop, wobble and float, the press, and reduced motion.
// Start Vite on 5199 first, then from the repo root:
//   node .claude/skills/know-how/kit-check.mjs
// Exits 1 on any ❌.
import puppeteer from 'puppeteer-core';

const URL = 'http://localhost:5199/?kit&tab=components&mode=light';
const results = [];
const ok = (name, pass, detail = '') => { results.push(pass); console.log(`${pass ? '✅' : '❌'} ${name}${detail ? `  (${detail})` : ''}`); };

const browser = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true, args: ['--mute-audio'] });
const page = await browser.newPage();
await page.setViewport({ width: 1180, height: 820 });
await page.goto(URL, { waitUntil: 'networkidle0' });
const focusOnLoad = await page.evaluate(() => document.activeElement?.getAttribute('role') === 'dialog');

// 1. a real press sinks the button onto its ledge
const btn = await page.evaluateHandle(() => [...document.querySelectorAll('button')].find(b => b.textContent.trim() === 'Play again' && !b.disabled && !b.dataset.state));
await btn.evaluate(el => el.scrollIntoView({ block: 'center' }));
const style = () => btn.evaluate(el => { const s = getComputedStyle(el); return { t: s.transform, sh: s.boxShadow }; });
const idle = await style();
const box = await btn.boundingBox();
await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
await page.mouse.down();
await new Promise(r => setTimeout(r, 400));
const pressed = await style();
await page.mouse.up();
await new Promise(r => setTimeout(r, 400));
const back = await style();
ok('press sinks by --press-depth', pressed.t.includes('3)') && idle.t === 'none', `idle ${idle.t}, pressed ${pressed.t}`);
ok('ledge shrinks to a hairline on press', pressed.sh.includes(' 0px 1px 0px') && idle.sh.includes(' 0px 5px 0px'), `idle ${idle.sh} → ${pressed.sh}`);
ok('it comes back up', back.t === 'none');

// 2. a disabled button doesn't sink
const dis = await page.evaluateHandle(() => [...document.querySelectorAll('button')].find(b => b.textContent.trim() === 'Play again' && b.disabled));
await dis.evaluate(el => el.scrollIntoView({ block: 'center' }));
const dbox = await dis.boundingBox();
await page.mouse.move(dbox.x + dbox.width / 2, dbox.y + dbox.height / 2);
await page.mouse.down();
await new Promise(r => setTimeout(r, 400));
const dt = await dis.evaluate(el => getComputedStyle(el).transform);
await page.mouse.up();
ok('disabled stays put', dt === 'none', dt);

// 3. the Modal: open on load, focus inside, Escape / X / the dim close it, focus goes back
const dialogs = () => page.$$eval('[role=dialog]', d => d.length);
ok('modal open on load', (await dialogs()) === 1);
ok('focus moves into the dialog when it opens', focusOnLoad);
await page.keyboard.press('Escape');
ok('Escape closes it', (await dialogs()) === 0);
const openIt = await page.evaluateHandle(() => [...document.querySelectorAll('button')].find(b => b.textContent.trim() === 'Open it'));
await openIt.evaluate(el => el.scrollIntoView({ block: 'center' }));
await openIt.click();
ok('Open it opens it again', (await dialogs()) === 1);
const close = await page.$('[data-shot="modal-close"]');
ok('close button is 48px', JSON.stringify(await close.evaluate(el => [el.offsetWidth, el.offsetHeight])) === '[48,48]');
ok('close button has a name', (await close.evaluate(el => el.getAttribute('aria-label'))) === 'Close');
await close.click();
ok('the X closes it', (await dialogs()) === 0);
ok('focus goes back to Open it', await page.evaluate(() => document.activeElement?.textContent?.trim() === 'Open it'));
await openIt.click();
const dim = await page.evaluate(() => { const r = document.querySelector('[role=dialog]').parentElement.getBoundingClientRect(); return { x: r.x + 8, y: r.y + 8 }; });
await page.mouse.click(dim.x, dim.y);
ok('a tap on the dim closes it', (await dialogs()) === 0);
await openIt.click();
const inside = await page.evaluate(() => { const r = document.querySelector('[role=dialog] p').getBoundingClientRect(); return { x: r.x + 4, y: r.y + 4 }; });
await page.mouse.click(inside.x, inside.y);
ok('a tap inside the card does not', (await dialogs()) === 1);
ok('the dim is --shade-deep', await page.evaluate(() => {
  const dimEl = document.querySelector('[role=dialog]').parentElement;
  const probe = document.createElement('span'); probe.style.background = 'var(--shade-deep)'; dimEl.parentElement.append(probe);
  const want = getComputedStyle(probe).backgroundColor; probe.remove();
  return getComputedStyle(dimEl).backgroundColor === want;
}));

// 4. keyboard focus shows the ring
await page.goto(URL, { waitUntil: 'networkidle0' });
await page.keyboard.press('Escape'); // close the light panel's modal
await page.evaluate(() => document.body.focus());
let ring = 'none';
let tileRing = 'none';
for (let i = 0; i < 80 && (ring === 'none' || tileRing === 'none'); i++) {
  await page.keyboard.press('Tab');
  const r = await page.evaluate(() => {
    const a = document.activeElement;
    const kind = a?.dataset.tint ? 'tile' : a?.dataset.variant && a.tagName === 'BUTTON' ? 'button' : null;
    return kind && { kind, ring: getComputedStyle(a).outlineStyle + ' ' + getComputedStyle(a).outlineWidth };
  });
  if (r?.kind === 'button') ring = r.ring;
  if (r?.kind === 'tile') tileRing = r.ring;
}
ok('a ChunkyButton shows the focus ring when tabbed to', ring === 'solid 3px', ring);
ok('a Tile shows the focus ring when tabbed to', tileRing === 'solid 3px', tileRing);

// 5. Tile pressed state and the Icon's label rule
ok('icons without a label are hidden from screen readers', await page.evaluate(() => [...document.querySelectorAll('svg[viewBox="0 0 24 24"]')].every(s => s.getAttribute('aria-hidden') === 'true' || s.getAttribute('aria-label'))));
ok('every kit Tile carries data-shot="tile-title"', await page.evaluate(() => [...document.querySelectorAll('button[data-tint]')].every(t => t.querySelector('[data-shot="tile-title"]'))));

// ── DES-7b ────────────────────────────────────────────────────────────────
const sleep = ms => new Promise(r => setTimeout(r, ms));
const choice = l => page.evaluateHandle(l => [...document.querySelectorAll('button[aria-label]')].find(b => b.getAttribute('aria-label') === `letter ${l}`), l);
const anim = el => el.evaluate(e => getComputedStyle(e).animationName);
await page.goto(URL, { waitUntil: 'networkidle0' });
await page.keyboard.press('Escape');
let s = await choice('S');
await s.evaluate(el => el.scrollIntoView({ block: 'center' }));
await s.click();
ok('a wrong Choice shows wrong', (await s.evaluate(e => e.dataset.state)) === 'wrong');
ok('wrong uses the shared wobble', (await anim(s)) === 'luna-wobble', await anim(s));
await sleep(600);
ok('wrong clears when the wobble ends', (await s.evaluate(e => e.dataset.state)) === undefined);
const m = await choice('M');
await m.click();
ok('the right Choice shows right', (await m.evaluate(e => e.dataset.state)) === 'right');
ok('right uses the shared pop', (await anim(m)) === 'luna-pop', await anim(m));
ok('right wears the glow ring', (await m.evaluate(e => getComputedStyle(e).boxShadow)).split('rgb').length === 3);
s = await choice('S');
ok('the others fade and can\'t be tapped', (await s.evaluate(e => e.dataset.state === 'faded' && e.disabled)));
ok('a revealed Choice can still be tapped', await page.evaluate(() => [...document.querySelectorAll('button[data-state~="revealed"]')].every(b => !b.disabled)));

const cue = await page.evaluateHandle(() => [...document.querySelectorAll('button[aria-label="Hear it again"]')].at(-1));
ok('a waiting cue keeps its answer hidden', await page.evaluate(() => [...document.querySelectorAll('button[aria-label="Hear it again"]')].every(b => !/M|ship/.test(b.textContent))));
ok('a waiting cue pulses with the shared glow', (await anim(cue)) === 'luna-glow');
await cue.evaluate(el => el.scrollIntoView({ block: 'center' }));
await cue.click();
const rippleNow = await cue.evaluate(b => { const r = b.nextElementSibling; return r ? getComputedStyle(r).animationName + ' ' + getComputedStyle(r).animationIterationCount : 'none'; });
ok('a tap ripples once', rippleNow === 'luna-glow 1', rippleNow);
await sleep(900);
ok('the ripple clears after one beat', await cue.evaluate(b => !b.nextElementSibling));
const foundBtn = await page.evaluateHandle(() => [...document.querySelectorAll('button')].find(b => b.textContent.trim() === 'Found it'));
await foundBtn.click();
const foundText = await page.evaluate(() => [...document.querySelectorAll('[data-state~="found"] button')].at(-1)?.textContent);
ok('found shows the answer and "found it!"', foundText === 'Mfound it!', foundText);

const stars = await page.evaluate(() => [...document.querySelectorAll('[role="img"][aria-label$="stars"]')].map(r => r.getAttribute('aria-label')));
ok('StarRow says how many stars', stars.includes('0 of 3 stars') && stars.includes('3 of 3 stars'));
const landing = await page.evaluate(() => [...document.querySelector('[data-state="landing"]').querySelectorAll('svg')].map(s => `${getComputedStyle(s).animationName}@${getComputedStyle(s).animationDelay}`));
ok('stars land one after another with the shared pop', landing.join(' ') === 'luna-pop@0s luna-pop@0.15s luna-pop@0.3s', landing.join(' '));

// reduced motion: no wobble, and wrong still clears
await page.goto(URL, { waitUntil: 'networkidle0' });
await page.keyboard.press('Escape');
await page.evaluate(() => document.documentElement.setAttribute('data-reduced-motion', ''));
s = await choice('B');
await s.evaluate(el => el.scrollIntoView({ block: 'center' }));
await s.click();
const rmAnim = await anim(s);
await sleep(100);
ok('reduced motion: no wobble, and wrong clears at once', rmAnim === 'none' && (await s.evaluate(e => e.dataset.state)) === undefined, rmAnim);

// ── DES-7c ────────────────────────────────────────────────────────────────
await page.goto(URL, { waitUntil: 'networkidle0' });
await page.keyboard.press('Escape');
const bar = await page.evaluate(() => {
  const t = [...document.querySelectorAll('[role="progressbar"]')].find(b => b.getAttribute('aria-label') === '3 of 6 lessons done');
  const fill = t.firstElementChild.getBoundingClientRect().width;
  const inner = t.clientWidth;
  return { now: t.getAttribute('aria-valuenow'), max: t.getAttribute('aria-valuemax'), share: fill / inner, ticks: t.children.length - 1 };
});
ok('ProgressBar reads its count from the data', bar.now === '3' && bar.max === '6', JSON.stringify(bar));
ok('the fill is done / total of the track', Math.abs(bar.share - 0.5) < 0.02, bar.share.toFixed(3));
ok('one tick between each segment', bar.ticks === 5);
ok('the fill grows with the soft spring', await page.evaluate(() => {
  const f = document.querySelector('[role="progressbar"]').firstElementChild;
  const s = getComputedStyle(f);
  return s.transitionProperty === 'width' && s.transitionDuration === '0.6s' && s.transitionTimingFunction.includes('0.34, 1.3');
}));

const card = label => page.evaluateHandle(l => [...document.querySelectorAll('button[aria-label^="Lesson"]')].find(b => b.getAttribute('aria-label').includes(l) && !b.dataset.state.includes('pressed')), label);
const centred = () => page.evaluate(() => {
  const b = [...document.querySelectorAll('button[aria-label*="up next"]')][0];
  const tag = [...b.children].find(c => c.textContent === 'Up next');
  const [a, c] = [tag.getBoundingClientRect(), b.getBoundingClientRect()];
  return Math.abs((a.left + a.width / 2) - (c.left + c.width / 2));
});
ok('the "Up next" tag is centred', (await centred()) < 1, (await centred()).toFixed(2));
const next = await card('up next');
ok('up next glows', (await anim(next)) === 'luna-glow');
const done = await card('done, took 4 minutes');
ok('done says its time and shows "took 4 min"', (await done.evaluate(b => b.textContent.includes('took 4 min'))));
const locked = await card('locked');
await locked.evaluate(el => el.scrollIntoView({ block: 'center' }));
const lbox = await locked.boundingBox();
await page.mouse.move(lbox.x + lbox.width / 2, lbox.y + lbox.height / 2);
await page.mouse.down();
await sleep(150);
const lockedPressed = await locked.evaluate(e => getComputedStyle(e).transform);
await page.mouse.up();
ok('a locked card doesn\'t sink', lockedPressed === 'none', lockedPressed);
ok('a tapped locked card wobbles', (await locked.evaluate(e => e.dataset.state)).includes('wobbling') && (await anim(locked)) === 'luna-wobble');
await sleep(600);
ok('the wobble clears', !(await locked.evaluate(e => e.dataset.state)).includes('wobbling'));
await page.evaluate(() => document.documentElement.setAttribute('data-reduced-motion', ''));
ok('reduced motion: the tag stays centred and nothing glows', (await centred()) < 1 && (await anim(next)) === 'none');
await page.evaluate(() => document.documentElement.removeAttribute('data-reduced-motion'));

const sq = l => page.evaluateHandle(l => document.querySelector(`button[aria-label="${l}"]`), l);
const cat = await sq('Mochi Cat, caramel');
await cat.evaluate(el => el.scrollIntoView({ block: 'center' }));
await cat.click();
const catArt = await cat.evaluate(b => getComputedStyle(b.firstElementChild).animationName);
ok('a found squishy squishes when tapped', catArt === 'luna-squish', catArt);
await sleep(900);
ok('the squish clears', !(await cat.evaluate(b => b.dataset.state)).includes('squish'));
ok('its colours come from the illustration palette', await cat.evaluate(b => {
  const body = b.querySelector('ellipse:nth-of-type(2), path');
  const probe = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  probe.style.fill = 'var(--illo-squishy-caramel)';
  b.querySelector('svg').append(probe);
  const want = getComputedStyle(probe).fill;
  probe.remove();
  return getComputedStyle(body).fill === want;
}));
const ghost = await sq('Not found yet: Bear');
await ghost.click();
ok('a ghost wobbles when tapped', (await ghost.evaluate(b => getComputedStyle(b.firstElementChild).animationName)) === 'luna-wobble');
ok('a ghost has no face', await ghost.evaluate(b => [...b.querySelectorAll('circle')].some(c => getComputedStyle(c).display === 'none')));
ok('a mystery squishy is a "?" slot', (await page.evaluate(() => document.querySelector('button[aria-label="Not found yet: a mystery squishy"]').textContent)) === '?');
ok('rare and super-rare wear a sparkle, usual doesn\'t', await page.evaluate(() => {
  const badge = l => !!document.querySelector(`button[aria-label="${l}"] [data-variant]`);
  return badge('Bear, blush') && badge('Bear, honey') && !badge('Bear, toffee');
}));
ok('a shimmering tag sweeps with the shared shimmer', await page.evaluate(() => {
  const t = document.querySelector('[data-shimmer]');
  return getComputedStyle(t, '::after').animationName === 'luna-shimmer';
}));

// ── Luna (DES-15) ──────────────────────────────────────────────────────────
const MOODS = ['idle', 'happy', 'cheer', 'think', 'oops', 'surprise', 'listen', 'sleepy'];
const luna = m => page.evaluateHandle(m => document.querySelector(`button[aria-label="Ms. Luna, ${m}"]`), m);
// a mood is its pose, and every pose is in her drawing's markup (screenshots
// can't tell: each specimen sits at a different sub-pixel, so even two
// identical poses never match byte for byte)
const frames = [];
for (const m of MOODS) frames.push(await (await luna(m)).evaluate(b => b.querySelector('svg').outerHTML));
const same = [];
for (let i = 0; i < MOODS.length; i++) for (let j = i + 1; j < MOODS.length; j++) if (frames[i] === frames[j]) same.push(`${MOODS[i]} = ${MOODS[j]}`);
ok('her 8 moods all look different', same.length === 0, same.join(', '));
ok('her feathers come from the illustration palette', await (await luna('idle')).evaluate(b => {
  const body = b.querySelector('svg g ellipse:nth-of-type(3)');
  const probe = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  probe.style.fill = 'var(--illo-luna-feather)';
  b.querySelector('svg').append(probe);
  const want = getComputedStyle(probe).fill;
  probe.remove();
  return getComputedStyle(body).fill === want;
}));
// her parts, found by what they animate
const animOf = (el, test) => el.evaluate((b, test) => {
  const parts = [b.firstElementChild, ...b.querySelectorAll('g')];
  return parts.map(p => getComputedStyle(p).animationName).filter(n => n !== 'none').join(' ') || 'none';
}, test);
const idleAnim = await animOf(await luna('idle'));
ok('idle blinks and stays put', idleAnim === 'luna-blink', idleAnim);
ok('sleepy and cheer don\'t blink (their eyes are lines)', !(await animOf(await luna('sleepy'))).includes('blink') && !(await animOf(await luna('cheer'))).includes('blink'));
ok('cheer and surprise pop, oops wobbles', (await animOf(await luna('cheer'))) === 'luna-pop' && (await animOf(await luna('surprise'))).startsWith('luna-pop') && (await animOf(await luna('oops'))).startsWith('luna-wobble'));
const fig = l => page.evaluateHandle(l => [...document.querySelectorAll('figure')].find(f => f.textContent.includes(l)).querySelector('[data-mood]'), l);
const talker = await fig('talking (only while');
const floater = await fig('float (off-round');
const follower = await fig('follows the voice');
ok('held talking moves her beak', (await animOf(talker)).includes('luna-talk'), await animOf(talker));
ok('not talking, her beak is still', !idleAnim.includes('luna-talk'));
ok('float bobs her with the shared float', (await animOf(floater)).includes('luna-float'));
// the app's own instance: after a hot reload Vite serves it as …/pronunciation.ts?t=…,
// and a bare import('/src/utils/pronunciation.ts') would load a second copy
const speak = on => page.evaluate(async on => {
  const url = performance.getEntriesByType('resource').map(e => e.name).find(n => n.includes('/src/utils/pronunciation.ts'));
  (await import(url)).pronunciation.setSpeaking(on);
}, on);
ok('left to follow the voice, she is still while no clip plays', !(await animOf(follower)).includes('luna-talk'));
await speak(true);
await sleep(100);
ok('… and talks while a clip plays', (await animOf(follower)).includes('luna-talk'), await animOf(follower));
await speak(false);
await sleep(100);
ok('… and stops when it ends', !(await animOf(follower)).includes('luna-talk'));
const tap = await luna('happy');
await tap.evaluate(e => e.scrollIntoView({ block: 'center' }));
const tb = await tap.boundingBox();
await page.mouse.move(tb.x + tb.width / 2, tb.y + tb.height / 2);
await page.mouse.down();
await sleep(300);
const sunk = await tap.evaluate(b => getComputedStyle(b.querySelector('svg')).transform);
await page.mouse.up();
ok('tapped, she sinks a little', sunk.startsWith('matrix(0.94'), sunk);
await page.evaluate(() => document.documentElement.setAttribute('data-reduced-motion', ''));
await sleep(100);
const rm = [await animOf(talker), await animOf(floater), await animOf(await luna('idle'))];
ok('reduced motion: no talk, float or blink', rm.every(a => a === 'none'), rm.join(' | '));
await page.evaluate(() => document.documentElement.removeAttribute('data-reduced-motion'));

await browser.close();
console.log(results.every(Boolean) ? '\nALL PASS' : '\nSOME FAILED');
process.exit(results.every(Boolean) ? 0 : 1);
