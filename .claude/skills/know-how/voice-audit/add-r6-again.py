# Adds the re-recorded sounds (E, I, V, Z) and the letter names (VOX-9) to
# round 6's cards, after convert-takes.py has converted them into <againdir>.
# Run from the repo root in the luna-vc env:
#   ~/anaconda3/envs/luna-vc/bin/python .claude/skills/know-how/voice-audit/add-r6-again.py <againdir> <round6.json>
# Prints E/I's formants and V/Z's voicing, his take beside Luna's, so a take
# that's still too alike or whispered shows before Alex listens. The name R
# ("ar") also gets its takes raised before converting, as the R sounds did.
import json, os, re, sys
import numpy as np, soundfile as sf, librosa

again, cards_path = sys.argv[1], sys.argv[2]
RATE = 24000
here = os.path.dirname(os.path.abspath(__file__))
src = open(os.path.join(here, 'takeformants.py')).read()
exec(src[src.index('def formants'):src.index('for f in files')])

cards = [c for c in json.load(open(cards_path)) if c['group'] in ('r', 's', 'l')]
for c in cards:
    if c['group'] == 'l': c['group'] = 's'
P = lambda name: os.path.join(again, name)

for sid, key, word in [('e', 'E', 'bed'), ('i', 'I', 'it'), ('v', 'V', 'van'), ('z', 'Z', 'zoo')]:
    takes = [{'id': 'today', 'label': 'In the app today', 'small': 'what Luna says now'}]
    for n in (1, 2, 3):
        takes.append({'id': f'luna{n}', 'label': f'Your new take {n}, as Luna', 'small': '', 'path': P(f'sound__{key}__take{n}--luna.wav')})
    for n in (1, 2, 3):
        takes.append({'id': f'his{n}', 'label': f'Your new take {n}, as you said it', 'small': 'your own voice', 'path': P(f'sound__{key}__take{n}--his.wav')})
    takes.append({'id': 'lunaword', 'label': f'Sounding out “{word}”, as Luna', 'small': 'to hear it in a word', 'pick': False,
                  'path': P(f'sound__{key}__word--luna.wav')})
    cards.append({'sid': sid, 'key': key, 'word': word, 'group': 'again', 'takes': takes})
    for n in (1, 2, 3):
        row = []
        for who in ('his', 'luna'):
            y, _ = librosa.load(P(f'sound__{key}__take{n}--{who}.wav'), sr=None)
            share, med, _ = formants(y, _)
            row.append(f'{who} voiced {share:.0%}' + (f' F1 {med[0]:.0f} F2 {med[1]:.0f}' if med is not None else ''))
        print(f'{key} take{n}: ' + ' | '.join(row), flush=True)

record = open(os.path.join(here, '../../../../src/dev/RecordPage/sounds.ts')).read()
names = re.findall(r"n\('([A-Z]+)', '([a-z ]+)'", record)
group = lambda k: 'n4' if len(k) > 1 else 'n1' if k <= 'I' else 'n2' if k <= 'R' else 'n3'

vc = None
for key, said in names:
    takes = [{'id': 'today', 'label': 'In the app today', 'small': 'what Luna says now'}]
    for n in (1, 2, 3):
        takes.append({'id': f'luna{n}', 'label': f'Your take {n}, as Luna', 'small': '', 'path': P(f'name__{key}__take{n}--luna.wav')})
    if key == 'R':
        import torch  # noqa: E402
        from chatterbox.vc import ChatterboxVC  # noqa: E402
        vc = vc or ChatterboxVC.from_pretrained('mps' if torch.backends.mps.is_available() else 'cpu')
        for n in (1, 2, 3):
            his, _ = librosa.load(P(f'name__R__take{n}--his.wav'), sr=RATE)
            best = None
            for shift in (4, 7):
                pad = np.zeros(int(RATE * 0.4), np.float32)
                sf.write(P('_in.wav'), np.concatenate([pad, librosa.effects.pitch_shift(his, sr=RATE, n_steps=shift), pad]), RATE)
                y = vc.generate(P('_in.wav'), target_voice_path=P('luna-ref.wav')).squeeze(0).cpu().numpy()
                y = librosa.resample(y, orig_sr=vc.sr, target_sr=RATE) if vc.sr != RATE else y
                s = int(RATE * 0.4); y = y[s - 720: s + len(his) + 720]
                y = y * (10 ** (-20 / 20) / np.sqrt(np.mean(y ** 2) + 1e-12)); y = y * min(1, 0.9 / np.abs(y).max())
                share, med, low = formants(y, RATE)
                f3 = low if med is not None else 9999
                if best is None or f3 < best[0]: best = (f3, shift, y)
            os.remove(P('_in.wav'))
            sf.write(P(f'name__R__take{n}__up--luna.wav'), best[2], RATE)
            takes.append({'id': f'up{n}', 'label': f'Your take {n}, raised, then as Luna', 'small': f'raised {best[1]} semitones first',
                          'path': P(f'name__R__take{n}__up--luna.wav')})
            print(f'name R take{n}: +{best[1]} → low F3 {best[0]:.0f}', flush=True)
        for n in (1, 2, 3):
            takes.append({'id': f'his{n}', 'label': f'Your take {n}, as you said it', 'small': 'your own voice', 'path': P(f'name__R__take{n}--his.wav')})
    cards.append({'sid': f'name-{key}', 'key': key, 'kind': 'name', 'word': said, 'title': key, 'sub': f'its name, “{said}”',
                  'group': group(key), 'takes': takes})

json.dump(cards, open(cards_path, 'w'), indent=1, ensure_ascii=False)
print(len(cards), 'cards')
