<!--CSS-->
.talk-intro .ow-beak { animation: talk 260ms ease-in-out 1.2s 7; }
.talk-a .ow-beak { animation: talkA 260ms ease-in-out 7; }
.talk-b .ow-beak { animation: talkB 260ms ease-in-out 7; }
.wv { opacity: 0.35; }
.talk-intro .wv { animation: wv 520ms ease-in-out 1.2s 4; }
.talk-a .wv { animation: wvA 520ms ease-in-out 4; }
.talk-b .wv { animation: wvB 520ms ease-in-out 4; }
.speak { position: absolute; top: 0; right: -8px; width: 34px; height: 34px; box-sizing: border-box; border-radius: 999px; background: var(--card); border: 2px solid var(--edge); box-shadow: 0 2px 0 var(--edge); color: var(--accent-text); display: flex; align-items: center; justify-content: center; }
.sq-idle { transform-box: fill-box; transform-origin: 50% 100%; animation: sqIdle 3.6s ease-in-out infinite; }
@keyframes talkA { 0%, 100% { transform: scaleY(1); } 50% { transform: scaleY(1.5); } }
@keyframes talkB { 0%, 100% { transform: scaleY(1); } 50% { transform: scaleY(1.5); } }
@keyframes wv { 0%, 100% { opacity: 0.35; } 50% { opacity: 1; } }
@keyframes wvA { 0%, 100% { opacity: 0.35; } 50% { opacity: 1; } }
@keyframes wvB { 0%, 100% { opacity: 0.35; } 50% { opacity: 1; } }
@keyframes sqIdle { 0%, 70%, 100% { transform: scale(1, 1); } 78% { transform: scale(1.18, 0.8); } 88% { transform: scale(0.94, 1.06); } }
.owl-bob { animation: bob 4.5s ease-in-out infinite; transform-origin: 50% 100%; }
.up-next { animation: glow 4s ease-in-out infinite, enter 600ms cubic-bezier(0.34, 1.56, 0.64, 1) both; }
.in { animation: enter 600ms cubic-bezier(0.34, 1.56, 0.64, 1) both; }
.bubble-in { animation: bubbleIn 500ms cubic-bezier(0.34, 1.56, 0.64, 1) 300ms both; transform-origin: 0 50%; }
.tag { animation: tagBounce 4s ease-in-out infinite; }
.bloom { transform-box: fill-box; transform-origin: 50% 100%; animation: sway 6s ease-in-out infinite; }
.sprouting { transform-box: fill-box; transform-origin: 50% 100%; animation: sprout 2.4s ease-in-out infinite; }
.rise { animation: floatUp 4s ease-in-out infinite; }
.jiggle { transform-box: fill-box; transform-origin: center; animation: jiggle 4s ease-in-out infinite; }
.sh1 { transform-box: fill-box; transform-origin: center; animation: shuffle 4.5s ease-in-out infinite; }
.sh2 { transform-box: fill-box; transform-origin: center; animation: shuffle2 4.5s ease-in-out infinite; }
.dashes { stroke-dasharray: 2 10; animation: dash 1.4s linear infinite; }
.page-flap { transform-box: fill-box; transform-origin: 0 50%; animation: flutter 4s ease-in-out infinite; }
.word { display: inline-block; animation: drift 4s ease-in-out infinite; }
.lesson { position: relative; height: 184px; border-radius: 999px 999px 20px 20px; border: 2px solid var(--edge); background: var(--card); box-shadow: 0 3px 0 var(--edge); display: flex; flex-direction: column; align-items: center; padding: 14px 8px 10px; gap: 3px; box-sizing: border-box; }
.ttl { font-size: 15px; font-weight: 700; line-height: 1.2; text-align: center; }
.time { margin-top: auto; height: 28px; padding: 0 10px 0 6px; border-radius: 999px; display: inline-flex; align-items: center; gap: 4px; font-size: 13px; font-weight: 700; white-space: nowrap; }
.game { height: 124px; padding: 0; border-radius: 22px; border: 2px solid var(--edge); background: var(--card); box-shadow: 0 3px 0 var(--edge); overflow: hidden; display: flex; flex-direction: column; text-align: left; }
.pic { height: 72px; width: 100%; display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden; }
.gname { padding: 9px 14px; font-size: 17px; font-weight: 700; }
.pill { height: 44px; padding: 0 16px 0 10px; border-radius: 999px; background: var(--accent-soft); display: flex; align-items: center; gap: 8px; font-size: 18px; font-weight: 700; }
@keyframes talk { 0%, 100% { transform: scaleY(1); } 50% { transform: scaleY(1.5); } }
@keyframes bob { 0%, 100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-5px) rotate(-2deg); } }
@keyframes glow { 0%, 100% { box-shadow: 0 0 0 0 rgba(154, 107, 69, 0.45); } 50% { box-shadow: 0 0 0 14px rgba(154, 107, 69, 0); } }
@keyframes enter { 0% { transform: translateY(24px) scale(0.95); opacity: 0; } 100% { transform: translateY(0) scale(1); opacity: 1; } }
@keyframes bubbleIn { 0% { transform: scale(0.6); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
@keyframes tagBounce { 0%, 86%, 100% { transform: translateX(-50%) rotate(-3deg) translateY(0); } 90% { transform: translateX(-50%) rotate(-3deg) translateY(-6px); } 95% { transform: translateX(-50%) rotate(-3deg) translateY(0); } }
@keyframes sway { 0%, 100% { transform: rotate(-5deg); } 50% { transform: rotate(5deg); } }
@keyframes sprout { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.08, 1.12); } }
@keyframes floatUp { 0% { transform: translateY(14px); opacity: 0; } 20% { opacity: 1; } 80% { opacity: 1; } 100% { transform: translateY(-30px); opacity: 0; } }
@keyframes jiggle { 0%, 100% { transform: rotate(0deg); } 25% { transform: rotate(-8deg); } 75% { transform: rotate(8deg); } }
@keyframes shuffle { 0%, 100% { transform: translateX(0) rotate(-10deg); } 50% { transform: translateX(10px) rotate(-4deg); } }
@keyframes shuffle2 { 0%, 100% { transform: translateX(0) rotate(12deg); } 50% { transform: translateX(-10px) rotate(4deg); } }
@keyframes dash { 0% { stroke-dashoffset: 0; } 100% { stroke-dashoffset: -24; } }
@keyframes flutter { 0%, 100% { transform: scaleX(1); } 50% { transform: scaleX(0.82); } }
@keyframes drift { 0%, 100% { transform: translateY(0) rotate(var(--r, 0deg)); } 50% { transform: translateY(-5px) rotate(var(--r, 0deg)); } }
@media (prefers-reduced-motion: reduce) { .talk-intro .ow-beak, .talk-a .ow-beak, .talk-b .ow-beak, .wv, .sq-idle, .owl-bob, .up-next, .in, .bubble-in, .tag, .bloom, .sprouting, .rise, .jiggle, .sh1, .sh2, .dashes, .page-flap, .word { animation: none !important; } }
<!--BODY-->
  <!-- one header: home, where you are, stars, grown-ups -->
  <header class="bar" style="gap: 14px;">
    <a href="R2HomeMore.dc.html" class="press btn">
      <svg width="22" height="22" viewBox="0 0 24 24"><path class="ic" d="M3.5 11L12 4l8.5 7"></path><path class="ic" d="M6 9.5V20h12V9.5"></path></svg>
      Home
    </a>
    <h1 class="display" style="margin: 0; font-size: 26px; font-weight: 650;">Luna’s Library</h1>
    <span class="soft" style="height: 32px; padding: 0 12px; border-radius: 10px; background: var(--well); border: 2px solid var(--edge); display: flex; align-items: center; font-size: 14px; font-weight: 700;">Kindergarten</span>
    <span class="pill" style="margin-left: auto; padding-left: 12px;">
      <svg width="24" height="24" viewBox="0 0 24 24"><path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z" fill="#C4996A" stroke="#7A5236" stroke-linejoin="round"></path></svg>
      9
    </span>
    <button class="press btn" aria-label="Grown-ups: settings" style="width: 48px; padding: 0; justify-content: center; color: var(--soft);">
      <svg width="24" height="24" viewBox="0 0 24 24"><circle class="ic" cx="12" cy="12" r="3.2"></circle><path class="ic" d="M12 2.5v3M12 18.5v3M4.6 4.6l2.1 2.1M17.3 17.3l2.1 2.1M2.5 12h3M18.5 12h3M4.6 19.4l2.1-2.1M17.3 6.7l2.1-2.1"></path></svg>
    </button>
  </header>

  <div style="position: relative; padding: 14px 28px 0; display: flex; flex-direction: column;">

    <!-- welcome: Luna greets you out loud (tap her to hear it again), the squishy shelf, today so far, and her pick -->
    <div style="height: 116px; display: flex; align-items: center; gap: 16px;">
      <button class="tap in owl-bob" onClick="{{ hi }}" aria-label="Hear Ms. Luna: Welcome back! Lesson 2 is ready to grow." style="position: relative; width: 108px; height: 108px; flex: none;">
        <span class="{{ owlClass }}" style="position: relative; display: block; width: 108px; height: 108px;">
          %%OWL 108%%
          <span class="speak"><svg width="20" height="20" viewBox="0 0 24 24"><path class="ic" d="M4 9v6h4l5 4V5L8 9z"></path><path class="ic wv" d="M16 9a4 4 0 0 1 0 6"></path><path class="ic wv" d="M18.5 6.5a8 8 0 0 1 0 11"></path></svg></span>
        </span>
      </button>

      <a href="R2Squishies.dc.html" class="press in panel" aria-label="Squishy shelf: 7 of 18 found" style="flex: 1; min-width: 0; height: 108px; box-sizing: border-box; border-radius: 22px; padding: 10px 16px 12px 20px; display: flex; align-items: center; gap: 14px; animation-delay: 80ms;">
        <span style="display: flex; flex-direction: column; gap: 4px; flex: none;">
          <span class="display" style="font-size: 22px; font-weight: 650; line-height: 1.1;">Squishy Shelf</span>
          <span class="soft" style="font-size: 14px;"><strong style="color: var(--ink);">7 of 18</strong> found</span>
        </span>
        <span style="flex: 1; min-width: 0; display: flex; flex-direction: column;">
          <span style="display: flex; justify-content: space-around; align-items: flex-end; height: 60px;">
            <svg width="62" height="57" viewBox="0 0 100 92"><g class="sq-idle"><circle cx="26" cy="30" r="11" fill="#B07D52" stroke="#7A5236" style="stroke-width: 3;"></circle><circle cx="74" cy="30" r="11" fill="#B07D52" stroke="#7A5236" style="stroke-width: 3;"></circle><circle cx="50" cy="56" r="32" fill="#B07D52" stroke="#7A5236" style="stroke-width: 3;"></circle><ellipse cx="50" cy="67" rx="13" ry="9" fill="#E9D3AE"></ellipse><ellipse cx="50" cy="63" rx="4" ry="3" fill="#3B2A20"></ellipse><circle cx="39" cy="52" r="3" fill="#3B2A20"></circle><circle cx="61" cy="52" r="3" fill="#3B2A20"></circle></g></svg>
            <svg width="62" height="57" viewBox="0 0 100 92"><g class="sq-idle" style="animation-delay: 1.2s;"><path d="M24 46 L28 24 L44 36 Z" fill="#D2A878" stroke="#9A6B45" stroke-linejoin="round" style="stroke-width: 3;"></path><path d="M76 46 L72 24 L56 36 Z" fill="#D2A878" stroke="#9A6B45" stroke-linejoin="round" style="stroke-width: 3;"></path><ellipse cx="50" cy="62" rx="38" ry="26" fill="#D2A878" stroke="#9A6B45" style="stroke-width: 3;"></ellipse><circle cx="40" cy="60" r="3" fill="#3B2A20"></circle><circle cx="60" cy="60" r="3" fill="#3B2A20"></circle><path d="M45 66 q2.5 3 5 0 q2.5 3 5 0" fill="none" stroke="#3B2A20" stroke-linecap="round" style="stroke-width: 2.2;"></path></g></svg>
            <svg width="62" height="57" viewBox="0 0 100 92"><g class="sq-idle" style="animation-delay: 2.4s;"><circle cx="50" cy="56" r="32" fill="#F1C9BC" stroke="#C98E7B" style="stroke-width: 3;"></circle><path d="M50 26 q-10 30 0 62" fill="none" stroke="#C98E7B" opacity="0.6" style="stroke-width: 2.5;"></path><path d="M52 26 q8 -14 22 -12 q-6 14 -22 12 z" fill="#A9B391" stroke="#5C6849" stroke-linejoin="round" style="stroke-width: 2;"></path><circle cx="40" cy="60" r="3" fill="#3B2A20"></circle><circle cx="60" cy="60" r="3" fill="#3B2A20"></circle></g></svg>
          </span>
          <span style="height: 8px; border-radius: 4px; background: var(--soil); border-bottom: 4px solid var(--soil-dk);"></span>
        </span>
        <svg width="22" height="22" viewBox="0 0 24 24" style="flex: none; color: var(--soft);"><path class="ic" d="M9 5l7 7-7 7"></path></svg>
      </a>

      <div class="in panel" style="width: 214px; height: 108px; flex: none; box-sizing: border-box; padding: 12px 16px; border-radius: 22px; display: flex; flex-direction: column; justify-content: space-between; animation-delay: 150ms;">
        <span class="lbl">Today</span>
        <span style="display: flex; align-items: baseline; gap: 6px;">
          <svg width="22" height="22" viewBox="0 0 24 24" style="color: var(--accent-text); align-self: center;"><circle class="ic" cx="12" cy="13" r="8"></circle><path class="ic" d="M12 9v4l2.5 2"></path></svg>
          <span class="display" style="font-size: 34px; font-weight: 700; line-height: 1;">8</span>
          <span class="soft" style="font-size: 16px; font-weight: 700;">min reading</span>
        </span>
        <span class="soft" style="font-size: 14px;"><strong style="color: var(--ink);">1 of 6</strong> lessons in bloom</span>
      </div>

      <button class="press in" style="width: 222px; height: 108px; flex: none; border: none; border-radius: 22px; background: var(--accent); color: var(--accent-ink); box-shadow: 0 5px 0 var(--accent-edge); display: flex; align-items: center; gap: 10px; padding: 0 14px; text-align: left; animation-delay: 250ms;">
        <span class="bloom" style="width: 46px; height: 46px; border-radius: 14px; background: #FFFBF5; color: #3B2A20; display: flex; align-items: center; justify-content: center; flex: none;">
          <svg width="30" height="30" viewBox="0 0 24 24"><rect class="ic" x="4" y="4" width="16" height="16" rx="4"></rect><circle cx="9" cy="9" r="1.4" fill="#3B2A20"></circle><circle cx="15" cy="9" r="1.4" fill="#3B2A20"></circle><circle cx="12" cy="12" r="1.4" fill="#3B2A20"></circle><circle cx="9" cy="15" r="1.4" fill="#3B2A20"></circle><circle cx="15" cy="15" r="1.4" fill="#3B2A20"></circle></svg>
        </span>
        <span style="display: flex; flex-direction: column;">
          <span class="display" style="font-size: 22px; font-weight: 650; line-height: 1.1; white-space: nowrap;">Luna’s Pick</span>
          <span style="font-size: 14px;">she chooses, you play</span>
        </span>
      </button>
    </div>

    <!-- the lessons, as a garden: seed, sprout, bud, bloom, and their times -->
    <div style="margin-top: 14px; display: flex; align-items: baseline; gap: 12px;">
      <h2 class="display" style="margin: 0; font-size: 24px; font-weight: 600;">Luna’s Lesson Garden</h2>
      <span class="soft" style="font-size: 15px;">a flower means you learned it</span>
    </div>
    <div style="position: relative; margin-top: 12px; display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 16px;">
      <svg style="position: absolute; left: 40px; right: 40px; bottom: -10px;" width="1044" height="20" viewBox="0 0 1044 20" preserveAspectRatio="none"><path d="M0 10 Q 130 0 260 10 T 520 10 T 780 10 T 1044 10" stroke-dasharray="2 12" style="fill: none; stroke: var(--soil); stroke-width: 5; stroke-linecap: round;"></path></svg>

      <a href="R2Done.dc.html" class="press lesson in" style="animation-delay: 300ms;">
        <span style="position: absolute; top: -6px; right: 12px; width: 28px; height: 28px; border-radius: 999px; background: var(--right); color: var(--right-ink); display: flex; align-items: center; justify-content: center;"><svg width="16" height="16" viewBox="0 0 24 24"><path class="ic" style="stroke-width: 3.4;" d="M5 12.5l4.5 4.5L19 7.5"></path></svg></span>
        %%PLANT daisy 54 63 bloom%%
        <span class="lbl" style="color: var(--right-text);">Lesson 1</span>
        <span class="ttl">Sounds for M, S, B &amp; T</span>
        <span class="time chip-took"><svg width="16" height="16" viewBox="0 0 24 24"><path class="ic" style="stroke-width: 3;" d="M5 12.5l4.5 4.5L19 7.5"></path></svg>took 4 min</span>
      </a>

      <a href="R2Round.dc.html" class="press lesson up-next" style="border: 3px solid var(--action); box-shadow: none; animation-delay: 0s, 360ms;">
        <span class="tag" style="position: absolute; top: -15px; left: 50%; padding: 3px 12px; border-radius: 8px; background: var(--accent); color: var(--accent-ink); font-size: 13px; font-weight: 700; white-space: nowrap;">Up next</span>
        %%PLANT sprout 54 63 - sprouting%%
        <span class="lbl" style="color: var(--accent-text);">Lesson 2</span>
        <span class="ttl">Find A, M, S &amp; B</span>
        <span class="time chip-accent"><svg width="16" height="16" viewBox="0 0 24 24"><circle class="ic" cx="12" cy="13" r="8"></circle><path class="ic" d="M12 9v4l2.5 2"></path></svg>about 5 min</span>
      </a>

      <button class="press lesson in" style="animation-delay: 420ms;">
        %%PLANT seed 54 63%%
        <span class="lbl">Lesson 3</span>
        <span class="ttl">Pet &amp; Animal Words</span>
        <span class="time chip-time"><svg width="16" height="16" viewBox="0 0 24 24"><circle class="ic" cx="12" cy="13" r="8"></circle><path class="ic" d="M12 9v4l2.5 2"></path></svg>about 4 min</span>
      </button>

      <button class="press lesson in" style="animation-delay: 480ms;">
        %%PLANT bud 54 63%%
        <span class="lbl">Lesson 4 · started</span>
        <span class="ttl">Everyday Words</span>
        <span class="time chip-time"><svg width="16" height="16" viewBox="0 0 24 24"><circle class="ic" cx="12" cy="13" r="8"></circle><path class="ic" d="M12 9v4l2.5 2"></path></svg>about 4 min</span>
      </button>

      <button class="press lesson in" style="animation-delay: 540ms;">
        %%PLANT seed 54 63%%
        <span class="lbl">Lesson 5</span>
        <span class="ttl">Starter Sight Words</span>
        <span class="time chip-time"><svg width="16" height="16" viewBox="0 0 24 24"><circle class="ic" cx="12" cy="13" r="8"></circle><path class="ic" d="M12 9v4l2.5 2"></path></svg>about 4 min</span>
      </button>

      <button class="press lesson in" style="animation-delay: 600ms;">
        %%PLANT seed 54 63%%
        <span class="lbl">Lesson 6</span>
        <span class="ttl">Rhyme Matcher</span>
        <span class="time chip-time"><svg width="16" height="16" viewBox="0 0 24 24"><circle class="ic" cx="12" cy="13" r="8"></circle><path class="ic" d="M12 9v4l2.5 2"></path></svg>about 6 min</span>
      </button>
    </div>

    <!-- the play shelf: every tile the same size, each picture gently alive -->
    <div style="margin-top: 24px; display: flex; align-items: baseline; gap: 12px;">
      <h2 class="display" style="margin: 0; font-size: 24px; font-weight: 600;">The Play Shelf</h2>
      <span class="soft" style="font-size: 15px;">8 games</span>
    </div>
    <div style="margin-top: 10px; display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 14px;">
      <button class="press game in" style="animation-delay: 650ms;">
        <span class="pic" style="background: var(--tint-1);"><svg width="96" height="68" viewBox="0 0 120 86"><rect x="34" y="4" width="52" height="10" rx="4" fill="#5C6849"></rect><path d="M38 14h44v58a10 10 0 0 1-10 10H48a10 10 0 0 1-10-10z" fill="#FFFBF5" stroke="#5C6849" style="stroke-width: 3;"></path><text class="jiggle" x="45" y="48" style="font: 700 20px Andika; fill: #9A6B45;">B</text><text class="jiggle" x="64" y="60" style="font: 700 18px Andika; fill: #6B4C35; animation-delay: 0.7s;">m</text><text class="jiggle" x="48" y="74" style="font: 700 16px Andika; fill: #5C6849; animation-delay: 1.4s;">s</text></svg></span>
        <span class="gname">The Letter Jar</span>
      </button>
      <button class="press game in" style="animation-delay: 700ms;">
        <span class="pic" style="background: var(--tint-2);">
          <span class="rise" style="position: absolute; left: 34%; top: 22px; width: 36px; height: 36px; border-radius: 999px; background: #FFFBF5; border: 3px solid #9A6B45; box-sizing: border-box;"></span>
          <span class="rise" style="position: absolute; left: 54%; top: 30px; width: 26px; height: 26px; border-radius: 999px; background: #FFFBF5; border: 3px solid #9A6B45; box-sizing: border-box; animation-delay: 1.3s;"></span>
          <span class="rise" style="position: absolute; left: 68%; top: 36px; width: 18px; height: 18px; border-radius: 999px; background: #FFFBF5; border: 3px solid #9A6B45; box-sizing: border-box; animation-delay: 2.6s;"></span>
        </span>
        <span class="gname">Bubble Sounds</span>
      </button>
      <button class="press game in" style="animation-delay: 750ms;">
        <span class="pic" style="background: var(--tint-3);"><svg width="120" height="68" viewBox="0 0 140 80"><g class="jiggle"><circle cx="54" cy="42" r="28" fill="#D2A878" stroke="#7A5236" style="stroke-width: 3;"></circle><text x="54" y="51" text-anchor="middle" style="font: 700 26px Andika; fill: #3B2A20;">b</text><circle cx="40" cy="30" r="2.6" fill="#6B4C35"></circle><circle cx="70" cy="34" r="2.4" fill="#6B4C35"></circle><circle cx="66" cy="60" r="2.6" fill="#6B4C35"></circle></g><g class="jiggle" style="animation-delay: 1.2s;"><circle cx="102" cy="50" r="19" fill="#E9D3AE" stroke="#7A5236" style="stroke-width: 3;"></circle><text x="102" y="57" text-anchor="middle" style="font: 700 19px Andika; fill: #3B2A20;">s</text></g></svg></span>
        <span class="gname">Letter Cookies</span>
      </button>
      <button class="press game in" style="animation-delay: 800ms;">
        <span class="pic" style="background: var(--tint-4);"><svg width="120" height="68" viewBox="0 0 140 80"><rect class="sh1" x="30" y="12" width="38" height="54" rx="8" fill="#9A6B45"></rect><rect x="52" y="10" width="38" height="54" rx="8" fill="#FFFBF5" stroke="#9A6B45" style="stroke-width: 3;"></rect><circle cx="71" cy="37" r="9" fill="#E2B9A6"></circle><rect class="sh2" x="74" y="14" width="38" height="54" rx="8" fill="#9A6B45"></rect></svg></span>
        <span class="gname">Muddled Cards</span>
      </button>
      <button class="press game in" style="animation-delay: 850ms;">
        <span class="pic" style="background: var(--tint-5); gap: 8px;">
          <span class="word" style="padding: 3px 9px; border-radius: 8px; background: #FFFBF5; color: #3B2A20; font-size: 17px; font-weight: 700; --r: -5deg;">The</span>
          <span class="word" style="padding: 3px 9px; border-radius: 8px; background: #FFFBF5; color: #3B2A20; font-size: 17px; font-weight: 700; --r: 4deg; animation-delay: 0.8s;">cat</span>
          <span class="word" style="padding: 3px 9px; border-radius: 8px; background: #FFFBF5; color: #3B2A20; font-size: 17px; font-weight: 700; --r: -2deg; animation-delay: 1.6s;">is</span>
        </span>
        <span class="gname">Words Off the Page</span>
      </button>
      <button class="press game in" style="animation-delay: 900ms;">
        <span class="pic" style="background: var(--tint-2);"><svg width="130" height="60" viewBox="0 0 130 60"><circle cx="24" cy="34" r="14" fill="#D2A878" stroke="#7A5236" style="stroke-width: 2.5;"></circle><rect x="48" y="20" width="28" height="28" rx="6" fill="#A9B391" stroke="#5C6849" style="stroke-width: 2.5;"></rect><rect class="jiggle" x="92" y="20" width="28" height="28" rx="8" stroke-dasharray="5 5" style="fill: none; stroke: var(--accent-text); stroke-width: 2.5;"></rect></svg></span>
        <span class="gname">What’s Missing?</span>
      </button>
      <button class="press game in" style="animation-delay: 950ms;">
        <span class="pic" style="background: var(--tint-1);"><svg width="150" height="64" viewBox="0 0 160 70"><path class="dashes" d="M14 56C40 56 40 14 80 24s40 34 66 14" style="fill: none; stroke: var(--stem); stroke-width: 4; stroke-linecap: round;"></path><path d="M138 28l12 12M150 28l-12 12" style="stroke: var(--accent-text); stroke-width: 4; stroke-linecap: round;"></path></svg></span>
        <span class="gname">Treasure Path</span>
      </button>
      <button class="press game in" style="animation-delay: 1000ms;">
        <span class="pic" style="background: var(--tint-3);"><svg width="104" height="64" viewBox="0 0 120 74"><path d="M60 18c-12-8-28-9-44-6v50c16-3 32-2 44 6z" fill="#FFFBF5" stroke="#7A5236" style="stroke-width: 3;"></path><path class="page-flap" d="M60 18c12-8 28-9 44-6v50c-16-3-32-2-44 6z" fill="#FFFBF5" stroke="#7A5236" style="stroke-width: 3;"></path></svg></span>
        <span class="gname">Story Corner</span>
      </button>
    </div>
  </div>
<!--LOGIC-->
  extra(vals, s, dark) {
    var self = this;
    var hi = s.hiBeat || 0;
    vals.owlClass = hi === 0 ? 'talk-intro' : (hi % 2 === 0 ? 'talk-a' : 'talk-b');
    vals.hi = function () {
      var cur = self.state || {};
      self.setState({ hiBeat: (cur.hiBeat || 0) + 1 });
    };
  }
