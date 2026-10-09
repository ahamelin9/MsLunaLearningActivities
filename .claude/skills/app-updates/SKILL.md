---
name: app-updates
description: End-of-day "App Updates" note for the teacher, a short plain-language list of what changed in Ms. Luna that day, ready for Alex to paste into Apple Notes. Use when Alex asks for the day's updates, an end-of-day summary, "what got done today", release notes for the teacher, or invokes /app-updates (optionally with a date, e.g. "for yesterday" or 2026-10-09).
---

# App Updates note

At the end of a day, Alex pastes a note into Apple Notes so the teacher can
see what changed in the app and when. This skill writes that note. Think of it
as the board, but only showing what got done that day.

## 1. Get the facts

```bash
node .claude/skills/app-updates/collect.mjs              # today
node .claude/skills/app-updates/collect.mjs 2026-10-09   # a day Alex names
```

It prints the note's title and, for that date: the Changelog lines (tickets
finished or dropped, plus other notes), tickets added to the board that day,
that day's commits, and whether anything is still uncommitted. **Write only
from this output**, never from memory of the session. If a finished ticket's
line is unclear, read its commit diff (`git show <hash> --stat`), not the
code.

## 2. Write the note for the teacher

The reader is the teacher, not a developer. She knows the app from the
classroom side: Luna, the lessons, the games by their names.

- **Say what a child or the teacher will notice.** "Luna no longer says the
  word before the child reads it", not "prompts no longer contain the target".
- **No ticket IDs, file names or code words.** Skill, hook, audit, clip,
  render, inventory, component and IPA ("phonetic symbols") are all out.
- **One idea per bullet, one or two short sentences.** Merge related tickets
  into one bullet (two Feed Luna fixes are one Feed Luna bullet). Most
  noticeable first. Use game and lesson names as the hub shows them.
- **Leave out developer-only work** (tools, checks, the backlog's own process,
  reprioritising) unless Alex asks for it. A dropped ticket only goes in if
  the teacher would have expected it.
- **"Coming up"** lists tickets added that day that the teacher would care
  about (new games, apps, rewards, lesson changes), at most four, in plain
  words, without priorities. Skip internal bugs she never saw. If the backlog
  itself was created that day, say so in one bullet instead of listing it.
- **Nothing finished that day?** Say so in one line and write no note.

## 3. Hand it over

Start the message with one line naming the audience
(`Written for: the teacher, in Apple Notes.`), then the note. Write it as
**ordinary rendered Markdown, not in a code block**. Copying the rendered text
pastes into Apple Notes as a real bulleted list, which is how Alex uses it. The
shape:

> ***App Updates 10/9/26***
> Here's what changed today:
> - **Short headline.** One plain sentence on what's different.
> - …
>
> Coming up:
> - …

After the note, add at most one line outside it, and only if it applies: the
collector's "UNCOMMITTED NOW" count ("3 files aren't committed yet, so they
aren't in this push"), or a bullet you left out that Alex might want back.
