// Picks LibriSpeech dev-clean utterances and phonemizes their transcripts with
// espeak (en-us), the same convention the phoneme recognizer was trained on.
//   node --input-type=module -e "$(cat libri-prep.mjs)" <LibriSpeech dir> <perSpeaker> <out.json>
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { phonemize } from 'phonemizer';

const [dir, perSpeaker, out] = process.argv.slice(1);
const sexOf = {};
for (const line of readFileSync(join(dir, 'SPEAKERS.TXT'), 'utf8').split('\n')) {
  if (line.startsWith(';')) continue;
  const [id, sex, subset] = line.split('|').map(s => s && s.trim());
  if (subset === 'dev-clean') sexOf[id] = sex;
}
const utts = [];
for (const spk of readdirSync(join(dir, 'dev-clean'))) {
  let n = 0;
  for (const ch of readdirSync(join(dir, 'dev-clean', spk))) {
    let trans;
    try { trans = readFileSync(join(dir, 'dev-clean', spk, ch, `${spk}-${ch}.trans.txt`), 'utf8').trim().split('\n'); } catch { continue; }
    for (const line of trans) {
      if (n >= Number(perSpeaker)) break;
      const [id, ...words] = line.split(' ');
      const text = words.join(' ').toLowerCase();
      if (words.length < 6 || words.length > 30) continue;
      const ipa = (await phonemize(text, 'en-us')).join(' ');
      utts.push({ id, speaker: spk, sex: sexOf[spk] ?? '?', wav: join(dir, 'dev-clean', spk, ch, `${id}.flac`), text, ipa });
      n += 1;
    }
  }
}
writeFileSync(out, JSON.stringify(utts));
console.log(utts.length, 'utterances from', new Set(utts.map(u => u.speaker)).size, 'speakers;', utts.filter(u => u.sex === 'F').length, 'by women');
