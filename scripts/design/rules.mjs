// The design check's rules (DES-19), shared by scripts/design/check.mjs (run by
// `npm run lint`) and the after-edit hook (.claude/hooks/design-check-file.mjs),
// so both judge a file the same way. The rules come from docs/design-system/:
// values live only in src/styles/tokens/ (colour.md, foundations.md,
// fitting-in.md).
//
// Counted against the baseline (it may only shrink):
//   colour     a hex, rgb()/hsl() or colour name outside _primitives.scss and
//              _illustration.scss (in .ts/.tsx, colours are the only check)
//   size       a px or rem value outside src/styles/tokens/
//   motion     a duration (ms, s) or an easing outside src/styles/tokens/
//   keyframes  an @keyframes outside src/styles/motion/
// Always fail, whatever the baseline:
//   primitives an @use/@forward/@import of the primitives outside src/styles/tokens/
//   kit-page   a kit folder with no <Name>.kit.tsx
//   media      an @media outside src/styles/tokens/_breakpoints.scss: breakpoints
//              go through bp(), and reduced motion through data-reduced-motion (DES-10)
//   marker     a design-exception(ID) whose ID is neither on the board nor in
//              the changelog, or that gives no reason
//
// Skipped: comments and url(data:…); 0, %, fr, viewport units, deg, em and
// unitless numbers. A `design-exception(ID): why` marker covers its own line
// and the next one.

import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { loadBacklog, mentions, parseBacklog } from '../../.claude/hooks/backlog-lib.mjs';

export const SRC_EXT = /\.(scss|css|ts|tsx)$/;

export const HINTS = {
  colour: 'raw colour: use a role (var(--card)) or, in a drawing, an --illo-* colour. See docs/design-system/colour.md',
  size: 'raw size: use the space scale (var(--space-4)) or a radius, border, ledge or target role; media queries go through bp(). See docs/design-system/foundations.md',
  motion: 'raw duration or easing: use a motion role (var(--dur-emphasis), var(--ease-standard), or a whole var(--motion-pop)). See docs/design-system/foundations.md, Motion',
  keyframes: '@keyframes live only in src/styles/motion/: use a shared animation (animation: var(--motion-pop)), or add one there with Alex\'s OK. See docs/design-system/foundations.md, Motion',
  primitives: 'only src/styles/tokens/ may use the primitives: read a role instead. See docs/design-system/colour.md',
  'kit-page': 'every kit component needs <Name>.kit.tsx showing its states. See docs/design-system/components.md',
  media: 'media queries go only through the breakpoint mixin: @include bp(narrow) { … } or bp(short), from styles/mixins. Reduced motion needs none: [data-reduced-motion] covers it (base/_reduced-motion.scss). See docs/design-system/foundations.md, Layout',
  marker: 'design-exception(ID): why — the ID must be on the board or in kanban/CHANGELOG.md, and the reason must be there. See docs/design-system/fitting-in.md'
};

/** Rules a baseline can carry; the rest always fail. */
export const COUNTED = new Set(['colour', 'size', 'motion', 'keyframes']);

// CSS colour names (CSS Color 4), so `color: white` counts like a hex
const NAMED = new Set(('aliceblue antiquewhite aqua aquamarine azure beige bisque black blanchedalmond blue blueviolet brown ' +
  'burlywood cadetblue chartreuse chocolate coral cornflowerblue cornsilk crimson cyan darkblue darkcyan darkgoldenrod ' +
  'darkgray darkgreen darkgrey darkkhaki darkmagenta darkolivegreen darkorange darkorchid darkred darksalmon darkseagreen ' +
  'darkslateblue darkslategray darkslategrey darkturquoise darkviolet deeppink deepskyblue dimgray dimgrey dodgerblue ' +
  'firebrick floralwhite forestgreen fuchsia gainsboro ghostwhite gold goldenrod gray green greenyellow grey honeydew ' +
  'hotpink indianred indigo ivory khaki lavender lavenderblush lawngreen lemonchiffon lightblue lightcoral lightcyan ' +
  'lightgoldenrodyellow lightgray lightgreen lightgrey lightpink lightsalmon lightseagreen lightskyblue lightslategray ' +
  'lightslategrey lightsteelblue lightyellow lime limegreen linen magenta maroon mediumaquamarine mediumblue mediumorchid ' +
  'mediumpurple mediumseagreen mediumslateblue mediumspringgreen mediumturquoise mediumvioletred midnightblue mintcream ' +
  'mistyrose moccasin navajowhite navy oldlace olive olivedrab orange orangered orchid palegoldenrod palegreen ' +
  'paleturquoise palevioletred papayawhip peachpuff peru pink plum powderblue purple rebeccapurple red rosybrown ' +
  'royalblue saddlebrown salmon sandybrown seagreen seashell sienna silver skyblue slateblue slategray slategrey snow ' +
  'springgreen steelblue tan teal thistle tomato turquoise violet wheat white whitesmoke yellow yellowgreen').split(' '));

const HEX = /(?<![&\w$#-])#(?:[0-9a-f]{8}|[0-9a-f]{6}|[0-9a-f]{3,4})(?![\w-])/gi;
const COLOUR_FN = /(?<![\w-])(?:rgba?|hsla?)\(/gi;
const WORD = /(?<![\w$@.#-])[a-z]+(?![\w-])/gi;
// properties whose value can carry a colour name
const COLOUR_PROP = /(?:^|[;{\s])((?:background|border|outline|box-shadow|text-shadow|text-decoration|column-rule|caret|accent|fill|stroke|stop|flood|lighting)(?:-[a-z-]+)?|color)\s*:([^;{}]*)/gi;
const JSX_COLOUR = /\b(?:fill|stroke|color|stopColor|floodColor|background|backgroundColor|borderColor)\s*[=:]\s*\{?\s*['"]([a-z]+)['"]/gi;
// a minus sign counts (translateY(-10px)), a dash inside a name doesn't
const SIZE = /(?<![\w.$#-])-?(\d*\.?\d+)(px|rem)(?![\w-])/gi;
const DURATION = /(?<![\w.$#-])-?(\d*\.?\d+)(ms|s)(?![\w-])/gi;
const EASING = /(?<![\w-])(?:cubic-bezier\(|steps\(|linear\(|(?:ease(?:-in-out|-in|-out)?|step-start|step-end|linear)(?![\w(-]))/gi;
const KEYFRAMES = /@(?:-webkit-)?keyframes\b/gi;
const PRIMITIVES = /@(?:use|forward|import)\s+['"][^'"]*primitives['"]/gi;
const MEDIA = /@media\b/gi;
const MARKER = /design-exception\(([^)]*)\)\s*(?::\s*(\S.*?))?\s*(?:\*\/|\}|$)/g;

const isZero = n => Number(n) === 0;

/**
 * Comments become spaces (newlines kept, so line numbers hold), outside
 * strings. In stylesheets an unquoted url(…) counts as a string, and data:
 * URLs are blanked first.
 */
export function stripComments(text, css) {
  if (css) text = text.replace(/url\(\s*(['"]?)data:[^)]*\)/gi, m => ' '.repeat(m.length));
  let out = '';
  let i = 0;
  let quote = null;
  while (i < text.length) {
    const c = text[i];
    const two = text.slice(i, i + 2);
    if (quote) {
      out += c;
      if (c === '\\') { out += text[i + 1] ?? ''; i += 2; continue; }
      if (c === quote || (quote === ')' && c === ')')) quote = null;
      i++;
      continue;
    }
    if (two === '/*') {
      const end = text.indexOf('*/', i + 2);
      const stop = end === -1 ? text.length : end + 2;
      out += text.slice(i, stop).replace(/[^\n]/g, ' ');
      i = stop;
      continue;
    }
    if (two === '//') {
      const end = text.indexOf('\n', i);
      const stop = end === -1 ? text.length : end;
      out += ' '.repeat(stop - i);
      i = stop;
      continue;
    }
    if (c === '"' || c === "'" || (!css && c === '`')) quote = c;
    else if (css && /^url\(\s*[^'"\s]/i.test(text.slice(i, i + 6))) quote = ')';
    out += c;
    i++;
  }
  return out;
}

let idCache = null;
/** Every ticket ID on the board or in the changelog. */
export function knownIds(root) {
  if (idCache?.root === root) return idCache;
  const { text } = loadBacklog(root);
  const { tickets, changelog } = parseBacklog(text);
  idCache = { root, board: new Set(tickets.map(t => t.id)), changelog };
  return idCache;
}
const idKnown = (root, id) => {
  const { board, changelog } = knownIds(root);
  return board.has(id) || mentions(changelog, id);
};

/**
 * Checks one file's text. `rel` is its path from the repo root.
 * Returns { violations, markers, legacy }: each violation is
 * { line, rule, text, hint, counted }; markers counts valid exception markers;
 * legacy is true when the file still uses an old partial.
 */
export function checkText(root, rel, text) {
  const css = /\.(scss|css)$/.test(rel);
  const inTokens = rel.startsWith('src/styles/tokens/');
  const rawColoursOk = rel === 'src/styles/tokens/_primitives.scss' || rel === 'src/styles/tokens/_illustration.scss';
  const inMotion = rel.startsWith('src/styles/motion/');
  const isBreakpoints = rel === 'src/styles/tokens/_breakpoints.scss';

  const rawLines = text.split('\n');
  const lines = stripComments(text, css).split('\n');
  const found = [];
  const add = (line, rule, match) => found.push({ line, rule, text: match.trim(), hint: HINTS[rule], counted: COUNTED.has(rule) });

  // exception markers live in comments, so read them from the raw text
  const covered = new Set();
  let markers = 0;
  rawLines.forEach((raw, i) => {
    for (const m of raw.matchAll(MARKER)) {
      const id = m[1].trim();
      if (!/^[A-Z]+-\d+[a-z]?$/.test(id) || !idKnown(root, id) || !m[2]) {
        add(i + 1, 'marker', m[0]);
        continue;
      }
      markers++;
      covered.add(i + 1).add(i + 2);
    }
  });

  lines.forEach((line, i) => {
    const n = i + 1;
    if (covered.has(n)) return;
    if (!rawColoursOk) {
      for (const m of line.matchAll(HEX)) add(n, 'colour', m[0]);
      for (const m of line.matchAll(COLOUR_FN)) add(n, 'colour', line.slice(m.index, line.indexOf(')', m.index) + 1 || undefined));
      if (css) {
        for (const p of line.matchAll(COLOUR_PROP)) {
          const value = p[2].replace(/var\([^)]*\)|url\([^)]*\)|'[^']*'|"[^"]*"/g, ' ');
          for (const w of value.matchAll(WORD)) if (NAMED.has(w[0].toLowerCase())) add(n, 'colour', w[0]);
        }
      } else {
        for (const m of line.matchAll(JSX_COLOUR)) if (NAMED.has(m[1].toLowerCase())) add(n, 'colour', m[0]);
      }
    }
    if (!css) return; // .ts/.tsx: colours only
    if (!inTokens) {
      for (const m of line.matchAll(SIZE)) if (!isZero(m[1])) add(n, 'size', m[0]);
      for (const m of line.matchAll(DURATION)) if (!isZero(m[1])) add(n, 'motion', m[0]);
      for (const m of line.matchAll(EASING)) add(n, 'motion', m[0]);
      for (const m of line.matchAll(PRIMITIVES)) add(n, 'primitives', m[0]);
    }
    if (!inMotion) for (const m of line.matchAll(KEYFRAMES)) add(n, 'keyframes', m[0]);
    if (!isBreakpoints) for (const m of line.matchAll(MEDIA)) add(n, 'media', m[0]);
  });

  return { violations: found, markers, legacy: LEGACY_USE.test(text) };
}

// a stylesheet still on the old partials (_variables.scss, _world.scss), which DES-24 deletes
const LEGACY_USE = /@(?:use|import)\s+['"][^'"]*\b_?(?:variables|world)['"]/;

/** Every stylesheet and TypeScript file under src/, as repo-relative paths. */
export function sourceFiles(root) {
  const out = [];
  const walk = dir => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (SRC_EXT.test(entry.name)) out.push(relative(root, full).split('\\').join('/'));
    }
  };
  walk(join(root, 'src'));
  return out.sort();
}

/** Kit folders missing their .kit.tsx (src/components/kit/<Name>/). */
export function kitFoldersWithoutPage(root) {
  const kit = join(root, 'src/components/kit');
  if (!existsSync(kit)) return [];
  return readdirSync(kit, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .filter(d => !readdirSync(join(kit, d.name)).some(f => f.endsWith('.kit.tsx')))
    .map(d => ({ file: `src/components/kit/${d.name}/`, line: 0, rule: 'kit-page', text: `${d.name}/ has no ${d.name}.kit.tsx`, hint: HINTS['kit-page'], counted: false }));
}

/** Checks a file on disk. */
export function checkFile(root, rel) {
  return checkText(root, rel, readFileSync(join(root, rel), 'utf8'));
}

export const BASELINE = 'scripts/design/baseline.json';

/** The baseline's per-file counts ({} when there's none yet). */
export function readBaseline(root) {
  try {
    return JSON.parse(readFileSync(join(root, BASELINE), 'utf8')).files ?? {};
  } catch {
    return {};
  }
}
