# Packs a Sound Check round's clips from a cards file (make-r6.py's
# round6.json): each take with a `path` is encoded as m4a, and a `today` take
# is the app's clip now (`<kind>|<key>|normal` in the manifest; kind is
# `sound` unless the card says `name`). Flags a silent or cut-off take.
#   ~/anaconda3/envs/luna-vc/bin/python pack-round.py <repo> <cards.json> <round id, e.g. r6> <out audio.json>
import base64, json, os, subprocess, sys, tempfile
import numpy as np, soundfile as sf

repo, cards_path, rid, out = sys.argv[1:5]
FFMPEG = os.path.join(repo, 'node_modules/ffmpeg-static/ffmpeg')
VOICE = os.path.join(repo, 'public/voice/af_heart')
manifest = json.load(open(os.path.join(VOICE, 'manifest.json')))['clips']
cards = json.load(open(cards_path))


def m4a(path):
    with tempfile.NamedTemporaryFile(suffix='.m4a') as t:
        subprocess.run([FFMPEG, '-v', 'error', '-y', '-i', path, '-ac', '1', '-ar', '24000', '-c:a', 'aac', '-b:a', '96k',
                        '-movflags', '+faststart', t.name], check=True)
        return base64.b64encode(open(t.name, 'rb').read()).decode()


audio, flags = {}, []
for c in cards:
    line = [f"{c['sid']:5}"]
    for t in c['takes']:
        cid = f"{rid}:{c['sid']}:{t['id']}"
        if t['id'] == 'today' and not t.get('path'):  # a word card's today is built, with a path
            key = c['key'].replace('_alt', '+alt')
            f = manifest.get(f"{c.get('kind', 'sound')}|{key}|normal")
            if not f: flags.append(f'{cid}: no clip in the app'); continue
            audio[cid] = base64.b64encode(open(os.path.join(VOICE, f), 'rb').read()).decode()
            continue
        if not os.path.exists(t['path']): flags.append(f'{cid}: {t["path"]} missing'); continue
        x, sr = sf.read(t['path'])
        x = x if x.ndim == 1 else x.mean(1)
        dur, peak = len(x) / sr, 20 * np.log10(np.abs(x).max() + 1e-9)
        if peak < -30 or dur < 0.12: flags.append(f'{cid}: {dur:.2f}s, peak {peak:.1f} dB')
        line.append(f"{t['id']} {dur:.2f}s")
        audio[cid] = m4a(t['path'])
    print('  '.join(line))
json.dump(audio, open(out, 'w'))
print(len(cards), 'cards,', len(audio), 'clips,', os.path.getsize(out) // 1024, 'KB')
print('flags:', flags or 'none')
