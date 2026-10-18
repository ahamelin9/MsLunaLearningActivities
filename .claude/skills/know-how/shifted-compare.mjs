#!/usr/bin/env node
// Compares two screenshots where the content moved up or down as a whole:
// the chrome above it changed (DES-8: the header went from 102px to 64px), so
// a plain --diff calls every pixel changed. This lines the two up by their
// own top edges and counts the pixels that really differ.
//
//   node .claude/skills/know-how/shifted-compare.mjs <before.png> <after.png> <topBefore> <topAfter> [rows] [out.png]
//
// rows: how many rows to compare (default: as many as both have).
// out.png: the after rows faded, every differing pixel red.
// Exits 1 when any pixel differs past 8 per channel, like ui:shots --diff.
// Run it from the repo root (it needs puppeteer-core from node_modules).

import { readFileSync, writeFileSync } from 'node:fs';
import puppeteer from 'puppeteer-core';
import { chromePath } from '../../../scripts/chrome-path.cjs';

const [before, after, topA, topB, rowsArg, out] = process.argv.slice(2);
if (!before || !after || topA === undefined || topB === undefined) {
  console.error('Usage: shifted-compare.mjs <before.png> <after.png> <topBefore> <topAfter> [rows] [out.png]');
  process.exit(2);
}

const browser = await puppeteer.launch({
  executablePath: chromePath(),
  headless: true
});
const page = await browser.newPage();
const result = await page.evaluate(
  async (a, b, topA, topB, rowsArg) => {
    const pixels = async base64 => {
      const bitmap = await createImageBitmap(await (await fetch(`data:image/png;base64,${base64}`)).blob());
      const ctx = new OffscreenCanvas(bitmap.width, bitmap.height).getContext('2d');
      ctx.drawImage(bitmap, 0, 0);
      return ctx.getImageData(0, 0, bitmap.width, bitmap.height);
    };
    const [A, B] = [await pixels(a), await pixels(b)];
    const width = Math.min(A.width, B.width);
    const rows = rowsArg ? Number(rowsArg) : Math.min(A.height - topA, B.height - topB);
    const img = new ImageData(width, rows);
    let differing = 0;
    let [first, last] = [-1, -1];
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < width; x++) {
        const i = ((y + topA) * A.width + x) * 4;
        const j = ((y + topB) * B.width + x) * 4;
        const o = (y * width + x) * 4;
        if ([0, 1, 2].some(k => Math.abs(A.data[i + k] - B.data[j + k]) > 8)) {
          differing++;
          if (first === -1) first = y;
          last = y;
          img.data.set([255, 0, 0, 255], o);
        } else {
          const grey = 255 - (255 - (B.data[j] * 0.3 + B.data[j + 1] * 0.59 + B.data[j + 2] * 0.11)) * 0.3;
          img.data.set([grey, grey, grey, 255], o);
        }
      }
    }
    const canvas = new OffscreenCanvas(width, rows);
    canvas.getContext('2d').putImageData(img, 0, 0);
    const png = new Uint8Array(await (await canvas.convertToBlob({ type: 'image/png' })).arrayBuffer());
    return { rows, differing, first, last, png: Array.from(png) };
  },
  readFileSync(before).toString('base64'),
  readFileSync(after).toString('base64'),
  Number(topA),
  Number(topB),
  rowsArg
);
await browser.close();

if (out) writeFileSync(out, Buffer.from(result.png));
if (result.differing === 0) {
  console.log(`✅ ${result.rows} rows the same once lined up (before from y ${topA}, after from y ${topB})`);
  process.exit(0);
}
console.log(
  `❌ ${result.differing} pixels differ in rows ${result.first}–${result.last} of ${result.rows} (counted from each top)${out ? `; overlay: ${out}` : ''}`
);
process.exit(1);
