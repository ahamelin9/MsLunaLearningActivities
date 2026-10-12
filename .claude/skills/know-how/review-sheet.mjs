// A review sheet for Alex (DES-9c): labelled shots side by side in rows,
// saved as one PNG, like screenshots/review/des9c-grade-select.png. From the
// repo root:
//   node .claude/skills/know-how/review-sheet.mjs <spec.json> <out.png>
// spec.json is the rows, each a list of [label, path to a PNG]:
//   [[["Grade Select · before", "screenshots/before/1180x820/02-grade-select.png"],
//     ["after · dark", "screenshots/after-dark/1180x820/02-grade-select.png"]],
//    [["the kit", "<scratch>/kit/Tile-light.png"]]]
// Landscape shots are drawn 300px tall and portrait ones 420px, so an iPad
// mini sits beside a landscape shot at a readable size. No server needed.
import puppeteer from 'puppeteer-core';
import { readFileSync } from 'node:fs';

const [specPath, out] = process.argv.slice(2);
if (!specPath || !out) {
  console.error('usage: node .claude/skills/know-how/review-sheet.mjs <spec.json> <out.png>');
  process.exit(1);
}
const rows = JSON.parse(readFileSync(specPath, 'utf8'));

const shot = path => {
  const png = readFileSync(path);
  // a PNG's width and height sit in its header, at bytes 16 and 20
  const portrait = png.readUInt32BE(20) > png.readUInt32BE(16);
  return `<img src="data:image/png;base64,${png.toString('base64')}" style="height:${portrait ? 420 : 300}px;display:block">`;
};
const html = `<body style="margin:0;padding:8px;background:#ccc;font:600 15px system-ui">${rows
  .map(row => `<div style="display:flex;gap:16px;align-items:flex-start;margin-bottom:10px">${row
    .map(([label, path]) => `<div><div style="margin:0 0 4px">${label}</div>${shot(path)}</div>`)
    .join('')}</div>`)
  .join('')}</body>`;

const browser = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
const page = await browser.newPage();
await page.setViewport({ width: 2400, height: 900 });
await page.setContent(html, { waitUntil: 'load' });
await page.screenshot({ path: out, fullPage: true });
await browser.close();
console.log(`saved ${out}`);
process.exit(0);
