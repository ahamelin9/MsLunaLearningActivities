// Copies screenshots/<from> to screenshots/<to> and changes one pixel of one
// PNG by `delta` on each colour channel, using Chrome to decode and encode.
// Proves `ui:shots --diff` can fail (DES-18a): past 8 it must show up, at 8 not.
//
//   node .claude/skills/know-how/pixel-poke.cjs "$PWD" <from> <to> <size>/<file>.png <x> <y> <delta>
//   npm run ui:shots -- --diff <from> <to>
const { createRequire } = require('node:module');
const fs = require('node:fs');
const path = require('node:path');
const [root, from, to, file, x, y, delta] = process.argv.slice(2);
const puppeteer = createRequire(path.join(root, 'package.json'))('puppeteer-core');
(async () => {
  fs.rmSync(path.join(root, 'screenshots', to), { recursive: true, force: true });
  fs.cpSync(path.join(root, 'screenshots', from), path.join(root, 'screenshots', to), { recursive: true });
  const target = path.join(root, 'screenshots', to, file);
  const browser = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
  const page = await browser.newPage();
  const out = await page.evaluate(async (b64, x, y, d) => {
    const blob = await (await fetch(`data:image/png;base64,${b64}`)).blob();
    const bmp = await createImageBitmap(blob, { colorSpaceConversion: 'none', premultiplyAlpha: 'none' });
    const c = new OffscreenCanvas(bmp.width, bmp.height); const ctx = c.getContext('2d');
    ctx.drawImage(bmp, 0, 0);
    const img = ctx.getImageData(0, 0, bmp.width, bmp.height);
    const i = (y * bmp.width + x) * 4;
    const before = [...img.data.slice(i, i + 4)];
    for (let k = 0; k < 3; k++) img.data[i + k] = img.data[i + k] + d > 255 ? img.data[i + k] - d : img.data[i + k] + d;
    ctx.putImageData(img, 0, 0);
    const png = await c.convertToBlob({ type: 'image/png' });
    const s = await new Promise(r => { const f = new FileReader(); f.onload = () => r(String(f.result).split(',')[1]); f.readAsDataURL(png); });
    return { s, before, after: [...img.data.slice(i, i + 4)] };
  }, fs.readFileSync(target).toString('base64'), +x, +y, +delta);
  fs.writeFileSync(target, Buffer.from(out.s, 'base64'));
  console.log(`${file} (${x},${y}): ${out.before} -> ${out.after}`);
  await browser.close();
})();
