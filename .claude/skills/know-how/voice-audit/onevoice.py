# VOX-10: do a set of sounds sound like one voice? For each folder of
# sound__<KEY>.wav, Chatterbox's voice encoder embeds each voiced sound
# (breaths carry too little voice to embed), and this prints how alike they
# are to each other (mean pairwise cosine) and to Luna (luna-ref.wav).
#   ~/anaconda3/envs/luna-vc/bin/python .claude/skills/know-how/voice-audit/onevoice.py KEYS DIR [DIR…]
import glob, os, sys
import numpy as np, librosa
from chatterbox.models.voice_encoder import VoiceEncoder
from safetensors.torch import load_file
keys, dirs = sys.argv[1].split(','), sys.argv[2:]
ve = VoiceEncoder()
ve.load_state_dict(load_file(glob.glob(os.path.expanduser('~/.cache/huggingface/hub/models--ResembleAI--chatterbox/snapshots/*/ve.safetensors'))[0]))
ve.eval()
emb = lambda y: (lambda e: e / np.linalg.norm(e))(ve.embeds_from_wavs([np.tile(y, max(1, int(np.ceil(6400 / max(1, len(y))))))], sample_rate=16000, as_spk=True, trim_top_db=None))
luna = emb(librosa.load('.voice-tmp/vox8/luna-ref.wav', sr=16000)[0])
for d in dirs:
    es = []
    for k in keys:
        p = os.path.join(d, f'sound__{k}.wav')
        if not os.path.exists(p):
            continue
        y = librosa.load(p, sr=16000)[0]
        f0, v, _ = librosa.pyin(y, fmin=80, fmax=500, sr=16000, frame_length=1024)
        if np.mean(v) < 0.3:
            continue  # a breath
        es.append(emb(y))
    E = np.array(es)
    pair = (E @ E.T)[np.triu_indices(len(E), 1)]
    print(f'{d:40s} {len(E)} voiced sounds: alike to each other {pair.mean():.3f} (lowest {pair.min():.3f}), to Luna {np.mean(E @ luna):.3f}')
