# OPS — Housekeeping (anytime)

### OPS-14 · A password on the site
Story · P0 · M · needs: —
- **Why:** the teacher (2026-11-12): "is there a way for the website to have a password required to enter… people not stealing MY WEBSITE", and "maybe just like a regular password". Today anyone with the link can use it: `wrangler.jsonc` serves `dist` as plain files.
- **How:**
  - A small Worker in front of the files (`worker/gate.ts`; `main`, `assets.binding: "ASSETS"` and `run_worker_first: true` in `wrangler.jsonc`). Without the sign-in cookie, a page answers with the password page, and a clip or anything else with 401; only the password page's own files load without it. `POST /sign-in` checks the password against the secret `SITE_PASSWORD` and sets a cookie (HttpOnly, Secure, SameSite=Lax, 400 days, the longest a browser keeps one), so each iPad or Chromebook signs in once. The cookie holds an HMAC of a fixed label keyed by the password, so changing the password signs every device out. With no secret set, nobody gets in.
  - The password page: one ordinary password field and a button, in the app's look (Luna on a PaperCard, kit buttons; a kit text field, new), as a second Vite page so it's built from the kit. A wrong password says so in words.
  - The secret lives only in Cloudflare (`npx wrangler secret put SITE_PASSWORD`, or the dashboard), never in the repo: it's public. For local checks, `.dev.vars` holds a throwaway test password and goes in `.gitignore` first. `npm run dev` stays open, as today.
  - How to set or change the password, in `docs/`.
- **Blocked:** waits for Alex's OK on the password page (review sheet in `screenshots/review/HANDOVER.md`), then his push, which deploys it.
- **Built (2026-11-12):** as above. Two changes from the plan: `wrangler dev` can't start from Claude's shell (its esbuild spawn fails with EBADF, sandbox or not), so `password-check.mjs` (know-how) plays the bundled Worker against the built `dist/` instead; and the fonts load without signing in, since the password page uses them. The check caught an empty password crashing the Worker (an HMAC key can't be empty), now a plain "try again". Alex set the secret on 2026-11-12 (`wrangler secret list` shows `SITE_PASSWORD`).
- **Complete when:**
  - with no cookie: `/` shows the password page and a voice clip answers 401, while the password page's own script and fonts load; a wrong password stays out with a message; the right one opens the app, and a reload stays in (`password-check.mjs`);
  - `.dev.vars` is git-ignored, and `git grep` finds no password in the repo;
  - the password page passes the design check, with shots at the four iPad sizes in light and dark;
  - once Alex has set the secret and deployed, the live site asks for the password and the teacher's iPad gets in;
  - build and lint pass.

### OPS-11 · A first cloud session (parked)
Task · P2 · M
- **Why:** the rest of OPS-10, parked by Alex on 2026-10-17: the cloud set-up was taking time away from building the app, and he hasn't needed to work away from the Mac yet. OPS-10 left the groundwork in the repo (one Chrome helper, the boards as pictures, `CLAUDE.md`, the backlog's **Git** section, the `voice-queue` skill, `docs/cloud-sessions.md`). Pick this up only if Alex wants to work from claude.ai/code.
- **How:**
  - **Claude's notes into the repo:** the notes in the Mac's memory (git rules, follow the board, the teacher's tastes, the stage table…) move into `.claude/memory/`, indexed from `CLAUDE.md`; the Mac's memory keeps only a pointer, and the `wrap-up` skill sends new notes there. Leave out anything personal: the repo is public. On 2026-10-17 the auto-mode safety check refused copying them (private memory into a public repo), so Alex allows those writes first.
  - **The cloud environment:** Alex sets up the setup script and the network access in `docs/cloud-sessions.md`.
  - **The first run:** that page's "The first cloud session" steps, noting in its table how review sheets reach Alex and whether `voice:render` reaches the model.
- **Complete when:**
  - `.claude/memory/` holds every note, `CLAUDE.md` indexes them, and the Mac's memory only points at them;
  - a cloud session passes `npm run lint` and `kit-check.mjs`, runs `ui:shots` with the emoji drawn, and a review sheet reaches Alex;
  - `docs/cloud-sessions.md` says which way the review sheet came and whether the voice model was reachable.

