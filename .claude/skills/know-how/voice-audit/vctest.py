# Voice conversion test: real people's speech (LibriSpeech, CC BY 4.0) turned
# into Luna's voice with Chatterbox's VC model. A stand-in for "Alex records the
# sounds, they come out as Luna".
#   python vctest.py <luna-ref.wav> <jobs.json> <outdir>   jobs: [{id, wav, start, end}]
import sys, os, json, time, torch, torchaudio, soundfile as sf, numpy as np
from chatterbox.vc import ChatterboxVC

ref, jobs, out = sys.argv[1], json.load(open(sys.argv[2])), sys.argv[3]
os.makedirs(out, exist_ok=True)
device = 'mps' if torch.backends.mps.is_available() else 'cpu'
try:
    vc = ChatterboxVC.from_pretrained(device)
except Exception as e:
    print('mps failed, cpu:', e); device = 'cpu'; vc = ChatterboxVC.from_pretrained(device)
print('loaded', device, flush=True)
for j in jobs:
    x, sr = sf.read(j['wav'], dtype='float32')
    a, b = int(j['start'] * sr), int(j['end'] * sr)
    seg = x[a:b]
    src = os.path.join(out, f"{j['id']}--human.wav"); sf.write(src, seg, sr)
    t = time.time()
    wav = vc.generate(src, target_voice_path=ref)
    torchaudio.save(os.path.join(out, f"{j['id']}--luna.wav"), wav, vc.sr)
    print(j['id'], f'{time.time() - t:.1f}s', flush=True)
print('done')
