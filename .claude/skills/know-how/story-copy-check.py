#!/usr/bin/env python3
"""Does any right answer in a drafted story list copy three words in a row from
its story? (CUR-22a/b's rule, so an answer can't be found by matching text.)

    python3 .claude/skills/know-how/story-copy-check.py screenshots/review/cur22b-stories.md

The list is the review format: each story starts with **Title**, a new story
has its lines on one line split by " / ", and each question lists "✅ right ·
wrong · wrong". A story already in the app has no lines in the list, so its
lines are read from the source (found by its title in src/data).
"""
import pathlib
import re
import sys

md = pathlib.Path(sys.argv[1]).read_text()
src = "".join(p.read_text() for p in pathlib.Path("src/data").rglob("*.ts"))
words = lambda t: re.findall(r"[a-z']+", t.lower().replace("’", "'"))
threes = lambda ws: {tuple(ws[i:i + 3]) for i in range(len(ws) - 2)}

bad = questions = stories = 0
for block in re.split(r"\n\*\*", md)[1:]:
    title = block.split("**")[0]
    lines = [l for l in block.split("\n") if " / " in l]
    if lines:
        text = lines[0]
    else:
        at = max(src.find(f"'{title}'"), src.find(f"'{title.replace(chr(39), '’')}'"))
        if at < 0:
            print(f"? no story called {title} in the list or src/data")
            bad += 1
            continue
        text = src[at:at + 700]
    stories += 1
    story = threes(words(text))
    for answer in re.findall(r"✅ ([^·]+)·", block):
        questions += 1
        hit = threes(words(answer)) & story
        if hit:
            bad += 1
            print(f"❌ {title}: \"{answer.strip()}\" copies {' '.join(next(iter(hit)))}")

print(f"{stories} stories, {questions} questions: {'✅ none copies three words' if not bad else f'❌ {bad} to fix'}")
sys.exit(1 if bad else 0)
