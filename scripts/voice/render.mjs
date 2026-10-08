// Renders Ms. Luna's whole vocabulary to audio files, once, on a developer's
// machine. The app then ships those files instead of a 325 MB model, and says
// things instantly instead of synthesising them on a child's tablet.
//
//   npm run voice:render                  the default voice
//   npm run voice:render -- --voice af_bella
//   npm run voice:render -- --only sound  just the phonics sounds, while tuning them
//   npm run voice:render -- --force       ignore the cache and redo everything
//
// Re-running is cheap: a clip is only regenerated when its text, recipe,
// tuning or speed has actually changed.

import { createHash } from 'node:crypto';
import { execFileSync, spawn } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import ffmpegPath from 'ffmpeg-static';
import { KokoroTTS } from 'kokoro-js';

import { fadeIn, fadeOut, ms, normalize, peak, shapeClip, trimSilence, SAMPLE_RATE } from './dsp.mjs';
import { SOUNDS, US_PHONEMES, renderSound, soundFor, validateCarriers } from './phonemes.mjs';
import { speakable } from './lexicon.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '../..');

// ---------- arguments ----------

const argv = process.argv.slice(2);
const flag = (name, fallback) => {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : fallback;
};
const has = name => argv.includes(`--${name}`);

const VOICE = flag('voice', 'af_heart');
const ONLY = flag('only', null);
const FORCE = has('force');
const BITRATE = flag('bitrate', '40k');

// ---------- inventory ----------

console.log('• bundling inventory');
const tmp = join(root, '.voice-tmp');
mkdirSync(tmp, { recursive: true });
execFileSync(
  join(root, 'node_modules/.bin/esbuild'),
  [
    join(here, 'inventory.ts'),
    '--bundle',
    '--platform=node',
    '--format=esm',
    // the games are imported for their missions, which brings their
    // components and stylesheets along; neither is ever run here
    '--jsx=automatic',
    '--loader:.scss=empty',
    '--loader:.css=empty',
    `--outfile=${join(tmp, 'inventory.mjs')}`,
    '--log-level=warning'
  ],
  { stdio: 'inherit' }
);

const { buildInventory, RATE_BUCKETS, keyOf, speedFor } = await import(
  `${join(tmp, 'inventory.mjs')}?v=${Date.now()}`
);

const overrides = JSON.parse(readFileSync(join(here, 'overrides.json'), 'utf8'));

// The code that makes a clip is part of its identity: change how a sound is
// cut or held and every affected clip is rendered again, without anyone
// having to remember to pass --force.
const versionOf = file => createHash('sha1').update(readFileSync(join(here, file))).digest('hex').slice(0, 12);
const dspVersion = versionOf('dsp.mjs');
const phonemesVersion = versionOf('phonemes.mjs');
// Words and sentences only go through shapeClip, so only the code it runs is
// part of their identity: retuning how phonics sounds are held does not
// re-render two thousand sentences.
const plainVersion = createHash('sha1')
  .update([shapeClip, trimSilence, normalize, fadeIn, fadeOut, peak, ms].map(f => f.toString()).join('\n'))
  .digest('hex')
  .slice(0, 12);

/**
 * A human recording, if one has been dropped in for this clip.
 *
 * Every phonics guide reaches the same conclusion: isolated sounds are best
 * recorded by a person. Since the app plays files rather than running a
 * model, swapping one in takes no code — drop `sound__B.wav` into
 * scripts/voice/recorded/ and it wins over the generated sound.
 */
const RECORDED_DIR = join(here, 'recorded');
const RECORDED_EXT = ['.wav', '.aiff', '.aif', '.mp3', '.m4a', '.flac', '.ogg'];

function recordedFor(clip) {
  const safe = clip.value.replace(/[^A-Za-z0-9]/g, '_');
  for (const ext of RECORDED_EXT) {
    const path = join(RECORDED_DIR, `${clip.kind}__${safe}${ext}`);
    if (existsSync(path)) return path;
  }
  return null;
}

/** Decode any audio file to the mono float samples the shaper expects. */
function decodeFile(path) {
  const raw = execFileSync(
    ffmpegPath,
    ['-v', 'error', '-i', path, '-f', 'f32le', '-ac', '1', '-ar', String(SAMPLE_RATE), 'pipe:1'],
    { maxBuffer: 1 << 28 }
  );
  return new Float32Array(raw.buffer, raw.byteOffset, Math.floor(raw.byteLength / 4));
}

const hashOf = text => createHash('sha1').update(text).digest('hex');

/**
 * A clip's file is named after everything that makes its audio, so a clip
 * whose audio changes gets a new URL. The app caches clips hard (they never
 * change under the same name) and re-checks only the small manifest, so a
 * child's tablet can never go on playing a sound from before a re-render.
 */
const fileFor = (id, fingerprint) => `${hashOf(`${VOICE}|${id}|${fingerprint}`).slice(0, 16)}.m4a`;
const fileHash = path => createHash('sha1').update(readFileSync(path)).digest('hex').slice(0, 12);

// --only narrows what is rendered, never the vocabulary: the manifest, the
// review page and the pruning below always see every clip, so a partial run
// cannot drop the rest of Luna's voice from the app
const clips = buildInventory();

const buckets = Object.keys(RATE_BUCKETS);

/** every word the app says on its own, for telling a word in caps from a letter team */
const vocabulary = new Set(clips.filter(c => c.kind === 'word').map(c => c.value.toLowerCase()));

// ---------- jobs ----------
//
// Words and sentences are rendered once per speed. A phonics sound is not: it
// is cut from a word and held for a fixed time, so it is the same at every
// speed — and C, K and CK make the same sound. Each distinct sound is
// therefore rendered once and every key that makes it points at that file.

const jobs = [];
/** manifest key → job, for every key at every speed */
const routes = new Map();

/** "m" and "M" are one sound key; this is the spelling the manifest uses */
const soundKeyOf = value => keyOf('sound', value, buckets[0]).split('|')[1];

const soundJobs = new Map();
for (const clip of clips) {
  if (clip.kind !== 'sound') continue;
  const key = soundKeyOf(clip.value);
  const recorded = recordedFor({ ...clip, value: key });
  const id = soundFor(key);
  // a recording belongs to one key; everything else shares its sound's file
  const unit = recorded ? `key:${key}` : `sound:${id}`;
  if (!soundJobs.has(unit)) {
    const tune = overrides[`sound|${id}`] ?? {};
    const fingerprint = hashOf(
      JSON.stringify({
        dsp: dspVersion,
        phonemes: phonemesVersion,
        voice: VOICE,
        unit,
        tune,
        bitrate: BITRATE,
        // a recording is identified by its bytes, so replacing the file
        // re-renders the clip and deleting it falls back to the voice
        recorded: recorded ? fileHash(recorded) : null
      })
    );
    soundJobs.set(unit, { kind: 'sound', unit, id, keys: [], recorded, tune, fingerprint, file: fileFor(unit, fingerprint) });
  }
  const job = soundJobs.get(unit);
  if (!job.keys.includes(key)) job.keys.push(key);
  for (const bucket of buckets) routes.set(keyOf('sound', key, bucket), job);
}
jobs.push(...soundJobs.values());

for (const clip of clips) {
  if (clip.kind === 'sound') continue;
  for (const bucket of buckets) {
    const speed = speedFor(clip.kind, bucket);
    const tune = overrides[`${clip.kind}|${clip.value}`] ?? {};
    const recorded = recordedFor(clip);
    const key = keyOf(clip.kind, clip.value, bucket);
    // what Kokoro is handed, which is part of the clip's identity: fix how a
    // line is pronounced and exactly that line is rendered again
    const said = clip.kind === 'text' ? speakable(clip.text, vocabulary) : clip.text;
    const fingerprint = hashOf(
      JSON.stringify({
        dsp: plainVersion,
        voice: VOICE,
        text: said,
        speed,
        tune,
        bitrate: BITRATE,
        recorded: recorded ? fileHash(recorded) : null
      })
    );
    const job = { kind: clip.kind, key, clip, said, bucket, speed, tune, recorded, fingerprint, file: fileFor(key, fingerprint) };
    jobs.push(job);
    routes.set(key, job);
  }
}

const cacheKey = job => (job.kind === 'sound' ? job.unit : job.key);

console.log(
  `• ${clips.length} clips: ${soundJobs.size} phonics sounds, ` +
    `${jobs.length - soundJobs.size} words and sentences across ${buckets.length} speeds`
);

/**
 * Every carrier word is spelled in misaki, Kokoro's own phoneme alphabet, and
 * a symbol outside it is either dropped silently or — like the British-only
 * length mark ː — accepted but never seen in American training, so the voice
 * does something unpredictable with it. Either way the sound comes out wrong
 * and it is very hard to hear why, so every spelling is checked up front.
 */
function checkCarriers() {
  const bad = validateCarriers();
  // a carrier word set in overrides.json gets the same check as the built-in ones
  for (const [key, tune] of Object.entries(overrides)) {
    if (!key.startsWith('sound|') || typeof tune?.carrier !== 'string') continue;
    const outside = [...tune.carrier].filter(c => !US_PHONEMES.has(c));
    if (outside.length) bad.push({ id: key, ps: tune.carrier, outside: outside.join('') });
  }
  if (bad.length) {
    console.error('\n✗ these carrier words use symbols outside Kokoro’s American alphabet:\n');
    for (const b of bad) console.error(`    ${b.id}   ${JSON.stringify(b.ps)}   outside: ${JSON.stringify(b.outside)}`);
    console.error('\n  Fix them in scripts/voice/phonemes.mjs or overrides.json. The alphabet is misaki’s, not IPA:');
    console.error('  ɡ (U+0261) not g, ʤ/ʧ for j/ch, A I O W Y for the diphthongs, and no ː.\n');
    process.exit(1);
  }
  console.log('• carrier words: every spelling is in Kokoro’s American alphabet');
  if (!/^a[fm]_/.test(VOICE)) {
    console.warn(`  ! ${VOICE} is not an American voice; its phonics sounds are cut from American spellings`);
  }
}

if (soundJobs.size) checkCarriers();

// ---------- output + cache ----------

const outDir = join(root, 'public/voice', VOICE);
mkdirSync(outDir, { recursive: true });

const cachePath = join(outDir, '.fingerprints.json');
const cache = !FORCE && existsSync(cachePath) ? JSON.parse(readFileSync(cachePath, 'utf8')) : {};

const todo = jobs.filter(
  j => (!ONLY || j.kind === ONLY) && (cache[cacheKey(j)] !== j.fingerprint || !existsSync(join(outDir, j.file)))
);
console.log(`• ${todo.length} need rendering, ${jobs.length - todo.length} already current`);

if (!todo.length) {
  writeManifest();
  writeReview();
  pruneOrphans();
  console.log('• nothing to do');
  process.exit(0);
}

// ---------- model ----------

// The model is only loaded if something actually has to be synthesised, so a
// run that only re-encodes recordings costs nothing.
let tts = null;
if (todo.some(j => !j.recorded)) {
  console.log('• loading Kokoro (first run downloads ~325 MB, then it is cached)');
  const t0 = Date.now();
  tts = await KokoroTTS.from_pretrained('onnx-community/Kokoro-82M-v1.0-ONNX', {
    dtype: 'fp32',
    device: 'cpu'
  });
  console.log(`  loaded in ${((Date.now() - t0) / 1000).toFixed(0)}s`);
} else {
  console.log('• every clip is a recording; the model is not needed');
}

/** Kokoro saying one carrier word, from its phonemes. Memoised: carriers are shared. */
const said = new Map();
function say(phonemes, speed = 1) {
  const id = `${phonemes}@${speed}`;
  if (!said.has(id)) {
    said.set(
      id,
      tts
        .generate_from_ids(tts.tokenizer(phonemes, { truncation: true }).input_ids, { voice: VOICE, speed })
        .then(r => Float32Array.from(r.audio))
    );
  }
  return said.get(id);
}

// ---------- encoding ----------

/** Raw float samples in, AAC file out. AAC because every browser decodes it. */
function encode(samples, file) {
  return new Promise((ok, fail) => {
    const ff = spawn(
      ffmpegPath,
      [
        '-hide_banner', '-loglevel', 'error', '-y',
        '-f', 'f32le', '-ar', String(SAMPLE_RATE), '-ac', '1', '-i', 'pipe:0',
        '-c:a', 'aac', '-b:a', BITRATE, '-movflags', '+faststart',
        join(outDir, file)
      ],
      { stdio: ['pipe', 'ignore', 'pipe'] }
    );
    let err = '';
    ff.stderr.on('data', d => { err += d; });
    ff.on('close', code => (code === 0 ? ok() : fail(new Error(err || `ffmpeg exited ${code}`))));
    ff.stdin.on('error', () => {});
    ff.stdin.end(Buffer.from(samples.buffer, samples.byteOffset, samples.byteLength));
  });
}

// ---------- render loop ----------

const started = Date.now();
const encoding = new Set();
/** which carrier each sound was finally cut from, for the review page */
const madeFrom = existsSync(join(outDir, '.sources.json')) ? JSON.parse(readFileSync(join(outDir, '.sources.json'), 'utf8')) : {};
let done = 0;
let failed = 0;

for (const job of todo) {
  try {
    let shaped;
    if (job.recorded) {
      // a person saying "mmmm" has already held it: a recording is trimmed
      // and levelled to sit with the rest, and nothing more
      shaped = normalize(trimSilence(decodeFile(job.recorded)).slice(), { targetDb: job.tune.targetDb ?? -20 });
      if (job.kind === 'sound') madeFrom[job.unit] = 'recording';
    } else if (job.kind === 'sound') {
      const made = await renderSound(job.id, say, job.tune);
      shaped = made.samples;
      madeFrom[job.unit] = made.carrier;
    } else {
      const raw = await tts.generate(job.said, { voice: VOICE, speed: job.speed });
      shaped = shapeClip(raw.audio, job.tune);
    }

    // keep a few encoders busy without letting the queue grow unbounded
    const task = encode(shaped, job.file)
      .then(() => { cache[cacheKey(job)] = job.fingerprint; })
      .catch(e => { failed += 1; console.warn(`  ! encode ${cacheKey(job)}: ${e.message}`); })
      .finally(() => encoding.delete(task));
    encoding.add(task);
    if (encoding.size >= 4) await Promise.race(encoding);
  } catch (e) {
    failed += 1;
    console.warn(`\n  ! ${cacheKey(job)}: ${e.message}`);
  }

  done += 1;
  if (done % 25 === 0 || done === todo.length) {
    const per = (Date.now() - started) / done;
    const left = ((todo.length - done) * per) / 1000;
    process.stdout.write(
      `\r  ${done}/${todo.length}  ${((done / todo.length) * 100).toFixed(0)}%  ~${left.toFixed(0)}s left   `
    );
  }
}

await Promise.all(encoding);
process.stdout.write('\n');

writeFileSync(cachePath, JSON.stringify(cache, null, 0));
writeFileSync(join(outDir, '.sources.json'), JSON.stringify(madeFrom, null, 1));
writeManifest();
writeReview();
pruneOrphans();

const bytes = readdirSync(outDir)
  .filter(f => f.endsWith('.m4a'))
  .reduce((a, f) => a + statSync(join(outDir, f)).size, 0);

console.log(`• done: ${done - failed} rendered, ${failed} failed`);
console.log(`• ${(bytes / 1024 / 1024).toFixed(2)} MB on disk`);
console.log(`• review: npm run dev  →  /voice/${VOICE}/review.html`);
if (failed) process.exitCode = 1;

// ---------- outputs ----------

function writeManifest() {
  const map = {};
  for (const [key, job] of routes) if (existsSync(join(outDir, job.file))) map[key] = job.file;
  writeFileSync(
    join(outDir, 'manifest.json'),
    JSON.stringify({ voice: VOICE, format: 'm4a', sampleRate: SAMPLE_RATE, generated: new Date().toISOString(), clips: map })
  );
  console.log(`• manifest: ${Object.keys(map).length} keys → ${new Set(Object.values(map)).size} files`);
}

/** Files from a vocabulary that no longer exists, so the folder stays honest. */
function pruneOrphans() {
  const keep = new Set(jobs.map(j => j.file));
  let removed = 0;
  for (const f of readdirSync(outDir)) {
    if (f.endsWith('.m4a') && !keep.has(f)) {
      rmSync(join(outDir, f));
      removed += 1;
    }
  }
  if (removed) console.log(`• pruned ${removed} orphaned clips`);
}

/** A page for listening to every sound and finding the ones still wrong. */
function writeReview() {
  const sources = existsSync(join(outDir, '.sources.json')) ? JSON.parse(readFileSync(join(outDir, '.sources.json'), 'utf8')) : {};
  const rows = [];
  for (const job of soundJobs.values()) {
    rows.push({
      k: 'sound',
      v: job.keys.join(' · '),
      m: job.recorded ? 'recording' : SOUNDS[job.id].method,
      s: job.recorded ? '' : sources[job.unit] ?? '',
      id: job.recorded ? '' : job.id,
      f: job.file,
      t: job.tune
    });
  }
  for (const job of jobs) {
    if (job.kind === 'sound' || job.bucket !== 'normal') continue;
    rows.push({ k: job.kind, v: job.clip.value, m: '', s: '', id: '', f: job.file, t: job.tune });
  }
  rows.sort((a, b) => a.k.localeCompare(b.k) || a.v.localeCompare(b.v));

  writeFileSync(
    join(outDir, 'review.html'),
    `<!doctype html><meta charset="utf-8"><title>Ms. Luna voice review — ${VOICE}</title>
<style>
 :root{color-scheme:light dark}
 body{font:14px/1.5 system-ui,sans-serif;margin:0;padding:24px;max-width:1000px}
 h1{font-size:19px;margin:0 0 4px}
 p.sub{color:#888;margin:0 0 20px}
 .bar{position:sticky;top:0;background:Canvas;padding:10px 0;border-bottom:1px solid #8884;margin-bottom:12px;display:flex;gap:8px;flex-wrap:wrap}
 button{font:inherit;padding:5px 11px;border:1px solid #8886;border-radius:7px;background:transparent;cursor:pointer}
 button:hover{background:#8882}
 table{border-collapse:collapse;width:100%}
 td,th{text-align:left;padding:5px 9px;border-bottom:1px solid #8883;vertical-align:middle}
 th{font-size:11px;text-transform:uppercase;letter-spacing:.05em;color:#888}
 code{font:12px ui-monospace,monospace;background:#8881;padding:1px 5px;border-radius:4px}
 .v{font-weight:600}
 .tune{color:#888;font:11px ui-monospace,monospace}
</style>
<h1>Ms. Luna voice review — ${VOICE}</h1>
<p class="sub">Every phonics sound, and every word and sentence at Normal speed. Each sound is cut from the
word in the “from” column. To change one, add an entry to <code>scripts/voice/overrides.json</code> keyed by its id
(e.g. <code>"sound|m": { "holdMs": 800 }</code>) and run <code>npm run voice:render -- --only sound</code>.</p>
<div class="bar">
 <button onclick="playKind('sound')">▶ all phonics sounds</button>
 <button onclick="playKind('name')">▶ all letter names</button>
 <button onclick="filt('')">show everything</button>
 <button onclick="filt('sound')">sounds only</button>
 <button onclick="filt('word')">words only</button>
 <button onclick="filt('text')">prose only</button>
</div>
<table><thead><tr><th></th><th>kind</th><th>value</th><th>id</th><th>made by</th><th>from</th><th>tuning</th></tr></thead><tbody id=b></tbody></table>
<script>
const rows=${JSON.stringify(rows)};
const b=document.getElementById('b');
let only='';
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function render(){
 b.innerHTML='';
 for(const r of rows){
  if(only&&r.k!==only)continue;
  const tr=document.createElement('tr');
  tr.innerHTML='<td><button data-f="'+esc(r.f)+'">▶</button></td><td>'+esc(r.k)+'</td><td class=v>'+esc(r.v)+
   '</td><td><code>'+esc(r.id)+'</code></td><td>'+esc(r.m)+'</td><td>'+esc(r.s)+'</td><td class=tune>'+
   (Object.keys(r.t).length?esc(JSON.stringify(r.t)):'')+'</td>';
  b.appendChild(tr);
 }
}
function filt(k){only=k;render()}
let audio=new Audio();
b.addEventListener('click',e=>{
 const f=e.target.dataset&&e.target.dataset.f;
 if(!f)return;
 audio.pause();audio=new Audio(f);audio.play();
});
async function playKind(k){
 for(const r of rows.filter(r=>r.k===k)){
  await new Promise(done=>{const a=new Audio(r.f);a.onended=done;a.onerror=done;a.play()});
  await new Promise(r=>setTimeout(r,180));
 }
}
render();
</script>`
  );
}
