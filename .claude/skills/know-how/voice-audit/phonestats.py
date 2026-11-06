# Per-phone medians from align.py output, and the same measures on isolated clips.
#   python phonestats.py summary <phones.json> [sex]
#   python phonestats.py clips <tsv: label \t phone \t wav>  -> measures each clip like align.py does
import sys, json, numpy as np

def med(vals):
    v = [x for x in vals if x is not None and x == x]
    return float(np.median(v)) if v else None

def summary(rows, sex=None):
    by = {}
    for r in rows:
        if sex and r.get('sex') != sex: continue
        by.setdefault(r['p'], []).append(r)
    out = {}
    for p, rs in by.items():
        d = {'n': len(rs), 'dur': med([r['dur'] for r in rs])}
        if any('f' in r for r in rs):
            mid = [r['f'][1] for r in rs if 'f' in r]
            d['F1'] = med([m[0] for m in mid]); d['F2'] = med([m[1] for m in mid]); d['F3'] = med([m[2] for m in mid])
            beg = [r['f'][0] for r in rs if 'f' in r]; end = [r['f'][2] for r in rs if 'f' in r]
            d['F2beg'] = med([m[1] for m in beg]); d['F2end'] = med([m[1] for m in end])
            d['F1beg'] = med([m[0] for m in beg]); d['F1end'] = med([m[0] for m in end])
        if any('minF3' in r for r in rs): d['minF3'] = med([r.get('minF3') for r in rs])
        if any(r.get('spec') for r in rs):
            d['centroid'] = med([r['spec']['centroid'] for r in rs if r.get('spec')])
            d['peak'] = med([r['spec']['peak'] for r in rs if r.get('spec')])
        out[p] = d
    return out

if sys.argv[1] == 'summary':
    rows = json.load(open(sys.argv[2]))
    s = summary(rows, sys.argv[3] if len(sys.argv) > 3 else None)
    json.dump(s, open(sys.argv[2].replace('.json', '-summary.json'), 'w'), ensure_ascii=False, indent=1)
    for p in sorted(s, key=lambda p: -s[p]['n']):
        d = s[p]
        if d['n'] < 8: continue
        bits = [f"n={d['n']}", f"dur={d['dur']*1000:.0f}ms"]
        for k in ('F1', 'F2', 'F3', 'minF3', 'centroid', 'peak'):
            if d.get(k): bits.append(f"{k}={d[k]:.0f}")
        print(p.ljust(5), ' '.join(bits))
