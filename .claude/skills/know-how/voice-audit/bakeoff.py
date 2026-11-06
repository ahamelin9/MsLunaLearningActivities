# Bake-off: Chatterbox (open, MIT) cloned to Luna's voice from a Kokoro sample.
#   python bakeoff.py <ref.wav> <outdir>
import sys, os, time, json, torch, torchaudio
from chatterbox.tts import ChatterboxTTS

ref, out = sys.argv[1], sys.argv[2]
os.makedirs(out, exist_ok=True)
device = 'mps' if torch.backends.mps.is_available() else 'cpu'
t0 = time.time()
try:
    model = ChatterboxTTS.from_pretrained(device=device)
except Exception as e:
    print('mps failed, using cpu:', e); device = 'cpu'; model = ChatterboxTTS.from_pretrained(device=device)
print('loaded on', device, f'{time.time() - t0:.0f}s', flush=True)

JOBS = {
    # held sounds, written the way a teacher would on a board
    'snd-m': 'Mmmmmmm.', 'snd-n': 'Nnnnnnn.', 'snd-l': 'Llllllll.', 'snd-r': 'Rrrrrrr.', 'snd-s': 'Sssssss.', 'snd-sh': 'Shhhhhh.',
    'snd-f': 'Fffffff.', 'snd-v': 'Vvvvvvv.', 'snd-z': 'Zzzzzzz.', 'snd-th': 'Thhhhhh.', 'snd-h': 'Hhhhh.', 'snd-ng': 'Nnnggg.',
    'snd-ay': 'Aaaaay.', 'snd-ee': 'Eeeeee.', 'snd-eye': 'Aaaaai.', 'snd-oh': 'Ooooh.', 'snd-oo': 'Oooooo.', 'snd-ar': 'Arrrrr.', 'snd-or': 'Orrrrr.', 'snd-er': 'Errrrr.',
    'snd-a': 'Aaa, as in apple.', 'snd-b': 'B.', 'snd-k': 'K.',
    # letter names that were wrong both ways
    'name-B': 'B.', 'name-E': 'E.', 'name-N': 'N.', 'name-P': 'P.', 'name-CH': 'C, H.',
    # words that were wrong both ways, or edgy
    **{f'word-{w}': f'{w.capitalize()}.' for w in ['cook', 'eat', 'her', 'hop', 'hopped', 'jump', 'leaf', 'peach', 'popped', 'sheep', 'cup', 'pup', 'green', 'moon', 'bed', 'key', 'stops']},
    # lines
    'line-l1': 'Ms. Luna hopped inside her shiny silver rocket ship.',
    'line-l2': 'The mother bird sang a happy song to say thank you.',
    'line-l4': 'When two vowels go walking, the first one does the talking!',
    'line-l5': 'I see a...',
}
log = {}
for take in (1, 2):
    for key, text in JOBS.items():
        t = time.time()
        torch.manual_seed(take * 1000 + len(key))
        wav = model.generate(text, audio_prompt_path=ref, exaggeration=0.4, cfg_weight=0.5, temperature=0.7)
        torchaudio.save(os.path.join(out, f'{key}--t{take}.wav'), wav, model.sr)
        log[f'{key}--t{take}'] = {'text': text, 'sec': round(time.time() - t, 2), 'dur': round(wav.shape[-1] / model.sr, 2)}
        print(key, take, log[f'{key}--t{take}'], flush=True)
json.dump(log, open(os.path.join(out, '_log.json'), 'w'), indent=1)
print('done')
