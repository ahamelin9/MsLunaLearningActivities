# Working from a Claude Code cloud session

Ms. Luna is meant to be workable from a Claude Code cloud session
(claude.ai/code) in the same way as from the desktop app on Alex's Mac. OPS-10
(2026-10-17) laid the groundwork; Alex parked the rest as OPS-11 to keep
building the app, so no cloud session has run yet. A cloud session starts from
what's on GitHub, so this page lists what it needs and what works differently
there.

## What a cloud session gets from the repo

Everything committed: the skills (`.claude/skills/`), the hooks
(`.claude/settings.json`: the backlog guard, the agenda, the design checks),
the backlog (`kanban/`), the design docs, every script and check, the rendered
voice clips (`public/voice/`), the fonts, and the round 2 boards as pictures
(`.claude/skills/luna-design/prototype/shots/`).

Not from the repo: anything only on the Mac. That's the desktop app's
signed-in browser, the `/board` pane, Alex's dev server on port 5173, and
`~/.claude` on the Mac, which holds Claude's notes (how Alex works, the
teacher's tastes). Until OPS-11 moves those notes into the repo, a cloud
session works without them.

## One-time setup of the cloud environment (Alex)

In the environment's settings on claude.ai/code:

- **Setup script:**

  ```bash
  npm ci
  # a Chrome for ui:shots and the know-how checks (scripts/chrome-path.cjs finds it)
  apt-get update && apt-get install -y chromium fonts-noto-color-emoji || true
  [ -x /usr/bin/chromium ] || npx --yes @puppeteer/browsers install chrome@stable --path "$HOME/.cache/puppeteer"
  chmod +x scripts/cloud/chrome.sh
  ```

  `fonts-noto-color-emoji` draws the emoji the games still use; without it
  they're empty boxes in the shots. If the image is Ubuntu, its `chromium` is
  a snap that won't run in a container, so the second line installs Chrome
  for Testing instead. That Chrome may need system libraries; Chrome's own
  error names them, and `apt-get install` adds them.
- **Network access:** the npm registry; the system's package mirrors and
  storage.googleapis.com (for Chrome); github.com; and huggingface.co, so
  `npm run voice:render` can fetch Luna's voice model (about 325 MB). Without
  huggingface.co, new lines wait in the voice queue for the Mac.

## What works differently in the cloud

| What | On the Mac (desktop app) | In a cloud session |
|---|---|---|
| Git | Alex runs it; Claude hands over `git add <paths>` and messages | Claude commits (code, then close-out) and pushes only on Alex's OK; the backlog skill's **Git** section |
| Which one am I in? | the agenda's "Session:" line says "on Alex's Mac" | it says "a cloud session" |
| Chrome | the Mac's Chrome | Chromium or Chrome for Testing, through `scripts/cloud/chrome.sh` |
| Screenshots | `npm run ui:shots` | the same, but its pixels never match the Mac's: take a `--diff`'s "before" and "after" in the same session |
| The boards | the pictures in `prototype/shots/`, or the canvas in the desktop app's browser | the pictures in `prototype/shots/` only |
| Review sheets | sent with SendUserFile, shown in the app | SendUserFile where the session has it; otherwise published as a private Artifact and the link given |
| New voice lines | `npm run voice:render` | the same if huggingface.co is reachable; otherwise logged in the `voice-queue` skill, the ticket left `Blocked`, and rendered on the Mac next |
| Trying the app | `npm run dev`, open http://localhost:5173 | not possible; look at the review sheets, and pull on the Mac to try it |
| The `/board` pane | yes | no: `kanban/README.md` and the agenda line instead |

## The first cloud session (OPS-11, parked)

1. `npm run lint` and `npm run build` pass.
2. With Vite on 5199 (`node_modules/.bin/vite --port 5199 --strictPort`, in
   the background), `node .claude/skills/know-how/kit-check.mjs` passes.
3. `npm run ui:shots -- --label cloud` runs, and the emoji in the game shots
   are drawn.
4. A review sheet from those shots (`node .claude/skills/know-how/review-sheet.mjs`)
   reaches Alex. Note which way worked in this page's table.
5. `npm run voice:render` with nothing new to render: does it reach the
   model? Note it here too.
6. OPS-11's close-out is committed and pushed by the rules in the backlog
   skill's **Git** section, after Alex's OK.
