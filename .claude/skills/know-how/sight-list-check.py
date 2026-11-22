#!/usr/bin/env python3
"""A drafted sight-word list, checked before Alex reads it (CUR-27a–c).

    python3 .claude/skills/know-how/sight-list-check.py screenshots/review/cur27a-dolch-k.md [more lists]

Each row of the review table is "| word [♻] | look-alike, look-alike | sentence 🙂 · sentence 🙂 |".
It fails a row whose look-alikes aren't two or include the word, that hasn't
two sentences, or whose sentence doesn't hold the word as a whole word; a
word whose look-alikes all start with another letter (its first sound gives
it away, distractor-check.mjs's first-letter rule); an owl
emoji (a second owl beside Luna, DES-12); and a word twice in one list.
"""
import pathlib
import re
import sys

failed = False
for path in sys.argv[1:]:
    seen, problems, rows = {}, [], 0
    for line in pathlib.Path(path).read_text().split("\n"):
        m = re.match(r"\| ([A-Za-z']+)[^|]*\| ([^|]+)\| ([^|]+)\|", line)
        if not m or m.group(1) == "Word":
            continue
        word, alike, sentences = m.group(1), m.group(2), m.group(3)
        rows += 1
        seen[word.lower()] = seen.get(word.lower(), 0) + 1
        alikes = [a.strip().lower() for a in alike.split(",")]
        if len(alikes) != 2 or word.lower() in alikes:
            problems.append(f"{word}: look-alikes {alikes}")
        # the game's rule (distractor-check.mjs): a look-alike starts like the
        # word, or its first sound alone gives it away
        if not any(x[:1] == word[:1].lower() for x in alikes):
            problems.append(f"{word}: no look-alike starts with {word[0]} ({', '.join(alikes)})")
        said = [s.strip() for s in sentences.split("·")]
        if len(said) != 2:
            problems.append(f"{word}: {len(said)} sentences")
        for s in said:
            if not re.search(r"(?<![A-Za-z'])" + re.escape(word) + r"(?![A-Za-z'])", s.replace("’", "'"), re.I):
                problems.append(f"{word}: not in \"{s}\"")
        if "🦉" in line:
            problems.append(f"{word}: an owl emoji")
    problems += [f"{w}: twice in the list" for w, n in seen.items() if n > 1]
    failed |= bool(problems)
    for p in problems:
        print(f"❌ {path}: {p}")
    print(f"{'❌' if problems else '✅'} {path}: {rows} words, {len(problems)} problems")

sys.exit(1 if failed else 0)
