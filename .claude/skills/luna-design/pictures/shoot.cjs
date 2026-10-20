// Shoots a DES-27 picture sample page as the review artifact shows it:
// wide in light and dark, and phone width, full page.
//
//   node .claude/skills/luna-design/pictures/shoot.cjs <sample.html> <outDir>
//
// Run from the repo root (it borrows the repo's puppeteer-core and Chrome).
const path = require('path');
const puppeteer = require(path.resolve('node_modules/puppeteer-core'));
const { chromePath } = require(path.resolve('scripts/chrome-path.cjs'));
const [page, outDir] = process.argv.slice(2).map(p => path.resolve(p));
(async () => {
  const b = await puppeteer.launch({ executablePath: chromePath(), headless: true });
  const p = await b.newPage();
  for (const [w, scheme] of [[1180, 'light'], [1180, 'dark'], [390, 'light']]) {
    await p.setViewport({ width: w, height: 900 });
    await p.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: scheme }]);
    await p.goto('file://' + page, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 1500));
    await p.screenshot({ path: `${outDir}/${path.basename(page, '.html')}-${w}-${scheme}.png`, fullPage: true });
  }
  await b.close();
})();
