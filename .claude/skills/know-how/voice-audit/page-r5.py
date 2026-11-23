# Adds round 5 (VOX-8: the other 51 sounds) to the Sound Check page.
#   python3 patch_page5.py <index.html> <r5-cards.json>
import json, sys

p = sys.argv[1]
s = open(p, encoding='utf-8').read()
cards = json.load(open(sys.argv[2]))


def rep(a, b):
    global s
    assert s.count(a) == 1, (s.count(a), a[:80])
    s = s.replace(a, b)


rep("voice audit · round 4 added 22 November 2026</span>", "voice audit · round 5 added 22 November 2026</span>")
rep("""<p class="lede"><b>New: round 4</b>, your own takes of the 8 sounds that had no pick, in Luna's voice. It's the first tab. The other tabs keep rounds 1 to 3 and your picks there.</p>""",
    """<p class="lede"><b>New: round 5</b>, the other 51 sounds from your recordings, in Luna's voice. It's the first tab, in six groups. Round 4 and rounds 1 to 3 keep their tabs and your picks.</p>""")

rep("""<button class="tab" role="tab" data-tab="r4" aria-selected="true">""",
    """<button class="tab" role="tab" data-tab="r5" aria-selected="true">Round 5: the rest <span class="count" id="c-r5"></span></button>
    <button class="tab" role="tab" data-tab="r4" aria-selected="false">""")
rep("""  <section id="p-r4" role="tabpanel">""", """  <section id="p-r5" role="tabpanel">
    <div class="verdict">
      <h2>Round 5: the other 51 sounds, in Luna's voice</h2>
      <p>You recorded every other sound three times, and the word sounded out, and each take was converted into Luna's voice the same way as round 4. Your own recordings stay on your Mac.</p>
      <ul>
        <li><b>Six groups, one at a time,</b> each with its own bar. Picks save as you go, so it can take a few sittings.</li>
        <li>Each card starts with <b>what the app plays today</b>, then your three takes as Luna. Press <b>Best</b> on the one that sounds like a teacher, or <b>None are right</b> with a note.</li>
        <li>The breathy sounds (p, t, k, ch, x, h, s, sh, f, sk, sp, st) also have <b>your own takes, as you said them</b>. A breath carries almost no voice, and in round 4 your own TH beat the converted ones.</li>
        <li><b>Sounding out the word</b> is there to hear the sound in a word. It isn't for picking.</li>
      </ul>
    </div>
    <nav class="buckets" id="r5-groups" aria-label="Round 5 groups"></nav>
    <div id="r5"></div>
  </section>
  <section id="p-r4" role="tabpanel" hidden>""")

rep("""</style>
<div class="wrap">""", """.buckets { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 170px), 1fr)); gap: 8px; margin-bottom: 18px }
.bucket { font: 700 15px/1.2 var(--font-read); color: var(--ink); background: var(--card); border: 1px solid var(--edge); border-radius: 14px; padding: 10px 12px; cursor: pointer; display: grid; gap: 6px; text-align: left }
.bucket[aria-pressed="true"] { border-color: var(--button); box-shadow: inset 0 0 0 1px var(--button) }
.bucket-top { display: flex; justify-content: space-between; gap: 8px }
.bucket-count { font-weight: 400; color: var(--quiet); font-variant-numeric: tabular-nums }
.bar { height: 8px; border-radius: 999px; background: var(--edge); overflow: hidden }
.bar > span { display: block; height: 100%; background: var(--right); border-radius: 999px }
.next-group { justify-self: start }
</style>
<div class="wrap">""")

rep('let AUDIO_R4 = null;', 'let AUDIO_R4 = null;\nlet AUDIO_R5 = null;')
rep("const raw = (AUDIO && AUDIO[id]) || (AUDIO_R4 && AUDIO_R4[id]);",
    "const raw = (AUDIO && AUDIO[id]) || (AUDIO_R4 && AUDIO_R4[id]) || (AUDIO_R5 && AUDIO_R5[id]);")

# the short vowels and X had no card before, so no symbol either
rep("  ng: ['/ng/', 'NG, as in ring'], kw: ['/kw/', 'Q · QU, as in queen']\n};",
    "  ng: ['/ng/', 'NG, as in ring'], kw: ['/kw/', 'Q · QU, as in queen'],\n"
    "  a: ['/ă/', 'A, as in apple'], e: ['/ĕ/', 'E, as in egg'], i: ['/ĭ/', 'I, as in igloo'], o: ['/ŏ/', 'O, as in octopus'], u: ['/ŭ/', 'U, as in umbrella'],\n"
    "  ks: ['/ks/', 'X, as in fox']\n};")

r5 = [[c['sid'], c['word'], c['group'], c['held'], c['breath']] for c in cards]
rep('function build() {', '''const R5 = ''' + json.dumps(r5) + r''';
const R5_GROUPS = [['short', 'Short vowels'], ['long', 'Long and R vowels'], ['quick', 'Quick sounds'], ['held', 'Held sounds'], ['lr', 'L and R blends'], ['s', 'S and W blends']];
const R5_KEY = 'luna-sound-check-r5-group';
let r5Group = 'short';
try { const g = localStorage.getItem(R5_KEY); if (R5_GROUPS.some(([id]) => id === g)) r5Group = g; } catch { /* a private window: start on the first group */ }
function r5Take(sid, take, label, small, pickable = true) {
  return `<div class="take" data-take="${esc(take)}">
      <button class="play" data-clip="r5:${esc(sid)}:${esc(take)}" aria-label="Play ${esc(label)}">${PLAY}</button>
      <span class="label">${esc(label)}${small ? `<small>${esc(small)}</small>` : ''}</span>
      ${pickable ? `<button class="pick" data-item="r5:${esc(sid)}" data-choice="${esc(take)}">Best</button>` : '<span></span>'}</div>`;
}
function r5Card([sid, word, , held, breath]) {
  const info = SOUND_INFO[sid] || [`/${sid}/`, ''];
  const item = `r5:${sid}`;
  const takes = [
    r5Take(sid, 'today', 'In the app today', 'what Luna says now'),
    ...[1, 2, 3].map(n => r5Take(sid, `luna${n}`, `Your take ${n}, as Luna`, '')),
    ...(breath ? [1, 2, 3].map(n => r5Take(sid, `his${n}`, `Your take ${n}, as you said it`, 'a breath: almost no voice')) : []),
    r5Take(sid, 'lunaword', `Sounding out “${word}”, as Luna`, 'to hear it in a word', false)
  ].join('');
  return `<article class="card" data-item="${item}">
    <div class="card-head"><span class="sym">${esc(info[0])}</span><span class="letters">${esc(info[1])} · ${held ? 'held' : 'quick'}</span></div>
    <div class="takes">${takes}</div>
    <div class="row"><button class="chip none" data-item="${item}" data-choice="none" aria-pressed="false">None are right</button></div>
    <textarea class="note" id="note-${esc(item)}" data-item="${item}" rows="1" placeholder="What's off? (optional)"></textarea>
  </article>`;
}
function r5Show(group) {
  r5Group = group;
  try { localStorage.setItem(R5_KEY, group); } catch { /* a private window: the group isn't remembered */ }
  const at = R5_GROUPS.findIndex(([id]) => id === group);
  const next = R5_GROUPS[at + 1];
  document.getElementById('r5').innerHTML = `<div class="group"><h3>${esc(R5_GROUPS[at][1])}</h3>${R5.filter(r => r[2] === group).map(r5Card).join('')}`
    + (next ? `<button class="chip next-group" data-r5group="${next[0]}">Next: ${esc(next[1])} →</button>` : '') + '</div>';
  for (const [item, p] of Object.entries(picks)) if (item.startsWith('r5:')) paint(item, p);
  r5Bars();
}
function r5Bars() {
  document.getElementById('r5-groups').innerHTML = R5_GROUPS.map(([id, label]) => {
    const all = R5.filter(r => r[2] === id); const done = all.filter(([sid]) => picks[`r5:${sid}`]?.choice).length;
    return `<button class="bucket" data-r5group="${id}" aria-pressed="${id === r5Group}">
      <span class="bucket-top"><span>${esc(label)}</span><span class="bucket-count">${done}/${all.length}</span></span>
      <span class="bar" role="progressbar" aria-label="${esc(label)} picked" aria-valuemin="0" aria-valuemax="${all.length}" aria-valuenow="${done}"><span style="width:${Math.round(done / all.length * 100)}%"></span></span></button>`;
  }).join('');
}
document.addEventListener('click', e => {
  const b = e.target.closest('[data-r5group]'); if (!b) return;
  r5Show(b.dataset.r5group);
  if (!b.classList.contains('next-group')) return;
  // back up to the group bars, just under the sticky tabs
  const bars = document.getElementById('r5-groups'); const tabs = document.querySelector('.tabs');
  window.scrollTo({ top: bars.getBoundingClientRect().top + window.scrollY - tabs.offsetHeight - 8 });
});
function build() {
  r5Show(r5Group);''')

rep("""  document.getElementById('c-r4').textContent""",
    """  document.getElementById('c-r5').textContent = `${R5.filter(([sid]) => picks[`r5:${sid}`]?.choice).length}/${R5.length}`;
  if (document.getElementById('r5-groups').childElementCount) r5Bars();
  document.getElementById('c-r4').textContent""")

# open on round 5 the first time, then wherever he was
rep("try { localStorage.setItem(LOCAL + '-tab4', tab.dataset.tab); } catch {}",
    "try { localStorage.setItem(LOCAL + '-tab5', tab.dataset.tab); } catch {}")
rep("try { const t = localStorage.getItem(LOCAL + '-tab4'); if (t)",
    "try { const t = localStorage.getItem(LOCAL + '-tab5'); if (t)")

rep("fetch('audio-r4.json')",
    "fetch('audio-r5.json').then(r => r.json()).then(a => { AUDIO_R5 = a; }).catch(() => {});\nfetch('audio-r4.json')")

open(p, 'w', encoding='utf-8').write(s)
print('patched', len(s))
