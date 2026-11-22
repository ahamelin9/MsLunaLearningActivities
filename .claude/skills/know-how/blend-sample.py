#!/usr/bin/env python3
# A listening sample of sounded-out words, from Luna's own rendered clips, at
# one or more gaps between the sounds (CUR-25: 260 ms was "too far apart").
#
#   python3 .claude/skills/know-how/blend-sample.py <out.wav> 260 100 [more gaps…]
#
# From the repo root, on the Mac (it uses afconvert). Each gap plays /b/ /a/
# /t/ bat, /h/ /e/ /n/ hen, /s/ /u/ /n/ sun, with two seconds of quiet between
# gaps, in the order given.
import json, os, subprocess, sys, tempfile, wave

out, gaps = sys.argv[1], [int(g) for g in sys.argv[2:]]
V = 'public/voice/af_heart/'
clips = json.load(open(V + 'manifest.json'))['clips']
tmp = tempfile.mkdtemp()
RATE = 24000


def pcm(key):
    name = clips[key]
    wav = os.path.join(tmp, name + '.wav')
    if not os.path.exists(wav):
        subprocess.run(['afconvert', '-f', 'WAVE', '-d', f'LEI16@{RATE}', '-c', '1', V + name, wav], check=True)
    with wave.open(wav) as w:
        return w.readframes(w.getnframes())


def quiet(ms):
    return b'\0\0' * int(RATE * ms / 1000)


data = b''
for n, gap in enumerate(gaps):
    if n:
        data += quiet(2000)
    for word in ['bat', 'hen', 'sun']:
        for letter in word.upper():
            data += pcm(f'sound|{letter}|normal') + quiet(gap)
        data += pcm(f'word|{word}|normal') + quiet(900)
with wave.open(out, 'wb') as w:
    w.setnchannels(1)
    w.setsampwidth(2)
    w.setframerate(RATE)
    w.writeframes(data)
print(out)
