# Whisper understood: the word heard, ignoring case, punctuation, digits for numbers and homophones.
# Usage: wscore.py <heard.json>...   (keys are "<voice>:<word>")
import json, re, sys
NUM = 'zero one two three four five six seven eight nine ten'.split()
HOMO = [{'write', 'right'}, {'high', 'hi'}, {'by', 'bye', 'buy'}, {'plane', 'plain'}, {'sails', 'sales'},
        {'sea', 'see'}, {'to', 'two', 'too'}, {'for', 'four'}, {'one', 'won'}, {'red', 'read'}, {'in', 'inn'},
        {'whole', 'hole'}, {'there', 'their'}, {'eight', 'ate'}, {'him', 'hymn'}, {'son', 'sun'}, {'pair', 'pear'},
        {'tail', 'tale'}, {'meet', 'meat'}, {'night', 'knight'}, {'no', 'know'}, {'bee', 'be'}, {'week', 'weak'}]
norm = lambda s: re.sub(r"[^a-z0-9' ]", '', s.lower()).strip()
def same(word, heard):
    w, h = norm(word), norm(heard)
    if w == h: return True
    if w in NUM and h == str(NUM.index(w)): return True
    return any(w in s and h in s for s in HOMO)
res = {}
for f in sys.argv[1:]:
    for k, v in json.load(open(f)).items():
        voice, word = k.split(':', 1)
        res.setdefault(voice, {})[word] = same(word, v['whisper'])
for voice, d in res.items():
    print(voice, sum(d.values()), 'of', len(d))
json.dump(res, open(sys.argv[-1] + ".scored.json", "w"))
