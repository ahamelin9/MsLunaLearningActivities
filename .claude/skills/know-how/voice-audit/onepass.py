# VOX-10: the sounds converted in ONE pass, so the converter makes one guess
# at Luna for all of them. Converted one at a time, each sound gave it a
# third of a second to go on, and each came out a slightly different voice
# (likeness to Luna 0.55-0.70); in a word, Alex heard "ship"'s three sounds
# as three voices. Here every picked take's own input is joined into one
# long recording with gaps, breaths included, converted once against the
# same luna-ref.wav, cut back apart at the same places, and set at Luna's
# pitch by PSOLA (repitch.py's). A breath that comes out of the converter
# voiced or dull (see `breath_ok`) keeps his own take instead.
#   ~/anaconda3/envs/luna-vc/bin/python .claude/skills/know-how/voice-audit/onepass.py <outdir> KEYS
# KEYS are recording keys (SH,I,P,...); writes <outdir>/sound__<KEY>.wav.
import json, os, re, sys
import numpy as np, soundfile as sf

outdir, keys = sys.argv[1], sys.argv[2].split(',')
os.makedirs(outdir, exist_ok=True)
here = os.path.dirname(os.path.abspath(__file__))
argv = sys.argv
sys.argv = ['repitch.py', os.path.join(outdir, '_repitch'), '']
__file__ = os.path.join(here, 'repitch.py')
src = open(__file__).read()
exec(src[:src.index('# --cut KEYS')])  # helpers: load, pitch, off, land, first_piece, convert's model, index, shifts…
sys.argv = argv
GAP_S = 0.6


def source_input(key):
    """(input samples, how): what the converter was given for this sound,
    with its old raise, or (his take, 'breath') for one never converted."""
    path = os.path.join(REC, f'sound__{key}.wav')
    source = index.get(md5(path))
    if source is None:
        raise SystemExit(f'{key}: no source found (cut by hand?)')
    b = re.sub(r'^sound__', '', os.path.basename(source))
    if b.endswith('__cut--luna.wav'):
        return load(Path(find_his(f"sound__{b.split('__')[0]}__word--his.wav", source))), 'cut'
    m = re.match(r'(.+)__(take\d)__up--luna\.wav$', b)
    if m:
        his = load(Path(find_his(f'sound__{m.group(1)}__{m.group(2)}--his.wav', source)))
        return shifted(his, shifts[os.path.abspath(source)]), 'up'
    m = re.match(r'(.+)__(take\d)__raised--his\.wav$', b)
    if m:
        his = load(Path(find_his(f'sound__{m.group(1)}__{m.group(2)}--his.wav', source)))
        return shifted(his, 4), 'raised'  # converted now, raised 4 like the R takes
    if b.endswith('--his.wav'):
        return load(Path(source)), 'breath'
    return load(Path(source.replace('--luna.wav', '--his.wav'))), 'plain'


def breath_ok(y, his):
    """A converted breath should stay a breath: mostly unvoiced, and about
    as bright as his (the converter can turn a hiss into a dull hum)."""
    import librosa
    _, share = pitch(y)
    c = lambda x: float(np.median(librosa.feature.spectral_centroid(y=x, sr=RATE)[0]))
    return share < 0.3 and c(y) > 0.6 * c(his), share, c(y), c(his)


parts, spans, kinds = [np.zeros(int(RATE * PAD_S), np.float32)], [], {}
at = len(parts[0])
for k in keys:
    x, how = source_input(k)
    x = level(x)
    spans.append((k, at, at + len(x)))
    kinds[k] = (how, x)
    parts += [x.astype(np.float32), np.zeros(int(RATE * GAP_S), np.float32)]
    at += len(x) + int(RATE * GAP_S)
long_in = np.concatenate(parts + [np.zeros(int(RATE * PAD_S), np.float32)])
tmp = os.path.join(outdir, '_long.wav')
sf.write(tmp, long_in, RATE)
w = vc.generate(tmp, target_voice_path=ref_for(os.path.join(TMP, 'vox8', 'x')))
y = w.squeeze(0).cpu().numpy()
if vc.sr != RATE:
    y = librosa.resample(y, orig_sr=vc.sr, target_sr=RATE)
sf.write(os.path.join(outdir, '_long--luna.wav'), y, RATE)
print(f'converted {len(long_in) / RATE:.1f} s in one pass', flush=True)

room = int(RATE * 0.03)
report = {}
for k, a, b in spans:
    how, his = kinds[k]
    piece = level(y[max(0, a - room): b + room])
    if how == 'cut':
        piece = first_piece(piece)
    note = ''
    if how == 'breath':
        ok, share, cy, ch = breath_ok(piece, his)
        note = f'voiced {share:.0%}, bright {cy:.0f}/{ch:.0f} Hz'
        if not ok:
            piece, how = level(his), 'breath (his, converter dulled it)'
    e, share = off(piece)
    if e is not None and share > 0.4:
        piece = land(piece, e)
    e2, _ = off(piece)
    sf.write(os.path.join(outdir, f'sound__{k}.wav'), piece.astype(np.float32), RATE)
    report[k] = {'how': how, 'pitch': None if e2 is None else round(e2, 2), 'note': note}
    print(f"{k:6s} {how:34s} pitch {'—' if e2 is None else f'{e2:+.1f}'} st  {note}", flush=True)
json.dump(report, open(os.path.join(outdir, 'onepass.json'), 'w'), indent=1)
