// Where Chrome is, for every script that drives it: `ui:shots` and the
// know-how checks (OPS-10). One place, so they all run on Alex's Mac and in a
// Claude Code cloud session alike.
//
//   1. CHROME_PATH, when it's set;
//   2. the Mac's Chrome;
//   3. a Linux Chrome or Chromium (a cloud session): a system one, or one
//      `npx @puppeteer/browsers install chrome@stable` put in
//      ~/.cache/puppeteer. It runs through scripts/cloud/chrome.sh, which adds
//      --no-sandbox: Chrome can't sandbox itself as root in a container.
//
// CommonJS, so the .cjs checks can require it and the .mjs ones import it.
// The cloud's setup is in docs/cloud-sessions.md.

const { existsSync, readdirSync } = require('node:fs');
const { homedir } = require('node:os');
const { join } = require('node:path');

const MAC = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const LINUX = ['/usr/bin/chromium', '/usr/bin/chromium-browser', '/usr/bin/google-chrome', '/usr/bin/google-chrome-stable'];

/** A Chrome that @puppeteer/browsers installed, newest last. */
function cachedChrome() {
  const dir = join(homedir(), '.cache', 'puppeteer', 'chrome');
  if (!existsSync(dir)) return null;
  const found = readdirSync(dir)
    .filter(d => d.startsWith('linux-'))
    .sort()
    .map(d => join(dir, d, 'chrome-linux64', 'chrome'))
    .filter(p => existsSync(p));
  return found.at(-1) ?? null;
}

exports.cachedChrome = cachedChrome;

exports.chromePath = function chromePath() {
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH;
  if (existsSync(MAC)) return MAC;
  if (LINUX.some(p => existsSync(p)) || cachedChrome()) return join(__dirname, 'cloud', 'chrome.sh');
  throw new Error('No Chrome found. Set CHROME_PATH, or install one (docs/cloud-sessions.md).');
};
