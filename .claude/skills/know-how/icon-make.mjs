#!/usr/bin/env node
// Makes the app's icons from the kit's own Luna (DES-31): the browser tab's
// `public/icon.svg`, and the home screen's PNGs (`apple-touch-icon.png` 180 px
// for an iPad, `icon-192.png` and `icon-512.png` for a Chromebook).
//
//   node .claude/skills/know-how/icon-make.mjs [port=5199] [outDir=public] [mood=idle]
//
// Needs Vite on the port. It opens the Kit page (`/?kit`, its components tab
// in light) with reduced motion, so Luna stands still, takes her in the mood
// asked for, and copies her drawing out with each part's colour as the page
// computed it from the tokens. She stands on the
// page's own light ground (a rounded square for the tab; a full square for the
// home screen, which rounds its own corners). Run it again if her drawing or
// her colours change.

import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import puppeteer from 'puppeteer-core';
import { chromePath } from '../../../scripts/chrome-path.cjs';

const port = process.argv.find(a => /^\d+$/.test(a)) ?? '5199';
const words = process.argv.slice(2).filter(a => !/^\d+$/.test(a));
const out = words.find(a => !a.startsWith('mood=')) ?? 'public';
const mood = (words.find(a => a.startsWith('mood=')) ?? 'mood=idle').slice(5);
mkdirSync(out, { recursive: true });
const wait = ms => new Promise(r => setTimeout(r, ms));

const browser = await puppeteer.launch({ executablePath: chromePath(), headless: true, args: ['--mute-audio'] });
const page = await browser.newPage();
await page.setViewport({ width: 1180, height: 820 });
await page.emulateMediaFeatures([
  { name: 'prefers-color-scheme', value: 'light' },
  { name: 'prefers-reduced-motion', value: 'reduce' }
]);
await page.goto(`http://localhost:${port}/?kit&tab=components&mode=light`, { waitUntil: 'networkidle0' });
await wait(1500);

const { owl, ground } = await page.evaluate(mood => {
  // the kit's Luna in that mood, from the Kit page's light panel: her 200×200 drawing
  const light = document.querySelector('[data-theme="light"]');
  const svg = light.querySelector(`[data-mood="${mood}"] svg[viewBox="0 0 200 200"]`);
  if (!svg) throw new Error(`no Luna in the mood "${mood}" on the Kit page`);
  const parts = [];
  const copy = el => {
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden' || Number(cs.opacity) === 0) return '';
    const tag = el.tagName.toLowerCase();
    const attrs = [...el.attributes].filter(a => !['class', 'style', 'aria-hidden'].includes(a.name)).map(a => `${a.name}="${a.value}"`);
    if (tag !== 'g') {
      attrs.push(`fill="${cs.fill}"`);
      if (cs.stroke !== 'none') attrs.push(`stroke="${cs.stroke}"`);
    }
    if (Number(cs.opacity) < 1) attrs.push(`opacity="${cs.opacity}"`);
    const inner = [...el.children].map(copy).join('');
    return tag === 'g' ? (inner ? `<g ${attrs.join(' ')}>${inner}</g>` : '') : `<${tag} ${attrs.join(' ')}/>`;
  };
  for (const child of svg.children) {
    // her shadow on the floor stays behind: an icon has no floor
    if (child.tagName.toLowerCase() === 'ellipse' && Number(child.getAttribute('cy')) > 185) continue;
    parts.push(copy(child));
  }
  // the ground: the page's background role (--ground), as the light panel computes it
  const probe = document.createElement('div');
  probe.style.background = 'var(--ground)';
  light.append(probe);
  const ground = getComputedStyle(probe).backgroundColor;
  probe.remove();
  return { owl: parts.join(''), ground };
}, mood);

// Her face: the drawing's square from her ear tips (y 28) down past her beak,
// so her eyes and frames still read at a tab's 16 px. The ground's rect clips
// the wings and belly at its edges.
const FACE = { x: 24, y: 16, size: 152 };
const icon = rounded => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">` +
  `<defs><clipPath id="ground"><rect width="200" height="200"${rounded ? ' rx="44"' : ''}/></clipPath></defs>` +
  `<rect width="200" height="200"${rounded ? ' rx="44"' : ''} fill="${ground}"/>` +
  `<g clip-path="url(#ground)"><g transform="scale(${200 / FACE.size}) translate(${-FACE.x} ${-FACE.y})">${owl}</g></g></svg>`;

writeFileSync(join(out, 'icon.svg'), icon(true));
for (const [name, size] of [['apple-touch-icon.png', 180], ['icon-192.png', 192], ['icon-512.png', 512]]) {
  const p = await browser.newPage();
  await p.setViewport({ width: size, height: size });
  await p.setContent(`<style>html,body{margin:0}svg{display:block;width:${size}px;height:${size}px}</style>${icon(false)}`);
  await p.screenshot({ path: join(out, name), omitBackground: false });
  await p.close();
}
await browser.close();
console.log(`Luna (${mood}) icons in ${out}/: icon.svg, apple-touch-icon.png (180), icon-192.png, icon-512.png; ground ${ground}`);
