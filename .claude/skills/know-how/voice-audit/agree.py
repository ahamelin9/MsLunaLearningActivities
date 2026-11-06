# Do the measures agree with Alex's ears? For every card where Alex picked a
# take, ranks the card's takes by what the machine can measure for that sound
# and reports where his pick came: vowels by formant distance to Luna's own
# vowel in speech, hisses by brightness against real speech, everything else
# by the phoneme recognizer's score. A pick ranked first far more often than
# chance means the measure can shortlist takes before he listens (VOX-4).
#   python agree.py <takes.tsv> <held.json> <scored.json> <picks dir> <round prefix: s|s2> <luna summary> <real summary>
import sys, json, glob, collections, math

takes_tsv, held_json, scored_json, picks_dir, prefix, luna_sum, real_sum = sys.argv[1:8]
luna, real = json.load(open(luna_sum)), json.load(open(real_sum))
held = {(r['sound'], r['take']): r for r in json.load(open(held_json))}
scored = json.load(open(scored_json))
cards = collections.defaultdict(list)
for line in open(takes_tsv):
    s, t, _ = line.rstrip('\n').split('\t'); cards[s].append(t)

VOWEL = {'a': 'æ', 'e': 'ɛ', 'i': 'ɪ', 'o': 'ɑː', 'u': 'ʌ', 'ee': 'iː', 'oo': 'uː', 'ay': 'eɪ', 'eye': 'aɪ', 'oh': 'oʊ',
         'ar': 'ɑːɹ', 'or': 'ɔːɹ', 'er': 'ɜː', 'l': 'l', 'r': 'ɹ', 'w': 'w', 'y': 'j'}
HISS = {'s': 's', 'sh': 'ʃ', 'z': 'z', 'f': 'f', 'th': 'θ', 'v': 'v', 'dh': 'ð', 'h': 'h'}

def measure(s, t):
    """Smaller is better. None when the machine can't say."""
    h = held.get((s, t))
    if s in VOWEL and h and h['F'] and VOWEL[s] in luna:
        tg = luna[VOWEL[s]]
        return math.hypot((h['F'][0] - tg['F1']) / tg['F1'], (h['F'][1] - tg['F2']) / tg['F2']), 'formants'
    if s in HISS and h and h['centroid']:
        c = real[HISS[s]]['centroid']; return abs(h['centroid'] - c) / c, 'brightness'
    r = scored.get(s, {}).get(t)
    if r is not None: return -r['score'], 'recognizer'
    return None, None

picks = {}
for f in glob.glob(f'{picks_dir}/*.json'):
    d = json.load(open(f)); item = d.get('item') or f.rsplit('--', 1)[1][:-5]
    p, _, s = item.partition(':')
    if p == prefix: picks[s] = d.get('choice')

rows, by = [], collections.defaultdict(lambda: [0, 0, 0.0, 0.0])
for s, choice in sorted(picks.items()):
    if choice in (None, 'none', 'both-wrong', 'same') or s not in cards or choice not in cards[s]: continue
    ms = [(measure(s, t), t) for t in cards[s]]
    ms = [(m, t) for (m, how), t in ms if m is not None]
    if len(ms) < 2 or choice not in [t for _, t in ms]: continue
    how = measure(s, choice)[1]
    order = [t for _, t in sorted(ms)]
    rank = order.index(choice) + 1
    rows.append((s, choice, how, rank, len(order), order[0]))
    b = by[how]; b[0] += 1; b[1] += rank == 1; b[2] += 1 / len(order); b[3] += rank / len(order)

for r in rows: print(f'{r[0]:4} picked {r[1]:12} by {r[2]:10} rank {r[3]}/{r[4]}   machine\'s first: {r[5]}')
print()
for how, (n, top, chance, rel) in by.items():
    print(f'{how:10} {n} cards: his pick ranked first {top} times (chance {chance:.1f})')
n = sum(b[0] for b in by.values()); top = sum(b[1] for b in by.values()); ch = sum(b[2] for b in by.values())
print(f'all        {n} cards: his pick ranked first {top} times (chance {ch:.1f})')

# The measures as a gate rather than a ranker: throw out takes that are the
# wrong sound, keep the rest for Alex's ear. Does the gate ever throw out his pick?
R_SOUNDS = {'ar', 'or', 'er', 'r'}
def gate(s, t):
    h = held.get((s, t))
    if s in VOWEL and h and h['F'] and VOWEL[s] in luna:
        tg = luna[VOWEL[s]]
        if abs(h['F'][1] - tg['F2']) / tg['F2'] > 0.2: return f"F2 {h['F'][1]} vs {round(tg['F2'])}"
        if s in R_SOUNDS and h['F'][2] > 2400: return f"F3 {h['F'][2]}: no R in it"
        return None
    r = scored.get(s, {}).get(t)
    if s not in HISS and r is not None and r['target'] < 0.3: return f"recognizer {r['target']:.2f}"
    return None
cut = kept = cut_pick = 0
for s, ts in cards.items():
    for t in ts:
        why = gate(s, t)
        if why:
            cut += 1; hit = picks.get(s) == t; cut_pick += hit
            print(f'gate cuts {s:4} {t:12} ({why}){"   <- HIS PICK" if hit else ""}')
        else: kept += 1
print(f'gate: cut {cut} of {cut + kept} takes; cut his pick {cut_pick} times')

# Card by card: when Alex said "None are right", had the gate already cut every take?
tally = collections.Counter()
for s, ts in cards.items():
    if s not in picks: continue
    kind = 'formants' if s in VOWEL else 'brightness' if s in HISS else 'recognizer'
    kept_ts = [t for t in ts if not gate(s, t)]
    none = picks[s] in ('none', 'both-wrong')
    tally[(kind, 'none' if none else 'picked', 'all cut' if not kept_ts else 'some kept')] += 1
for k, v in sorted(tally.items()): print('cards', *k, v)
