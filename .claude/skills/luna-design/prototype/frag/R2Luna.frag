<!--CSS-->

.card { position: relative; border: 2px solid var(--edge); border-radius: 30px; background: var(--card); box-shadow: 0 3px 0 var(--edge), 0 8px 18px var(--shadow); padding: 0; overflow: hidden; cursor: pointer; display: flex; flex-direction: column; text-align: left; font-family: 'Andika', sans-serif; color: var(--ink); transition: transform 120ms cubic-bezier(0.2, 0, 0, 1); animation: enter 700ms cubic-bezier(0.34, 1.56, 0.64, 1) both; }
.card:active { transform: translateY(3px) scale(0.99); }
.card:focus-visible { outline: 3px solid var(--focus); outline-offset: 4px; }
.stage { position: relative; height: 290px; display: flex; align-items: center; justify-content: center; overflow: hidden; }
.arch { position: absolute; bottom: -90px; width: 260px; height: 260px; border-radius: 999px 999px 0 0; }
.about { padding: 14px 22px 18px; display: flex; flex-direction: column; gap: 6px; }
.name { font-size: 25px; font-weight: 650; line-height: 1.1; }
.pitch { font-size: 16px; line-height: 1.4; color: var(--soft); }
.fits { display: flex; gap: 6px; margin-top: 2px; }
.fit { height: 26px; padding: 0 10px; border-radius: 8px; background: var(--well); border: 2px solid var(--edge); font-size: 13px; font-weight: 700; display: flex; align-items: center; }
.hi { position: absolute; top: 18px; right: 18px; padding: 10px 16px; border-radius: 18px 18px 18px 4px; background: var(--card); border: 2px solid var(--edge); font-size: 18px; font-weight: 700; color: var(--ink); box-shadow: 0 3px 0 var(--edge); animation: hiPop 500ms cubic-bezier(0.34, 1.56, 0.64, 1) both; }
.row-h { display: flex; align-items: baseline; gap: 14px; }

.ch { display: block; animation: float 4.5s ease-in-out infinite; transform-origin: 50% 100%; }
.eyes { transform-box: fill-box; transform-origin: center; animation: blink 5.2s ease-in-out infinite; }
.mouth { transform-box: fill-box; transform-origin: 50% 0; }
.talk-a .mouth { animation: talkA 220ms ease-in-out 9; }
.talk-b .mouth { animation: talkB 220ms ease-in-out 9; }
.talk-a { animation: float 4.5s ease-in-out infinite, hopA 600ms cubic-bezier(0.34, 1.56, 0.64, 1); }
.talk-b { animation: float 4.5s ease-in-out infinite, hopB 600ms cubic-bezier(0.34, 1.56, 0.64, 1); }
.halo { transform-box: fill-box; transform-origin: center; opacity: 0; }
.talk-a .halo { animation: glowA 2s ease-in-out; }
.talk-b .halo { animation: glowB 2s ease-in-out; }
.wing-l { transform-box: fill-box; transform-origin: 100% 20%; animation: wingL 3.2s ease-in-out infinite; }
.wing-r { transform-box: fill-box; transform-origin: 0% 20%; animation: wingR 3.2s ease-in-out infinite; }
.rock { transform-box: view-box; transform-origin: 100px 110px; animation: rock 6s ease-in-out infinite; }
.swing { transform-box: fill-box; transform-origin: 50% 0; animation: swing 2.8s ease-in-out infinite; }
.twinkle { transform-box: fill-box; transform-origin: center; animation: twinkle 3.4s ease-in-out infinite; }
.fringe { transform-box: fill-box; transform-origin: 50% 0; animation: swing 3.6s ease-in-out infinite; }

@keyframes enter { 0% { transform: translateY(30px) scale(0.95); opacity: 0; } 100% { transform: translateY(0) scale(1); opacity: 1; } }
@keyframes hiPop { 0% { transform: scale(0.4) translateY(10px); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
@keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
@keyframes hopA { 0%, 100% { transform: translateY(0); } 40% { transform: translateY(-22px) rotate(-4deg); } }
@keyframes hopB { 0%, 100% { transform: translateY(0); } 40% { transform: translateY(-22px) rotate(4deg); } }
@keyframes blink { 0%, 90%, 100% { transform: scaleY(1); } 93% { transform: scaleY(0.1); } 96% { transform: scaleY(1); } }
@keyframes talkA { 0%, 100% { transform: scaleY(1); } 50% { transform: scaleY(1.6); } }
@keyframes talkB { 0%, 100% { transform: scaleY(1); } 50% { transform: scaleY(1.6); } }
@keyframes glowA { 0%, 100% { opacity: 0; transform: scale(0.9); } 15%, 30%, 45%, 60%, 75% { opacity: 0.85; transform: scale(1.05); } 22%, 37%, 52%, 67% { opacity: 0.4; transform: scale(0.98); } }
@keyframes glowB { 0%, 100% { opacity: 0; transform: scale(0.9); } 15%, 30%, 45%, 60%, 75% { opacity: 0.85; transform: scale(1.05); } 22%, 37%, 52%, 67% { opacity: 0.4; transform: scale(0.98); } }
@keyframes wingL { 0%, 100% { transform: rotate(0deg); } 50% { transform: rotate(12deg); } }
@keyframes wingR { 0%, 100% { transform: rotate(0deg); } 50% { transform: rotate(-12deg); } }
@keyframes rock { 0%, 100% { transform: rotate(-5deg); } 50% { transform: rotate(5deg); } }
@keyframes swing { 0%, 100% { transform: rotate(-8deg); } 50% { transform: rotate(8deg); } }
@keyframes twinkle { 0%, 100% { opacity: 0.3; transform: scale(0.7); } 50% { opacity: 1; transform: scale(1.1); } }
@media (prefers-reduced-motion: reduce) { .card, .hi, .ch, .eyes, .mouth, .talk-a, .talk-b, .halo, .wing-l, .wing-r, .rock, .swing, .twinkle, .fringe { animation: none !important; } }
<!--BODY-->
<div style="position: absolute; inset: 0; box-sizing: border-box; padding: 36px 48px; display: flex; flex-direction: column; gap: 14px;">
  <div style="display: flex; align-items: baseline; gap: 18px;">
    <h1 class="display" style="margin: 0; font-size: 44px; font-weight: 650;">Who is Ms. Luna? Round 2</h1>
    <span class="soft" style="font-size: 19px;">The teacher’s picks: the rounder owl in black glasses, or a crescent moon. The moons wear moon gold, the one colour outside the palette, so they read as moons. Each one blinks or glows, and talks when she speaks. Tap one to say hi.</span>
  </div>

  <div class="row-h" style="margin-top: 6px;">
    <h2 class="display" style="margin: 0; font-size: 26px; font-weight: 600;">Row 1 · The rounder owl, in black glasses</h2>
  </div>
  <div style="display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 32px;">

    <!-- 1 · classic round frames -->
    <button class="card" onClick="{{ p1 }}" style="animation-delay: 0ms;">
      <span class="stage" style="background: var(--accent-soft);">
        <span class="arch" style="background: var(--soil);"></span>
        <span class="{{ c1 }}" style="position: relative; width: 200px; height: 200px;">
          <svg width="200" height="200" viewBox="0 0 200 200">
            <ellipse cx="100" cy="191" rx="50" ry="7" fill="#3B2A20" opacity="0.12"></ellipse>
            <path d="M58 66 L50 28 L86 48 Z" fill="#A0744B" stroke="#A0744B" stroke-linejoin="round" style="stroke-width: 8;"></path>
            <path d="M142 66 L150 28 L114 48 Z" fill="#A0744B" stroke="#A0744B" stroke-linejoin="round" style="stroke-width: 8;"></path>
            <ellipse class="wing-l" cx="40" cy="124" rx="14" ry="30" fill="#A0744B"></ellipse>
            <ellipse class="wing-r" cx="160" cy="124" rx="14" ry="30" fill="#A0744B"></ellipse>
            <ellipse cx="100" cy="112" rx="66" ry="72" fill="#C4996A"></ellipse>
            <ellipse cx="100" cy="150" rx="40" ry="30" fill="#F5E6CF"></ellipse>
            <path d="M84 142 l6 6 6 -6 M104 142 l6 6 6 -6 M94 156 l6 6 6 -6" fill="none" stroke="#C4996A" stroke-linecap="round" stroke-linejoin="round" style="stroke-width: 3;"></path>
            <circle cx="74" cy="94" r="21" fill="#FFFBF5"></circle>
            <circle cx="126" cy="94" r="21" fill="#FFFBF5"></circle>
            <g class="eyes">
              <circle cx="76" cy="96" r="10" fill="#2A1E17"></circle>
              <circle cx="124" cy="96" r="10" fill="#2A1E17"></circle>
              <circle cx="79.5" cy="92" r="3.5" fill="#FFFFFF"></circle>
              <circle cx="127.5" cy="92" r="3.5" fill="#FFFFFF"></circle>
            </g>
            <circle cx="74" cy="94" r="23" fill="none" stroke="#1E1916" style="stroke-width: 5;"></circle>
            <circle cx="126" cy="94" r="23" fill="none" stroke="#1E1916" style="stroke-width: 5;"></circle>
            <path d="M97 91 q3 -3 6 0 M51 90 l-11 -5 M149 90 l11 -5" fill="none" stroke="#1E1916" stroke-linecap="round" style="stroke-width: 5;"></path>
            <ellipse cx="56" cy="124" rx="9" ry="5.5" fill="#E2B9A6"></ellipse>
            <ellipse cx="144" cy="124" rx="9" ry="5.5" fill="#E2B9A6"></ellipse>
            <path class="mouth" d="M92 116 h16 l-8 11 z" fill="#7A5236" stroke="#7A5236" stroke-linejoin="round" style="stroke-width: 3;"></path>
            <ellipse cx="82" cy="186" rx="11" ry="6" fill="#7A5236"></ellipse>
            <ellipse cx="118" cy="186" rx="11" ry="6" fill="#7A5236"></ellipse>
          </svg>
        </span>
        <sc-if value="{{ s1 }}" hint-placeholder-val="{{ false }}"><span class="hi">Hi! I’m Ms. Luna!</span></sc-if>
      </span>
      <span class="about">
        <span class="display name">Round black frames</span>
        <span class="pitch">The owl on every screen in round 2. Caramel feathers and round black frames; simple and friendly, and clear even when small.</span>
        <span class="fits"><span class="fit">owl</span><span class="fit">black glasses</span></span>
      </span>
    </button>

    <!-- 2 · cat-eye frames, cocoa feathers -->
    <button class="card" onClick="{{ p2 }}" style="animation-delay: 80ms;">
      <span class="stage" style="background: var(--tint-4);">
        <span class="arch" style="background: var(--soil);"></span>
        <span class="{{ c2 }}" style="position: relative; width: 200px; height: 200px;">
          <svg width="200" height="200" viewBox="0 0 200 200">
            <ellipse cx="100" cy="191" rx="50" ry="7" fill="#3B2A20" opacity="0.14"></ellipse>
            <path d="M58 66 L50 28 L86 48 Z" fill="#6E4E36" stroke="#6E4E36" stroke-linejoin="round" style="stroke-width: 8;"></path>
            <path d="M142 66 L150 28 L114 48 Z" fill="#6E4E36" stroke="#6E4E36" stroke-linejoin="round" style="stroke-width: 8;"></path>
            <ellipse class="wing-l" cx="40" cy="124" rx="14" ry="30" fill="#6E4E36"></ellipse>
            <ellipse class="wing-r" cx="160" cy="124" rx="14" ry="30" fill="#6E4E36"></ellipse>
            <ellipse cx="100" cy="112" rx="66" ry="72" fill="#8C6647"></ellipse>
            <ellipse cx="100" cy="150" rx="40" ry="30" fill="#EADBC5"></ellipse>
            <path d="M84 142 l6 6 6 -6 M104 142 l6 6 6 -6 M94 156 l6 6 6 -6" fill="none" stroke="#B08A68" stroke-linecap="round" stroke-linejoin="round" style="stroke-width: 3;"></path>
            <circle cx="74" cy="94" r="21" fill="#FFFBF5"></circle>
            <circle cx="126" cy="94" r="21" fill="#FFFBF5"></circle>
            <g class="eyes">
              <circle cx="76" cy="96" r="10" fill="#2A1E17"></circle>
              <circle cx="124" cy="96" r="10" fill="#2A1E17"></circle>
              <circle cx="79.5" cy="92" r="3.5" fill="#FFFFFF"></circle>
              <circle cx="127.5" cy="92" r="3.5" fill="#FFFFFF"></circle>
            </g>
            <path d="M48 84 C50 74 62 70 76 72 C92 74 98 84 97 94 C96 108 86 116 74 116 C60 116 50 106 49 96 C48 92 46 86 42 78 Z" fill="none" stroke="#1E1916" stroke-linejoin="round" style="stroke-width: 5;"></path>
            <path d="M152 84 C150 74 138 70 124 72 C108 74 102 84 103 94 C104 108 114 116 126 116 C140 116 150 106 151 96 C152 92 154 86 158 78 Z" fill="none" stroke="#1E1916" stroke-linejoin="round" style="stroke-width: 5;"></path>
            <path d="M97 90 q3 -3 6 0" fill="none" stroke="#1E1916" stroke-linecap="round" style="stroke-width: 5;"></path>
            <ellipse cx="56" cy="126" rx="9" ry="5.5" fill="#D9A08C"></ellipse>
            <ellipse cx="144" cy="126" rx="9" ry="5.5" fill="#D9A08C"></ellipse>
            <path class="mouth" d="M92 118 h16 l-8 11 z" fill="#E0BE92" stroke="#E0BE92" stroke-linejoin="round" style="stroke-width: 3;"></path>
            <ellipse cx="82" cy="186" rx="11" ry="6" fill="#E0BE92"></ellipse>
            <ellipse cx="118" cy="186" rx="11" ry="6" fill="#E0BE92"></ellipse>
          </svg>
        </span>
        <sc-if value="{{ s2 }}" hint-placeholder-val="{{ false }}"><span class="hi">Hi! I’m Ms. Luna!</span></sc-if>
      </span>
      <span class="about">
        <span class="display name">Cat-eye frames</span>
        <span class="pitch">Darker cocoa feathers and upswept cat-eye glasses. A little more grown-up, a little more teacher.</span>
        <span class="fits"><span class="fit">owl</span><span class="fit">black glasses</span></span>
      </span>
    </button>

    <!-- 3 · bold frames and a knit scarf, latte feathers -->
    <button class="card" onClick="{{ p3 }}" style="animation-delay: 160ms;">
      <span class="stage" style="background: var(--well);">
        <span class="arch" style="background: var(--edge);"></span>
        <span class="{{ c3 }}" style="position: relative; width: 200px; height: 200px;">
          <svg width="200" height="200" viewBox="0 0 200 200">
            <ellipse cx="100" cy="191" rx="50" ry="7" fill="#3B2A20" opacity="0.12"></ellipse>
            <path d="M58 66 L50 28 L86 48 Z" fill="#BFA27E" stroke="#BFA27E" stroke-linejoin="round" style="stroke-width: 8;"></path>
            <path d="M142 66 L150 28 L114 48 Z" fill="#BFA27E" stroke="#BFA27E" stroke-linejoin="round" style="stroke-width: 8;"></path>
            <ellipse class="wing-l" cx="40" cy="124" rx="14" ry="30" fill="#BFA27E"></ellipse>
            <ellipse class="wing-r" cx="160" cy="124" rx="14" ry="30" fill="#BFA27E"></ellipse>
            <ellipse cx="100" cy="112" rx="66" ry="72" fill="#D9C4A6"></ellipse>
            <ellipse cx="100" cy="156" rx="40" ry="26" fill="#FFF7EA"></ellipse>
            <circle cx="74" cy="94" r="20" fill="#FFFBF5"></circle>
            <circle cx="126" cy="94" r="20" fill="#FFFBF5"></circle>
            <g class="eyes">
              <circle cx="76" cy="96" r="10" fill="#2A1E17"></circle>
              <circle cx="124" cy="96" r="10" fill="#2A1E17"></circle>
              <circle cx="79.5" cy="92" r="3.5" fill="#FFFFFF"></circle>
              <circle cx="127.5" cy="92" r="3.5" fill="#FFFFFF"></circle>
            </g>
            <circle cx="74" cy="94" r="24" fill="none" stroke="#1E1916" style="stroke-width: 8;"></circle>
            <circle cx="126" cy="94" r="24" fill="none" stroke="#1E1916" style="stroke-width: 8;"></circle>
            <path d="M98 90 q2 -2 4 0" fill="none" stroke="#1E1916" stroke-linecap="round" style="stroke-width: 7;"></path>
            <ellipse cx="54" cy="124" rx="9" ry="5.5" fill="#E2B9A6"></ellipse>
            <ellipse cx="146" cy="124" rx="9" ry="5.5" fill="#E2B9A6"></ellipse>
            <path class="mouth" d="M92 114 h16 l-8 10 z" fill="#7A5236" stroke="#7A5236" stroke-linejoin="round" style="stroke-width: 3;"></path>
            <path d="M42 134 Q100 158 158 134 L160 150 Q100 176 40 150 Z" fill="#C4996A" stroke="#9A6B45" stroke-linejoin="round" style="stroke-width: 2.5;"></path>
            <path d="M60 142 l4 12 M76 147 l3 12 M92 150 l2 12 M108 150 l-1 12 M124 147 l-3 12 M140 142 l-4 12" stroke="#9A6B45" stroke-linecap="round" opacity="0.6" style="stroke-width: 2;"></path>
            <g class="fringe">
              <path d="M118 152 L132 186 L118 190 L106 158 Z" fill="#C4996A" stroke="#9A6B45" stroke-linejoin="round" style="stroke-width: 2.5;"></path>
              <path d="M120 190 l-1 7 M125 189 l0 7 M130 187 l1 7" stroke="#9A6B45" stroke-linecap="round" style="stroke-width: 2.5;"></path>
            </g>
            <ellipse cx="82" cy="186" rx="11" ry="6" fill="#7A5236"></ellipse>
            <ellipse cx="118" cy="186" rx="11" ry="6" fill="#7A5236"></ellipse>
          </svg>
        </span>
        <sc-if value="{{ s3 }}" hint-placeholder-val="{{ false }}"><span class="hi">Hi! I’m Ms. Luna!</span></sc-if>
      </span>
      <span class="about">
        <span class="display name">Bold frames, knit scarf</span>
        <span class="pitch">Light latte feathers, thick black frames and a cosy caramel scarf. The softest and most boho of the owls.</span>
        <span class="fits"><span class="fit">owl</span><span class="fit">black glasses</span></span>
      </span>
    </button>

    <!-- 4 · reading glasses and a book -->
    <button class="card" onClick="{{ p4 }}" style="animation-delay: 240ms;">
      <span class="stage" style="background: var(--tint-2);">
        <span class="arch" style="background: var(--edge);"></span>
        <span class="{{ c4 }}" style="position: relative; width: 200px; height: 200px;">
          <svg width="200" height="200" viewBox="0 0 200 200">
            <ellipse cx="100" cy="191" rx="50" ry="7" fill="#3B2A20" opacity="0.12"></ellipse>
            <path d="M58 66 L50 28 L86 48 Z" fill="#A0744B" stroke="#A0744B" stroke-linejoin="round" style="stroke-width: 8;"></path>
            <path d="M142 66 L150 28 L114 48 Z" fill="#A0744B" stroke="#A0744B" stroke-linejoin="round" style="stroke-width: 8;"></path>
            <ellipse cx="100" cy="112" rx="66" ry="72" fill="#C4996A"></ellipse>
            <ellipse cx="100" cy="156" rx="40" ry="26" fill="#F5E6CF"></ellipse>
            <circle cx="74" cy="92" r="21" fill="#FFFBF5"></circle>
            <circle cx="126" cy="92" r="21" fill="#FFFBF5"></circle>
            <g class="eyes">
              <circle cx="76" cy="86" r="9.5" fill="#2A1E17"></circle>
              <circle cx="124" cy="86" r="9.5" fill="#2A1E17"></circle>
              <circle cx="79" cy="82" r="3.2" fill="#FFFFFF"></circle>
              <circle cx="127" cy="82" r="3.2" fill="#FFFFFF"></circle>
            </g>
            <path d="M52 100 h42 v4 a14 14 0 0 1 -14 14 h-14 a14 14 0 0 1 -14 -14 z" fill="rgba(255, 251, 245, 0.35)" stroke="#1E1916" stroke-linejoin="round" style="stroke-width: 5;"></path>
            <path d="M106 100 h42 v4 a14 14 0 0 1 -14 14 h-14 a14 14 0 0 1 -14 -14 z" fill="rgba(255, 251, 245, 0.35)" stroke="#1E1916" stroke-linejoin="round" style="stroke-width: 5;"></path>
            <path d="M94 102 q6 -4 12 0 M52 101 l-12 -6 M148 101 l12 -6" fill="none" stroke="#1E1916" stroke-linecap="round" style="stroke-width: 5;"></path>
            <ellipse cx="54" cy="128" rx="9" ry="5.5" fill="#E2B9A6"></ellipse>
            <ellipse cx="146" cy="128" rx="9" ry="5.5" fill="#E2B9A6"></ellipse>
            <path class="mouth" d="M92 120 h16 l-8 10 z" fill="#7A5236" stroke="#7A5236" stroke-linejoin="round" style="stroke-width: 3;"></path>
            <path d="M100 148 c-10 -6 -24 -7 -36 -4 v34 c12 -3 26 -2 36 4 z" fill="#FFFBF5" stroke="#9A6B45" stroke-linejoin="round" style="stroke-width: 2.5;"></path>
            <path d="M100 148 c10 -6 24 -7 36 -4 v34 c-12 -3 -26 -2 -36 4 z" fill="#F2E6D3" stroke="#9A6B45" stroke-linejoin="round" style="stroke-width: 2.5;"></path>
            <path d="M72 156 c6 -1 13 -1 20 1 M72 164 c6 -1 13 -1 20 1 M108 157 c6 -2 13 -2 20 -1 M108 165 c6 -2 13 -2 20 -1" fill="none" stroke="#C4996A" stroke-linecap="round" style="stroke-width: 2;"></path>
            <ellipse cx="58" cy="164" rx="13" ry="22" fill="#A0744B" transform="rotate(-24 58 164)"></ellipse>
            <ellipse cx="142" cy="164" rx="13" ry="22" fill="#A0744B" transform="rotate(24 142 164)"></ellipse>
            <ellipse cx="82" cy="188" rx="11" ry="6" fill="#7A5236"></ellipse>
            <ellipse cx="118" cy="188" rx="11" ry="6" fill="#7A5236"></ellipse>
          </svg>
        </span>
        <sc-if value="{{ s4 }}" hint-placeholder-val="{{ false }}"><span class="hi">Hi! I’m Ms. Luna!</span></sc-if>
      </span>
      <span class="about">
        <span class="display name">Reading glasses</span>
        <span class="pitch">Half-moon readers low on her face, peeking over them at you, with a book in her wings. Wise and bookish.</span>
        <span class="fits"><span class="fit">owl</span><span class="fit">black glasses</span></span>
      </span>
    </button>
  </div>

  <div class="row-h" style="margin-top: 14px;">
    <h2 class="display" style="margin: 0; font-size: 26px; font-weight: 600;">Row 2 · A crescent moon, with a face and without</h2>
  </div>
  <div style="display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 32px;">

    <!-- 5 · crescent with a face -->
    <button class="card" onClick="{{ p5 }}" style="animation-delay: 320ms;">
      <span class="stage" style="background: #33261E;">
        <span class="arch" style="background: #3F2F25;"></span>
        <svg style="position: absolute; left: 44px; top: 40px;" width="16" height="16" viewBox="0 0 24 24"><path class="twinkle" d="M12 2l2.6 7.4L22 12l-7.4 2.6L12 22l-2.6-7.4L2 12l7.4-2.6z" fill="#FBEFD9"></path></svg>
        <svg style="position: absolute; right: 60px; top: 70px;" width="12" height="12" viewBox="0 0 24 24"><path class="twinkle" style="animation-delay: 1.3s;" d="M12 2l2.6 7.4L22 12l-7.4 2.6L12 22l-2.6-7.4L2 12l7.4-2.6z" fill="#FBEFD9"></path></svg>
        <span class="{{ c5 }}" style="position: relative; width: 210px; height: 210px;">
          <svg width="210" height="210" viewBox="0 0 200 200">
            <g class="rock">
              <g transform="rotate(-18 100 110)">
                <path d="M40 60.2 A72 72 0 1 0 160 60.2 A60 60 0 1 1 40 60.2 Z" fill="#F2CF63" stroke="#C9A23A" stroke-linejoin="round" style="stroke-width: 4;"></path>
                <circle cx="46" cy="108" r="6" fill="#F7DE8E"></circle>
                <circle cx="150" cy="112" r="5" fill="#F7DE8E"></circle>
                <circle cx="62" cy="126" r="4" fill="#F7DE8E"></circle>
                <g class="eyes">
                  <circle cx="84" cy="142" r="6.5" fill="#3B2A20"></circle>
                  <circle cx="116" cy="142" r="6.5" fill="#3B2A20"></circle>
                  <circle cx="86" cy="139.5" r="2.2" fill="#FFFFFF"></circle>
                  <circle cx="118" cy="139.5" r="2.2" fill="#FFFFFF"></circle>
                </g>
                <ellipse cx="70" cy="152" rx="7" ry="4" fill="#E9A898"></ellipse>
                <ellipse cx="130" cy="152" rx="7" ry="4" fill="#E9A898"></ellipse>
                <path class="mouth" d="M92 151 h16 a8 8 0 0 1 -16 0 z" fill="#7A5236"></path>
              </g>
            </g>
          </svg>
        </span>
        <sc-if value="{{ s5 }}" hint-placeholder-val="{{ false }}"><span class="hi">Hi! I’m Ms. Luna!</span></sc-if>
      </span>
      <span class="about">
        <span class="display name">Crescent with a face</span>
        <span class="pitch">Luna means moon. A soft golden crescent with a sweet smile; she rocks gently and talks when she speaks.</span>
        <span class="fits"><span class="fit">moon</span><span class="fit">with a face</span></span>
      </span>
    </button>

    <!-- 6 · crescent with a face and black glasses -->
    <button class="card" onClick="{{ p6 }}" style="animation-delay: 400ms;">
      <span class="stage" style="background: #2E221B;">
        <span class="arch" style="background: #3A2B22;"></span>
        <span style="position: absolute; left: 60px; top: 50px; width: 4px; height: 4px; border-radius: 999px; background: #FBEFD9;"></span>
        <span style="position: absolute; right: 56px; top: 210px; width: 3px; height: 3px; border-radius: 999px; background: #FBEFD9;"></span>
        <span class="{{ c6 }}" style="position: relative; width: 210px; height: 210px;">
          <svg width="210" height="210" viewBox="0 0 200 200">
            <g class="rock" style="animation-delay: -2s;">
              <g transform="rotate(-18 100 110)">
                <path d="M40 60.2 A72 72 0 1 0 160 60.2 A60 60 0 1 1 40 60.2 Z" fill="#F7E3A1" stroke="#C9A23A" stroke-linejoin="round" style="stroke-width: 4;"></path>
                <circle cx="48" cy="110" r="5" fill="#FBEDC0"></circle>
                <circle cx="150" cy="114" r="5" fill="#FBEDC0"></circle>
                <g class="eyes">
                  <circle cx="84" cy="142" r="6" fill="#3B2A20"></circle>
                  <circle cx="116" cy="142" r="6" fill="#3B2A20"></circle>
                  <circle cx="86" cy="139.5" r="2" fill="#FFFFFF"></circle>
                  <circle cx="118" cy="139.5" r="2" fill="#FFFFFF"></circle>
                </g>
                <circle cx="84" cy="142" r="12" fill="none" stroke="#1E1916" style="stroke-width: 4.5;"></circle>
                <circle cx="116" cy="142" r="12" fill="none" stroke="#1E1916" style="stroke-width: 4.5;"></circle>
                <path d="M96 140 q4 -3 8 0" fill="none" stroke="#1E1916" stroke-linecap="round" style="stroke-width: 4.5;"></path>
                <ellipse cx="66" cy="152" rx="6" ry="3.5" fill="#E9A898"></ellipse>
                <ellipse cx="134" cy="152" rx="6" ry="3.5" fill="#E9A898"></ellipse>
                <path class="mouth" d="M93 158 h14 a7 7 0 0 1 -14 0 z" fill="#7A5236"></path>
              </g>
            </g>
          </svg>
        </span>
        <sc-if value="{{ s6 }}" hint-placeholder-val="{{ false }}"><span class="hi">Hi! I’m Ms. Luna!</span></sc-if>
      </span>
      <span class="about">
        <span class="display name">Crescent in glasses</span>
        <span class="pitch">A pale gold moon wearing Luna’s round black glasses, so she still looks like the class teacher.</span>
        <span class="fits"><span class="fit">moon</span><span class="fit">with a face</span><span class="fit">black glasses</span></span>
      </span>
    </button>

    <!-- 7 · crescent, no face, a boho hanging -->
    <button class="card" onClick="{{ p7 }}" style="animation-delay: 480ms;">
      <span class="stage" style="background: #33261E;">
        <span class="arch" style="background: #3F2F25;"></span>
        <span style="position: absolute; left: 48px; top: 70px; width: 3px; height: 3px; border-radius: 999px; background: #FBEFD9;"></span>
        <span style="position: absolute; right: 50px; top: 160px; width: 4px; height: 4px; border-radius: 999px; background: #FBEFD9;"></span>
        <span class="{{ c7 }}" style="position: relative; width: 210px; height: 230px;">
          <svg width="210" height="230" viewBox="0 0 200 220">
            <circle class="halo" cx="100" cy="104" r="84" fill="#F2CF63"></circle>
            <g class="rock">
              <path d="M137 0 V40" stroke="#C9B6A1" stroke-linecap="round" style="stroke-width: 2;"></path>
              <g transform="translate(10 0) scale(0.9) rotate(-18 100 110)">
                <path d="M40 60.2 A72 72 0 1 0 160 60.2 A60 60 0 1 1 40 60.2 Z" fill="#F2CF63" stroke="#C9A23A" stroke-linejoin="round" style="stroke-width: 4;"></path>
                <circle cx="50" cy="112" r="7" fill="#F7DE8E"></circle>
                <circle cx="152" cy="110" r="5" fill="#F7DE8E"></circle>
                <circle cx="96" cy="150" r="8" fill="#F7DE8E"></circle>
                <circle cx="70" cy="136" r="4" fill="#F7DE8E"></circle>
                <circle cx="124" cy="146" r="4.5" fill="#F7DE8E"></circle>
              </g>
              <g class="swing" style="animation-delay: -0.6s;">
                <path d="M78 146 V188" stroke="#C9B6A1" stroke-linecap="round" style="stroke-width: 1.8;"></path>
                <path d="M78 181 L79.8 185.6 L84.7 185.8 L80.9 188.9 L82.1 193.7 L78 191 L73.9 193.7 L75.1 188.9 L71.3 185.8 L76.2 185.6 Z" fill="#F7E3A1" stroke="#C9A23A" stroke-linejoin="round" style="stroke-width: 1.5;"></path>
              </g>
              <g class="swing" style="animation-delay: -1.4s;">
                <path d="M104 150 V204" stroke="#C9B6A1" stroke-linecap="round" style="stroke-width: 1.8;"></path>
                <path d="M104 197 L105.8 201.6 L110.7 201.8 L106.9 204.9 L108.1 209.7 L104 207 L99.9 209.7 L101.1 204.9 L97.3 201.8 L102.2 201.6 Z" fill="#FBEFD9" stroke="#C9A23A" stroke-linejoin="round" style="stroke-width: 1.5;"></path>
              </g>
              <g class="swing" style="animation-delay: -2.1s;">
                <path d="M130 140 V184" stroke="#C9B6A1" stroke-linecap="round" style="stroke-width: 1.8;"></path>
                <path d="M130 177 L131.8 181.6 L136.7 181.8 L132.9 184.9 L134.1 189.7 L130 187 L125.9 189.7 L127.1 184.9 L123.3 181.8 L128.2 181.6 Z" fill="#F7E3A1" stroke="#C9A23A" stroke-linejoin="round" style="stroke-width: 1.5;"></path>
              </g>
            </g>
          </svg>
        </span>
        <sc-if value="{{ s7 }}" hint-placeholder-val="{{ false }}"><span class="hi">Hi! I’m Ms. Luna!</span></sc-if>
      </span>
      <span class="about">
        <span class="display name">Crescent, no face</span>
        <span class="pitch">Just the moon, like a boho wall hanging with little stars. She glows and sways when she talks.</span>
        <span class="fits"><span class="fit">moon</span><span class="fit">no face</span></span>
      </span>
    </button>

    <!-- 8 · crescent holding a star, no face, at dusk -->
    <button class="card" onClick="{{ p8 }}" style="animation-delay: 560ms;">
      <span class="stage" style="background: #2A1F19;">
        <span class="arch" style="background: #36281F;"></span>
        <span style="position: absolute; left: 50px; top: 46px; width: 4px; height: 4px; border-radius: 999px; background: #FBEFD9;"></span>
        <span style="position: absolute; left: 120px; top: 230px; width: 3px; height: 3px; border-radius: 999px; background: #FBEFD9;"></span>
        <span style="position: absolute; right: 70px; top: 60px; width: 5px; height: 5px; border-radius: 999px; background: #FBEFD9;"></span>
        <span style="position: absolute; right: 40px; top: 200px; width: 3px; height: 3px; border-radius: 999px; background: #FBEFD9;"></span>
        <span class="{{ c8 }}" style="position: relative; width: 210px; height: 210px;">
          <svg width="210" height="210" viewBox="0 0 200 200">
            <circle class="halo" cx="100" cy="110" r="88" fill="#F7E3A1" opacity="0.3"></circle>
            <circle cx="100" cy="110" r="80" fill="#F7E3A1" opacity="0.08"></circle>
            <g class="rock" style="animation-delay: -3s;">
              <g transform="rotate(-18 100 110)">
                <path d="M40 60.2 A72 72 0 1 0 160 60.2 A60 60 0 1 1 40 60.2 Z" fill="#F7E3A1"></path>
                <circle cx="50" cy="112" r="6" fill="#FBEDC0"></circle>
                <circle cx="96" cy="152" r="7" fill="#FBEDC0"></circle>
                <circle cx="150" cy="112" r="4" fill="#FBEDC0"></circle>
                <path class="twinkle" d="M100.0 76.0 L105.3 88.7 L119.0 89.8 L108.6 98.8 L111.8 112.2 L100.0 105.0 L88.2 112.2 L91.4 98.8 L81.0 89.8 L94.7 88.7 Z" fill="#F2CF63" stroke="#FBEFD9" stroke-linejoin="round" style="stroke-width: 2;"></path>
              </g>
            </g>
          </svg>
        </span>
        <sc-if value="{{ s8 }}" hint-placeholder-val="{{ false }}"><span class="hi">Hi! I’m Ms. Luna!</span></sc-if>
      </span>
      <span class="about">
        <span class="display name">Moon and star, no face</span>
        <span class="pitch">A pale gold moon cradling a little star on a cocoa night. Calm and simple; a soft glow shows she’s speaking.</span>
        <span class="fits"><span class="fit">moon</span><span class="fit">no face</span></span>
      </span>
    </button>
  </div>
</div>
<!--LOGIC-->
  extra(vals, s, dark) {
    var who = s.who || 0;
    var beat = s.beat || 0;
    var flip = beat % 2 === 0 ? 'a' : 'b';
    var self = this;
    for (var i = 1; i <= 8; i++) {
      (function (n) {
        vals['c' + n] = who === n ? 'ch talk-' + flip : 'ch';
        vals['s' + n] = who === n;
        vals['p' + n] = function () {
          var cur = self.state || {};
          self.setState({ who: n, beat: (cur.beat || 0) + 1 });
        };
      })(i);
    }
  }
