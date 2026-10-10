"""Checks built artboards before publishing: tags balance, no placeholder left, and the script parses.

Usage: python3 check.py project/R2Look.dc.html [more files...]
Needs node on the PATH for the script check.
"""
import os
import subprocess
import sys
import tempfile
from html.parser import HTMLParser

VOID = {'meta', 'input', 'link', 'br', 'img', 'hr'}


class TagCheck(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.stack, self.errors = [], []

    def handle_starttag(self, tag, attrs):
        if tag not in VOID:
            self.stack.append((tag, self.getpos()))

    def handle_startendtag(self, tag, attrs):
        self.errors.append(f'self-closed <{tag}> at {self.getpos()}')

    def handle_endtag(self, tag):
        if tag in VOID:
            return
        if not self.stack:
            self.errors.append(f'stray </{tag}> at {self.getpos()}')
        elif self.stack[-1][0] != tag:
            self.errors.append(f'</{tag}> at {self.getpos()} closes <{self.stack[-1][0]}> from {self.stack[-1][1]}')
            for i in range(len(self.stack) - 1, -1, -1):
                if self.stack[i][0] == tag:
                    del self.stack[i:]
                    break
        else:
            self.stack.pop()


def check(path):
    text = open(path).read()
    problems = []
    body = text.split('<x-dc>')[1].split('</x-dc>')[0]
    p = TagCheck()
    p.feed(body)
    p.close()
    problems += p.errors[:5]
    if p.stack:
        problems.append(f'unclosed: {p.stack[-3:]}')
    if '%%' in text:
        problems.append('a %%placeholder%% was not expanded')
    script = text.split('data-dc-script')[1]
    script = script[script.index('>') + 1:script.index('</script>')]
    with tempfile.NamedTemporaryFile('w', suffix='.js', delete=False) as f:
        f.write('class DCLogic {}\n' + script)
    try:
        r = subprocess.run(['node', '--check', f.name], capture_output=True, text=True)
        if r.returncode:
            problems.append('script: ' + r.stderr.strip().splitlines()[-1])
    finally:
        os.unlink(f.name)
    print(path, 'OK' if not problems else problems)
    return not problems


if __name__ == '__main__':
    ok = all([check(f) for f in sys.argv[1:]])
    sys.exit(0 if ok else 1)
