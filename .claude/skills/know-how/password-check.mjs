#!/usr/bin/env node
// Does the site's password hold? (OPS-14)
//
//   npm run build && node .claude/skills/know-how/password-check.mjs
//
// Bundles worker/gate.ts and hands it real requests, the asset server played
// by the built dist/ folder, with a made-up password. No wrangler needed:
// `wrangler dev` can't start from Claude's shell (esbuild's spawn fails with
// EBADF), and this checks the Worker's own logic, which is what can go wrong.
// It checks:
//   - with no cookie: a page gets the password page, a voice clip 401, and
//     the password page's own files (its script, a font) load;
//   - a wrong password stays out, slowly, back at "/?wrong" with no cookie;
//   - the right one sets a long-lived HttpOnly, Secure cookie and goes to "/";
//     with it the app, a clip and a deep link open;
//   - a made-up cookie, or the cookie from an old password, stays out;
//   - with no password set at all, nobody gets in.

import { build } from 'esbuild';
import { readFile, readdir, mkdtemp } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, extname } from 'node:path';
import { pathToFileURL } from 'node:url';

const root = process.cwd();
const dist = join(root, 'dist');
if (!existsSync(join(dist, 'gate.html'))) {
  console.error('No dist/gate.html: run `npm run build` first.');
  process.exit(2);
}

const out = join(await mkdtemp(join(tmpdir(), 'luna-gate-')), 'gate.mjs');
await build({ entryPoints: [join(root, 'worker/gate.ts')], bundle: true, format: 'esm', platform: 'neutral', outfile: out, logLevel: 'warning' });
const worker = (await import(pathToFileURL(out).href)).default;

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.m4a': 'audio/mp4', '.woff2': 'font/woff2', '.svg': 'image/svg+xml' };
/** The asset server, as Cloudflare's: drops .html, falls back to index.html (single-page app). */
const ASSETS = {
  async fetch(request) {
    let path = decodeURIComponent(new URL(request.url).pathname);
    if (path === '/') path = '/index.html';
    else if (!extname(path)) path += '.html';
    let file = join(dist, path);
    if (!existsSync(file)) file = join(dist, 'index.html');
    return new Response(await readFile(file), { headers: { 'Content-Type': TYPES[extname(file)] ?? 'application/octet-stream' } });
  }
};

const PASSWORD = 'owl-check-password';
const site = 'http://localhost';
const ask = (env, path, init = {}) => worker.fetch(new Request(site + path, init), env);
const page = { headers: { Accept: 'text/html' } };
const titleOf = async res => (await res.text()).match(/<title>([^<]*)/)?.[1] ?? '(no title)';
const signIn = (env, password) =>
  ask(env, '/sign-in', { method: 'POST', body: new URLSearchParams({ password }), redirect: 'manual' });

const clipDir = join(dist, 'voice/af_heart');
const clip = `/voice/af_heart/${(await readdir(clipDir)).find(f => f.endsWith('.m4a'))}`;
const font = `/fonts/${(await readdir(join(dist, 'fonts')))[0]}`;
const gateScript = `/assets/${(await readdir(join(dist, 'assets'))).find(f => f.startsWith('gate-') && f.endsWith('.js'))}`;

let failed = 0;
const ok = (what, pass, got = '') => {
  console.log(`${pass ? '✅' : '❌'} ${what}${pass ? '' : `  (got ${got})`}`);
  if (!pass) failed += 1;
};

const env = { ASSETS, SITE_PASSWORD: PASSWORD };

// no cookie
let res = await ask(env, '/', page);
let title = await titleOf(res);
ok('no cookie: "/" is the password page', title.includes('Sign in'), title);
ok('no cookie: the password page is never cached', res.headers.get('Cache-Control') === 'no-store', res.headers.get('Cache-Control'));
res = await ask(env, '/library', page);
ok('no cookie: a deep link is the password page too', (await titleOf(res)).includes('Sign in'));
res = await ask(env, clip);
ok('no cookie: a voice clip answers 401', res.status === 401, res.status);
res = await ask(env, '/index.html');
ok('no cookie: index.html itself answers 401', res.status === 401, res.status);
for (const [what, path] of [['script', gateScript], ['font', font]]) {
  res = await ask(env, path);
  ok(`no cookie: the password page's ${what} loads`, res.status === 200, res.status);
}
// DES-31: browsers fetch the tab icon, the home screen icons and the manifest without the cookie
for (const path of ['/icon.svg', '/apple-touch-icon.png', '/icon-192.png', '/icon-512.png', '/manifest.webmanifest']) {
  res = await ask(env, path);
  ok(`no cookie: ${path} loads`, res.status === 200, res.status);
}
res = await ask(env, '/icon.svg.map');
ok('no cookie: a name that only starts like an icon stays out', res.status === 401, res.status);

// a wrong password
const started = Date.now();
res = await signIn(env, 'nope');
ok('wrong password: back to "/?wrong"', res.status === 303 && res.headers.get('Location') === '/?wrong', `${res.status} ${res.headers.get('Location')}`);
ok('wrong password: no cookie', !res.headers.get('Set-Cookie'));
ok('wrong password: answered slowly (≥ 900 ms)', Date.now() - started >= 900, `${Date.now() - started} ms`);
res = await signIn(env, '');
ok('empty password: stays out', res.headers.get('Location') === '/?wrong');

// the right password
res = await signIn(env, PASSWORD);
const setCookie = res.headers.get('Set-Cookie') ?? '';
ok('right password: on to "/"', res.status === 303 && res.headers.get('Location') === '/', `${res.status} ${res.headers.get('Location')}`);
ok('right password: the cookie is HttpOnly, Secure, SameSite=Lax, for 400 days',
  /HttpOnly/.test(setCookie) && /Secure/.test(setCookie) && /SameSite=Lax/.test(setCookie) && /Max-Age=34560000/.test(setCookie), setCookie.replace(/=[^;]+/, '=…'));
ok('right password: the cookie does not hold the password', !setCookie.includes(PASSWORD));
const cookie = setCookie.split(';')[0];
const withCookie = (init = {}) => ({ ...init, headers: { ...(init.headers ?? {}), Cookie: `theme=1; ${cookie}` } });

res = await ask(env, '/', withCookie(page));
title = await titleOf(res);
ok('signed in: "/" is the app', title.includes('Reading & Phonics'), title);
res = await ask(env, '/some/where', withCookie(page));
ok('signed in: a deep link is the app (single-page fallback)', (await titleOf(res)).includes('Reading & Phonics'));
res = await ask(env, clip, withCookie());
ok('signed in: a voice clip plays', res.status === 200 && res.headers.get('Content-Type') === 'audio/mp4', `${res.status} ${res.headers.get('Content-Type')}`);

// cookies that shouldn't work
res = await ask(env, clip, { headers: { Cookie: 'luna_gate=abc' } });
ok('a made-up cookie stays out', res.status === 401, res.status);
res = await ask({ ASSETS, SITE_PASSWORD: 'a-new-password' }, clip, withCookie());
ok('a new password signs every device out', res.status === 401, res.status);

// no password set
const unset = { ASSETS };
res = await signIn(unset, '');
ok('no password set: an empty one gets nobody in', res.headers.get('Location') === '/?wrong' && !res.headers.get('Set-Cookie'));
res = await signIn(unset, 'undefined');
ok('no password set: "undefined" gets nobody in', !res.headers.get('Set-Cookie'));
res = await ask(unset, clip, withCookie());
ok('no password set: an old cookie gets nobody in', res.status === 401, res.status);

console.log(failed ? `\n${failed} failed` : '\nAll passed');
process.exit(failed ? 1 : 0);
