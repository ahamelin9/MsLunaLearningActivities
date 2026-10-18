---
name: voice-queue
description: Ms. Luna lines waiting for Luna's voice, and anything else only Alex's Mac can do. Use when a session changed what Luna says but couldn't render it (a cloud session that can't reach the voice model), at the start of every session on Alex's Mac to render what's waiting, and when Alex asks "is any voice waiting?" or "render the queue".
---

# Voice queue

Luna's lines are pre-rendered clips, never spoken on the device
(`npm run voice:render`, in `scripts/voice/`). Rendering needs the Kokoro
model, about 325 MB, which `render.mjs` downloads from huggingface.co
(`onnx-community/Kokoro-82M-v1.0-ONNX`) the first time and caches after. A
cloud session may not reach it, or may not keep it, so its new lines can wait
here until the next session on Alex's Mac renders them (Alex, 2026-10-13,
OPS-10).

The queue is `queue.md` in this folder. The backlog hook shows how many entries
are waiting with every message, so a Mac session sees them at once.

## In a session that changed what Luna says

1. Write every new or changed line as a whole `{ text }` part, as always
   (`voice:audit` fails template literals).
2. Try `npm run voice:render`. If it renders, run `npm run voice:audit` and
   carry on: nothing to queue.
3. If it can't (no network to huggingface.co, no room for the model):
   - add an entry to `queue.md`: the date, the ticket, and the lines and files
     waiting (what `npm run voice:audit` lists as missing);
   - leave the ticket `Blocked`, reason "voice render waiting (voice-queue)",
     not Done: Completion criteria B2 needs the clips. Commit its code as
     usual; the next ticket can start (Blocked isn't In progress);
   - until it's rendered, those lines play in the browser's robot voice, so
     say so in the review: "N lines wait for the voice queue".
4. Something else only the Mac can do (a board shot through the desktop app's
   browser, a check that needs its signed-in browser) goes in `queue.md`'s
   second list the same way.

## On Alex's Mac (the start of a session, or when he asks)

1. Read `queue.md`. Empty: nothing to do.
2. Make sure the tree is current (`git status`, and Alex pulls if needed),
   then `npm ci` if `package-lock.json` changed.
3. `npm run voice:render`, then `npm run voice:audit` must pass. If the lines
   came with moved files or new imports, run `distractor-check.mjs` and
   `passage-check.mjs` too (know-how, BUG-24).
4. Tell Alex to reload any open tab before he listens (the `know-how` skill's
   "Luna sounds like the robot voice").
5. Empty the entries you rendered from `queue.md`, then close each ticket that
   was Blocked on them with the `backlog` skill (its Completion criteria,
   changelog line and all).
6. Hand over the commit as usual: `public/voice/`, `queue.md` and the
   backlog files, its message starting with the ticket ID.
