# Adds round 6 (VOX-8: new candidates for the sounds round 5 found no take
# for) to a copy of the Sound Check page, after page-r5.py. Read the artifact
# first; patch the copy; check it with page-r5-check.mjs's way; publish.
#   python3 page-r6.py <index.html> <round6.json>
# round6.json is make-r6.py's: [{ sid, word, group, takes: [{ id, label, small, pick? }] }].
# Clips are r6:<sid>:<take id> in audio-r6.json (pack-round.py), picks r6:<sid>.
# Run again with a new round6.json and it only swaps the cards (R6 = …).
import json, re, sys

p = sys.argv[1]
s = open(p, encoding='utf-8').read()
cards = [{'sid': c['sid'], 'word': c['word'], 'group': c['group'], 'title': c.get('title', ''), 'sub': c.get('sub', ''),
          'takes': [[t['id'], t['label'], t.get('small', ''), t.get('pick', True)] for t in c['takes']]}
         for c in json.load(open(sys.argv[2]))]
data = 'const R6 = ' + json.dumps(cards, ensure_ascii=False) + ';'

if 'const R6 = ' in s:
    s = re.sub(r'const R6 = .*?;\n', lambda m: data + '\n', s, count=1)
    open(p, 'w', encoding='utf-8').write(s)
    sys.exit(f'swapped the cards: {len(cards)}')


def rep(a, b):
    global s
    assert s.count(a) == 1, (s.count(a), a[:80])
    s = s.replace(a, b)


rep("voice audit · round 5 added 22 November 2026</span>", "voice audit · round 6 added 23 November 2026</span>")
rep("""<p class="lede"><b>New: round 5</b>, the other 51 sounds from your recordings, in Luna's voice. It's the first tab, in six groups. Round 4 and rounds 1 to 3 keep their tabs and your picks.</p>""",
    """<p class="lede"><b>New: round 6</b>, new tries at the sounds round 5 found no take for. It's the first tab. Rounds 1 to 5 keep their tabs and your picks.</p>""")
rep("""<button class="tab" role="tab" data-tab="r5" aria-selected="true">""",
    """<button class="tab" role="tab" data-tab="r6" aria-selected="true">Round 6: second tries <span class="count" id="c-r6"></span></button>
    <button class="tab" role="tab" data-tab="r5" aria-selected="false">""")
rep("""  <section id="p-r5" role="tabpanel">""", """  <section id="p-r6" role="tabpanel">
    <div class="verdict">
      <h2>Round 6: second tries</h2>
      <p>Your R is a clear R in your own takes, but the converter flattens it, so Luna's takes in round 5 had "no R". Each R card now has:</p>
      <ul>
        <li><b>Your takes raised, then as Luna:</b> your take pitched up before converting, which keeps more of the R.</li>
        <li><b>Cut from the word:</b> the start of the word you sounded out, as Luna (crab, drum and frog were "almost").</li>
        <li><b>Your take, made higher</b> (your voice, not converted) and <b>your take as you said it</b>, in case only your own R will do.</li>
      </ul>
      <p>SM and PL have the cut from "smile" and "plum" against what the app plays today. E, I, V and Z are your new takes, and the letter names are new too: each card starts with what the app says today. One group at a time, each with its bar. Press <b>Best</b>, or <b>None are right</b> with a note.</p>
    </div>
    <nav class="buckets" id="r6-groups" aria-label="Round 6 groups"></nav>
    <div id="r6"></div>
  </section>
  <section id="p-r5" role="tabpanel" hidden>""")

rep('let AUDIO_R5 = null;', 'let AUDIO_R5 = null;\nlet AUDIO_R6 = null;')
rep("|| (AUDIO_R5 && AUDIO_R5[id]);", "|| (AUDIO_R5 && AUDIO_R5[id]) || (AUDIO_R6 && AUDIO_R6[id]);")

rep('function build() {', data + r'''
const R6_GROUPS = [['r', 'R and its blends'], ['s', 'S and L blends'], ['again', 'Recorded again'], ['n1', 'Names A to I'], ['n2', 'Names J to R'], ['n3', 'Names S to Z'], ['n4', 'Names of letter pairs']];
const R6_KEY = 'luna-sound-check-r6-group';
let r6Group = 'r';
try { const g = localStorage.getItem(R6_KEY); if (R6_GROUPS.some(([id]) => id === g)) r6Group = g; } catch { /* a private window: start on the first group */ }
const r6Shown = () => R6_GROUPS.filter(([g]) => R6.some(c => c.group === g));
function r6Show(group) {
  const shown = r6Shown();
  if (!shown.some(([g]) => g === group)) group = shown[0][0];
  r6Group = group;
  try { localStorage.setItem(R6_KEY, group); } catch { /* a private window: the group isn't remembered */ }
  const at = shown.findIndex(([g]) => g === group); const next = shown[at + 1];
  document.getElementById('r6').innerHTML = `<div class="group"><h3>${esc(shown[at][1])}</h3>${R6.filter(c => c.group === group).map(r6Card).join('')}`
    + (next ? `<button class="chip next-group" data-r6group="${next[0]}">Next: ${esc(next[1])} →</button>` : '') + '</div>';
  for (const [item, p] of Object.entries(picks)) if (item.startsWith('r6:')) paint(item, p);
  r6Bars();
}
function r6Bars() {
  document.getElementById('r6-groups').innerHTML = r6Shown().map(([id, label]) => {
    const all = R6.filter(c => c.group === id); const done = all.filter(c => picks[`r6:${c.sid}`]?.choice).length;
    return `<button class="bucket" data-r6group="${id}" aria-pressed="${id === r6Group}">
      <span class="bucket-top"><span>${esc(label)}</span><span class="bucket-count">${done}/${all.length}</span></span>
      <span class="bar" role="progressbar" aria-label="${esc(label)} picked" aria-valuemin="0" aria-valuemax="${all.length}" aria-valuenow="${done}"><span style="width:${Math.round(done / all.length * 100)}%"></span></span></button>`;
  }).join('');
}
document.addEventListener('click', e => {
  const b = e.target.closest('[data-r6group]'); if (!b) return;
  r6Show(b.dataset.r6group);
  if (!b.classList.contains('next-group')) return;
  // back up to the group bars, just under the sticky tabs
  const bars = document.getElementById('r6-groups'); const tabs = document.querySelector('.tabs');
  window.scrollTo({ top: bars.getBoundingClientRect().top + window.scrollY - tabs.offsetHeight - 8 });
});
function r6Card(c) {
  const info = c.title ? [c.title, c.sub] : (SOUND_INFO[c.sid] || [`/${c.sid}/`, '']);
  const item = `r6:${c.sid}`;
  const takes = c.takes.map(([id, label, small, pick]) => `<div class="take" data-take="${esc(id)}">
      <button class="play" data-clip="r6:${esc(c.sid)}:${esc(id)}" aria-label="Play ${esc(label)}">${PLAY}</button>
      <span class="label">${esc(label)}${small ? `<small>${esc(small)}</small>` : ''}</span>
      ${pick ? `<button class="pick" data-item="${item}" data-choice="${esc(id)}">Best</button>` : '<span></span>'}</div>`).join('');
  return `<article class="card" data-item="${item}">
    <div class="card-head"><span class="sym">${esc(info[0])}</span><span class="letters">${esc(info[1])}</span></div>
    <div class="takes">${takes}</div>
    <div class="row"><button class="chip none" data-item="${item}" data-choice="none" aria-pressed="false">None are right</button></div>
    <textarea class="note" id="note-${esc(item)}" data-item="${item}" rows="1" placeholder="What's off? (optional)"></textarea>
  </article>`;
}
function build() {
  r6Show(r6Group);''')

rep("""  document.getElementById('c-r5').textContent""",
    """  document.getElementById('c-r6').textContent = `${R6.filter(c => picks[`r6:${c.sid}`]?.choice).length}/${R6.length}`;
  if (document.getElementById('r6-groups').childElementCount) r6Bars();
  document.getElementById('c-r5').textContent""")
rep("try { localStorage.setItem(LOCAL + '-tab5', tab.dataset.tab); } catch {}",
    "try { localStorage.setItem(LOCAL + '-tab6', tab.dataset.tab); } catch {}")
rep("try { const t = localStorage.getItem(LOCAL + '-tab5'); if (t)",
    "try { const t = localStorage.getItem(LOCAL + '-tab6'); if (t)")
rep("fetch('audio-r5.json')",
    "fetch('audio-r6.json').then(r => r.json()).then(a => { AUDIO_R6 = a; }).catch(() => {});\nfetch('audio-r5.json')")

open(p, 'w', encoding='utf-8').write(s)
print('patched', len(s))
