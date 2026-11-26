# VOX-10: every recorded sound and letter name at Luna's pitch.
# Run from the repo root in the luna-vc env, after pitchscan.py:
#   ~/anaconda3/envs/luna-vc/bin/python .claude/skills/know-how/voice-audit/pitchscan.py .voice-tmp/pitchscan.json
#   ~/anaconda3/envs/luna-vc/bin/python .claude/skills/know-how/voice-audit/repitch.py <outdir> [KEYS]
#
# Every voiced file in scripts/voice/recorded/ more than LIMIT semitones from
# Luna's median gets two new versions, for Alex's ear:
#   A  its conversion redone with the take raised as far as the converter
#      will follow (it has a ceiling: D's take at 130 Hz came out at 164,
#      raised 3 at 194, raised 6 still 188, raised 9 broke), then the small
#      rest by PSOLA;
#   B  today's clip moved by PSOLA alone.
# PSOLA (below) moves the pitch one cycle at a time and keeps the voice's
# shape (its formants), so it doesn't chipmunk the way a plain pitch shift
# of the finished clip does. Its intonation is kept; only the level moves.
#
# Where a recording came from is found by matching its bytes against the
# conversion folders in .voice-tmp/vox7 and vox8:
#   <take>--luna.wav          a plain conversion of <take>--his.wav
#   <take>__up--luna.wav      raised 4 or 7 first (the round 6/7 cards say)
#   <K>__cut--luna.wav        the first piece of the converted word
#   <take>__raised--his.wav   his take raised 7, not converted (V): A re-raises it
#   anything else (OO, cut by hand in VOX-7): B only
# Writes <outdir>/A/<key>.wav, <outdir>/B/<key>.wav and <outdir>/repitch.json.
import glob, hashlib, json, os, re, sys
from pathlib import Path
import numpy as np, soundfile as sf, librosa

out = sys.argv[1]
only = set(sys.argv[2].split(',')) if len(sys.argv) > 2 else None
RATE, PAD_S, LIMIT, HOP = 24000, 0.4, 1.0, 128
ROOT = os.getcwd()
REC = os.path.join(ROOT, 'scripts/voice/recorded')
TMP = os.path.join(ROOT, '.voice-tmp')
here = os.path.dirname(os.path.abspath(__file__))
for d in ('A', 'B'):
    os.makedirs(os.path.join(out, d), exist_ok=True)

root, SR = Path(ROOT), RATE  # what pitchscan.py's helpers expect
src = open(os.path.join(here, 'pitchscan.py')).read()
exec(src[src.index('def load'):src.index('man = json.load')])  # load(p), pitch(y) -> (hz, voiced share)


def md5(p):
    return hashlib.md5(open(p, 'rb').read()).hexdigest()


def level(x, target_db=-20):
    rms = np.sqrt(np.mean(x ** 2) + 1e-12)
    y = x * (10 ** (target_db / 20) / rms)
    return y * (0.9 / np.abs(y).max()) if np.abs(y).max() > 0.9 else y


def semis(hz, ref):
    return float(12 * np.log2(hz / ref))


def first_piece(y):
    a, b = librosa.effects.split(y, top_db=30, frame_length=1024, hop_length=128)[0]
    x = y[max(0, a - int(.02 * RATE)): min(len(y), b + int(.03 * RATE))].copy()
    f = int(.015 * RATE)
    x[:f] *= np.linspace(0, 1, f); x[-f:] *= np.linspace(1, 0, f)
    return x


def psola(y, n):
    """Move y's pitch by n semitones, keeping its length and its formants.
    Analysis marks one period apart, on the waveform's peaks where voiced
    (5 ms apart and left alone where not); each output mark, spaced by the
    new period, takes a two-period Hann grain from the nearest input mark."""
    if abs(n) < 0.05:
        return y
    ratio = 2 ** (n / 12)
    f0, vf, _ = librosa.pyin(y, fmin=80, fmax=500, sr=RATE, frame_length=1024, hop_length=HOP)
    still = int(0.005 * RATE)

    def period(t):
        i = min(len(f0) - 1, t // HOP)
        return int(RATE / f0[i]) if vf[i] and not np.isnan(f0[i]) else None

    marks, t = [], 0
    while t < len(y):
        p = period(t)
        if p is None:
            marks.append((t, still, False)); t += still; continue
        lo, hi = max(0, t - p // 4), min(len(y), t + p // 4 + 1)
        t = lo + int(np.argmax(y[lo:hi])) if hi > lo else t
        marks.append((t, p, True)); t += p
    at = np.array([m[0] for m in marks])
    out_y, norm = np.zeros(len(y) + 2 * RATE // 50), np.zeros(len(y) + 2 * RATE // 50)
    t = 0
    while t < len(y):
        k = int(np.argmin(np.abs(at - t)))
        c, p, voiced = marks[k]
        w = np.hanning(2 * p + 1)
        a, b = c - p, c + p + 1
        g = np.zeros(2 * p + 1)
        s0, s1 = max(0, a), min(len(y), b)
        g[s0 - a: s1 - a] = y[s0:s1]
        o = t - p
        lo, hi = max(0, o), min(len(out_y), o + 2 * p + 1)
        out_y[lo:hi] += (g * w)[lo - o: hi - o]
        norm[lo:hi] += w[lo - o: hi - o]
        t += max(1, int(round(p / ratio))) if voiced else still
    out_y = out_y[:len(y)] / np.maximum(norm[:len(y)], 1e-3)
    return out_y.astype(np.float32)


scan = json.load(open(os.path.join(TMP, 'pitchscan.json')))
LUNA = scan['luna_hz']

index = {}
for p in glob.glob(os.path.join(TMP, 'vox7/**/*.wav'), recursive=True) + glob.glob(os.path.join(TMP, 'vox8/**/*.wav'), recursive=True):
    index.setdefault(md5(p), p)
shifts = {}
for f in glob.glob(os.path.join(TMP, 'vox8/r*/round*.json')):
    for card in json.load(open(f)):
        for t in card['takes']:
            m = re.match(r'raised (\d+) semitones first', t.get('small', ''))
            if m and t.get('path'):
                shifts[os.path.abspath(t['path'])] = int(m.group(1))


def find_his(name, near):
    """The converter's input for a take, looked for near its output first."""
    for d in [os.path.dirname(near), os.path.dirname(os.path.dirname(near)), os.path.join(TMP, 'vox8/r7conv'),
              os.path.join(TMP, 'vox8'), os.path.join(TMP, 'vox7'), os.path.join(TMP, 'vox8/again')]:
        p = os.path.join(d, name)
        if os.path.exists(p):
            return p
    raise FileNotFoundError(name)


def ref_for(path):
    for d in [os.path.dirname(path), os.path.dirname(os.path.dirname(path)), os.path.join(TMP, 'vox8')]:
        p = os.path.join(d, 'luna-ref.wav')
        if os.path.exists(p):
            return p
    raise FileNotFoundError('luna-ref.wav')


import torch  # noqa: E402
from chatterbox.vc import ChatterboxVC  # noqa: E402
device = 'mps' if torch.backends.mps.is_available() else 'cpu'
try:
    vc = ChatterboxVC.from_pretrained(device)
except Exception:
    device = 'cpu'
    vc = ChatterboxVC.from_pretrained(device)
print('converter on', device, flush=True)


def convert(x, ref):
    pad = np.zeros(int(RATE * PAD_S), np.float32)
    tmp = os.path.join(out, '_in.wav')
    sf.write(tmp, np.concatenate([pad, x, pad]).astype(np.float32), RATE)
    w = vc.generate(tmp, target_voice_path=ref)
    os.remove(tmp)
    y = w.squeeze(0).cpu().numpy()
    if vc.sr != RATE:
        y = librosa.resample(y, orig_sr=vc.sr, target_sr=RATE)
    s, room = int(RATE * PAD_S), int(RATE * 0.03)
    return level(y[max(0, s - room): s + len(x) + room])


def shifted(x, n):
    return x if abs(n) < 0.05 else librosa.effects.pitch_shift(x, sr=RATE, n_steps=float(n))


def plan(source):
    """(how, make(n)): make rebuilds the clip from its source with n more semitones."""
    b = re.sub(r'^sound__', '', os.path.basename(source))  # rounds named them "DR__…" or "sound__M__…"
    if b.endswith('__cut--luna.wav'):
        k = b.split('__')[0]
        his = load(Path(find_his(f"sound__{k}__word--his.wav", source)))
        ref = ref_for(source)
        return 'cut', lambda n: first_piece(convert(shifted(his, n), ref))
    m = re.match(r'(.+)__(take\d)__up--luna\.wav$', b)
    if m:
        old = shifts[os.path.abspath(source)]
        his = load(Path(find_his(f'sound__{m.group(1)}__{m.group(2)}--his.wav', source)))
        ref = ref_for(source)
        return f'up {old}', lambda n: convert(shifted(his, old + n), ref)
    m = re.match(r'(.+)__(take\d)__raised--his\.wav$', b)
    if m:
        his = load(Path(find_his(f'sound__{m.group(1)}__{m.group(2)}--his.wav', source)))
        return 'his, raised', lambda n: level(shifted(his, 7 + n))
    if b.endswith('--luna.wav'):
        his = load(Path(source.replace('--luna.wav', '--his.wav')))
        ref = ref_for(source)
        return 'plain', lambda n: convert(shifted(his, n), ref)
    return 'B only', None


def off(y):
    hz, share = pitch(y)
    return (None, share) if hz is None else (semis(hz, LUNA), share)


def land(y, e):
    """PSOLA y by -e, then once more from y by what that missed."""
    z = psola(y, -e)
    e2, _ = off(z)
    if e2 is not None and abs(e2) > 0.7:
        z = psola(y, -e - e2)
    return level(z)


def version_a(make, need, share0):
    """Raise the take toward Luna's pitch as far as the converter follows
    (0, half, all of what's needed, at most 6), keep the closest that's still
    voiced, then PSOLA the rest."""
    best = None
    for n in sorted({0.0, round(need / 2, 2), float(np.clip(need, -6, 6))}, key=abs):
        y = make(n)
        e, share = off(y)
        if e is None or share < 0.6 * share0:
            continue
        if best is None or abs(e) < abs(best[1]):
            best = (y, e, n)
    if best is None:
        return None
    y, e, n = best
    return land(y, e), n


# --cut KEYS: a voiced sound the converter whispered (Z, voiced TH) cut from
# the converted word sounded out instead, as M, PL and DR were, then set at
# Luna's pitch: <outdir>/C/<key>.wav
if '--cut' in sys.argv:
    os.makedirs(os.path.join(out, 'C'), exist_ok=True)
    for key in sorted(only):
        k = key.replace('sound__', '')
        his = load(Path(find_his(f'sound__{k}__word--his.wav', os.path.join(TMP, 'vox8', 'x'))))
        y = first_piece(convert(his, ref_for(os.path.join(TMP, 'vox8', 'x'))))
        e, share = off(y)
        if e is not None:
            y = land(y, e)
        e2, share2 = off(y)
        sf.write(os.path.join(out, 'C', key + '.wav'), y, RATE)
        print(f"{key:16s} cut from the word: {len(y) / RATE:.2f} s, voiced {share2:.0%}, pitch {'—' if e2 is None else f'{e2:+.1f}'} st", flush=True)
    sys.exit(0)

# a re-run with KEYS adds to the rows already written
prev = os.path.join(out, 'repitch.json')
rows = [r for r in json.load(open(prev))['rows'] if not only or r['key'] not in only] if os.path.exists(prev) else []
done = {}
for r in scan['rows']:
    key = r['file']
    if only and key not in only:
        continue
    if r['hz'] is None or r['voiced'] < 0.4 or abs(r['semitones']) <= LIMIT:
        continue
    path = os.path.join(REC, key + '.wav')
    source = index.get(md5(path), path)
    if source not in done:
        how, make = plan(source)
        today = load(Path(path))
        b = land(today, r['semitones'])
        a = version_a(make, -r['semitones'], r['voiced']) if make else None
        done[source] = (how, a, b)
    how, a, b = done[source]
    row = {'key': key, 'how': how, 'source': os.path.relpath(source, ROOT), 'before': round(r['semitones'], 2)}
    sf.write(os.path.join(out, 'B', key + '.wav'), b, RATE)
    row['B'] = [None if v is None else round(v, 2) for v in off(b)]
    if a is not None:
        sf.write(os.path.join(out, 'A', key + '.wav'), a[0], RATE)
        row['A'] = [None if v is None else round(v, 2) for v in off(a[0])]
        row['A_raised'] = a[1]
    rows.append(row)
    fa = f"A {row['A'][0]:+5.1f} (raised {row['A_raised']:+.1f})" if 'A' in row and row['A'][0] is not None else 'A  —'
    fb = f"B {row['B'][0]:+5.1f}" if row['B'][0] is not None else 'B unvoiced'
    print(f"{key:16s} {how:12s} {r['semitones']:+5.1f} → {fa}   {fb}", flush=True)

json.dump({'luna_hz': LUNA, 'rows': rows}, open(os.path.join(out, 'repitch.json'), 'w'), indent=1)
print('done', len(rows))
