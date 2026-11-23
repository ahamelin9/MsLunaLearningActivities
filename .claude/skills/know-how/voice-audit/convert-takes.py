# VOX-7: Alex's takes from the recording page (`/?record`) turned into Luna's
# voice with Chatterbox's voice converter, which keeps his timing and mouth
# shape and gives it her voice. Needs the luna-vc env (Python 3.11, see
# README.md); the model is cached in ~/.cache/huggingface.
#
#   ~/anaconda3/envs/luna-vc/bin/python .claude/skills/know-how/voice-audit/convert-takes.py <outdir> [B,D,...]
#   (a letter's name: name__B; the takes are scripts/voice/takes/name__B__take1.wav)
#
# From the repo root. Reads scripts/voice/takes/sound__<key>__<slot>.wav
# (git ignores it: his raw voice), and writes to <outdir>, which must be
# outside the repo or ignored by git:
#   <name>--his.wav   the take, trimmed and levelled (for Claude's checks only)
#   <name>--luna.wav  the same, in Luna's voice: what goes on the Sound Check page
# plus luna-ref.wav, the sample of her voice it converts to (about 25 s of her
# lines, normal speed, from public/voice/af_heart). A converter wants a second
# or so of input, so a short take is padded with quiet before converting and
# trimmed again after.

import json, os, subprocess, sys, time
import numpy as np
import soundfile as sf

ROOT = os.getcwd()
TAKES = os.path.join(ROOT, 'scripts/voice/takes')
VOICE = os.path.join(ROOT, 'public/voice/af_heart')
FFMPEG = os.path.join(ROOT, 'node_modules/ffmpeg-static/ffmpeg')
RATE = 24000
PAD_S = 0.4
REF_S = 25.0

out = sys.argv[1] if len(sys.argv) > 1 else None
only = set(sys.argv[2].split(',')) if len(sys.argv) > 2 else None
if not out:
    sys.exit('usage: convert-takes.py <outdir> [B,D,...]')
os.makedirs(out, exist_ok=True)
inside = os.path.abspath(out).startswith(ROOT + os.sep)
if inside and subprocess.run(['git', 'check-ignore', '-q', out]).returncode != 0:
    sys.exit(f'{out} is in the repo and git would keep it: his voice must stay out of git')


def load(path):
    """Any audio file as mono float32 at RATE, through the repo's ffmpeg."""
    raw = subprocess.run([FFMPEG, '-v', 'error', '-i', path, '-f', 'f32le', '-ac', '1', '-ar', str(RATE), '-'],
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32).copy()


def trim(x, keep_s=0.06, skip_start_s=0.12, skip_end_s=0.2, least_run_s=0.04):
    """Cut the quiet before and after the sound.

    The recording page's takes have a key or button click at each end, so the
    first 0.12 s and the last 0.2 s don't count. The threshold sits above each
    take's own room noise (its quietest tenth), by up to 12 dB for a loud take
    and as little as 4 dB for a soft one, since a TH is barely above the room;
    a blip shorter than 40 ms doesn't count either.
    """
    frame = int(RATE * 0.01)
    n = len(x) // frame
    if n < 10:
        return x
    db = 20 * np.log10(np.sqrt(np.mean(x[: n * frame].reshape(n, frame) ** 2, axis=1)) + 1e-9)
    db = np.convolve(db, np.ones(3) / 3, mode='same')
    a, b = int(skip_start_s * 100), max(int(skip_start_s * 100) + 1, n - int(skip_end_s * 100))
    inner = db[a:b]
    noise, peak = np.percentile(inner, 10), inner.max()
    loud = inner > noise + max(4, min(12, 0.3 * (peak - noise)))
    least = int(least_run_s * 100)
    runs, start = [], None
    for i, on in enumerate(np.append(loud, False)):
        if on and start is None:
            start = i
        elif not on and start is not None:
            if i - start >= least:
                runs.append((start, i))
            start = None
    if not runs:
        return x[a * frame: b * frame]
    keep = int(RATE * keep_s)
    return x[max(0, (a + runs[0][0]) * frame - keep): min(len(x), (a + runs[-1][1]) * frame + keep)]


def level(x, target_db=-20):
    """The loud part's RMS to the target, as the render levels a recording."""
    rms = np.sqrt(np.mean(x ** 2) + 1e-12)
    y = x * (10 ** (target_db / 20) / rms)
    peak = np.abs(y).max()
    return y * (0.9 / peak) if peak > 0.9 else y


def luna_ref(path):
    """About 25 s of Luna's lines at normal speed, joined with short gaps."""
    clips = json.load(open(os.path.join(VOICE, 'manifest.json')))['clips']
    lines = sorted(k for k in clips if k.startswith('text|') and k.endswith('|normal') and len(k) > 40)
    joined, total = [], 0.0
    for key in lines[::max(1, len(lines) // 60)]:
        x = load(os.path.join(VOICE, clips[key]))
        joined += [x, np.zeros(int(RATE * 0.25), np.float32)]
        total += len(x) / RATE
        if total >= REF_S:
            break
    sf.write(path, np.concatenate(joined), RATE)
    return total


ref = os.path.join(out, 'luna-ref.wav')
if not os.path.exists(ref):
    print(f'Luna sample: {luna_ref(ref):.1f} s', flush=True)

names = sorted(n for n in os.listdir(TAKES) if n.endswith('.wav')) if os.path.isdir(TAKES) else []
if only:
    # B is the sound's takes; name__B the letter name's (VOX-9)
    names = [n for n in names if (n.startswith('sound__') and n.split('__')[1] in only) or '__'.join(n.split('__')[:2]) in only]
if not names:
    sys.exit(f'no takes in {TAKES}')

import torch, torchaudio  # noqa: E402  (slow to load: only once there is work)
from chatterbox.vc import ChatterboxVC  # noqa: E402

device = 'mps' if torch.backends.mps.is_available() else 'cpu'
try:
    vc = ChatterboxVC.from_pretrained(device)
except Exception as e:  # the Mac's GPU refuses some models; the CPU never does
    print('mps failed, cpu:', e)
    device = 'cpu'
    vc = ChatterboxVC.from_pretrained(device)
print('converter on', device, flush=True)

for name in names:
    stem = name[:-4]
    his = level(trim(load(os.path.join(TAKES, name))))
    his_path = os.path.join(out, f'{stem}--his.wav')
    sf.write(his_path, his, RATE)
    padded = os.path.join(out, f'{stem}--padded.wav')
    pad = np.zeros(int(RATE * PAD_S), np.float32)
    sf.write(padded, np.concatenate([pad, his, pad]), RATE)
    t = time.time()
    wav = vc.generate(padded, target_voice_path=ref)
    os.remove(padded)
    luna_path = os.path.join(out, f'{stem}--luna.wav')
    torchaudio.save(luna_path, wav, vc.sr)
    # the converter keeps the timing but hisses faintly in the padding, so cut
    # its output to where the take sits, with a little room each side
    room = int(RATE * 0.03)
    start = int(RATE * PAD_S)
    luna = level(load(luna_path)[max(0, start - room): start + len(his) + room])
    sf.write(luna_path, luna, RATE)
    print(f'{stem}: his {len(his) / RATE:.2f} s → Luna {len(luna) / RATE:.2f} s ({time.time() - t:.1f} s)', flush=True)
print('done')
