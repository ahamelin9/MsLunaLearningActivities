#!/usr/bin/env node
// Is Luna on the tab and the home screen (DES-31)? Opens the app and the
// password page on Vite and checks each links Luna's icons: the tab's SVG, an
// iPad's 180×180 touch icon, and a manifest Chrome reads without errors whose
// 192 and 512 px icons are the sizes they say. Nothing may still point at
// Vite's own logo. That the password Worker lets them all through without a
// cookie is password-check.mjs's job.
//
//   node .claude/skills/know-how/icon-check.mjs [port=5199]

import puppeteer from 'puppeteer-core';
import { chromePath } from '../../../scripts/chrome-path.cjs';

const port = process.argv[2] ?? '5199';
let failed = 0;
const ok = (what, pass, got = '') => {
  console.log(`${pass ? '✅' : '❌'} ${what}${pass ? '' : `  (got ${got})`}`);
  if (!pass) failed += 1;
};

const browser = await puppeteer.launch({ executablePath: chromePath(), headless: true, args: ['--mute-audio'] });
const page = await browser.newPage();

/** What a URL serves, as the page sees it: status, type, and an image's size. */
const served = url => page.evaluate(async url => {
  const res = await fetch(url, { cache: 'no-store' });
  const type = res.headers.get('Content-Type') ?? '';
  let size = '';
  if (type.startsWith('image/')) {
    const img = new Image();
    img.src = URL.createObjectURL(await res.blob());
    await img.decode();
    size = `${img.naturalWidth}x${img.naturalHeight}`;
  }
  return { status: res.status, type, size };
}, url);

for (const [name, path] of [['the app', '/'], ['the password page', '/gate.html']]) {
  await page.goto(`http://localhost:${port}${path}`, { waitUntil: 'networkidle0' });
  const links = await page.evaluate(() => Object.fromEntries(
    [...document.querySelectorAll('link[rel~="icon"], link[rel="apple-touch-icon"], link[rel="manifest"]')].map(l => [l.rel, l.href])
  ));
  ok(`${name}: nothing points at Vite's logo`, !JSON.stringify(links).includes('vite.svg'), JSON.stringify(links));

  const tab = links.icon && await served(links.icon);
  ok(`${name}: the tab icon is Luna's SVG`, !!tab && tab.status === 200 && tab.type.startsWith('image/svg+xml') && links.icon.endsWith('/icon.svg'), JSON.stringify({ href: links.icon, ...tab }));

  const touch = links['apple-touch-icon'] && await served(links['apple-touch-icon']);
  ok(`${name}: an iPad's home screen icon is a 180×180 PNG`, !!touch && touch.status === 200 && touch.type === 'image/png' && touch.size === '180x180', JSON.stringify(touch));

  const cdp = await page.createCDPSession();
  const { url, errors, data } = await cdp.send('Page.getAppManifest');
  ok(`${name}: Chrome reads the manifest without errors`, !!url && !!data && errors.length === 0, JSON.stringify({ url, errors }));
  const icons = data ? JSON.parse(data).icons ?? [] : [];
  for (const want of ['192x192', '512x512']) {
    const icon = icons.find(i => i.sizes === want);
    const got = icon && await served(new URL(icon.src, url).href);
    ok(`${name}: the manifest's ${want} icon is that size`, !!got && got.status === 200 && got.size === want, JSON.stringify(got ?? icons));
  }
}

await browser.close();
console.log(failed ? `\n${failed} failed` : '\nALL PASS');
process.exit(failed ? 1 : 0);
