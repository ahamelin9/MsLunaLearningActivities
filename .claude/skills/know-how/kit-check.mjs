// The kit's behaviour on the Kit page, in a real browser. DES-7a: the press, a
// disabled button, the Modal (focus in and back, Escape, the X, the dim) and
// the focus ring. DES-7b: Choice's wrong wobble and right pop (and under
// reduced motion), ListenCue keeping its answer hidden and rippling, StarRow
// landing. DES-7c: ProgressBar's count and fill, LessonCard's states (the
// "Up next" tag centred even under reduced motion, a locked card wobbling),
// Squishy's squish, ghost and colours, the shimmering tag. DES-15: Luna's 8
// moods all differ, her palette colours, the blink, the talk (held, and
// following the voice), pop, wobble and float, the press, and reduced motion.
// DES-9b: the Switch flips and slides its knob (at once under reduced motion),
// and a selected ChunkyButton (aria-pressed) takes the action colour.
// DES-9c: a picked Tile (aria-pressed) takes the action colour too.
// DES-13: a LessonCard with no time shows none, and the one that just opened
// pops then glows (no pop under reduced motion).
// DES-22a: a SpeechBubble with no tail draws none, and its line is a 48px
// button that still reads as her words.
// DES-22d: Icon's 96 size, and PaperCard's dashed reward panel.
// DES-11: Flower's kinds in the illustration palette, growing a step apart
// then swaying (still under reduced motion); Petals falling (30, in 7
// colours, never taking a tap), the delayed ones waiting, none under reduced
// motion.
// DES-22b: ChunkyButton's prompt pill (soft accent, round, 48px, flat,
// faded while it waits); a found ListenCue's burst of five sparks (none
// under reduced motion).
// DES-22c: Choice's phrase kind (22px, bold, at least 64px tall).
// SET-1: ChunkyButton's hold mode: the ring drawn from --hold-progress, the
// note only after a quick tap, and a press held 2s (not 1s) opening, with
// the same wait and a filling ring under reduced motion.
// Start Vite on 5199 first, then from the repo root:
//   node .claude/skills/know-how/kit-check.mjs
// Exits 1 on any ❌.
import puppeteer from 'puppeteer-core';
import { chromePath } from '../../../scripts/chrome-path.cjs';

const URL = 'http://localhost:5199/?kit&tab=components&mode=light';
const results = [];
const ok = (name, pass, detail = '') => { results.push(pass); console.log(`${pass ? '✅' : '❌'} ${name}${detail ? `  (${detail})` : ''}`); };

const browser = await puppeteer.launch({ executablePath: chromePath(), headless: true, args: ['--mute-audio'] });
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
// PRG-6: a Tile given minutes shows "about N min" under its name, below the
// name and inside the tile; one without shows none
const tileTimes = await page.evaluate(() => {
  const tiles = [...document.querySelectorAll('button[data-tint]')].filter(t => t.textContent.includes('Bubble Sounds'));
  return tiles.map(t => {
    const name = t.querySelector('[data-shot="tile-title"]').getBoundingClientRect();
    const chip = [...t.querySelectorAll('span')].find(s => /^about \d+ min$/.test(s.textContent.trim()) && s.children.length > 0);
    const box = t.getBoundingClientRect();
    const c = chip?.getBoundingClientRect();
    return { time: chip?.textContent.trim() ?? null, below: c ? c.top >= name.bottom - 1 && c.bottom <= box.bottom + 1 : null };
  });
});
ok('a Tile with minutes shows "about 4 min" under its name; without, no time', tileTimes.some(t => t.time === 'about 4 min' && t.below) && tileTimes.some(t => t.time === null), JSON.stringify(tileTimes));

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

// DES-13: a card with no time yet (until PRG-6), and the lesson that just opened
ok('a card with no minutes shows no time', await page.evaluate(() => {
  const b = [...document.querySelectorAll('button[aria-label^="Lesson"]')].find(x => x.getAttribute('aria-label').endsWith(', done'));
  return !!b && !/min/.test(b.textContent);
}));
const opened = await page.evaluateHandle(() => document.querySelector('button[data-state~="opened"]'));
ok('the lesson that just opened pops, then glows', (await anim(opened)) === 'luna-pop, luna-glow', await anim(opened));
await page.evaluate(() => document.documentElement.setAttribute('data-reduced-motion', ''));
ok('reduced motion: it opens with no pop', /^none(, none)?$/.test(await anim(opened)), await anim(opened));
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

// ── Switch and the picked button (DES-9b) ──────────────────────────────────
const flip = await page.evaluateHandle(() => document.querySelector('button[role="switch"][aria-label="Try me"]'));
await flip.evaluate(e => e.scrollIntoView({ block: 'center' }));
const knobX = () => flip.evaluate(b => new DOMMatrix(getComputedStyle(b.querySelector('span span')).transform).m41);
const offX = await knobX();
await flip.click();
await sleep(400);
const onX = await knobX();
ok('a Switch flips when tapped', (await flip.evaluate(b => b.getAttribute('aria-checked'))) === 'true');
ok('… and its knob slides across', onX > offX + 10, `${offX} → ${onX}`);
await page.evaluate(() => document.documentElement.setAttribute('data-reduced-motion', ''));
ok('reduced motion: the knob jumps, no slide', await flip.evaluate(b => getComputedStyle(b.querySelector('span span')).transitionDuration === '0s'));
await page.evaluate(() => document.documentElement.removeAttribute('data-reduced-motion'));
await flip.click();
ok('… and flips back', (await flip.evaluate(b => b.getAttribute('aria-checked'))) === 'false');
ok('the picked button in a row takes the action colour, the others don\'t', await page.evaluate(() => {
  const row = [...document.querySelectorAll('button')].filter(b => ['Beginner', 'Normal', 'Quick'].includes(b.textContent.trim()) && b.hasAttribute('aria-pressed'));
  const probe = document.createElement('span');
  probe.style.background = 'var(--action)';
  row[0].parentElement.append(probe);
  const action = getComputedStyle(probe).backgroundColor;
  probe.remove();
  const bg = b => getComputedStyle(b).backgroundColor;
  const picked = row.find(b => b.getAttribute('aria-pressed') === 'true');
  return row.length === 3 && bg(picked) === action && row.filter(b => b !== picked).every(b => bg(b) !== action);
}));

// ── the picked Tile (DES-9c, Grade Select) ─────────────────────────────────
ok('the picked Tile in a set takes the action colour, the others don\'t', await page.evaluate(() => {
  const set = [...document.querySelectorAll('button[data-tint]')].filter(b => b.hasAttribute('aria-pressed'));
  const probe = document.createElement('span');
  probe.style.background = 'var(--action)';
  set[0].parentElement.append(probe);
  const action = getComputedStyle(probe).backgroundColor;
  probe.remove();
  const bg = b => getComputedStyle(b).backgroundColor;
  const picked = set.find(b => b.getAttribute('aria-pressed') === 'true');
  return set.length === 3 && bg(picked) === action && set.filter(b => b !== picked).every(b => bg(b) !== action);
}));
ok('… and its picture keeps the ink, not the action ink', await page.evaluate(() => {
  const set = [...document.querySelectorAll('button[data-tint]')].filter(b => b.hasAttribute('aria-pressed'));
  const ink = b => getComputedStyle(b.firstElementChild).color;
  const picked = set.find(b => b.getAttribute('aria-pressed') === 'true');
  return ink(picked) === ink(set.find(b => b !== picked)) && ink(picked) !== getComputedStyle(picked).color;
}));

// ── a SpeechBubble with no tail (DES-22a, the perch of a game with its own Luna) ──
const bare = await page.evaluateHandle(() => document.querySelector('button[aria-label="Hear Ms. Luna again"]'));
await bare.evaluate(e => e.scrollIntoView({ block: 'center' }));
ok('a no-tail bubble draws no tail', await bare.evaluate(b => {
  const root = b.closest('[data-variant]');
  return root.dataset.variant === 'none' && root.children.length === 1;
}));
ok('… its line is a button at least 48px tall', await bare.evaluate(b => b.getBoundingClientRect().height >= 48), `${await bare.evaluate(b => b.getBoundingClientRect().height)}px`);
ok('… that reads as her words, not a grey button', await bare.evaluate(b => {
  const said = getComputedStyle(b);
  const line = getComputedStyle(document.querySelector('[data-variant="left"] p'));
  return said.borderTopStyle === 'none' && said.backgroundColor === 'rgba(0, 0, 0, 0)' &&
    said.fontSize === line.fontSize && said.fontFamily === line.fontFamily && said.color === line.color;
}));

// ── the done screen's pieces (DES-22d): the 96px mark, the dashed reward panel ──
const mark = await page.evaluate(() => {
  const svg = document.querySelector('svg[data-size="96"]');
  return svg ? svg.getBoundingClientRect().width : 0;
});
ok('Icon\'s 96 size is 96px (the done screen\'s mark)', mark === 96, `${mark}px`);
ok('the reward PaperCard is flat, on a thick dashed accent border', await page.evaluate(() => {
  const card = document.querySelector('[data-variant="reward"]');
  const probe = document.createElement('span');
  probe.style.color = 'var(--accent)';
  card.parentElement.append(probe);
  const accent = getComputedStyle(probe).color;
  probe.remove();
  const s = getComputedStyle(card);
  return s.borderTopStyle === 'dashed' && s.borderTopWidth === '3px' && s.borderTopColor === accent && s.boxShadow === 'none';
}));

// ── a won round's garden and petals (DES-11): Flower and Petals ──
const clickText = async text => {
  const b = await page.evaluateHandle(t => [...document.querySelectorAll('button')].find(x => x.textContent.trim() === t), text);
  await b.evaluate(e => e.scrollIntoView({ block: 'center' }));
  await b.click();
};
ok('a red rose, a blush rose and a daisy, in the illustration palette', await page.evaluate(() => {
  const probe = (near, v) => {
    const p = document.createElement('span');
    p.style.color = `var(${v})`;
    near.append(p);
    const c = getComputedStyle(p).color;
    p.remove();
    return c;
  };
  const fill = el => getComputedStyle(el).fill;
  // the drawing's children: soil, stem, leaf, then the head
  const head = kind => document.querySelector(`[data-kind="${kind}"] svg`).children;
  const near = document.querySelector('[data-kind="daisy"]').parentElement;
  return fill(head('rose-red')[4]) === probe(near, '--illo-rose-red') &&
    fill(head('rose-blush')[4]) === probe(near, '--illo-rose-blush') &&
    fill(head('daisy')[3]) === probe(near, '--illo-daisy-petal') &&
    fill(head('daisy')[9]) === probe(near, '--illo-daisy-heart') &&
    fill(head('daisy')[1]) === 'none' && fill(head('daisy')[0]) === probe(near, '--soil');
}));
ok('a still flower doesn\'t move', await page.evaluate(() => {
  const f = document.querySelector('[data-kind="rose-red"]');
  return getComputedStyle(f).animationName === 'none' && getComputedStyle(f.querySelector('svg')).animationName === 'none';
}));
await clickText('Grow again');
await new Promise(r => setTimeout(r, 50));
const growing = await page.evaluate(() => [...document.querySelector('[data-shot="kit-flower-row"]').children].map(f => ({
  grow: getComputedStyle(f).animationName,
  wait: parseFloat(getComputedStyle(f).animationDelay),
  sway: getComputedStyle(f.querySelector('svg')).animationName
})));
ok('a growing row grows in one step after another, then sways',
  growing.every(g => g.grow === 'luna-grow-in' && g.sway === 'luna-sway') && growing[0].wait < growing[1].wait && growing[1].wait < growing[2].wait,
  growing.map(g => `${g.grow} ${g.wait}s ${g.sway}`).join(' | '));
await page.evaluate(() => document.documentElement.setAttribute('data-reduced-motion', ''));
await clickText('Grow again');
await new Promise(r => setTimeout(r, 50));
ok('reduced motion: the flowers are simply there, and don\'t sway', await page.evaluate(() => [...document.querySelector('[data-shot="kit-flower-row"]').children].every(f => {
  const s = getComputedStyle(f);
  return s.animationName === 'none' && getComputedStyle(f.querySelector('svg')).animationName === 'none' && s.opacity === '1' && s.transform === 'none';
})));
await page.evaluate(() => document.documentElement.removeAttribute('data-reduced-motion'));

// the petals fall once, so drop them again and look while they're falling
const petalsNow = () => page.evaluate(() => [...document.querySelectorAll('[data-shot="petals"]')].slice(0, 2).map(root => ({
  count: root.children.length,
  taps: getComputedStyle(root).pointerEvents,
  z: getComputedStyle(root).zIndex,
  fall: getComputedStyle(root.firstElementChild).animationName,
  shown: [...root.children].filter(p => parseFloat(getComputedStyle(p).opacity) > 0.05).length,
  colours: new Set([...root.children].map(p => getComputedStyle(p).backgroundColor)).size
})));
await clickText('Drop again');
await new Promise(r => setTimeout(r, 600));
const [now, late] = await petalsNow();
ok('30 petals fall with the shared petal fall, in 7 colours', now.count === 30 && now.fall === 'luna-petal-fall' && now.colours === 7, JSON.stringify(now));
ok('… they never take a tap, over the screen on --z-celebrate', now.taps === 'none' && now.z === '60');
ok('… a won round\'s start at once; the done screen\'s wait for it to arrive', now.shown > 5 && late.shown === 0, `at once ${now.shown} shown, delayed ${late.shown}`);
await new Promise(r => setTimeout(r, 1400));
const [, lateNow] = await petalsNow();
ok('… then the done screen\'s fall too', lateNow.shown > 5, `${lateNow.shown} shown`);
await page.evaluate(() => document.documentElement.setAttribute('data-reduced-motion', ''));
await clickText('Drop again');
await new Promise(r => setTimeout(r, 600));
const rmPetals = await petalsNow();
ok('reduced motion: no petals at all', rmPetals.every(p => p.shown === 0 && p.fall === 'none'), JSON.stringify(rmPetals.map(p => p.shown)));
await page.evaluate(() => document.documentElement.removeAttribute('data-reduced-motion'));

// ── a game's prompt pill (DES-22b): ChunkyButton's prompt variant ──
const promptPill = () => page.evaluate(() => {
  const all = [...document.querySelectorAll('[data-variant="prompt"]')];
  const idle = all.find(b => !b.disabled && !b.dataset.state);
  const off = all.find(b => b.disabled);
  const probe = (near, v) => {
    const p = document.createElement('span');
    p.style.color = `var(${v})`;
    near.parentElement.append(p);
    const c = getComputedStyle(p).color;
    p.remove();
    return c;
  };
  const s = getComputedStyle(idle);
  return {
    bg: s.backgroundColor === probe(idle, '--accent-soft'),
    round: parseFloat(s.borderTopLeftRadius) >= idle.offsetHeight / 2,
    tall: idle.offsetHeight,
    ledge: s.boxShadow,
    speaker: Boolean(idle.querySelector('svg')),
    font: s.fontSize,
    faded: parseFloat(getComputedStyle(off).opacity) < 1
  };
});
const pill = await promptPill();
ok('the prompt pill: the soft accent, round ends, 48px, a speaker, the reading size', pill.bg && pill.round && pill.tall >= 48 && pill.speaker && pill.font === '22px', JSON.stringify(pill));
ok('… flat, with no ledge', pill.ledge === 'none' || /0px 0px 0px/.test(pill.ledge), pill.ledge);
ok('… and faded while it waits for a try', pill.faded);

// ── a found ListenCue's burst (DES-22b) ──
// the Try it row's cue (the first, in the light panel), which "Found it" finds
const sparksNow = () => page.evaluate(() => {
  const row = [...document.querySelectorAll('h4')].find(h => h.textContent.startsWith('Try it: tap the arch')).parentElement;
  const burst = row.querySelector('[data-shot="cue-burst"]');
  if (!burst) return { count: 0, anim: [], colours: false, shown: 0, taps: null };
  const probe = v => {
    const p = document.createElement('span');
    p.style.color = `var(${v})`;
    burst.append(p);
    const c = getComputedStyle(p).color;
    p.remove();
    return c;
  };
  const sparks = [...burst.children];
  const win = ['--illo-spark-win-1', '--illo-spark-win-2', '--illo-spark-win-3', '--illo-spark-win-4'].map(probe);
  return {
    count: sparks.length,
    anim: sparks.map(s => getComputedStyle(s).animationName),
    colours: sparks.every(s => win.includes(getComputedStyle(s).color)),
    shown: sparks.filter(s => parseFloat(getComputedStyle(s).opacity) > 0.05).length,
    taps: getComputedStyle(burst).pointerEvents
  };
});
ok('only a found cue has a burst', await page.evaluate(() => {
  const bursts = [...document.querySelectorAll('[data-shot="cue-burst"]')];
  return bursts.length > 0 && bursts.every(b => (b.parentElement.dataset.state ?? '').split(' ').includes('found'));
}));
// a fresh find in the Try it row: back to waiting if an earlier check left it found
const freshFind = () => page.evaluate(() => {
  const row = [...document.querySelectorAll('h4')].find(h => h.textContent.startsWith('Try it: tap the arch')).parentElement;
  const toggle = () => [...row.querySelectorAll('button')].find(b => ['Found it', 'Again'].includes(b.textContent.trim()));
  if (toggle().textContent.trim() === 'Again') toggle().click();
  return new Promise(r => requestAnimationFrame(() => { toggle().click(); r(); }));
});
await freshFind();
await new Promise(r => setTimeout(r, 300));
const sparks = await sparksNow();
ok('found: five sparks burst out with the shared burst, in the win sparkle colours', sparks.count === 5 && sparks.anim.every(a => a === 'luna-burst') && sparks.colours && sparks.shown >= 3 && sparks.taps === 'none', JSON.stringify(sparks));
await page.evaluate(() => document.documentElement.setAttribute('data-reduced-motion', ''));
await freshFind();
await new Promise(r => setTimeout(r, 300));
const rmSparks = (await sparksNow()).shown;
ok('reduced motion: no sparks', rmSparks === 0, `${rmSparks} shown`);

// ── Choice's phrase kind (DES-22c): a few words, in the reading type ──
const phrase = await page.evaluate(() => {
  const c = [...document.querySelectorAll('button[data-kind="phrase"]')].find(b => !b.dataset.state);
  const s = getComputedStyle(c);
  return { size: s.fontSize, weight: s.fontWeight, tall: c.offsetHeight };
});
ok('a phrase Choice is the reading type, bold, and an answer tall', phrase.size === '22px' && phrase.weight === '700' && phrase.tall >= 64 && phrase.tall < 88, JSON.stringify(phrase));
await page.evaluate(() => document.documentElement.removeAttribute('data-reduced-motion'));

// ── ChunkyButton's hold mode (SET-1): the grown-up gate ──
const heldRing = await page.evaluate(() => {
  const b = [...document.querySelectorAll('button[data-hold]')].find(el => el.style.getPropertyValue('--hold-progress') === '0.6');
  const after = getComputedStyle(b, '::after');
  return { bg: after.backgroundImage, wider: parseFloat(after.width) > b.offsetWidth };
});
ok('a held-part-way gate draws its ring round the button, in the action colour', heldRing.bg.startsWith('conic-gradient') && heldRing.wider, JSON.stringify(heldRing));
const notes = await page.$$eval('button[data-hold] + [role="status"]', els => els.map(el => `${el.dataset.state ?? '-'}:${getComputedStyle(el).display}`));
ok('the note shows only where it was asked for', notes.filter(n => n === 'shown:block').length === 2 && notes.every(n => n === 'shown:block' || n.endsWith(':none')), notes.join(' '));
// SET-2: by default the note lines up with the button's right edge; with
// holdNoteAt="start", its left edge (for Luna's mute, near the screen's left)
const edges = await page.$$eval('button[data-hold] + [role="status"][data-state="shown"]', els => els.map(el => {
  const b = el.previousElementSibling.getBoundingClientRect();
  const n = el.getBoundingClientRect();
  return { start: el.parentElement.dataset.note === 'start', left: Math.round(n.left - b.left), right: Math.round(b.right - n.right) };
}));
ok('the note lines up with the button\'s right edge, or its left with holdNoteAt="start"',
  edges.length === 2 && edges.every(e => (e.start ? e.left === 0 : e.right === 0)) && edges.some(e => e.start), JSON.stringify(edges));
const tryHold = await page.$('[data-shot="kit-hold"]');
const tryLabel = () => tryHold.evaluate(b => b.closest('figure').querySelector('figcaption').textContent.trim());
const holdFor = async (ms, mid) => {
  await tryHold.evaluate(b => b.scrollIntoView({ block: 'center', behavior: 'instant' }));
  const box = await tryHold.boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await sleep(mid);
  const ring = await tryHold.evaluate(b => Number(getComputedStyle(b).getPropertyValue('--hold-progress')) || 0);
  await sleep(ms - mid);
  await page.mouse.up();
  await sleep(300);
  return ring;
};
for (const rm of [false, true]) {
  if (rm) await page.evaluate(() => document.documentElement.setAttribute('data-reduced-motion', ''));
  const before = await tryLabel();
  await holdFor(80, 40);
  const tapNote = await tryHold.evaluate(b => getComputedStyle(b.nextElementSibling).display);
  const ring = await holdFor(1000, 500);
  const afterShort = await tryLabel();
  await holdFor(2300, 1000);
  const afterLong = await tryLabel();
  ok(`${rm ? 'reduced motion: ' : ''}a tap or a 1s hold doesn't open, a 1.5s hold does; the ring fills meanwhile`,
    afterShort === before && afterLong !== before && tapNote === 'block' && ring > 0.1 && ring < 0.5,
    `${before} → ${afterShort} → ${afterLong}, note ${tapNote}, ring ${ring.toFixed(2)} at 0.5s`);
}
await page.evaluate(() => document.documentElement.removeAttribute('data-reduced-motion'));

// ── MilestoneMoon (DES-17) ─────────────────────────────────────────────────
// her specimens, found by their captions; her parts by what they animate
const moonIn = l => page.evaluateHandle(l => [...document.querySelectorAll('figure')].find(f => f.textContent.includes(l))?.querySelector('[data-mood]'), l);
const moonAnim = el => el.evaluate(m => [...m.querySelectorAll('g')].map(p => getComputedStyle(p).animationName).filter(n => n !== 'none').join(' ') || 'none');
const moonHappy = await moonIn('happy: open eyes');
const moonCheer = await moonIn('cheer: smiling eyes');
const moonTalker = await moonIn('her mouth talking');
const moonFollower = await moonIn('her mouth follows');
ok('the moon\'s two looks differ', await moonHappy.evaluate(m => m.innerHTML) !== await moonCheer.evaluate(m => m.innerHTML));
ok('the moon is drawn in moon colours from the illustration palette', await moonHappy.evaluate(m => {
  const face = m.querySelector('path');
  const probe = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  probe.style.fill = 'var(--illo-moon-pale)';
  m.querySelector('svg').append(probe);
  const want = getComputedStyle(probe).fill;
  probe.remove();
  return getComputedStyle(face).fill === want;
}));
const happyMoon = await moonAnim(moonHappy);
ok('happy rocks and blinks, her mouth still', happyMoon.includes('luna-sway') && happyMoon.includes('luna-blink') && !happyMoon.includes('luna-talk'), happyMoon);
ok('cheer doesn\'t blink (her eyes are lines)', !(await moonAnim(moonCheer)).includes('luna-blink'));
ok('held talking moves her mouth', (await moonAnim(moonTalker)).includes('luna-talk'), await moonAnim(moonTalker));
ok('left to follow the voice, her mouth is still while no clip plays', !(await moonAnim(moonFollower)).includes('luna-talk'));
await speak(true);
await sleep(100);
ok('… and moves while a clip plays', (await moonAnim(moonFollower)).includes('luna-talk'));
await speak(false);
await sleep(100);
ok('… and stops when it ends', !(await moonAnim(moonFollower)).includes('luna-talk'));
await page.evaluate(() => document.documentElement.setAttribute('data-reduced-motion', ''));
await sleep(100);
ok('reduced motion: the moon is still', (await moonAnim(moonTalker)) === 'none', await moonAnim(moonTalker));
await page.evaluate(() => document.documentElement.removeAttribute('data-reduced-motion'));

await browser.close();
console.log(results.every(Boolean) ? '\nALL PASS' : '\nSOME FAILED');
process.exit(results.every(Boolean) ? 0 : 1);
