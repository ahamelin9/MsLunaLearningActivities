// The page sizes the app has to work at (DES-32): one list for every check
// that walks the screens (ui:shots, layout-audit, library-fit-check,
// fit-check), so they all agree.
//
// A size is the page the browser leaves once its own bars are counted, so a
// phone's is shorter than its screen: an iPhone's 390×844 screen is about a
// 390×660 page in Safari.
//
// Pick sets by name: `sizes=phone` for the know-how checks, `--sizes phone`
// for ui:shots, several joined with commas (`phone,big`). With no sizes, each
// check keeps the four iPads, so earlier shots still line up with --diff.

/** @type {Record<string, { width: number, height: number, what: string }[]>} */
export const SIZE_SETS = {
  // the four iPads (DES-10)
  ipad: [
    { width: 1180, height: 820, what: 'iPad landscape' },
    { width: 820, height: 1180, what: 'iPad portrait' },
    { width: 1024, height: 768, what: 'the older iPad' },
    { width: 744, height: 1133, what: 'iPad mini' }
  ],
  // phones held upright, in the browser (DES-32)
  phone: [
    { width: 360, height: 640, what: 'a small Android phone' },
    { width: 390, height: 660, what: 'an iPhone' },
    { width: 430, height: 750, what: 'a big iPhone' }
  ],
  // a phone turned sideways: a round can't fit 330 px tall, so it may
  // scroll, but nothing may be cut off
  'phone-landscape': [{ width: 850, height: 330, what: 'a phone turned sideways' }],
  // laptops and the classroom's big screen
  big: [
    { width: 1366, height: 650, what: 'a Chromebook or small laptop' },
    { width: 1536, height: 730, what: 'a Windows laptop at 125%' },
    { width: 1920, height: 970, what: 'a whiteboard or TV' }
  ]
};

/** Sets whose sizes are phones: touch, a mobile browser, a sharper screen. */
const PHONE_SETS = new Set(['phone', 'phone-landscape']);

/**
 * The sizes a check runs at, from its arguments: `sizes=phone,big` (or
 * `--sizes phone,big`), else the four iPads. Each size says which set it's
 * from, so a check can treat a phone in landscape as "may scroll".
 */
export function sizesFrom(argv, fallback = 'ipad') {
  const i = argv.indexOf('--sizes');
  const named = argv.find(a => a.startsWith('sizes='))?.slice('sizes='.length) ?? (i === -1 ? null : argv[i + 1]);
  const names = (named ?? fallback).split(',').map(s => s.trim()).filter(Boolean);
  const unknown = names.filter(n => !SIZE_SETS[n]);
  if (unknown.length) {
    throw new Error(`unknown size set ${unknown.join(', ')}: use ${Object.keys(SIZE_SETS).join(', ')}`);
  }
  return names.flatMap(set => SIZE_SETS[set].map(s => ({ ...s, set, phone: PHONE_SETS.has(set) })));
}

/** Puppeteer's viewport for a size: a phone gets touch and a mobile browser. */
export function viewportFor(size, deviceScaleFactor = 1) {
  return {
    width: size.width,
    height: size.height,
    deviceScaleFactor: size.phone ? Math.max(deviceScaleFactor, 2) : deviceScaleFactor,
    isMobile: !!size.phone,
    hasTouch: true
  };
}
