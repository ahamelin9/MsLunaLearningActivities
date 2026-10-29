# Luna's own vowels, measured inside her words: the loudest voiced 60 ms of each word.
import sys, numpy as np, parselmouth
def core(path):
    snd = parselmouth.Sound(path)
    inten = snd.to_intensity(time_step=0.005)
    pitch = snd.to_pitch(time_step=0.005)
    f = snd.to_formant_burg(time_step=0.005, max_number_of_formants=5, maximum_formant=5500)
    ts = [t for t in inten.xs() if pitch.get_value_at_time(t) == pitch.get_value_at_time(t)]
    if not ts: return None
    peak = max(ts, key=lambda t: inten.get_value(t))
    win = [t for t in ts if abs(t - peak) <= 0.03]
    vals = [[f.get_value_at_time(k, t) for t in win] for k in (1, 2, 3)]
    return tuple(np.nanmedian(v) for v in vals)
groups = {'æ': 'cat hat bat map', 'ɛ': 'bed pen ten red', 'ɪ': 'pig it big six', 'ɑ': 'hot fox box top', 'ʌ': 'bug cup sun mud',
          'eɪ': 'cake lake day rain', 'i': 'see tree key green', 'oʊ': 'go boat bone nose', 'u': 'moon soup two noon',
          'ɝ': 'her bird', 'ɑɹ': 'car star far farm', 'ɔɹ': 'short popcorn', 'aɪ': 'kite bike my sky'}
which = sys.argv[1]  # folder prefix, e.g. wavA/word_ or wavB/word:
for v, ws in groups.items():
    rows = [core(f'{which}{w}.wav') for w in ws.split()]
    rows = [r for r in rows if r]
    m = np.median(np.array(rows), 0)
    print(f"{v:3}  F1 {m[0]:5.0f}  F2 {m[1]:5.0f}  F3 {m[2]:5.0f}   ({ws})")
