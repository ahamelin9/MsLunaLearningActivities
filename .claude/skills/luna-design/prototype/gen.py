"""Assembles the round 2 artboards from fragments in frag/.

Each fragment has three parts, split by marker lines:
    <!--CSS-->    board-only styles
    <!--BODY-->   the screen's markup (inside the themed screen div)
    <!--LOGIC-->  extra methods for the Component class; `extra(vals, s)` adds render values
Placeholders in BODY: %%OWL w [wings]%%, %%PLANT stage w h [svgclass] [headclass]%%.
Usage: python3 gen.py R2Look [R2Home ...]   (writes project/<name>.dc.html; check with check.py)
"""
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).parent
FRAG = ROOT / 'frag'
OUT = ROOT / 'project'

SCREENS = [
    ('R2Look', 'Round 2 · The look'),
    ('R2Home', 'Home · just the app, like today'),
    ('R2Library', 'Library · lessons in order, one bar'),
    ('R2Progress', 'Lesson progress · she picked One bar'),
    ('R2Round', 'A round · tap the letters and the ?'),
    ('R2Done', 'Lesson done · time and a new squishy'),
    ('R2Squishies', 'The squishy shelf · tap one'),
    ('R2Luna', 'Ms. Luna · the owl, and the milestone moon'),
]
JUMP = [('Look', 'R2Look'), ('Home', 'R2Home'), ('Library', 'R2Library'), ('Progress', 'R2Progress'),
        ('Round', 'R2Round'), ('Done', 'R2Done'), ('Squishies', 'R2Squishies'), ('Ms. Luna', 'R2Luna')]
WIDE = {'R2Luna', 'R2Progress'}

FONTS = '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Andika:wght@400;700&amp;family=Fraunces:opsz,wght,SOFT,WONK@9..144,300..900,0..100,0..1&amp;display=swap">'

TOKENS = """
.t-light {
  --bg: #F5EDE1; --dot: rgba(59, 42, 32, 0.05); --dot2: rgba(59, 42, 32, 0.035);
  --card: #FFFBF5; --edge: #E9DCC9; --well: #F5EDE1; --soil: #D9C4A6; --soil-dk: #C9AE8B;
  --ink: #3B2A20; --soft: #6E5747;
  --accent: #C4996A; --accent-ink: #3B2A20; --accent-edge: #9A6B45; --accent-soft: #F2E6D3; --accent-text: #6B4C35;
  --action: #9A6B45; --action-ink: #FFFFFF; --action-edge: #6B4C35;
  --right: #5C6849; --right-ink: #FFFFFF; --right-edge: #434C33; --right-soft: #E7EADF; --right-text: #4B5639; --right-glow: rgba(169, 179, 145, 0.45);
  --retry-soft: #F3E0D6; --retry-edge: #9A5A44; --retry-text: #7F4433;
  --rare-soft: #F3E0D6; --rare-edge: #C98E7B; --rare-text: #7F4433; --super-soft: #F3E3BC; --super-edge: #A9832F; --super-text: #6B4C35;
  --leaf: #A9B391; --stem: #5C6849; --petal: #FFFBF5; --petal-edge: #9A6B45; --seed: #7A5236;
  --tint-1: #E7EADF; --tint-2: #EFE3D1; --tint-3: #F2E6D3; --tint-4: #E9DCC9; --tint-5: #F3E3DA;
  --focus: #3B2A20; --shadow: rgba(59, 42, 32, 0.08); --shadow-lg: rgba(59, 42, 32, 0.16); --shine: rgba(255, 255, 255, 0.8);
}
.t-dark {
  --bg: #1E1813; --dot: rgba(255, 240, 220, 0.045); --dot2: rgba(255, 240, 220, 0.03);
  --card: #2A211B; --edge: #433629; --well: #352A21; --soil: #5A4636; --soil-dk: #6B5442;
  --ink: #F4EADC; --soft: #C9B6A1;
  --accent: #D9AE7C; --accent-ink: #1E1813; --accent-edge: #9C7651; --accent-soft: #3F3125; --accent-text: #E6C49A;
  --action: #D9AE7C; --action-ink: #1E1813; --action-edge: #9C7651;
  --right: #A9B88C; --right-ink: #1E1813; --right-edge: #6F7A57; --right-soft: #2F3527; --right-text: #C5D0AA; --right-glow: rgba(169, 184, 140, 0.3);
  --retry-soft: #46302A; --retry-edge: #D79C86; --retry-text: #EDBBA8;
  --rare-soft: #46302A; --rare-edge: #C98E7B; --rare-text: #EDBBA8; --super-soft: #3F3420; --super-edge: #C9A54A; --super-text: #E8CB8A;
  --leaf: #8E9A74; --stem: #A9B88C; --petal: #FBF3E6; --petal-edge: #C08A5A; --seed: #C08A5A;
  --tint-1: #2F3527; --tint-2: #352A21; --tint-3: #3F3125; --tint-4: #433629; --tint-5: #46302A;
  --focus: #F4EADC; --shadow: rgba(0, 0, 0, 0.3); --shadow-lg: rgba(0, 0, 0, 0.45); --shine: rgba(255, 255, 255, 0.35);
}
"""

BASE = """
body { margin: 0; font-family: 'Andika', sans-serif; }
.display { font-family: 'Fraunces', serif; font-variation-settings: 'SOFT' 100, 'WONK' 0; font-optical-sizing: auto; }
.ic { fill: none; stroke: currentColor; stroke-width: 2.2; stroke-linecap: round; stroke-linejoin: round; }
.screen { color: var(--ink); background-color: var(--bg); background-image: radial-gradient(var(--dot) 1px, transparent 1.2px), radial-gradient(var(--dot2) 1px, transparent 1.2px); background-size: 22px 22px, 31px 31px; background-position: 0 0, 11px 17px; transition: background-color 300ms ease, color 300ms ease; }
.press { cursor: pointer; font-family: 'Andika', sans-serif; color: var(--ink); text-decoration: none; transition: transform 120ms cubic-bezier(0.2, 0, 0, 1), box-shadow 120ms cubic-bezier(0.2, 0, 0, 1); }
.press:active { transform: translateY(3px); }
.press:focus-visible { outline: 3px solid var(--focus); outline-offset: 3px; }
.tap { background: none; border: none; padding: 0; cursor: pointer; font-family: 'Andika', sans-serif; color: var(--ink); }
.tap:focus-visible { outline: 3px solid var(--focus); outline-offset: 4px; border-radius: 20px; }
.bar { height: 64px; box-sizing: border-box; padding: 0 24px; display: flex; align-items: center; gap: 16px; background: var(--card); border-bottom: 2px solid var(--edge); position: relative; }
.btn { height: 48px; box-sizing: border-box; padding: 0 18px 0 14px; border-radius: 16px; border: 2px solid var(--edge); background: var(--card); box-shadow: 0 3px 0 var(--edge); display: flex; align-items: center; gap: 8px; font-size: 17px; font-weight: 700; }
.btn-action { border: none; background: var(--action); color: var(--action-ink); box-shadow: 0 5px 0 var(--action-edge); }
.panel { background: var(--card); border: 2px solid var(--edge); box-shadow: 0 3px 0 var(--edge); }
.lbl { font-size: 12px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--soft); }
.chip { height: 34px; padding: 0 12px 0 8px; border-radius: 999px; display: inline-flex; align-items: center; gap: 6px; font-size: 15px; font-weight: 700; white-space: nowrap; box-sizing: border-box; }
.chip-time { background: var(--well); color: var(--soft); }
.chip-took { background: var(--right-soft); color: var(--right-text); }
.chip-accent { background: var(--accent-soft); color: var(--accent-text); }
.soft { color: var(--soft); }
.ow-eyes { transform-box: fill-box; transform-origin: center; animation: blink 5.5s ease-in-out infinite; }
.ow-beak { transform-box: fill-box; transform-origin: 50% 0; }
.ow-wl { transform-box: fill-box; transform-origin: 100% 20%; animation: owWingL 3.4s ease-in-out infinite; }
.ow-wr { transform-box: fill-box; transform-origin: 0% 20%; animation: owWingR 3.4s ease-in-out infinite; }
@keyframes blink { 0%, 91%, 100% { transform: scaleY(1); } 94% { transform: scaleY(0.1); } 97% { transform: scaleY(1); } }
@keyframes owWingL { 0%, 100% { transform: rotate(0deg); } 50% { transform: rotate(10deg); } }
@keyframes owWingR { 0%, 100% { transform: rotate(0deg); } 50% { transform: rotate(-10deg); } }
@media (prefers-reduced-motion: reduce) { .ow-eyes, .ow-beak, .ow-wl, .ow-wr { animation: none !important; } .screen { transition: none; } }
"""

LZ = """
.lz-check { position: absolute; opacity: 0; width: 1px; height: 1px; pointer-events: none; }
.lz-vp { overflow: hidden; }
.lz-btn { background: #3B5BDB; }
.lz-on { display: none; }
.lz-check:checked ~ .lz-vp { overflow: auto; -webkit-overflow-scrolling: touch; overscroll-behavior: contain; touch-action: pan-x pan-y; }
.lz-check:checked ~ .lz-vp .lz-in { zoom: 2; }
.lz-check:checked ~ nav .lz-btn { background: #FFFFFF; color: #16161A !important; }
.lz-check:checked ~ nav .lz-on { display: inline; }
.lz-check:checked ~ nav .lz-off { display: none; }
.lz-check:focus-visible ~ nav .lz-btn { outline: 3px solid #FFFFFF; outline-offset: 2px; }
.theme-btn:focus-visible { outline: 3px solid #FFFFFF; outline-offset: 2px; }
"""

THEME_JS = """
  canvasTheme() {
    try {
      var t = document.documentElement.getAttribute('data-theme');
      if (t === 'dark' || t === 'light') return t;
    } catch (e) {}
    try {
      var q = new URLSearchParams(window.location.search).get('theme');
      if (q === 'dark' || q === 'light') return q;
    } catch (e) {}
    return null;
  }
  readDark() {
    var c = this.canvasTheme();
    if (c) return c === 'dark';
    try {
      var v = window.localStorage.getItem('luna-r2-theme');
      if (v === 'dark') return true;
      if (v === 'light') return false;
    } catch (e) {}
    try {
      return !!(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
    } catch (e) {
      return false;
    }
  }
  componentDidMount() {
    var self = this;
    this.onThemeMsg = function (e) {
      var d = e && e.data;
      if (d && d.type === '__dc_theme' && (d.theme === 'dark' || d.theme === 'light')) self.setState({ dark: d.theme === 'dark' });
    };
    window.addEventListener('message', this.onThemeMsg);
    try {
      this.themeObserver = new MutationObserver(function () {
        var c = self.canvasTheme();
        if (c) self.setState({ dark: c === 'dark' });
      });
      this.themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    } catch (e) {}
    try {
      this.themeQuery = window.matchMedia('(prefers-color-scheme: dark)');
      this.onThemeQuery = function (e) { self.setState({ dark: e.matches }); };
      this.themeQuery.addEventListener('change', this.onThemeQuery);
    } catch (e) {}
  }
  componentWillUnmount() {
    window.removeEventListener('message', this.onThemeMsg);
    try { this.themeObserver.disconnect(); } catch (e) {}
    try { this.themeQuery.removeEventListener('change', this.onThemeQuery); } catch (e) {}
    if (this.cleanup) this.cleanup();
  }
"""


def owl(w, wings=False):
    wl = ' class="ow-wl"' if wings else ''
    wr = ' class="ow-wr"' if wings else ''
    return f'''<svg width="{w}" height="{w}" viewBox="0 0 200 200">
<ellipse cx="100" cy="191" rx="50" ry="7" fill="#3B2A20" opacity="0.14"></ellipse>
<path d="M58 66 L50 28 L86 48 Z" fill="#A0744B" stroke="#A0744B" stroke-linejoin="round" style="stroke-width: 8;"></path>
<path d="M142 66 L150 28 L114 48 Z" fill="#A0744B" stroke="#A0744B" stroke-linejoin="round" style="stroke-width: 8;"></path>
<ellipse{wl} cx="40" cy="124" rx="14" ry="30" fill="#A0744B"></ellipse>
<ellipse{wr} cx="160" cy="124" rx="14" ry="30" fill="#A0744B"></ellipse>
<ellipse cx="100" cy="112" rx="66" ry="72" fill="#C4996A"></ellipse>
<ellipse cx="100" cy="150" rx="40" ry="30" fill="#F5E6CF"></ellipse>
<path d="M84 142 l6 6 6 -6 M104 142 l6 6 6 -6 M94 156 l6 6 6 -6" fill="none" stroke="#C4996A" stroke-linecap="round" stroke-linejoin="round" style="stroke-width: 3;"></path>
<circle cx="74" cy="94" r="21" fill="#FFFBF5"></circle>
<circle cx="126" cy="94" r="21" fill="#FFFBF5"></circle>
<g class="ow-eyes"><circle cx="76" cy="96" r="10" fill="#2A1E17"></circle><circle cx="124" cy="96" r="10" fill="#2A1E17"></circle><circle cx="79.5" cy="92" r="3.5" fill="#FFFFFF"></circle><circle cx="127.5" cy="92" r="3.5" fill="#FFFFFF"></circle></g>
<circle cx="74" cy="94" r="23" fill="none" stroke="#1E1916" style="stroke-width: 5;"></circle>
<circle cx="126" cy="94" r="23" fill="none" stroke="#1E1916" style="stroke-width: 5;"></circle>
<path d="M97 91 q3 -3 6 0 M51 90 l-11 -5 M149 90 l11 -5" fill="none" stroke="#1E1916" stroke-linecap="round" style="stroke-width: 5;"></path>
<ellipse cx="56" cy="124" rx="9" ry="5.5" fill="#E2B9A6"></ellipse>
<ellipse cx="144" cy="124" rx="9" ry="5.5" fill="#E2B9A6"></ellipse>
<path class="ow-beak" d="M92 116 h16 l-8 11 z" fill="#7A5236" stroke="#7A5236" stroke-linejoin="round" style="stroke-width: 3;"></path>
<ellipse cx="82" cy="186" rx="11" ry="6" fill="#7A5236"></ellipse>
<ellipse cx="118" cy="186" rx="11" ry="6" fill="#7A5236"></ellipse>
</svg>'''


ROSES = {
    'red': ('#C8323C', '#8E1F2A', '#A82732'),
    'blush': ('#EBA9AC', '#B5636A', '#D88C91'),
    'cream': ('#FBF1E2', '#B89A73', '#EEDDC4'),
    'coral': ('#F2A07E', '#B8644A', '#E38B68'),
    'yellow': ('#F2CB57', '#A9821E', '#E3B640'),
    'mauve': ('#B98585', '#7F4E50', '#A57172'),
}

SOIL = '<path d="M6 66 Q30 50 54 66 Z" style="fill: var(--soil);"></path>'


def stem(top):
    return f'<path d="M30 60 V{top}" style="fill: none; stroke: var(--stem); stroke-width: 3; stroke-linecap: round;"></path>'


LEAF_L = '<path d="M30 52 C22 52 18 46 18 42 C26 42 30 46 30 52 Z" style="fill: var(--leaf);"></path>'
LEAF_R = '<path d="M30 46 C38 46 42 40 42 36 C34 36 30 40 30 46 Z" style="fill: var(--leaf);"></path>'
SPROUT_L = '<path d="M30 47 C22 47 18 41 18 37 C26 37 30 41 30 47 Z" style="fill: var(--leaf);"></path>'
SPROUT_R = '<path d="M30 43 C38 43 42 37 42 33 C34 33 30 37 30 43 Z" style="fill: var(--leaf);"></path>'


def head(kind):
    if kind == 'daisy':
        petals = ''.join(
            f'<ellipse cx="30" cy="12" rx="4.5" ry="8" transform="rotate({a} 30 22)" style="fill: var(--petal); stroke: var(--petal-edge); stroke-width: 1.5;"></ellipse>'
            for a in (0, 60, 120, 180, 240, 300))
        return petals + '<circle cx="30" cy="22" r="6" fill="#C4996A" stroke="#7A5236" style="stroke-width: 1.5;"></circle>'
    if kind.startswith('rose') and not kind.startswith('rosebud'):
        fill, dark, front = ROSES[kind.split(':')[1] if ':' in kind else 'red']
        return (f'<path d="M30 31 C25 30 22 27 21 24 C25 27 27 28 30 28 C33 28 35 27 39 24 C38 27 35 30 30 31 Z" style="fill: var(--leaf);"></path>'
                f'<path d="M19 19 C17 10 23 4 30 4 C37 4 43 10 41 19 C40 26 35 30 30 30 C25 30 20 26 19 19 Z" fill="{fill}" stroke="{dark}" stroke-linejoin="round" style="stroke-width: 1.5;"></path>'
                f'<path d="M23 14 C24 9 34 8 36 13 C37 18 31 20 29 17 C27 14 31 12 33 14" fill="none" stroke="{dark}" stroke-linecap="round" style="stroke-width: 1.5;"></path>'
                f'<path d="M19 19 C22 26 27 29 30 30 C33 29 38 26 41 19 C37 23 33 24 30 24 C27 24 23 23 19 19 Z" fill="{front}" stroke="{dark}" stroke-linejoin="round" style="stroke-width: 1.2;"></path>')
    if kind.startswith('rosebud'):
        fill, dark, front = ROSES[kind.split(':')[1] if ':' in kind else 'red']
        return (f'<path d="M30 29 C23 25 23 13 30 7 C37 13 37 25 30 29 Z" fill="{fill}" stroke="{dark}" stroke-linejoin="round" style="stroke-width: 1.5;"></path>'
                f'<path d="M30 30 C25 28 23 24 23 21 C26 24 28 25 30 26 C32 25 34 24 37 21 C37 24 35 28 30 30 Z" style="fill: var(--leaf);"></path>')
    if kind == 'bud':
        return '<path d="M30 28 C23 24 23 13 30 7 C37 13 37 24 30 28 Z" fill="#C4996A" stroke="#7A5236" style="stroke-width: 1.5;"></path>'
    if kind == 'tulip':
        return '<path d="M20 10 L24 19 L30 8 L36 19 L40 10 C42 22 38 30 30 30 C22 30 18 22 20 10 Z" fill="#E59A86" stroke="#A9584A" stroke-linejoin="round" style="stroke-width: 1.5;"></path><path d="M30 8 L30 24" stroke="#A9584A" opacity="0.5" style="stroke-width: 1.2;"></path>'
    if kind == 'sunflower':
        petals = ''.join(
            f'<ellipse cx="30" cy="8" rx="3.6" ry="7" fill="#F2C14E" stroke="#B88A1E" transform="rotate({a} 30 19)" style="stroke-width: 1.2;"></ellipse>'
            for a in range(0, 360, 30))
        return petals + '<circle cx="30" cy="19" r="7.5" fill="#6B4C35" stroke="#3B2A20" style="stroke-width: 1.2;"></circle><circle cx="28" cy="17" r="1" fill="#C4996A"></circle><circle cx="32" cy="20" r="1" fill="#C4996A"></circle><circle cx="29" cy="22" r="1" fill="#C4996A"></circle>'
    if kind == 'lavender':
        buds = ''.join(f'<ellipse cx="{30 + dx}" cy="{y}" rx="3.2" ry="4.4" fill="#A592C4" stroke="#6F5E92" style="stroke-width: 1;"></ellipse>'
                       for y, dx in ((6, 0), (11, -3), (11, 3), (16, -3.5), (16, 3.5), (21, -3), (21, 3), (26, 0)))
        return buds
    if kind == 'cosmos':
        petals = ''.join(
            f'<path d="M30 20 C26 14 25 6 30 3 C35 6 34 14 30 20 Z" fill="#E7B3C2" stroke="#B0697F" transform="rotate({a} 30 20)" style="stroke-width: 1.2;"></path>'
            for a in range(0, 360, 45))
        return petals + '<circle cx="30" cy="20" r="4.5" fill="#F2C14E" stroke="#B88A1E" style="stroke-width: 1.2;"></circle>'
    if kind == 'strawflower':
        outer = ''.join(
            f'<path d="M30 19 L27 6 L30 2 L33 6 Z" fill="#C98A52" stroke="#8C5A2E" stroke-linejoin="round" transform="rotate({a} 30 19)" style="stroke-width: 1;"></path>'
            for a in range(0, 360, 30))
        inner = ''.join(
            f'<path d="M30 19 L28 11 L30 8 L32 11 Z" fill="#E3B27A" stroke="#8C5A2E" stroke-linejoin="round" transform="rotate({a} 30 19)" style="stroke-width: 0.8;"></path>'
            for a in range(15, 375, 30))
        return outer + inner + '<circle cx="30" cy="19" r="3.5" fill="#8C5A2E"></circle>'
    raise ValueError(kind)


def plant(stage, w, h, svgcls='-', headcls='-'):
    sc = '' if svgcls == '-' else f' class="{svgcls}"'
    hc = '' if headcls == '-' else f' class="{headcls}"'
    if stage == 'seed':
        inner = SOIL + '<ellipse cx="30" cy="58" rx="6" ry="4" transform="rotate(-20 30 58)" style="fill: var(--seed);"></ellipse>'
    elif stage == 'sprout':
        inner = SOIL + f'<g{hc}>' + stem(40) + SPROUT_L + SPROUT_R + '</g>'
    elif stage == 'bud' or stage.startswith('rosebud'):
        inner = SOIL + stem(26) + '<path d="M30 50 C22 50 18 44 18 40 C26 40 30 44 30 50 Z" style="fill: var(--leaf);"></path>' + LEAF_R + f'<g{hc}>' + head(stage) + '</g>'
    else:
        top = 22 if stage == 'lavender' else 28
        inner = SOIL + stem(top) + LEAF_L + f'<g{hc}>' + head(stage) + '</g>'
    return f'<svg{sc} width="{w}" height="{h}" viewBox="0 0 60 70">{inner}</svg>'


def expand(body):
    def rep(m):
        parts = m.group(1).split()
        if parts[0] == 'OWL':
            return owl(int(parts[1]), wings=len(parts) > 2 and parts[2] == 'wings')
        if parts[0] == 'INCLUDE':
            return expand((FRAG / f'_{parts[1]}.part').read_text().rstrip('\n'))
        if parts[0] == 'PLANT':
            return plant(parts[1], int(parts[2]), int(parts[3]), *(parts[4:6]))
        raise ValueError(m.group(0))
    return re.sub(r'%%([A-Z]+[^%]*)%%', rep, body)


def nav(cur, s):
    def px(v):
        return f'{round(v * s)}px'
    idx = [n for n, _ in SCREENS].index(cur)
    prev_f = SCREENS[idx - 1][0]
    next_f = SCREENS[(idx + 1) % len(SCREENS)][0]
    cur_jump = cur
    item = (f'flex: 1 1 0; display: flex; align-items: center; justify-content: center; border-radius: {px(14)}; '
            f'text-decoration: none; font-family: system-ui, -apple-system, sans-serif; font-size: {px(18)}; font-weight: 700; white-space: nowrap; overflow: hidden;')
    links = []
    for label, f in JUMP:
        if f == cur_jump:
            links.append(f'<a href="{f}.dc.html" aria-current="page" style="{item} background: #FFFFFF; color: #16161A;">{label}</a>')
        else:
            links.append(f'<a href="{f}.dc.html" style="{item} background: #2E2E36; color: #FFFFFF;">{label}</a>')
    links.append(f'<a href="Main.dc.html" aria-label="Round 1: the first four options" style="{item} background: #2E2E36; color: #B8B8C2;">Round 1</a>')
    ico = round(22 * s)
    zoom = (f'<label for="lz-toggle" class="lz-btn" style="flex: 1 1 0; display: flex; align-items: center; justify-content: center; gap: {px(6)}; border-radius: {px(14)}; color: #FFFFFF; font-family: system-ui, -apple-system, sans-serif; font-size: {px(18)}; font-weight: 700; white-space: nowrap; cursor: pointer;">'
            f'<svg width="{ico}" height="{ico}" viewBox="0 0 24 24"><circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke="currentColor" style="stroke-width: 2.6;"></circle><path d="M15.5 15.5L21 21" stroke="currentColor" stroke-linecap="round" style="stroke-width: 2.6;"></path></svg>'
            f'<span class="lz-off">Zoom 2×</span><span class="lz-on">Fit</span></label>')
    theme = (f'<button class="theme-btn" onClick="{{{{ toggleTheme }}}}" aria-label="Switch to {{{{ themeLabel }}}} mode" style="flex: 1 1 0; display: flex; align-items: center; justify-content: center; gap: {px(6)}; border: none; border-radius: {px(14)}; background: #5A4636; color: #FFFFFF; font-family: system-ui, -apple-system, sans-serif; font-size: {px(18)}; font-weight: 700; white-space: nowrap; cursor: pointer;">'
             f'<sc-if value="{{{{ isLight }}}}" hint-placeholder-val="{{{{ true }}}}"><svg width="{ico}" height="{ico}" viewBox="0 0 24 24"><path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" fill="none" stroke="currentColor" stroke-linejoin="round" style="stroke-width: 2.4;"></path></svg></sc-if>'
             f'<sc-if value="{{{{ isDark }}}}" hint-placeholder-val="{{{{ false }}}}"><svg width="{ico}" height="{ico}" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4.2" fill="none" stroke="currentColor" style="stroke-width: 2.4;"></circle><path d="M12 2.5v2.5M12 19v2.5M2.5 12H5M19 12h2.5M5.3 5.3l1.8 1.8M16.9 16.9l1.8 1.8M5.3 18.7l1.8-1.8M16.9 7.1l1.8-1.8" stroke="currentColor" stroke-linecap="round" style="stroke-width: 2.4;"></path></svg></sc-if>'
             f'{{{{ themeLabel }}}}</button>')
    big = round(34 * s)
    title = dict(SCREENS)[cur]
    return f'''<nav aria-label="Jump to a screen" style="height: {px(80)}; box-sizing: border-box; padding: {px(10)} {px(12)}; display: flex; gap: {px(6)}; background: #16161A;">
{chr(10).join(links)}
{zoom}
{theme}
</nav>
<nav aria-label="Click through the screens" style="height: {px(120)}; display: flex; align-items: stretch; background: #16161A; font-family: system-ui, -apple-system, sans-serif;">
<a href="{prev_f}.dc.html" aria-label="Previous screen" style="height: 100%; flex: 1 1 0; display: flex; align-items: center; gap: {px(14)}; justify-content: flex-start; padding: 0 {px(36)}; box-sizing: border-box; color: #FFFFFF; text-decoration: none; font-family: system-ui, -apple-system, sans-serif; font-size: {px(34)}; font-weight: 700; background: #26262C;"><svg width="{big}" height="{big}" viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7" fill="none" stroke="#FFFFFF" stroke-linecap="round" stroke-linejoin="round" style="stroke-width: 3;"></path></svg>Back</a>
<div style="flex: 2 1 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: {px(4)}; color: #FFFFFF; text-align: center; padding: 0 {px(12)};">
<span style="font-size: {px(28)}; font-weight: 700; line-height: 1.15;">{title}</span>
<span style="font-size: {px(22)}; color: #B8B8C2;">{idx + 1} of {len(SCREENS)}</span>
</div>
<a href="{next_f}.dc.html" aria-label="Next screen" style="height: 100%; flex: 1 1 0; display: flex; align-items: center; gap: {px(14)}; justify-content: flex-end; padding: 0 {px(36)}; box-sizing: border-box; color: #FFFFFF; text-decoration: none; font-family: system-ui, -apple-system, sans-serif; font-size: {px(34)}; font-weight: 700; background: #3B5BDB;">Next<svg width="{big}" height="{big}" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" fill="none" stroke="#FFFFFF" stroke-linecap="round" stroke-linejoin="round" style="stroke-width: 3;"></path></svg></a>
</nav>'''


def build(name):
    text = (FRAG / f'{name}.frag').read_text()
    css = text.split('<!--CSS-->')[1].split('<!--BODY-->')[0].strip('\n')
    body = text.split('<!--BODY-->')[1].split('<!--LOGIC-->')[0].strip('\n')
    logic = text.split('<!--LOGIC-->')[1].strip('\n') if '<!--LOGIC-->' in text else ''
    wide = name in WIDE
    W, SH = (2440, 1100) if wide else (1180, 820)
    s = 2.07 if wide else 1
    H = SH + round(80 * s) + round(120 * s)
    page_title = dict(SCREENS)[name].replace('·', '-')
    html = f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Round 2: {page_title}</title>
<script src="./support.js"></script>
</head>
<body>
<x-dc>
<helmet>
{FONTS}
<style>
{TOKENS.strip()}
{BASE.strip()}
{expand(css)}
</style>
<style>
{LZ.strip()}
</style>
</helmet>
<div style="width: {W}px; height: {H}px; display: flex; flex-direction: column; background: #16161A;">
<input type="checkbox" id="lz-toggle" class="lz-check" aria-label="Zoom in 2x">
<div class="lz-vp" style="width: {W}px; height: {SH}px; flex: none;"><div class="lz-in" style="width: {W}px; height: {SH}px;">
<div class="screen {{{{ theme }}}}" style="width: {W}px; height: {SH}px; position: relative; overflow: hidden;">
{expand(body)}
</div>
</div></div>
{nav(name, s)}
</div>
</x-dc>
<script type="text/x-dc" data-dc-script data-props='{{"$preview":{{"width":{W},"height":{H}}}}}'>
class Component extends DCLogic {{
{THEME_JS.strip(chr(10))}
{logic}
  renderVals() {{
    var s = this.state || {{}};
    var self = this;
    var dark = typeof s.dark === 'boolean' ? s.dark : this.readDark();
    var vals = {{
      theme: dark ? 't-dark' : 't-light',
      themeLabel: dark ? 'Light' : 'Dark',
      isDark: dark,
      isLight: !dark,
      toggleTheme: function () {{
        try {{ window.localStorage.setItem('luna-r2-theme', dark ? 'light' : 'dark'); }} catch (e) {{}}
        self.setState({{ dark: !dark }});
      }}
    }};
    if (this.extra) this.extra(vals, s, dark);
    return vals;
  }}
}}
</script>
</body>
</html>
'''
    OUT.mkdir(exist_ok=True)
    (OUT / f'{name}.dc.html').write_text(html)
    return OUT / f'{name}.dc.html'


if __name__ == '__main__':
    for n in sys.argv[1:]:
        print(build(n))
