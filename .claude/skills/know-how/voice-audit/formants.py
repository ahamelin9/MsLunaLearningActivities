# Vowel check by formants (Praat, Burg), against Hillenbrand et al. 1995 women's means.
import sys, glob, os, numpy as np, parselmouth
REF = {  # F1, F2, F3 (women)
 'i': (437, 2761, 3372), 'ɪ': (483, 2365, 3053), 'eɪ': (536, 2530, 3047), 'ɛ': (731, 2058, 2979),
 'æ': (669, 2349, 2972), 'ɑ': (936, 1551, 2815), 'ɔ': (781, 1136, 2824), 'oʊ': (555, 1035, 2828),
 'ʊ': (519, 1225, 2827), 'u': (459, 1105, 2735), 'ʌ': (753, 1426, 2933), 'ɝ': (523, 1588, 1929)}
WANT = {'A': 'æ', 'E': 'ɛ', 'I': 'ɪ', 'O': 'ɑ', 'U': 'ʌ', 'A_alt': 'eɪ', 'E_alt': 'i', 'O_alt': 'oʊ', 'OO': 'u', 'ER': 'ɝ', 'R': 'ɝ', 'I_alt': 'aɪ', 'AR': 'ɑ', 'OR': 'ɔ'}
def track(path):
    snd = parselmouth.Sound(path)
    f = snd.to_formant_burg(time_step=0.01, max_number_of_formants=5, maximum_formant=5500)
    pitch = snd.to_pitch()
    ts = [t for t in np.arange(0.02, snd.duration - 0.02, 0.01) if pitch.get_value_at_time(t) == pitch.get_value_at_time(t)]
    rows = [(t, f.get_value_at_time(1, t), f.get_value_at_time(2, t), f.get_value_at_time(3, t)) for t in ts]
    return [r for r in rows if not any(np.isnan(r[1:]))]
def nearest(f1, f2):
    d = {k: ((f1 - v[0]) / 100) ** 2 + ((f2 - v[1]) / 300) ** 2 for k, v in REF.items()}
    return sorted(d, key=d.get)[:2]
src = sys.argv[1]
for name, want in WANT.items():
    p = f'{src}/{name}.wav'
    if not os.path.exists(p): continue
    rows = track(p)
    if not rows: print(name, 'no voiced frames'); continue
    n = len(rows); mid = rows[n // 4: max(n // 4 + 1, 3 * n // 4)]
    f1, f2, f3 = (np.median([r[i] for r in mid]) for i in (1, 2, 3))
    start = rows[: max(1, n // 5)]; end = rows[-max(1, n // 5):]
    s12 = (np.median([r[1] for r in start]), np.median([r[2] for r in start]))
    e12 = (np.median([r[1] for r in end]), np.median([r[2] for r in end]))
    ref = REF.get(want)
    print(f"{name:6} want {want:3} mid F1 {f1:5.0f} F2 {f2:5.0f} F3 {f3:5.0f}  nearest {'/'.join(nearest(f1, f2)):6}"
          f"  start {s12[0]:4.0f}/{s12[1]:4.0f} → end {e12[0]:4.0f}/{e12[1]:4.0f}" + (f"   ref {ref[0]}/{ref[1]}/{ref[2]}" if ref else ''))
