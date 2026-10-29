import sys, json
from misaki import en
g2p = en.G2P(trf=False, british=False, fallback=None)
if False:
    from misaki import espeak
    fb = espeak.EspeakFallback(british=False)
    g2p = en.G2P(trf=False, british=False, fallback=fb)
else:
    pass
out = {}
for line in open(sys.argv[1]):
    w = line.strip()
    if not w: continue
    ps, toks = g2p(w)
    # a word said on its own carries primary stress
    if 'ˈ' not in ps: ps = ps.replace('ˌ', 'ˈ', 1) if 'ˌ' in ps else 'ˈ' + ps
    out[w] = ps
json.dump(out, open(sys.argv[2], 'w'), ensure_ascii=False, indent=0)
print(len(out), 'words;', sum('❓' in v or not v for v in out.values()), 'unknown')
