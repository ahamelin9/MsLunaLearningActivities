# The site's password

The live site asks for one class password before it opens (OPS-14). A small
Cloudflare Worker (`worker/gate.ts`) stands in front of the site's files:

- A device that hasn't signed in gets the password page (`gate.html`, built
  from `src/components/os/SignIn/`) for any page, and nothing else: Luna's
  clips and the app answer 401.
- The right password sets a cookie for 400 days (the longest a browser keeps
  one), so each iPad or Chromebook signs in about once a year. An iPad's
  home-screen app keeps its own cookies, so it signs in once on its own.
- A wrong password waits a second and says "That's not it. Try again."

The password itself lives **only in Cloudflare**, as the secret
`SITE_PASSWORD`. The repo is public, so it never goes in a file here.

## Set or change it

From the repo, on the Mac:

```bash
npx wrangler secret put SITE_PASSWORD
```

It asks for the password and saves it straight away; no deploy is needed. To
see it's there, `npx wrangler secret list` (it shows the name, never the
value). On the Cloudflare dashboard it's under the Worker's **Settings →
Variables and Secrets**, not under **Build** (that one is for build-time
settings, and stays empty).

Changing the password signs every device out: the cookie is made from the
password, so an old one no longer fits.

With no password set at all, nobody gets in.

## Locally

`npm run dev` has no password: the Worker only runs on Cloudflare. To try the
Worker's logic, `npm run build`, then
`node .claude/skills/know-how/password-check.mjs`, which plays the Worker
against the built site with a made-up password. (`wrangler dev` reads a test
password from `.dev.vars`, which git ignores, but it can't start from Claude's
shell.)
