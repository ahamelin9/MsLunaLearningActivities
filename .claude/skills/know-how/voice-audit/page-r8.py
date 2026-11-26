# Adds round 8 (VOX-10: every recorded sound at Luna's pitch) to a copy of
# the Sound Check page that has round 7 (page-r7.py). Cards drawn by round
# 6's r6Card under the r8 prefix: picks r8:<sid>, clips r8:<sid>:<take id> in
# audio-r8.json (pack-round.py … r8 …). Six groups, one at a time, each with
# its bar, a "hear the group in a row" for each version (the point is that
# the sounds sound like one voice), a button that picks B on every card of
# the group not picked yet, and one question: r8:q:row (today / a / b).
#   python3 page-r8.py <index.html> <round8.json>
import json, sys

p = sys.argv[1]
s = open(p, encoding='utf-8').read()
cards = [{'sid': c['sid'], 'word': c['word'], 'group': c['group'], 'title': c.get('title', ''), 'sub': c.get('sub', ''),
          'keys': c['keys'], 'takes': [[t['id'], t['label'], t.get('small', ''), True] for t in c['takes']]}
         for c in json.load(open(sys.argv[2]))]


def rep(a, b):
    global s
    assert s.count(a) == 1, (s.count(a), a[:80])
    s = s.replace(a, b)


# on a phone the wrapped tabs grew to half the screen and sat over the cards
# as it scrolled: one row that scrolls sideways under 700px
rep(".tab[aria-selected=\"true\"] { background: var(--button);",
    "@media (max-width: 700px) { .tabs { flex-wrap: nowrap; overflow-x: auto; scrollbar-width: none; align-items: center } .tab, .tabs .status { flex: none; white-space: nowrap } }\n.tab[aria-selected=\"true\"] { background: var(--button);")
rep("voice audit · round 7 added 23 November 2026</span>", "voice audit · round 8 added 23 November 2026</span>")
rep("""<p class="lede"><b>New: round 7</b>, your new ER, CR and DR. It's the first tab. Rounds 1 to 6 keep their tabs and your picks.</p>""",
    """<p class="lede"><b>New: round 8</b>, every sound at Luna's pitch. It's the first tab. Rounds 1 to 7 keep their tabs and your picks.</p>""")
rep("""<button class="tab" role="tab" data-tab="r7" aria-selected="true">""",
    """<button class="tab" role="tab" data-tab="r8" aria-selected="true">Round 8: at her pitch <span class="count" id="c-r8"></span></button>
    <button class="tab" role="tab" data-tab="r7" aria-selected="false">""")
rep("""  <section id="p-r7" role="tabpanel">""", """  <section id="p-r8" role="tabpanel">
    <div class="verdict">
      <h2>Round 8: every sound at Luna's pitch</h2>
      <p>Most of the sounds sat 2 to 4 semitones under Luna's own words, and some well above, which is what made a few sound like another voice. Each card has the same take of yours you picked, in two new versions at her pitch:</p>
      <ul>
        <li><b>At her pitch, converted again:</b> your take raised before converting, then evened to her pitch. A fresh conversion, so it can sound a little different.</li>
        <li><b>At her pitch, today's clip:</b> what the app plays now, with only its pitch moved. It keeps the R and the vowel best.</li>
      </ul>
      <p><b>New: one pass.</b> The first five words (ship, fish, map, frog, kite) have a fourth version: all their sounds converted together in one go, so the converter makes one guess at Luna's voice for all of them instead of one per sound. Measured, it's the most alike of the four. If it wins your ear, every sound gets made this way.</p>
      <p><b>Start with the words.</b> Each is sounded out the way a lesson does it, every sound and then the word, today's against each version, so you hear the sounds next to each other (and next to her word) the way you noticed it in "ship". F is also back to the loudness of the others (it was 8 dB quieter, left over from the old synthetic F). Press <b>Best</b> on the one that sounds most like one teacher.</p>
      <p>Then the sounds themselves, group by group. Z also has a version cut from "zoo", since today's Z is a whisper. <b>Hear the group in a row</b>: today's, then each version, to hear which sounds like one voice. Then press <b>Best</b> on each card, or <b>B on the rest</b> to pick today's-clip-at-her-pitch on every card you haven't picked.</p>
    </div>
    <article class="card question" data-item="r8:q:row">
      <div class="card-head"><span class="sym">One voice?</span><span class="letters">After hearing the groups in a row, which sounds most like one teacher?</span></div>
      <div class="row">
        <button class="chip" data-item="r8:q:row" data-choice="today" aria-pressed="false">Today's</button>
        <button class="chip" data-item="r8:q:row" data-choice="a" aria-pressed="false">Converted again</button>
        <button class="chip" data-item="r8:q:row" data-choice="b" aria-pressed="false">Today's clip at her pitch</button>
        <button class="chip" data-item="r8:q:row" data-choice="same" aria-pressed="false">Can't tell</button>
      </div>
    </article>
    <nav class="buckets" id="r8-groups" aria-label="Round 8 groups"></nav>
    <div id="r8"></div>
  </section>
  <section id="p-r7" role="tabpanel" hidden>""")
rep('let AUDIO_R7 = null;', 'let AUDIO_R7 = null;\nlet AUDIO_R8 = null;')
rep("|| (AUDIO_R7 && AUDIO_R7[id]);", "|| (AUDIO_R7 && AUDIO_R7[id]) || (AUDIO_R8 && AUDIO_R8[id]);")
rep("function build() {\n", "const R8 = " + json.dumps(cards, ensure_ascii=False) + """;
const R8_GROUPS = [['words', 'Words sounded out'], ['short', 'Short vowels'], ['long', 'Long vowels'], ['consonant', 'Consonants'], ['blend', 'Blends'], ['n1', 'Letter names A to M'], ['n2', 'Letter names N to Z, and pairs']];
const R8_KEY = 'luna-sound-check-r8-group';
let r8Group = 'words';
try { const g = localStorage.getItem(R8_KEY); if (R8_GROUPS.some(([id]) => id === g)) r8Group = g; } catch { /* a private window: start on the first group */ }
const R8_ROW = [['today', "Today's"], ['a', 'Converted again'], ['b', "Today's clip at her pitch"], ['p', 'One pass']];
function r8Show(group) {
  r8Group = group;
  try { localStorage.setItem(R8_KEY, group); } catch { /* a private window: the group isn't remembered */ }
  const at = R8_GROUPS.findIndex(([g]) => g === group); const next = R8_GROUPS[at + 1];
  const rows = R8_ROW.filter(([v]) => v !== 'p' || R8.some(c => c.group === group && c.takes.some(t => t[0] === 'p'))).map(([v, label]) => `<button class="chip row-play" data-r8row="${v}">${PLAY} ${esc(label)}</button>`).join('');
  document.getElementById('r8').innerHTML = `<div class="group"><h3>${esc(R8_GROUPS[at][1])}</h3>
    <div class="row"><span class="letters">Hear the group in a row:</span> ${rows}</div>
    ${R8.filter(c => c.group === group).map(c => r6Card(c, 'r8')).join('')}
    <div class="row"><button class="chip" data-r8rest="${group}">B on the rest of this group</button></div>`
    + (next ? `<button class="chip next-group" data-r8group="${next[0]}">Next: ${esc(next[1])} →</button>` : '') + '</div>';
  for (const [item, p] of Object.entries(picks)) if (item.startsWith('r8:')) paint(item, p);
  r8Bars();
}
function r8Bars() {
  document.getElementById('r8-groups').innerHTML = R8_GROUPS.map(([id, label]) => {
    const all = R8.filter(c => c.group === id); const done = all.filter(c => picks[`r8:${c.sid}`]?.choice).length;
    return `<button class="bucket" data-r8group="${id}" aria-pressed="${id === r8Group}">
      <span class="bucket-top"><span>${esc(label)}</span><span class="bucket-count">${done}/${all.length}</span></span>
      <span class="bar" role="progressbar" aria-label="${esc(label)} picked" aria-valuemin="0" aria-valuemax="${all.length}" aria-valuenow="${done}"><span style="width:${Math.round(done / all.length * 100)}%"></span></span></button>`;
  }).join('');
}
let r8Run = 0;
function r8PlayRow(v, btn) {
  const run = ++r8Run;
  if (current) { current.pause(); if (currentBtn) currentBtn.dataset.playing = 'false'; }
  // each card's version, or today's where the card has none (E, OO, Z)
  // one pass is only on a few words: play just those, never today's in its place
  const ids = R8.filter(c => c.group === r8Group && (v !== 'p' || c.takes.some(t => t[0] === 'p'))).map(c => `r8:${c.sid}:${c.takes.some(t => t[0] === v) ? v : 'today'}`);
  btn.dataset.playing = 'true';
  const step = i => {
    if (run !== r8Run || i >= ids.length) { btn.dataset.playing = 'false'; return; }
    const url = clip(ids[i]); if (!url) return step(i + 1);
    current = new Audio(url); currentBtn = btn;
    const next = () => setTimeout(() => step(i + 1), 350);
    current.onended = next; current.onerror = next; current.play().catch(next);
  };
  step(0);
}
document.addEventListener('click', e => {
  const row = e.target.closest('[data-r8row]');
  if (row) { r8PlayRow(row.dataset.r8row, row); return; }
  const rest = e.target.closest('[data-r8rest]');
  if (rest) {
    for (const c of R8.filter(c => c.group === rest.dataset.r8rest)) {
      const item = `r8:${c.sid}`;
      if (picks[item]?.choice) continue;
      const choice = c.takes.some(t => t[0] === 'b') ? 'b' : c.takes.some(t => t[0] === 'c') ? 'c' : 'a';
      (picks[item] = picks[item] || {}).choice = choice;
      paint(item, picks[item]); save(item);
    }
    counts(); return;
  }
  const b = e.target.closest('[data-r8group]'); if (!b) return;
  r8Show(b.dataset.r8group);
  if (!b.classList.contains('next-group')) return;
  const bars = document.getElementById('r8-groups'); const tabs = document.querySelector('.tabs');
  window.scrollTo({ top: bars.getBoundingClientRect().top + window.scrollY - tabs.offsetHeight - 8 });
});
function build() {
  r8Show(r8Group);
""")
rep("  document.getElementById('c-r7').textContent", "  document.getElementById('c-r8').textContent = `${R8.filter(c => picks[`r8:${c.sid}`]?.choice).length}/${R8.length}`;\n  if (document.getElementById('r8-groups').childElementCount) r8Bars();\n  document.getElementById('c-r7').textContent")
rep("try { localStorage.setItem(LOCAL + '-tab7', tab.dataset.tab); } catch {}", "try { localStorage.setItem(LOCAL + '-tab8', tab.dataset.tab); } catch {}")
rep("try { const t = localStorage.getItem(LOCAL + '-tab7'); if (t)", "try { const t = localStorage.getItem(LOCAL + '-tab8'); if (t)")
rep("fetch('audio-r7.json')", "fetch('audio-r8.json').then(r => r.json()).then(a => { AUDIO_R8 = a; }).catch(() => {});\nfetch('audio-r7.json')")
open(p, 'w', encoding='utf-8').write(s)
print('patched', len(s))
