# Round 6's new candidates (VOX-8): the sounds round 5 found no take for that
# recording again won't fix. Run from the repo root in the luna-vc env:
#   ~/anaconda3/envs/luna-vc/bin/python .claude/skills/know-how/voice-audit/make-r6.py <convdir> <outdir> [KEYS [cards.json]]
# With KEYS (ER,CR,DR: round 7's re-recordings) only those R cards are made,
# with the plain conversions too, into cards.json (default round6.json).
# <convdir> is round 5's convert-takes.py output (.voice-tmp/vox8); <outdir>
# (ignored) gets the WAVs and round6.json, the cards for pack-round.py.
#
# The converter loses R (README, "Things learned"), so for the R sounds and SN:
#   - each take pitched up 4 and 7 semitones before converting, keeping
#     whichever leaves the lower F3 (an R's mark);
#   - the sound cut from the converted word sounded out (its first piece);
#   - his own take, pitched up 7 semitones and not converted, and as he said it.
# SM and PL get the cut from their word, against today's (his round 5 pick).
import json, os, sys
import numpy as np, soundfile as sf, librosa

conv, out = sys.argv[1], sys.argv[2]
only = set(sys.argv[3].split(',')) if len(sys.argv) > 3 else None
cards_name = sys.argv[4] if len(sys.argv) > 4 else 'round6.json'
os.makedirs(out, exist_ok=True)
RATE = 24000
here = os.path.dirname(os.path.abspath(__file__))
src = open(os.path.join(here, 'takeformants.py')).read()
exec(src[src.index('def formants'):src.index('for f in files')])  # formants(y, sr) -> share, medians, low F3

R_SOUNDS = [('r', 'R', 'red'), ('er', 'ER', 'her'), ('br', 'BR', 'brush'), ('cr', 'CR', 'crab'), ('dr', 'DR', 'drum'),
            ('fr', 'FR', 'frog'), ('gr', 'GR', 'grass'), ('pr', 'PR', 'prize'), ('tr', 'TR', 'truck'), ('sn', 'SN', 'snake')]
CUT_ONLY = [('sm', 'SM', 'smile'), ('pl', 'PL', 'plum')]
if only:
    R_SOUNDS = [r for r in R_SOUNDS if r[1] in only]
    CUT_ONLY = []


def low_f3(y):
    share, med, low = formants(y, RATE)
    return low if med is not None else 9999


def first_piece(path, dst):
    """The first stretch of sound in a sounded-out word ("crrr" of "crrr-a-b")."""
    y, _ = librosa.load(path, sr=RATE)
    a, b = librosa.effects.split(y, top_db=30, frame_length=1024, hop_length=128)[0]
    x = y[max(0, a - int(.02 * RATE)): min(len(y), b + int(.03 * RATE))].copy()
    f = int(.015 * RATE)
    x[:f] *= np.linspace(0, 1, f); x[-f:] *= np.linspace(1, 0, f)
    sf.write(dst, x, RATE)
    return dst


def level(x, target_db=-20):
    rms = np.sqrt(np.mean(x ** 2) + 1e-12)
    y = x * (10 ** (target_db / 20) / rms)
    return y * (0.9 / np.abs(y).max()) if np.abs(y).max() > 0.9 else y


import torch, torchaudio  # noqa: E402
from chatterbox.vc import ChatterboxVC  # noqa: E402
vc = ChatterboxVC.from_pretrained('mps' if torch.backends.mps.is_available() else 'cpu')
ref = os.path.join(conv, 'luna-ref.wav')


def convert(x):
    pad = np.zeros(int(RATE * 0.4), np.float32)
    tmp = os.path.join(out, '_in.wav')
    sf.write(tmp, np.concatenate([pad, x, pad]).astype(np.float32), RATE)
    w = vc.generate(tmp, target_voice_path=ref)
    os.remove(tmp)
    y = w.squeeze(0).cpu().numpy()
    if vc.sr != RATE: y = librosa.resample(y, orig_sr=vc.sr, target_sr=RATE)
    s, room = int(RATE * 0.4), int(RATE * 0.03)
    return level(y[max(0, s - room): s + len(x) + room])


cards = []
for sid, f, word in R_SOUNDS:
    takes = [{'id': 'today', 'label': 'In the app today', 'small': 'what Luna says now'}]
    if only:
        takes += [{'id': f'luna{n}', 'label': f'Your new take {n}, as Luna', 'small': '', 'path': os.path.join(conv, f'sound__{f}__take{n}--luna.wav')} for n in (1, 2, 3)]
    his_best = None
    for n in (1, 2, 3):
        his, _ = librosa.load(os.path.join(conv, f'sound__{f}__take{n}--his.wav'), sr=RATE)
        best = None
        for shift in (4, 7):
            y = convert(librosa.effects.pitch_shift(his, sr=RATE, n_steps=shift))
            f3 = low_f3(y)
            if best is None or f3 < best[0]: best = (f3, shift, y)
        p = os.path.join(out, f'{f}__take{n}__up--luna.wav')
        sf.write(p, best[2], RATE)
        takes.append({'id': f'up{n}', 'label': f'Your take {n}, raised, then as Luna', 'small': f'raised {best[1]} semitones first', 'path': p})
        hf3 = low_f3(his)
        if his_best is None or hf3 < his_best[0]: his_best = (hf3, n, his)
        print(f'{f} take{n}: +{best[1]} → low F3 {best[0]:.0f} Hz (his own {hf3:.0f})', flush=True)
    p = first_piece(os.path.join(conv, f'sound__{f}__word--luna.wav'), os.path.join(out, f'{f}__cut--luna.wav'))
    takes.append({'id': 'cut', 'label': f'Cut from “{word}”, as Luna', 'small': 'the start of the word sounded out', 'path': p})
    n, his = his_best[1], his_best[2]
    p = os.path.join(out, f'{f}__take{n}__raised--his.wav')
    sf.write(p, level(librosa.effects.pitch_shift(his, sr=RATE, n_steps=7)), RATE)
    takes.append({'id': 'hisup', 'label': f'Your take {n}, made higher', 'small': 'your voice, not converted', 'path': p})
    takes.append({'id': 'his', 'label': f'Your take {n}, as you said it', 'small': 'your own voice',
                  'path': os.path.join(conv, f'sound__{f}__take{n}--his.wav')})
    takes.append({'id': 'lunaword', 'label': f'Sounding out “{word}”, as Luna', 'small': 'to hear it in a word', 'pick': False,
                  'path': os.path.join(conv, f'sound__{f}__word--luna.wav')})
    cards.append({'sid': sid, 'key': f, 'word': word, 'group': 'r' if sid != 'sn' else 's', 'takes': takes})

for sid, f, word in CUT_ONLY:
    p = first_piece(os.path.join(conv, f'sound__{f}__word--luna.wav'), os.path.join(out, f'{f}__cut--luna.wav'))
    cards.append({'sid': sid, 'key': f, 'word': word, 'group': 's' if sid == 'sm' else 'l', 'takes': [
        {'id': 'today', 'label': 'In the app today', 'small': 'your round 5 pick' if sid == 'pl' else 'SN’s take 2, as Luna (your note)'},
        {'id': 'cut', 'label': f'Cut from “{word}”, as Luna', 'small': 'the start of the word sounded out', 'path': p},
        {'id': 'lunaword', 'label': f'Sounding out “{word}”, as Luna', 'small': 'to hear it in a word', 'pick': False,
         'path': os.path.join(conv, f'sound__{f}__word--luna.wav')}]})

json.dump(cards, open(os.path.join(out, cards_name), 'w'), indent=1, ensure_ascii=False)
print(len(cards), 'cards')
