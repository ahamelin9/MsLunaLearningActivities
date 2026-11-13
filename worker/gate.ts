// The password in front of the site (OPS-14; the teacher, 2026-11-12: "people
// not stealing my website"). Every request comes here first (run_worker_first
// in wrangler.jsonc). A device that has signed in gets the site as before;
// one that hasn't gets the password page (gate.html) for a page, and 401 for
// anything else, such as a voice clip. Only the password page's own files
// (its script, styles and fonts) load without signing in.
//
// Signed in means the cookie holds an HMAC of a fixed label, keyed by the
// password: the secret SITE_PASSWORD, set in Cloudflare and never in this
// public repo. So changing the password signs every device out, and with no
// secret set nobody gets in. How to set or change it: docs/site-password.md.

interface Env {
  ASSETS: { fetch(request: Request): Promise<Response> };
  SITE_PASSWORD?: string;
}

const COOKIE = 'luna_gate';
const LABEL = 'ms-luna-gate-v1';
/** The longest a browser keeps a cookie (400 days), so a device signs in about once a year. */
const KEEP_SECONDS = 400 * 24 * 60 * 60;
/** gate.html, as the asset server names it (it drops the .html). */
const GATE_PAGE = '/gate';
/**
 * What loads before signing in: the password page's own files (Vite's hashed
 * files, the fonts), and Luna's icons with the manifest that lists them
 * (DES-31), which browsers fetch without the cookie.
 */
const OPEN = [/^\/assets\//, /^\/fonts\//, /^\/(icon\.svg|icon-(192|512)\.png|apple-touch-icon\.png|manifest\.webmanifest)$/];
/** A wrong password waits this long, so guessing is slow. */
const WRONG_WAIT_MS = 1000;

async function tokenFor(password: string): Promise<string> {
  const text = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', text.encode(password), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const mac = new Uint8Array(await crypto.subtle.sign('HMAC', key, text.encode(LABEL)));
  return btoa(String.fromCharCode(...mac)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/** The same text, compared in the same time whatever it holds. */
function sameText(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function cookieOf(request: Request): string | undefined {
  for (const part of (request.headers.get('Cookie') ?? '').split(';')) {
    const [name, ...value] = part.trim().split('=');
    if (name === COOKIE) return value.join('=');
  }
  return undefined;
}

async function signedIn(request: Request, env: Env): Promise<boolean> {
  const cookie = cookieOf(request);
  return !!env.SITE_PASSWORD && !!cookie && sameText(cookie, await tokenFor(env.SITE_PASSWORD));
}

const noStore = { 'Cache-Control': 'no-store' };

function goTo(location: string, headers: Record<string, string> = {}): Response {
  return new Response(null, { status: 303, headers: { Location: location, ...noStore, ...headers } });
}

async function passwordPage(request: Request, env: Env): Promise<Response> {
  const page = await env.ASSETS.fetch(new Request(new URL(GATE_PAGE, request.url)));
  const headers = new Headers(page.headers);
  headers.set('Cache-Control', 'no-store');
  return new Response(page.body, { status: 200, headers });
}

async function signIn(request: Request, env: Env): Promise<Response> {
  const form = await request.formData().catch(() => null);
  const tried = String(form?.get('password') ?? '');
  // both sides as HMACs, so the comparison never depends on the password's
  // length; an empty one is wrong before that (an HMAC key can't be empty)
  const right = !!env.SITE_PASSWORD && tried !== '' && sameText(await tokenFor(tried), await tokenFor(env.SITE_PASSWORD));
  if (!right || !env.SITE_PASSWORD) {
    await new Promise(resolve => setTimeout(resolve, WRONG_WAIT_MS));
    return goTo('/?wrong');
  }
  const cookie = `${COOKIE}=${await tokenFor(env.SITE_PASSWORD)}; Max-Age=${KEEP_SECONDS}; Path=/; HttpOnly; Secure; SameSite=Lax`;
  return goTo('/', { 'Set-Cookie': cookie });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const { pathname } = new URL(request.url);
    if (pathname === '/sign-in' && request.method === 'POST') return signIn(request, env);
    if (OPEN.some(path => path.test(pathname))) return env.ASSETS.fetch(request);
    if (await signedIn(request, env)) return env.ASSETS.fetch(request);
    const wantsPage = request.method === 'GET' && (request.headers.get('Accept') ?? '').includes('text/html');
    if (wantsPage) return passwordPage(request, env);
    return new Response('Sign in first.', { status: 401, headers: noStore });
  }
};
