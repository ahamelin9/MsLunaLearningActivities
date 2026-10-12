// Reads the design tokens the way the page actually gets them (DES-20), so the
// Kit page never keeps its own list: a role added to src/styles/tokens/ shows
// up here by itself.

/**
 * Every custom property the token files declare on :root, in their order.
 * Only global.scss counts (Vite marks each dev stylesheet with its file), so
 * the legacy ones in index.css stay out.
 */
export function tokenNames(): string[] {
  const names: string[] = [];
  for (const sheet of Array.from(document.styleSheets)) {
    const file = (sheet.ownerNode as HTMLElement | null)?.dataset?.viteDevId ?? '';
    if (!file.endsWith('/src/styles/global.scss')) continue;
    let rules: CSSRuleList;
    try {
      rules = sheet.cssRules;
    } catch {
      continue; // a stylesheet from another origin
    }
    for (const rule of Array.from(rules)) {
      if (!(rule instanceof CSSStyleRule) || !rule.selectorText.includes(':root')) continue;
      for (let i = 0; i < rule.style.length; i++) {
        const name = rule.style[i];
        if (name.startsWith('--') && !names.includes(name)) names.push(name);
      }
    }
  }
  return names;
}

/** The token groups the Tokens tab shows, by name. */
export const GROUPS: { title: string; test: (name: string) => boolean }[] = [
  { title: 'Illustration palette', test: n => n.startsWith('--illo-') },
  { title: 'Space', test: n => n.startsWith('--space-') },
  { title: 'Corners', test: n => n.startsWith('--radius-') },
  { title: 'Elevation', test: n => /^--(elevation-|ledge-|glow-ring|press-depth)/.test(n) },
  { title: 'Borders', test: n => /^--(border-|focus-offset)/.test(n) },
  { title: 'Type', test: n => /^--(text-|font-)/.test(n) },
  { title: 'Motion', test: n => /^--(dur-|ease-|motion-)/.test(n) },
  { title: 'Touch targets', test: n => n.startsWith('--target-') },
  { title: 'Stacking', test: n => n.startsWith('--z-') }
];

/** The text pairs listed next to the roles (`$text-pairs` in _roles.scss). */
export function textPairs(rolesScss: string): [text: string, ground: string][] {
  const block = rolesScss.match(/\$text-pairs:\s*\(([\s\S]*?)\n\);/)?.[1] ?? '';
  return [...block.matchAll(/^\s*([\w-]+):\s*\(([^)]*)\)/gm)].flatMap(([, text, grounds]) =>
    grounds.split(',').map(g => [text, g.trim()] as [string, string])
  );
}

type Rgba = [number, number, number, number];

/** '#3B2A20' or 'rgba(59, 42, 32, 0.5)'; null for anything else. */
export function parseColour(value: string): Rgba | null {
  const v = value.trim().toLowerCase();
  if (v.startsWith('#')) {
    let h = v.slice(1);
    if (h.length <= 4) h = [...h].map(c => c + c).join('');
    const n = [0, 2, 4, 6].map(i => (i < h.length ? parseInt(h.slice(i, i + 2), 16) : 255));
    return n.some(Number.isNaN) ? null : [n[0], n[1], n[2], n[3] / 255];
  }
  const m = v.match(/^rgba?\(([^)]+)\)$/);
  if (!m) return null;
  const [r, g, b, a = 1] = m[1].split(/[\s,/]+/).filter(Boolean).map(Number);
  return [r, g, b, a];
}

const over = ([r, g, b, a]: Rgba, [R, G, B]: Rgba): Rgba => [r * a + R * (1 - a), g * a + G * (1 - a), b * a + B * (1 - a), 1];
const luminance = (c: Rgba) =>
  c.slice(0, 3)
    .map(x => x / 255)
    .map(x => (x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4))
    .reduce((sum, x, i) => sum + x * [0.2126, 0.7152, 0.0722][i], 0);

/** Contrast of text on a background, each blended over the page first (as scripts/design/contrast.mjs does). */
export function contrast(text: string, background: string, page: string): number | null {
  const [t, b, p] = [text, background, page].map(parseColour);
  if (!t || !b || !p) return null;
  const bg = over(b, p);
  const [hi, lo] = [luminance(over(t, bg)), luminance(bg)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}
