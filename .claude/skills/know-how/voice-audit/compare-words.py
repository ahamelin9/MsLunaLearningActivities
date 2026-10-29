# Today's word clips (A) against the misaki ones (B): did Whisper understand the
# word, and how far are the recognized phones from the word's misaki phonemes?
import json, re, sys
S = sys.argv[1]
heard = json.load(open(f'{S}/heard-words.json'))
ms = json.load(open(f'{S}/words-misaki.json'))

def norm_ps(s):
    s = re.sub(r'[ˈˌː\s.,!?]', '', s)
    for a, b in [('eɪ', 'A'), ('aɪ', 'I'), ('oʊ', 'O'), ('aʊ', 'W'), ('ɔɪ', 'Y'), ('dʒ', 'ʤ'), ('tʃ', 'ʧ'), ('ɚ', 'əɹ'), ('ɝ', 'ɜɹ'),
                 ('ɾ', 'T'), ('ɐ', 'ə'), ('ᵻ', 'ɪ'), ('ᵊ', 'ə'), ('r', 'ɹ'), ('ɡ', 'g'), ('i5', 'i'), ('ɑɹ', 'ɑɹ')]:
        s = s.replace(a, b)
    return s
def edit(a, b):
    d = list(range(len(b) + 1))
    for i, ca in enumerate(a, 1):
        p, d[0] = d[0], i
        for j, cb in enumerate(b, 1):
            p, d[j] = d[j], min(d[j] + 1, d[j - 1] + 1, p + (ca != cb))
    return d[len(b)]
SAME = {'two': {'2', 'to', 'too'}, 'i': {'eye', 'aye'}, 'a': {'uh', 'ah', 'eh'}, 'four': {'4', 'for'}, 'one': {'1', 'won'}, 'six': {'6'}, 'ten': {'10'},
        'seven': {'7'}, 'three': {'3'}, 'r': {'are'}, 'g': {'gee'}, 's': {'yes', 'ess'}, 'ms': {'miss', 'mrs', 'mz'}, 'see': {'sea', 'c'}, 'sea': {'see'},
        'sun': {'son'}, 'eat': set(), 'read': {'red', 'reed'}, 'no': {'know'}, 'by': {'buy', 'bye'}, 'flower': {'flour'}, 'hours': {'ours'}}
def understood(w, text):
    t = re.sub(r"[^a-z0-9' ]", '', text.lower()).strip()
    t = t.replace("'", '’') if '’' in w else t
    return t == w.lower() or t in SAME.get(w.lower(), set()) or t.replace(' ', '') == w.lower().replace('’', '')

rows = []
for w, ps in ms.items():
    a, b = heard.get(f'A:{w}'), heard.get(f'B:{w}')
    if not a or not b: continue
    ref = norm_ps(ps)
    pa, pb = norm_ps(a['phones']), norm_ps(b['phones'])
    rows.append({'w': w, 'ref': ref, 'A': pa, 'B': pb, 'perA': edit(pa, ref) / max(1, len(ref)), 'perB': edit(pb, ref) / max(1, len(ref)),
                 'wa': a['whisper'], 'wb': b['whisper'], 'okA': understood(w, a['whisper']), 'okB': understood(w, b['whisper'])})
n = len(rows)
print(f'{n} words')
print(f"Whisper understood: today {sum(r['okA'] for r in rows)}/{n}, fixed {sum(r['okB'] for r in rows)}/{n}")
print(f"mean phone distance to misaki: today {sum(r['perA'] for r in rows)/n:.3f}, fixed {sum(r['perB'] for r in rows)/n:.3f}")
better = [r for r in rows if r['perB'] + 0.15 < r['perA']]
worse = [r for r in rows if r['perA'] + 0.15 < r['perB']]
print(f'closer with the fix: {len(better)}, further: {len(worse)}')
print('\nonly the fix understood:', [(r['w'], r['wa']) for r in rows if r['okB'] and not r['okA']])
print('\nonly today understood:', [(r['w'], r['wb']) for r in rows if r['okA'] and not r['okB']])
print('\nneither:', [(r['w'], r['wa'], r['wb']) for r in rows if not r['okA'] and not r['okB']])
print('\nbiggest gains:')
for r in sorted(rows, key=lambda r: r['perB'] - r['perA'])[:25]: print(f"  {r['w']:12} ref {r['ref']:14} today {r['A']:16} fixed {r['B']:16}")
print('\nbiggest losses:')
for r in sorted(rows, key=lambda r: r['perA'] - r['perB'])[:12]: print(f"  {r['w']:12} ref {r['ref']:14} today {r['A']:16} fixed {r['B']:16}")
json.dump(rows, open(f'{S}/compare-words.json', 'w'), ensure_ascii=False, indent=0)
