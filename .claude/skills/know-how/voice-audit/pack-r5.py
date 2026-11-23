# Round 5's clips for the Sound Check page (VOX-8), and a list of the cards.
#   ~/anaconda3/envs/luna-vc/bin/python pack5.py <repo> <outdir>
# Writes <outdir>/audio-r5.json (ids r5:<sid>:today|luna1-3|lunaword|his1-3,
# base64 m4a) and <outdir>/r5-cards.json, and prints each take's length and
# loudness so a silent or cut-off conversion shows before Alex hears it.
import base64, json, os, re, subprocess, sys, tempfile
import numpy as np, soundfile as sf

repo, out = sys.argv[1], sys.argv[2]
os.makedirs(out, exist_ok=True)
FFMPEG = os.path.join(repo, 'node_modules/ffmpeg-static/ffmpeg')
CONV = os.path.join(repo, '.voice-tmp/vox8')
VOICE = os.path.join(repo, 'public/voice/af_heart')
manifest = json.load(open(os.path.join(VOICE, 'manifest.json')))['clips']
src = open(os.path.join(repo, 'src/dev/RecordPage/sounds.ts')).read()
key_to_sound = json.loads(subprocess.run(['node', '-e', '''
import(process.argv[1]).then(m => console.log(JSON.stringify(m.KEY_TO_SOUND)))''',
    'file://' + os.path.join(repo, 'scripts/voice/phonemes.mjs')], capture_output=True, text=True, check=True).stdout)
safe = {re.sub(r'[^A-Za-z0-9]', '_', k): (k, v) for k, v in key_to_sound.items()}

BREATH = {'P', 'T', 'K', 'CH', 'X', 'H', 'S', 'SH', 'F', 'SK', 'SP', 'ST'}
rows = re.findall(r"s\('(\w+)', (true|false), '(\w+)', '((?:[^'\\]|\\.)*)', '(\w+)'", src)
cards = []
for group, held, file, label, word in rows:
    if group == 'pilot':
        continue
    key, sid = safe[file]
    cards.append({'sid': sid, 'key': key, 'file': file, 'label': label.replace("\\'", "'"), 'word': word,
                  'group': group, 'held': held == 'true', 'breath': file in BREATH})


def m4a(path):
    with tempfile.NamedTemporaryFile(suffix='.m4a') as t:
        subprocess.run([FFMPEG, '-v', 'error', '-y', '-i', path, '-ac', '1', '-ar', '24000', '-c:a', 'aac', '-b:a', '96k',
                        '-movflags', '+faststart', t.name], check=True)
        return base64.b64encode(open(t.name, 'rb').read()).decode()


def measure(path):
    x, sr = sf.read(path)
    x = x if x.ndim == 1 else x.mean(1)
    peak = 20 * np.log10(np.abs(x).max() + 1e-9)
    f = int(sr * 0.01)
    n = len(x) // f
    db = 20 * np.log10(np.sqrt(np.mean(x[: n * f].reshape(n, f) ** 2, 1)) + 1e-9)
    return len(x) / sr, peak, float(np.percentile(db, 90))


audio, flags = {}, []
for c in cards:
    today = manifest.get(f"sound|{c['key']}|normal")
    if not today:
        flags.append(f"{c['file']}: no clip in the app")
    else:
        audio[f"r5:{c['sid']}:today"] = base64.b64encode(open(os.path.join(VOICE, today), 'rb').read()).decode()
    line = [f"{c['file']:6} {c['sid']:4}"]
    for slot, name in [('take1', 'luna1'), ('take2', 'luna2'), ('take3', 'luna3'), ('word', 'lunaword')]:
        p = os.path.join(CONV, f"sound__{c['file']}__{slot}--luna.wav")
        if not os.path.exists(p):
            flags.append(f"{c['file']} {slot}: not converted")
            continue
        dur, peak, loud = measure(p)
        line.append(f"{name} {dur:.2f}s {peak:5.1f}dB")
        if peak < -30 or dur < 0.12:
            flags.append(f"{c['file']} {slot}: {dur:.2f}s, peak {peak:.1f} dB")
        audio[f"r5:{c['sid']}:{name}"] = m4a(p)
    if c['breath']:
        for n in (1, 2, 3):
            p = os.path.join(CONV, f"sound__{c['file']}__take{n}--his.wav")
            if os.path.exists(p):
                audio[f"r5:{c['sid']}:his{n}"] = m4a(p)
    print('  '.join(line))

json.dump(audio, open(os.path.join(out, 'audio-r5.json'), 'w'))
json.dump(cards, open(os.path.join(out, 'r5-cards.json'), 'w'), indent=1)
print(len(cards), 'cards,', len(audio), 'clips,', os.path.getsize(os.path.join(out, 'audio-r5.json')) // 1024, 'KB')
print('flags:', flags or 'none')
