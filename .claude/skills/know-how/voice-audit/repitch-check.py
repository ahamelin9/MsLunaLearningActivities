# VOX-10: does each re-pitched version keep the sound and the voice?
# Run from the repo root in the luna-vc env, after repitch.py:
#   ~/anaconda3/envs/luna-vc/bin/python .claude/skills/know-how/voice-audit/repitch-check.py <repitch outdir>
#
# For today's clip (scripts/voice/recorded/, or .voice-tmp/vox10/before if
# the picks are in already) and versions A and B, per key:
#   pitch    semitones from Luna's median (pitchscan.py's measure)
#   voiced   share of frames with a pitch (a whisper falls toward 0)
#   luna     cosine likeness to Luna's voice (Chatterbox's voice encoder,
#            against luna-ref.wav: 25 s of her lines)
#   F1, F2   the vowel's shape (takeformants.py); a shift that kept the
#            formants keeps these near today's
#   dB       loudness (RMS)
# and the medians at the end. Fails (exit 1) if a version moves F2 more than
# 12% or loses more than 0.05 of Luna likeness against today's, on the median.
import json, os, sys
from pathlib import Path
import numpy as np, librosa

outdir = sys.argv[1]
ROOT = os.getcwd()
RATE = SR = 24000
root = Path(ROOT)
here = os.path.dirname(os.path.abspath(__file__))
src = open(os.path.join(here, 'pitchscan.py')).read()
exec(src[src.index('def load'):src.index('man = json.load')])  # load, pitch
src = open(os.path.join(here, 'takeformants.py')).read()
exec(src[src.index('def formants'):src.index('for f in files')])  # formants(y, sr) -> share, medians, low F3

from chatterbox.models.voice_encoder import VoiceEncoder  # noqa: E402
from safetensors.torch import load_file  # noqa: E402
import glob  # noqa: E402
ve = VoiceEncoder()
ve.load_state_dict(load_file(glob.glob(os.path.expanduser('~/.cache/huggingface/hub/models--ResembleAI--chatterbox/snapshots/*/ve.safetensors'))[0]))
ve.eval()
ref = librosa.load(os.path.join(ROOT, '.voice-tmp/vox8/luna-ref.wav'), sr=16000)[0]
luna = ve.embeds_from_wavs([ref], sample_rate=16000, as_spk=True)


def likeness(y):
    y16 = librosa.resample(y, orig_sr=RATE, target_sr=16000)
    if len(y16) < 16000 * 0.4:  # the encoder wants a little length: repeat a short sound
        y16 = np.tile(y16, int(np.ceil(16000 * 0.4 / max(1, len(y16)))))
    e = ve.embeds_from_wavs([y16], sample_rate=16000, as_spk=True, trim_top_db=None)
    return float(np.dot(e, luna) / (np.linalg.norm(e) * np.linalg.norm(luna)))


LUNA_HZ = json.load(open(os.path.join(ROOT, '.voice-tmp/pitchscan.json')))['luna_hz']
keys = sorted(f[:-4] for f in os.listdir(os.path.join(outdir, 'B')) if f.endswith('.wav'))
before = os.path.join(ROOT, '.voice-tmp/vox10/before')


def measure(p):
    y = load(Path(p))
    hz, share = pitch(y)
    _, med, _ = formants(y, RATE)
    f1, f2 = (med[0], med[1]) if med is not None else (None, None)
    return {'st': None if hz is None else 12 * np.log2(hz / LUNA_HZ), 'voiced': share, 'luna': likeness(y),
            'f1': f1, 'f2': f2, 'db': 20 * np.log10(np.sqrt(np.mean(y ** 2)) + 1e-9)}


def fmt(m):
    st = f"{m['st']:+5.1f}" if m['st'] is not None else '   — '
    f1 = f"{m['f1']:4.0f}" if m['f1'] else '  — '
    f2 = f"{m['f2']:4.0f}" if m['f2'] else '  — '
    return f"{st} {m['voiced']:4.0%} {m['luna']:.2f} {f1} {f2} {m['db']:5.1f}"


print(f"{'key':16s} {'today: st  voic luna F1  F2   dB':38s} {'A':38s} B")
res = {'today': [], 'A': [], 'B': []}
for key in keys:
    t = os.path.join(before, key + '.wav')
    if not os.path.exists(t):
        t = os.path.join(ROOT, 'scripts/voice/recorded', key + '.wav')
    ms = {'today': measure(t)}
    for v in ('A', 'B'):
        p = os.path.join(outdir, v, key + '.wav')
        if os.path.exists(p):
            ms[v] = measure(p)
    for v, m in ms.items():
        res[v].append((ms['today'], m))
    print(f"{key:16s} {fmt(ms['today']):38s} {fmt(ms['A']) if 'A' in ms else '—':38s} {fmt(ms['B'])}", flush=True)

bad = False
print()
for v in ('today', 'A', 'B'):
    pairs = res[v]
    st = [abs(m['st']) for _, m in pairs if m['st'] is not None]
    lk = [m['luna'] - t['luna'] for t, m in pairs]
    f2 = [abs(m['f2'] / t['f2'] - 1) for t, m in pairs if m['f2'] and t['f2']]
    db = [m['db'] - t['db'] for t, m in pairs]
    within = sum(s <= 1 for s in st)
    print(f"{v:6s} within 1 st: {within}/{len(st)}  median |st| {np.median(st):.2f}  likeness vs today {np.median(lk):+.3f}"
          f"  F2 moved {np.median(f2):.0%}  loudness vs today {np.median(db):+.1f} dB")
    if v != 'today' and (np.median(f2) > 0.12 or np.median(lk) < -0.05):
        bad = True
sys.exit(1 if bad else 0)
