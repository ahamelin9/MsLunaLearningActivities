// Packs the research run's experiments for the Sound Check page's Research tab.
//   node pack3.mjs <scratch> <repo>
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';

const [S, repo] = process.argv.slice(2);
const manifest = JSON.parse(readFileSync(join(repo, 'public/voice/af_heart/manifest.json'), 'utf8'));
const keyOf = JSON.parse(readFileSync(join(S, 'key-of-sound.json'), 'utf8'));
const audio = JSON.parse(readFileSync(join(S, 'page/audio2.json'), 'utf8'));
const prod = key => readFileSync(join(repo, 'public/voice/af_heart', manifest.clips[key])).toString('base64');
const wav = f => 'WAV:' + readFileSync(join(S, f)).toString('base64');
const m4a = f => readFileSync(join(S, f)).toString('base64');
const ff = createRequire(join(repo, 'package.json'))('ffmpeg-static');
// the bake-off and conversion tests compare voices, not codecs: compressed is fine
const enc = f => { const out = join(S, 'enc-tmp.m4a'); execFileSync(ff, ['-nostdin', '-v', 'error', '-y', '-i', join(S, f), '-ac', '1', '-ar', '24000', '-c:a', 'aac', '-b:a', '64k', out]); return readFileSync(out).toString('base64'); };
const today = s => prod(`sound|${keyOf[s].replace('_', '+')}|normal`);
const groups = [];
const card = (group, prefix, id, title, sub, takes) => {
  for (const t of takes) audio[`${prefix}:${id}:${t.take}`] = t.data;
  group.cards.push({ item: `rx:${prefix}:${id}`, prefix, id, title, sub, takes: takes.map(({ take, label, small }) => ({ take, label, small: small ?? '' })) });
};
const T = s => ({ take: 'today', label: 'Today’s (in the app)', data: today(s) });

// 1. stops with a whisper
{
  const g = { title: 'Stops with a whisper instead of “uh”', how: 'Kilpatrick’s method: the burst, then a <b>whispered</b> vowel instead of a voiced “uh”. That gives the sound length without the “buh”. The machine ear can’t name a whispered stop, so this one is all yours.', cards: [] };
  const W = { b: [['whisper60', 'whisper, 60 ms'], ['whisper90', 'whisper, 90 ms']], d: [['whisper60', 'from “dip”, whisper 60 ms'], ['whisper90', 'from “dip”, whisper 90 ms']], g: [['whisper60', 'whisper, 60 ms'], ['whisper90', 'whisper, 90 ms']], p: [['whisper70', 'a puff, 70 ms']], t: [['whisper70', 'a hiss, 70 ms (may be too hissy)']], k: [['whisper90', 'radio static, 90 ms']] };
  const name = { b: '/b/', d: '/d/', g: '/g/', p: '/p/', t: '/t/', k: '/k/' };
  for (const [s, takes] of Object.entries(W)) card(g, 'rxs', s, name[s], 'stop', [T(s), ...takes.map(([t, l]) => ({ take: t, label: l, data: wav(`whisper/${s}--${t}.wav`) }))]);
  groups.push(g);
}
// 2. L and R from the right part of her words
{
  const g = { title: 'L and R from the right part of Luna’s words', how: 'Today’s L measures like the “e” of “bell”, and today’s R like an “er”. These are held from the exact stretch of Luna’s own word where the L or R is, chosen because it measures like real American speech (L: F2 about 1450–1500 Hz; R: F2 about 1500, F3 under 2000). Held with a natural wobble.', cards: [] };
  const files = readdirSync(join(S, 'lr3'));
  const lab = f => { const w = f.split('--')[1].replace('.wav', ''); const [, ps, sp] = w.split('-'); const word = { 'lˈɪp': 'lip', 'lˈif': 'leaf', 'lˈip': 'leap', 'ɹˈɛd': 'red', 'ɹˈik': 'reek', 'ɹˈæt': 'rat', 'ɹˈAn': 'rain', 'ɹˈʌn': 'run' }[ps] ?? ps; return `from the start of “${word}”${sp === '0.8' ? ', said slowly' : ''}, held`; };
  for (const s of ['l', 'r']) card(g, 'rxl', s, `/${s}/`, s === 'l' ? 'L, as in leaf' : 'R, as in ring', [T(s), ...files.filter(f => f.startsWith(`${s}--`)).map(f => ({ take: f.replace('.wav', '').replace(/[^A-Za-z0-9-]/g, '_'), label: lab(f), data: wav(`lr3/${f}`) }))]);
  groups.push(g);
}
// 3. long vowels and R vowels said slowly, cut properly
{
  const g = { title: 'Long vowels and R vowels said slowly (redone)', how: 'Round 2’s “said slowly” takes for these were broken (some only 60 ms). These are cut properly: Luna saying the vowel slowly, from where it starts to where her voice stops, with nothing in front and no stretching.', cards: [] };
  const name = { ay: ['/ā/', 'long A'], eye: ['/ī/', 'long I'], oo: ['/oo/', 'as in moon'], you: ['/ū/', 'long U'], ar: ['/ar/', 'as in star'], or: ['/or/', 'as in fork'], er: ['/er/', 'as in her'] };
  const word = { 'ˈA.': 'on its own', 'dˈA.': 'from “day”', 'ˈI.': 'on its own', 'mˈI.': 'from “my”', 'ˈu.': 'on its own', 'mˈun.': 'from “moon”', 'zˈu.': 'from “zoo”', 'jˈu.': '“you”', 'ˈɑɹ.': 'on its own', 'kˈɑɹ.': 'from “car”', 'ˈɔɹ.': 'on its own', 'dˈɔɹ.': 'from “door”', 'mˈɔɹ.': 'from “more”', 'ˈɜɹ.': 'on its own', 'fˈɜɹ.': 'from “fur”' };
  const files = readdirSync(join(S, 'v3'));
  for (const [s, [t, sub]] of Object.entries(name)) card(g, 'rxv', s, t, sub, [T(s), ...files.filter(f => f.startsWith(`${s}--`)).map(f => { const ps = f.split('--')[1].replace('.wav', ''); return { take: ps.replace(/[^A-Za-z0-9]/g, '_') || 'bare', label: `${word[ps] ?? ps}, said slowly`, data: wav(`v3/${f}`) }; })]);
  groups.push(g);
}
// 4. F and TH
{
  const g = { title: 'F and TH: her real hiss, held smoothly, softer', how: 'Round 2’s grains were short enough to flutter (the “vibrating”). These use long, overlapping grains. The “softer” ones ease off the treble: real F and TH are much less bright than Luna’s. Lossless, so compression isn’t part of it.', cards: [] };
  for (const s of ['f', 'th']) {
    const files = readdirSync(join(S, 'hiss3')).filter(f => f.startsWith(`${s}--`));
    card(g, 'rxh', s, `/${s}/`, s === 'f' ? 'F, as in fox' : 'TH, as in thumb', [T(s), ...files.map(f => { const [w, kind] = f.split('--')[1].replace('.wav', '').split(/-(.*)/); return { take: `${w}-${kind}`, label: `from “${w}”, ${kind === 'softer' ? 'long grains, softer' : 'long grains'}`, data: wav(`hiss3/${f}`) }; })]);
  }
  groups.push(g);
}
// 5. compression
{
  const g = { title: 'Does compression add the static?', how: 'The same take three ways: as the app squeezes it today (40 kbps), at 96 kbps, and not compressed at all. If 96 sounds like the original and 40 doesn’t, the letter sounds should ship at 96.', cards: [] };
  const src = { f: 'f--real-cuff', th: 'th--real-tooth', s: 's--real-yes', sh: 'sh--today-420', z: 'z--real-4' };
  for (const [s, b] of Object.entries(src)) card(g, 'rxc', s, `/${s}/`, b.split('--')[1], [
    { take: '40k', label: '40 kbps (the app today)', data: m4a(`codec/${b}-40k.m4a`) },
    { take: '96k', label: '96 kbps', data: m4a(`codec/${b}-96k.m4a`) },
    { take: 'lossless', label: 'not compressed', data: wav(`codec/${b}-orig.wav`) }]);
  groups.push(g);
}
// 5b. blending with or without pauses (a teaching question for the teacher)
if (existsSync(join(S, 'blend'))) {
  const g = { title: 'Blending: with pauses, or connected?', how: 'Research favours blending without pauses (“mmmaaap”, then “map”): kindergartners taught that way read new words better. The app pauses between sounds today. Built from sounds you’ve already picked; a teaching choice, so worth playing for the teacher.', cards: [] };
  for (const w of ['map', 'sun', 'fan']) card(g, 'rxbl', w, w, 'sounding out', [
    { take: 'segmented', label: 'With pauses (like the app today)', data: enc(`blend/${w}--segmented.wav`) },
    { take: 'connected', label: 'Connected (“mmmaaap”), then the word', data: enc(`blend/${w}--connected.wav`) }]);
  groups.push(g);
}
// 6. bake-off
if (existsSync(join(S, 'bake/_log.json'))) {
  const g = { title: 'Bake-off: Chatterbox, cloned to Luna’s voice', how: 'Chatterbox is a free, open voice model. Here it copies Luna’s voice from a 25-second sample of her and is given plain text (“Mmmmmm.”, “Cup.”). Two takes of each, since it varies. Kokoro (Luna today) comes first. If Chatterbox wins somewhere, that’s worth knowing; it can’t take exact phonemes, so it’s a candidate for words or lines more than for letter sounds.', cards: [] };
  const log = JSON.parse(readFileSync(join(S, 'bake/_log.json'), 'utf8'));
  const bk = k => [1, 2].filter(t => log[`${k}--t${t}`]).map(t => ({ take: `cb${t}`, label: `Chatterbox, take ${t}`, data: enc(`bake/${k}--t${t}.wav`) }));
  const sounds = { m: 'snd-m', n: 'snd-n', l: 'snd-l', r: 'snd-r', s: 'snd-s', sh: 'snd-sh', f: 'snd-f', v: 'snd-v', z: 'snd-z', th: 'snd-th', ng: 'snd-ng', ay: 'snd-ay', ee: 'snd-ee', eye: 'snd-eye', oh: 'snd-oh', oo: 'snd-oo', ar: 'snd-ar', or: 'snd-or', er: 'snd-er' };
  for (const [s, k] of Object.entries(sounds)) card(g, 'rxb', `s-${s}`, `/${s}/`, `“${log[`${k}--t1`]?.text ?? ''}”`, [T(s), ...bk(k)]);
  for (const n of ['B', 'E', 'N', 'P', 'CH']) card(g, 'rxb', `n-${n}`, n, 'letter name', [{ take: 'today', label: 'Today’s (in the app)', data: prod(`name|${n}|normal`) }, ...bk(`name-${n}`)]);
  for (const w of ['cook', 'eat', 'her', 'hop', 'hopped', 'jump', 'leaf', 'peach', 'popped', 'sheep', 'cup', 'pup', 'green', 'moon', 'bed', 'key', 'stops']) {
    const trim = existsSync(join(S, `wavT/w:${w}:today-trim.wav`)) ? [{ take: 'trim', label: 'Today’s, edges trimmed', data: enc(`wavT/w:${w}:today-trim.wav`) }] : [];
    card(g, 'rxb', `w-${w}`, w, 'word', [{ take: 'today', label: 'Today’s (in the app)', data: prod(`word|${w}|normal`) }, ...trim, ...bk(`word-${w}`)]);
  }
  const lines = JSON.parse(readFileSync(join(S, 'lines.json'), 'utf8'));
  for (const id of ['l1', 'l2', 'l4', 'l5']) {
    const [, key] = lines.find(l => l[0] === id);
    card(g, 'rxb', `t-${id}`, key, 'line', [{ take: 'today', label: 'Today’s (in the app)', data: prod(`text|${key}|normal`) }, { take: 'misaki', label: 'Kokoro, misaki spelling', data: enc(`wavB/text:${id}.wav`) }, ...bk(`line-${id}`)]);
  }
  groups.push(g);
}
// 7. voice conversion
if (existsSync(join(S, 'vc'))) {
  const g = { title: 'Voice conversion: a real person, turned into Luna', how: 'The test for “Alex records the sounds, they come out in Luna’s voice”. These are real readers from LibriSpeech (two men, two women) turned into Luna by Chatterbox’s voice converter. Pick the converted one if it sounds like Luna, None if it doesn’t.', cards: [] };
  const jobs = JSON.parse(readFileSync(join(S, 'vc-jobs.json'), 'utf8'));
  for (const j of jobs) {
    if (!existsSync(join(S, `vc/${j.id}--luna.wav`))) continue;
    card(g, 'rxvc', j.id, j.id.startsWith('m') ? 'A man reading' : 'A woman reading', `“${j.text.slice(0, 50)}…”`, [
      { take: 'human', label: 'The reader', data: enc(`vc/${j.id}--human.wav`) },
      { take: 'luna', label: 'Turned into Luna', data: enc(`vc/${j.id}--luna.wav`) }]);
  }
  groups.push(g);
}
writeFileSync(join(S, 'page/audio3.json'), JSON.stringify(audio));
writeFileSync(join(S, 'research-meta.json'), JSON.stringify(groups));
console.log(groups.map(g => `${g.title}: ${g.cards.length}`).join('\n'), '\n', (Object.values(audio).reduce((a, b) => a + b.length, 0) / 1048576).toFixed(1), 'MB');
