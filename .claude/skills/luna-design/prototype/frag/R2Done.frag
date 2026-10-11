<!--CSS-->
.ow-beak { animation: talk 240ms ease-in-out 1.6s 8; }
.owl-hop { animation: hop 800ms cubic-bezier(0.34, 1.56, 0.64, 1) 1.4s both; }
.medal { width: 168px; height: 168px; border-radius: 999px; background: var(--right); color: var(--right-ink); box-shadow: 0 6px 0 var(--right-edge), 0 0 0 14px var(--right-glow); display: flex; align-items: center; justify-content: center; }
.grow-a .medal { animation: popA 700ms cubic-bezier(0.34, 1.56, 0.64, 1) 300ms both; }
.grow-b .medal { animation: popB 700ms cubic-bezier(0.34, 1.56, 0.64, 1) both; }
.lbar { flex: 1; position: relative; height: 26px; box-sizing: border-box; border-radius: 999px; background: var(--well); border: 2px solid var(--edge); overflow: hidden; }
.lfill { position: absolute; left: 0; top: 0; bottom: 0; width: 33.333%; border-radius: 999px; background: var(--right); animation: fillUp 900ms cubic-bezier(0.34, 1.3, 0.64, 1) 1.2s both; }
.ltick { position: absolute; top: 0; bottom: 0; width: 3px; margin-left: -1px; background: var(--card); opacity: 0.85; }
.in { animation: enter 600ms cubic-bezier(0.34, 1.56, 0.64, 1) both; }
.star { transform-box: fill-box; transform-origin: center; animation: starIn 600ms cubic-bezier(0.34, 1.56, 0.64, 1) both; }
.sq { transform-origin: 50% 100%; }
.sq-a { animation: squishA 700ms cubic-bezier(0.3, 0.7, 0.4, 1); }
.sq-b { animation: squishB 700ms cubic-bezier(0.3, 0.7, 0.4, 1); }
.spark { transform-box: fill-box; transform-origin: center; animation: twinkle 2.2s ease-in-out infinite; }
.petal { position: absolute; top: 0; border-radius: 80% 0 80% 0; opacity: 0; pointer-events: none; }
.petal-a { animation: petalA 2200ms cubic-bezier(0.35, 0.1, 0.6, 1) 1.2s forwards; }
.petal-b { animation: petalB 2200ms cubic-bezier(0.35, 0.1, 0.6, 1) 1.2s forwards; }
.rare-tag { position: relative; display: inline-flex; align-self: flex-start; }
.shimmer { position: relative; overflow: hidden; isolation: isolate; background: var(--rare-soft); color: var(--rare-text); box-shadow: 0 0 0 2px var(--rare-edge); animation: rareGlow 2.6s ease-in-out infinite; }
.shimmer::after { content: ''; position: absolute; top: -6px; bottom: -6px; width: 42%; left: -60%; background: linear-gradient(100deg, transparent 0%, var(--shine) 50%, transparent 100%); transform: skewX(-18deg); animation: sweep 2.6s ease-in-out infinite; }
.tag-spark { position: absolute; transform-box: fill-box; transform-origin: center; animation: twinkle 1.8s ease-in-out infinite; }
@keyframes talk { 0%, 100% { transform: scaleY(1); } 50% { transform: scaleY(1.5); } }
@keyframes hop { 0%, 100% { transform: translateY(0); } 40% { transform: translateY(-14px) rotate(-4deg); } 70% { transform: translateY(0) rotate(2deg); } }
@keyframes fillUp { 0% { width: 16.667%; } 100% { width: 33.333%; } }
@keyframes popA { 0% { transform: scale(0); } 70% { transform: scale(1.15); } 100% { transform: scale(1); } }
@keyframes popB { 0% { transform: scale(0); } 70% { transform: scale(1.15); } 100% { transform: scale(1); } }
@keyframes enter { 0% { transform: translateY(24px) scale(0.96); opacity: 0; } 100% { transform: translateY(0) scale(1); opacity: 1; } }
@keyframes starIn { 0% { transform: scale(0) rotate(-40deg); } 70% { transform: scale(1.2) rotate(8deg); } 100% { transform: scale(1) rotate(0deg); } }
@keyframes squishA { 0%, 100% { transform: scale(1, 1); } 25% { transform: scale(1.3, 0.66); } 50% { transform: scale(0.9, 1.12); } 75% { transform: scale(1.05, 0.96); } }
@keyframes squishB { 0%, 100% { transform: scale(1, 1); } 25% { transform: scale(1.3, 0.66); } 50% { transform: scale(0.9, 1.12); } 75% { transform: scale(1.05, 0.96); } }
@keyframes twinkle { 0%, 100% { opacity: 0.2; transform: scale(0.6) rotate(0deg); } 50% { opacity: 1; transform: scale(1.15) rotate(20deg); } }
@keyframes sweep { 0%, 35% { left: -60%; } 75%, 100% { left: 130%; } }
@keyframes rareGlow { 0%, 100% { box-shadow: 0 0 0 2px var(--rare-edge), 0 0 0 0 rgba(201, 142, 123, 0); } 50% { box-shadow: 0 0 0 2px var(--rare-edge), 0 0 12px 3px rgba(201, 142, 123, 0.45); } }
@keyframes petalA { 0% { transform: translate(0, -40px) rotate(0deg); opacity: 0; } 8% { opacity: 1; } 30% { transform: translate(26px, 220px) rotate(90deg); } 55% { transform: translate(-16px, 450px) rotate(180deg); } 80% { transform: translate(20px, 680px) rotate(270deg); opacity: 1; } 100% { transform: translate(4px, 880px) rotate(340deg); opacity: 0.6; } }
@keyframes petalB { 0% { transform: translate(0, -40px) rotate(0deg); opacity: 0; } 8% { opacity: 1; } 30% { transform: translate(-24px, 220px) rotate(-80deg); } 55% { transform: translate(18px, 450px) rotate(-170deg); } 80% { transform: translate(-20px, 680px) rotate(-260deg); opacity: 1; } 100% { transform: translate(-4px, 880px) rotate(-330deg); opacity: 0.6; } }
@media (prefers-reduced-motion: reduce) { .owl-hop, .medal, .lfill, .in, .star, .sq-a, .sq-b, .spark, .shimmer, .shimmer::after, .tag-spark { animation: none !important; } .petal, .shimmer::after { display: none; } }
<!--BODY-->
  <header class="bar" style="gap: 18px;">
    <a href="R2Library.dc.html" class="press btn">
      <svg width="22" height="22" viewBox="0 0 24 24"><path class="ic" d="M19 12H5"></path><path class="ic" d="M11 6l-6 6 6 6"></path></svg>
      Library
    </a>
    <span class="display" style="font-size: 22px; font-weight: 600;">Lesson 2 · Find A, M, S &amp; B</span>
  </header>

  <div class="in panel" style="position: absolute; left: 60px; right: 60px; top: 92px; height: 690px; box-sizing: border-box; border-radius: 32px; box-shadow: 0 5px 0 var(--edge), 0 18px 36px var(--shadow-lg); display: grid; grid-template-columns: 420px minmax(0, 1fr); overflow: hidden;">

    <!-- left: the lesson is done -->
    <div style="position: relative; background: var(--accent-soft); display: flex; flex-direction: column; align-items: center; padding: 26px 24px 0; gap: 6px; overflow: hidden;">
      <div style="position: absolute; left: 50%; top: 40px; width: 300px; height: 300px; margin-left: -150px; border-radius: 999px 999px 0 0; background: var(--edge);"></div>
      <button class="tap" onClick="{{ regrow }}" aria-label="See it again" style="position: relative; margin-top: 70px;">
        <span class="{{ growClass }}" style="display: block;">
          <span class="medal"><svg width="92" height="92" viewBox="0 0 24 24"><path class="ic" style="stroke-width: 3;" d="M5 12.5l4.5 4.5L19 7.5"></path></svg></span>
        </span>
      </button>
      <h1 class="display" style="position: relative; margin: 26px 0 0; font-size: 40px; font-weight: 650; text-align: center; line-height: 1.05;">Lesson done!</h1>
      <p class="soft" style="position: relative; margin: 0; font-size: 18px; text-align: center;">You learned A, M, S and B.</p>
      <div style="position: relative; display: flex; gap: 10px; margin-top: 8px;" aria-label="3 stars">
        <svg class="star" style="animation-delay: 1.6s;" width="46" height="46" viewBox="0 0 24 24"><path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z" fill="#C4996A" stroke="#7A5236" stroke-linejoin="round" style="stroke-width: 1.2;"></path></svg>
        <svg class="star" style="animation-delay: 1.75s;" width="46" height="46" viewBox="0 0 24 24"><path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z" fill="#C4996A" stroke="#7A5236" stroke-linejoin="round" style="stroke-width: 1.2;"></path></svg>
        <svg class="star" style="animation-delay: 1.9s;" width="46" height="46" viewBox="0 0 24 24"><path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z" fill="#C4996A" stroke="#7A5236" stroke-linejoin="round" style="stroke-width: 1.2;"></path></svg>
      </div>
      <span class="soft" style="position: relative; font-size: 15px;">4 of 4 solved</span>

      <!-- Luna cheers from the corner -->
      <div class="owl-hop" style="position: absolute; left: 14px; bottom: 6px; width: 96px; height: 96px;">
        <svg width="96" height="96" viewBox="0 0 200 200">
          <ellipse cx="100" cy="191" rx="50" ry="7" fill="#3B2A20" opacity="0.12"></ellipse>
          <path d="M58 66 L50 28 L86 48 Z" fill="#A0744B" stroke="#A0744B" stroke-linejoin="round" style="stroke-width: 8;"></path>
          <path d="M142 66 L150 28 L114 48 Z" fill="#A0744B" stroke="#A0744B" stroke-linejoin="round" style="stroke-width: 8;"></path>
          <ellipse cx="34" cy="96" rx="14" ry="30" fill="#A0744B" transform="rotate(40 34 96)"></ellipse>
          <ellipse cx="166" cy="96" rx="14" ry="30" fill="#A0744B" transform="rotate(-40 166 96)"></ellipse>
          <ellipse cx="100" cy="112" rx="66" ry="72" fill="#C4996A"></ellipse>
          <ellipse cx="100" cy="150" rx="40" ry="30" fill="#F5E6CF"></ellipse>
          <circle cx="74" cy="94" r="21" fill="#FFFBF5"></circle>
          <circle cx="126" cy="94" r="21" fill="#FFFBF5"></circle>
          <g class="ow-eyes"><path d="M64 98 q12 -12 24 0" fill="none" stroke="#2A1E17" stroke-linecap="round" style="stroke-width: 6;"></path><path d="M112 98 q12 -12 24 0" fill="none" stroke="#2A1E17" stroke-linecap="round" style="stroke-width: 6;"></path></g>
          <circle cx="74" cy="94" r="23" fill="none" stroke="#1E1916" style="stroke-width: 5;"></circle>
          <circle cx="126" cy="94" r="23" fill="none" stroke="#1E1916" style="stroke-width: 5;"></circle>
          <path d="M97 91 q3 -3 6 0" fill="none" stroke="#1E1916" stroke-linecap="round" style="stroke-width: 5;"></path>
          <ellipse cx="56" cy="124" rx="9" ry="5.5" fill="#E2B9A6"></ellipse>
          <ellipse cx="144" cy="124" rx="9" ry="5.5" fill="#E2B9A6"></ellipse>
          <path class="ow-beak" d="M92 116 h16 l-8 11 z" fill="#7A5236" stroke="#7A5236" stroke-linejoin="round" style="stroke-width: 3;"></path>
          <ellipse cx="82" cy="186" rx="11" ry="6" fill="#7A5236"></ellipse>
          <ellipse cx="118" cy="186" rx="11" ry="6" fill="#7A5236"></ellipse>
        </svg>
      </div>
    </div>

    <!-- right: time, the lessons bar, the new squishy, what next -->
    <div style="padding: 30px 34px; display: flex; flex-direction: column; gap: 20px;">
      <div style="display: flex; flex-direction: column; gap: 8px;">
        <span class="lbl">Time</span>
        <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
          <span class="chip chip-took" style="height: 44px; font-size: 19px;"><svg width="24" height="24" viewBox="0 0 24 24"><circle class="ic" cx="12" cy="13" r="8"></circle><path class="ic" d="M12 9v4l2.5 2"></path></svg>You took 4 minutes</span>
          <span class="chip chip-time">this lesson is about 5 min</span>
        </div>
      </div>

      <div style="display: flex; flex-direction: column; gap: 10px;">
        <span class="lbl">Your lessons</span>
        <div style="display: flex; align-items: center; gap: 16px;">
          <span class="lbar" aria-hidden="true"><span class="lfill"></span><span class="ltick" style="left: 16.667%;"></span><span class="ltick" style="left: 33.333%;"></span><span class="ltick" style="left: 50%;"></span><span class="ltick" style="left: 66.667%;"></span><span class="ltick" style="left: 83.333%;"></span></span>
          <span style="display: flex; flex-direction: column; flex: none;">
            <strong style="font-size: 22px;">2 of 6</strong>
            <span class="soft" style="font-size: 15px;">lessons done · 12 min today</span>
          </span>
        </div>
        <span class="chip chip-accent" style="align-self: flex-start; height: 38px; font-size: 17px;"><svg width="20" height="20" viewBox="0 0 24 24"><rect class="ic" x="5" y="10.5" width="14" height="10" rx="2.5"></rect><path class="ic" d="M8 10.5V8a4 4 0 0 1 7.6-1.8"></path></svg>Lesson 3 is open now</span>
      </div>

      <div style="display: flex; align-items: center; gap: 18px; padding: 14px 18px; border-radius: 22px; border: 3px dashed var(--accent); background: var(--card);">
        <button class="tap" onClick="{{ squish }}" aria-label="Squish your new bunny" style="position: relative; flex: none; width: 116px; height: 106px;">
          <span class="{{ sqClass }}" style="display: block; width: 116px; height: 106px;">
            <svg width="116" height="106" viewBox="0 0 100 92">
              <ellipse cx="50" cy="86" rx="30" ry="5" fill="#3B2A20" opacity="0.12"></ellipse>
              <ellipse cx="38" cy="28" rx="8" ry="20" fill="#F1C9BC" stroke="#C98E7B" style="stroke-width: 3;"></ellipse>
              <ellipse cx="62" cy="28" rx="8" ry="20" fill="#F1C9BC" stroke="#C98E7B" style="stroke-width: 3;"></ellipse>
              <ellipse cx="38" cy="30" rx="3.5" ry="12" fill="#FFFBF5" opacity="0.7"></ellipse>
              <ellipse cx="62" cy="30" rx="3.5" ry="12" fill="#FFFBF5" opacity="0.7"></ellipse>
              <ellipse cx="50" cy="62" rx="36" ry="25" fill="#F1C9BC" stroke="#C98E7B" style="stroke-width: 3;"></ellipse>
              <circle cx="41" cy="60" r="3" fill="#3B2A20"></circle>
              <circle cx="59" cy="60" r="3" fill="#3B2A20"></circle>
              <path d="M46 66 q4 4 8 0" fill="none" stroke="#3B2A20" stroke-linecap="round" style="stroke-width: 2.4;"></path>
              <ellipse cx="33" cy="67" rx="5" ry="3" fill="#E59C8A" opacity="0.6"></ellipse>
              <ellipse cx="67" cy="67" rx="5" ry="3" fill="#E59C8A" opacity="0.6"></ellipse>
            </svg>
          </span>
          <svg class="spark" style="position: absolute; right: -4px; top: 4px;" width="20" height="20" viewBox="0 0 24 24"><path d="M12 2l2.6 7.4L22 12l-7.4 2.6L12 22l-2.6-7.4L2 12l7.4-2.6z" fill="#E2B9A6" stroke="#9A5A44" stroke-linejoin="round"></path></svg>
        </button>
        <span style="display: flex; flex-direction: column; gap: 6px;">
          <span class="lbl" style="color: var(--accent-text);">New squishy for your shelf</span>
          <span style="font-size: 24px; font-weight: 700;">Bunny</span>
          <span class="rare-tag">
            <span class="chip shimmer" style="height: 32px;"><svg width="16" height="16" viewBox="0 0 24 24"><path d="M12 2l2.6 7.4L22 12l-7.4 2.6L12 22l-2.6-7.4L2 12l7.4-2.6z" fill="#E2B9A6" stroke="#7F4433" stroke-linejoin="round"></path></svg>Rare colour: blush!</span>
            <svg class="tag-spark" style="right: -14px; top: -10px;" width="16" height="16" viewBox="0 0 24 24"><path d="M12 2l2.6 7.4L22 12l-7.4 2.6L12 22l-2.6-7.4L2 12l7.4-2.6z" fill="#F1C9BC" stroke="#9A5A44" stroke-linejoin="round"></path></svg>
            <svg class="tag-spark" style="right: 18px; bottom: -12px; animation-delay: 0.6s;" width="12" height="12" viewBox="0 0 24 24"><path d="M12 2l2.6 7.4L22 12l-7.4 2.6L12 22l-2.6-7.4L2 12l7.4-2.6z" fill="#F1C9BC" stroke="#9A5A44" stroke-linejoin="round"></path></svg>
            <svg class="tag-spark" style="left: -12px; top: -8px; animation-delay: 1.1s;" width="12" height="12" viewBox="0 0 24 24"><path d="M12 2l2.6 7.4L22 12l-7.4 2.6L12 22l-2.6-7.4L2 12l7.4-2.6z" fill="#F1C9BC" stroke="#9A5A44" stroke-linejoin="round"></path></svg>
          </span>
          <span class="soft" style="font-size: 14px;">Only about 1 in 8 squishies comes in a rare colour. Tap her to squish.</span>
        </span>
      </div>

      <div style="margin-top: auto; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px;">
        <a href="R2Round.dc.html" class="press btn btn-action" style="height: 64px; border-radius: 18px; justify-content: center; font-size: 19px;"><svg width="22" height="22" viewBox="0 0 24 24"><path class="ic" d="M3 12a9 9 0 1 0 3-6.7"></path><path class="ic" d="M3 4v5h5"></path></svg>Play again</a>
        <a href="R2Library.dc.html" class="press btn" style="height: 64px; border-radius: 18px; justify-content: center; font-size: 19px; box-shadow: 0 5px 0 var(--edge);">Next lesson<svg width="22" height="22" viewBox="0 0 24 24"><path class="ic" d="M5 12h14M13 6l6 6-6 6"></path></svg></a>
        <a href="R2Squishies.dc.html" class="press" style="height: 64px; box-sizing: border-box; border-radius: 18px; border: 2px dashed var(--soil); display: flex; align-items: center; justify-content: center; gap: 8px; font-size: 19px; font-weight: 700; color: var(--soft);">See my shelf</a>
      </div>
    </div>
  </div>
  <!-- petals drift down, the same celebration as a solved round -->
  <sc-for list="{{ petals }}" as="p" hint-placeholder-count="0">
    <span class="{{ p.cls }}" style="{{ p.style }}"></span>
  </sc-for>
<!--LOGIC-->
  extra(vals, s, dark) {
    var self = this;
    var grow = s.grow || 0;
    var sq = s.sq || 0;
    vals.growClass = grow % 2 === 0 ? 'grow-a' : 'grow-b';
    vals.sqClass = sq > 0 ? (sq % 2 === 0 ? 'sq sq-a' : 'sq sq-b') : 'sq';
    vals.regrow = function () {
      var cur = self.state || {};
      self.setState({ grow: (cur.grow || 0) + 1 });
    };
    vals.squish = function () {
      var cur = self.state || {};
      self.setState({ sq: (cur.sq || 0) + 1 });
    };
    var colors = ['#FFFBF5', '#F1C9BC', '#C8323C', '#D9C4A6', '#FBF1E2', '#EBA9AC', '#C4996A'];
    var petals = [];
    for (var i = 0; i < 24; i++) {
      var w = 10 + (i % 4) * 3;
      var c = colors[i % colors.length];
      var edge = c === '#FFFBF5' || c === '#FBF1E2' ? ' box-shadow: inset 0 0 0 1.5px #C9AE8B;' : '';
      petals.push({
        cls: 'petal ' + (i % 2 === 0 ? 'petal-a' : 'petal-b'),
        style: 'left: ' + ((i * 41 + 7) % 100) + '%; width: ' + w + 'px; height: ' + Math.round(w * 1.35) + 'px; background: ' + c + '; animation-delay: ' + (1200 + (i * 67) % 700) + 'ms; animation-duration: ' + (1800 + (i * 83) % 800) + 'ms;' + edge
      });
    }
    vals.petals = petals;
  }
