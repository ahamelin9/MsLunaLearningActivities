# Adds round 7 (VOX-8: ER, CR and DR recorded again) to a copy of the Sound
# Check page that already has round 6 (page-r6.py). Reuses round 6's card
# drawing with its own item prefix: picks r7:<sid>, clips r7:<sid>:<take id>
# in audio-r7.json (pack-round.py … r7 …).
#   python3 page-r7.py <index.html> <round7.json>
import json, sys

p = sys.argv[1]
s = open(p, encoding='utf-8').read()
cards = [{'sid': c['sid'], 'word': c['word'], 'group': c['group'], 'title': c.get('title', ''), 'sub': c.get('sub', ''),
          'takes': [[t['id'], t['label'], t.get('small', ''), t.get('pick', True)] for t in c['takes']]}
         for c in json.load(open(sys.argv[2]))]


def rep(a, b):
    global s
    assert s.count(a) == 1, (s.count(a), a[:80])
    s = s.replace(a, b)


rep("voice audit · round 6 added 23 November 2026</span>", "voice audit · round 7 added 23 November 2026</span>")
rep("""<p class="lede"><b>New: round 6</b>, new tries at the sounds round 5 found no take for. It's the first tab. Rounds 1 to 5 keep their tabs and your picks.</p>""",
    """<p class="lede"><b>New: round 7</b>, your new ER, CR and DR. It's the first tab. Rounds 1 to 6 keep their tabs and your picks.</p>""")
rep("""<button class="tab" role="tab" data-tab="r6" aria-selected="true">""",
    """<button class="tab" role="tab" data-tab="r7" aria-selected="true">Round 7: ER, CR, DR <span class="count" id="c-r7"></span></button>
    <button class="tab" role="tab" data-tab="r6" aria-selected="false">""")
rep("""  <section id="p-r6" role="tabpanel">""", """  <section id="p-r7" role="tabpanel">
    <div class="verdict">
      <h2>Round 7: ER, CR and DR, recorded again</h2>
      <p>Your new takes, with the crisp first sound and the long R. Each card has what the app plays today, your three new takes as Luna, the same raised before converting (which keeps more R), the start of the word, and your take made higher and as you said it. Press <b>Best</b>, or <b>None are right</b> with a note.</p>
    </div>
    <div id="r7"></div>
  </section>
  <section id="p-r6" role="tabpanel" hidden>""")
rep('let AUDIO_R6 = null;', 'let AUDIO_R6 = null;\nlet AUDIO_R7 = null;')
rep("|| (AUDIO_R6 && AUDIO_R6[id]);", "|| (AUDIO_R6 && AUDIO_R6[id]) || (AUDIO_R7 && AUDIO_R7[id]);")
# round 6's card, drawn under any round's prefix
rep("function r6Card(c) {", "function r6Card(c, rid = 'r6') {")
# a card list's map hands the index as the second argument: pass the card alone
rep(".map(r6Card).join('')", ".map(c => r6Card(c)).join('')")
rep("const item = `r6:${c.sid}`;\n  const takes = c.takes.map(([id, label, small, pick]) => `<div class=\"take\" data-take=\"${esc(id)}\">\n      <button class=\"play\" data-clip=\"r6:${esc(c.sid)}:${esc(id)}\"",
    "const item = `${rid}:${c.sid}`;\n  const takes = c.takes.map(([id, label, small, pick]) => `<div class=\"take\" data-take=\"${esc(id)}\">\n      <button class=\"play\" data-clip=\"${rid}:${esc(c.sid)}:${esc(id)}\"")
rep("function build() {\n  r6Show(r6Group);", "const R7 = " + json.dumps(cards, ensure_ascii=False) + ";\nfunction build() {\n  document.getElementById('r7').innerHTML = R7.map(c => r6Card(c, 'r7')).join('');\n  r6Show(r6Group);")
rep("  document.getElementById('c-r6').textContent", "  document.getElementById('c-r7').textContent = `${R7.filter(c => picks[`r7:${c.sid}`]?.choice).length}/${R7.length}`;\n  document.getElementById('c-r6').textContent")
rep("try { localStorage.setItem(LOCAL + '-tab6', tab.dataset.tab); } catch {}", "try { localStorage.setItem(LOCAL + '-tab7', tab.dataset.tab); } catch {}")
rep("try { const t = localStorage.getItem(LOCAL + '-tab6'); if (t)", "try { const t = localStorage.getItem(LOCAL + '-tab7'); if (t)")
rep("fetch('audio-r6.json')", "fetch('audio-r7.json').then(r => r.json()).then(a => { AUDIO_R7 = a; }).catch(() => {});\nfetch('audio-r6.json')")
open(p, 'w', encoding='utf-8').write(s)
print('patched', len(s))
