<!--CSS-->
.talk-a .ow-beak { animation: talkA 240ms ease-in-out 8; }
.talk-b .ow-beak { animation: talkB 240ms ease-in-out 8; }
.hop-a { animation: hopA 700ms cubic-bezier(0.34, 1.56, 0.64, 1); }
.hop-b { animation: hopB 700ms cubic-bezier(0.34, 1.56, 0.64, 1); }
.tilt-a { animation: tiltA 700ms ease-in-out; }
.tilt-b { animation: tiltB 700ms ease-in-out; }
.slot { animation: rise 600ms cubic-bezier(0.34, 1.56, 0.64, 1) both; }
.choice { width: 136px; height: 136px; border-radius: 26px; border: 3px solid var(--edge); background: var(--card); box-shadow: 0 6px 0 var(--edge); font-family: 'Andika', sans-serif; font-weight: 700; font-size: 76px; line-height: 1; color: var(--ink); cursor: pointer; transition: transform 120ms cubic-bezier(0.2, 0, 0, 1), box-shadow 120ms cubic-bezier(0.2, 0, 0, 1), background-color 240ms ease, border-color 240ms ease, opacity 240ms ease; }
.choice:active:not(:disabled) { transform: translateY(5px); box-shadow: 0 1px 0 var(--edge); }
.choice:focus-visible, .cue:focus-visible { outline: 3px solid var(--focus); outline-offset: 4px; }
.choice.is-wrong { border-color: var(--retry-edge); background: var(--retry-soft); animation: wobble 400ms ease-in-out; }
.choice.is-right { border-color: var(--right); background: var(--right); color: var(--right-ink); box-shadow: 0 6px 0 var(--right-edge), 0 0 0 10px var(--right-glow); animation: pop 400ms cubic-bezier(0.34, 1.56, 0.64, 1); }
.choice.is-faded { opacity: 0.4; cursor: default; }
.cue-wrap { position: relative; animation: dropIn 700ms cubic-bezier(0.34, 1.56, 0.64, 1) both; }
.cue { position: relative; width: 190px; height: 214px; border-radius: 999px 999px 26px 26px; border: 3px dashed var(--action); background: var(--card); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; cursor: pointer; font-family: 'Andika', sans-serif; color: var(--ink); transition: background-color 240ms ease, border-color 240ms ease; }
.cue.is-hidden { animation: listen 4s ease-in-out 1s infinite; }
.cue.is-found { border-style: solid; border-color: var(--right); background: var(--right-soft); animation: pop 400ms cubic-bezier(0.34, 1.56, 0.64, 1); }
.ring { position: absolute; inset: 0; border-radius: 999px 999px 26px 26px; border: 3px solid var(--action); pointer-events: none; opacity: 0; }
.ring-a { animation: ringA 900ms cubic-bezier(0.2, 0, 0, 1); }
.ring-a.r2 { animation-delay: 200ms; }
.ring-b { animation: ringB 900ms cubic-bezier(0.2, 0, 0, 1); }
.ring-b.r2 { animation-delay: 200ms; }
.spark { position: absolute; left: 50%; top: 40%; width: 24px; height: 24px; margin: -12px 0 0 -12px; opacity: 0; }
.s1 { animation: burst1 700ms cubic-bezier(0.2, 0, 0, 1) forwards; }
.s2 { animation: burst2 700ms cubic-bezier(0.2, 0, 0, 1) 60ms forwards; }
.s3 { animation: burst3 700ms cubic-bezier(0.2, 0, 0, 1) 120ms forwards; }
.s4 { animation: burst4 700ms cubic-bezier(0.2, 0, 0, 1) 90ms forwards; }
.s5 { animation: burst5 700ms cubic-bezier(0.2, 0, 0, 1) 30ms forwards; }
.petal { position: absolute; top: 0; border-radius: 80% 0 80% 0; opacity: 0; pointer-events: none; }
.petal-a { animation: petalA 2200ms cubic-bezier(0.35, 0.1, 0.6, 1) forwards; }
.petal-b { animation: petalB 2200ms cubic-bezier(0.35, 0.1, 0.6, 1) forwards; }
.grow-in { transform-origin: 50% 100%; animation: growIn 700ms cubic-bezier(0.34, 1.56, 0.64, 1) both; }
.sway { transform-box: fill-box; transform-origin: 50% 100%; animation: sway 5s ease-in-out 1.2s infinite; }
.rbar { position: relative; width: 220px; height: 22px; box-sizing: border-box; border-radius: 999px; background: var(--well); border: 2px solid var(--edge); overflow: hidden; }
.rfill { position: absolute; left: 0; top: 0; bottom: 0; border-radius: 999px; background: var(--right); transition: width 600ms cubic-bezier(0.34, 1.3, 0.64, 1); }
.q0 { width: 0; } .q1 { width: 25%; }
.rtick { position: absolute; top: 0; bottom: 0; width: 3px; margin-left: -1px; background: var(--card); opacity: 0.85; }
.bubble-in { animation: rise 500ms cubic-bezier(0.34, 1.56, 0.64, 1) 400ms both; }
@keyframes talkA { 0%, 100% { transform: scaleY(1); } 50% { transform: scaleY(1.5); } }
@keyframes talkB { 0%, 100% { transform: scaleY(1); } 50% { transform: scaleY(1.5); } }
@keyframes hopA { 0%, 100% { transform: translateY(0); } 40% { transform: translateY(-18px) rotate(-5deg); } 70% { transform: translateY(0) rotate(3deg); } }
@keyframes hopB { 0%, 100% { transform: translateY(0); } 40% { transform: translateY(-18px) rotate(-5deg); } 70% { transform: translateY(0) rotate(3deg); } }
@keyframes tiltA { 0%, 100% { transform: rotate(0deg); } 30% { transform: rotate(-10deg); } 65% { transform: rotate(6deg); } }
@keyframes tiltB { 0%, 100% { transform: rotate(0deg); } 30% { transform: rotate(-10deg); } 65% { transform: rotate(6deg); } }
@keyframes wobble { 0%, 100% { transform: translateX(0); } 20% { transform: translateX(-9px) rotate(-3deg); } 40% { transform: translateX(8px) rotate(2deg); } 60% { transform: translateX(-5px) rotate(-1deg); } 80% { transform: translateX(3px); } }
@keyframes pop { 0% { transform: scale(0.9); } 55% { transform: scale(1.12); } 100% { transform: scale(1); } }
@keyframes dropIn { 0% { transform: translateY(-40px) scale(0.8); opacity: 0; } 100% { transform: translateY(0) scale(1); opacity: 1; } }
@keyframes rise { 0% { transform: translateY(40px) scale(0.85); opacity: 0; } 100% { transform: translateY(0) scale(1); opacity: 1; } }
@keyframes listen { 0%, 70%, 100% { box-shadow: 0 6px 0 var(--edge), 0 0 0 0 rgba(154, 107, 69, 0.35); } 85% { box-shadow: 0 6px 0 var(--edge), 0 0 0 16px rgba(154, 107, 69, 0); } }
@keyframes ringA { 0% { transform: scale(0.8); opacity: 0.8; } 100% { transform: scale(1.7); opacity: 0; } }
@keyframes ringB { 0% { transform: scale(0.8); opacity: 0.8; } 100% { transform: scale(1.7); opacity: 0; } }
@keyframes burst1 { 0% { transform: translate(0, 0) scale(0.2); opacity: 0; } 30% { opacity: 1; } 100% { transform: translate(-170px, -80px) scale(1.1) rotate(80deg); opacity: 0; } }
@keyframes burst2 { 0% { transform: translate(0, 0) scale(0.2); opacity: 0; } 30% { opacity: 1; } 100% { transform: translate(170px, -100px) scale(1.1) rotate(-80deg); opacity: 0; } }
@keyframes burst3 { 0% { transform: translate(0, 0) scale(0.2); opacity: 0; } 30% { opacity: 1; } 100% { transform: translate(-150px, 90px) scale(1) rotate(60deg); opacity: 0; } }
@keyframes burst4 { 0% { transform: translate(0, 0) scale(0.2); opacity: 0; } 30% { opacity: 1; } 100% { transform: translate(160px, 80px) scale(1) rotate(-60deg); opacity: 0; } }
@keyframes burst5 { 0% { transform: translate(0, 0) scale(0.2); opacity: 0; } 30% { opacity: 1; } 100% { transform: translate(0, -170px) scale(1.1) rotate(90deg); opacity: 0; } }
@keyframes petalA { 0% { transform: translate(0, -40px) rotate(0deg); opacity: 0; } 8% { opacity: 1; } 30% { transform: translate(26px, 220px) rotate(90deg); } 55% { transform: translate(-16px, 450px) rotate(180deg); } 80% { transform: translate(20px, 680px) rotate(270deg); opacity: 1; } 100% { transform: translate(4px, 880px) rotate(340deg); opacity: 0.6; } }
@keyframes petalB { 0% { transform: translate(0, -40px) rotate(0deg); opacity: 0; } 8% { opacity: 1; } 30% { transform: translate(-24px, 220px) rotate(-80deg); } 55% { transform: translate(18px, 450px) rotate(-170deg); } 80% { transform: translate(-20px, 680px) rotate(-260deg); opacity: 1; } 100% { transform: translate(-4px, 880px) rotate(-330deg); opacity: 0.6; } }
@keyframes growIn { 0% { transform: scale(0.3, 0); opacity: 0; } 60% { transform: scale(1.06, 1.12); opacity: 1; } 100% { transform: scale(1, 1); opacity: 1; } }
@keyframes sway { 0%, 100% { transform: rotate(-4deg); } 50% { transform: rotate(4deg); } }
@media (prefers-reduced-motion: reduce) { .choice, .cue, .cue-wrap, .slot, .spark, .petal, .ring, .hop-a, .hop-b, .tilt-a, .tilt-b, .grow-in, .sway, .rfill, .bubble-in, .talk-a .ow-beak, .talk-b .ow-beak { animation: none !important; } .spark, .petal, .ring { display: none; } .grow-in { opacity: 1; } }
<!--BODY-->
  <!-- one bar: back to the library, where you are, a bar for the rounds, hear it again -->
  <header class="bar" style="gap: 18px;">
    <a href="R2Library.dc.html" class="press btn">
      <svg width="22" height="22" viewBox="0 0 24 24"><path class="ic" d="M19 12H5"></path><path class="ic" d="M11 6l-6 6 6 6"></path></svg>
      Library
    </a>
    <span class="display" style="font-size: 22px; font-weight: 600;">Find A, M, S &amp; B</span>
    <span style="margin-left: auto; display: flex; align-items: center; gap: 12px;" aria-label="{{ roundText }}">
      <span class="rbar"><span class="{{ roundFill }}"></span><span class="rtick" style="left: 25%;"></span><span class="rtick" style="left: 50%;"></span><span class="rtick" style="left: 75%;"></span></span>
      <span class="soft" style="font-size: 15px; font-weight: 700; white-space: nowrap;">{{ roundText }}</span>
    </span>
    <button class="press btn" onClick="{{ hear }}" style="padding: 0 16px 0 12px;">
      <svg width="22" height="22" viewBox="0 0 24 24"><path class="ic" d="M3 12a9 9 0 1 0 3-6.7"></path><path class="ic" d="M3 4v5h5"></path></svg>
      Again
    </button>
  </header>

  <!-- the stage -->
  <div class="panel" style="position: absolute; left: 24px; right: 24px; top: 84px; height: 560px; border-radius: 30px; box-shadow: 0 3px 0 var(--edge), 0 8px 18px var(--shadow); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 22px; overflow: hidden;">
    <div style="position: absolute; left: -70px; bottom: -120px; width: 260px; height: 260px; border-radius: 999px; background: var(--accent-soft);"></div>
    <div style="position: absolute; right: -40px; top: -60px; width: 200px; height: 200px; border-radius: 999px; background: var(--tint-2);"></div>

    <!-- a solved round grows a little garden up both sides of the stage -->
    <sc-if value="{{ solved }}" hint-placeholder-val="{{ false }}">
      <div style="position: absolute; left: 22px; bottom: -4px; display: flex; align-items: flex-end; gap: 2px; pointer-events: none;">
        <span class="grow-in" style="display: block; animation-delay: 200ms;">%%PLANT daisy 66 77 sway%%</span>
        <span class="grow-in" style="display: block; animation-delay: 340ms;">%%PLANT rose:red 84 98 sway%%</span>
        <span class="grow-in" style="display: block; animation-delay: 480ms;">%%PLANT daisy 58 68 sway%%</span>
      </div>
      <div style="position: absolute; right: 22px; bottom: -4px; display: flex; align-items: flex-end; gap: 2px; pointer-events: none;">
        <span class="grow-in" style="display: block; animation-delay: 420ms;">%%PLANT daisy 58 68 sway%%</span>
        <span class="grow-in" style="display: block; animation-delay: 280ms;">%%PLANT rose:blush 84 98 sway%%</span>
        <span class="grow-in" style="display: block; animation-delay: 560ms;">%%PLANT daisy 66 77 sway%%</span>
      </div>
    </sc-if>

    <div class="cue-wrap">
      <span class="{{ ringClass }}"></span>
      <span class="{{ ringClass2 }}"></span>
      <button class="{{ cueClass }}" onClick="{{ hear }}" aria-label="Hear the sound again">
        <sc-if value="{{ solved }}" hint-placeholder-val="{{ false }}">
          <span style="font-size: 104px; font-weight: 700; line-height: 1; color: var(--right-text);">M</span>
          <span style="font-size: 16px; font-weight: 700; color: var(--right-text);">found it!</span>
        </sc-if>
        <sc-if value="{{ hidden }}" hint-placeholder-val="{{ true }}">
          <span style="color: var(--accent-text);"><svg width="40" height="40" viewBox="0 0 24 24"><path class="ic" d="M6 8.5a6 6 0 1 1 12 0c0 3.5-3 4.5-3 7.5a3.5 3.5 0 0 1-6.5 1.8"></path><path class="ic" d="M9.5 9a2.5 2.5 0 0 1 5 0c0 1.5-1.5 2-1.5 3.5"></path></svg></span>
          <span class="display" style="font-size: 92px; font-weight: 700; line-height: 0.9; color: var(--accent-text);">?</span>
          <span class="soft" style="font-size: 15px; font-weight: 700;">tap to listen</span>
        </sc-if>
      </button>
      <sc-if value="{{ solved }}" hint-placeholder-val="{{ false }}">
        <svg class="spark s1" viewBox="0 0 24 24"><path d="M12 2l2.6 7.4L22 12l-7.4 2.6L12 22l-2.6-7.4L2 12l7.4-2.6z" fill="#C4996A"></path></svg>
        <svg class="spark s2" viewBox="0 0 24 24"><path d="M12 2l2.6 7.4L22 12l-7.4 2.6L12 22l-2.6-7.4L2 12l7.4-2.6z" fill="#9A6B45"></path></svg>
        <svg class="spark s3" viewBox="0 0 24 24"><path d="M12 2l2.6 7.4L22 12l-7.4 2.6L12 22l-2.6-7.4L2 12l7.4-2.6z" fill="#A9B391"></path></svg>
        <svg class="spark s4" viewBox="0 0 24 24"><path d="M12 2l2.6 7.4L22 12l-7.4 2.6L12 22l-2.6-7.4L2 12l7.4-2.6z" fill="#E2B9A6"></path></svg>
        <svg class="spark s5" viewBox="0 0 24 24"><path d="M12 2l2.6 7.4L22 12l-7.4 2.6L12 22l-2.6-7.4L2 12l7.4-2.6z" fill="#C4996A"></path></svg>
      </sc-if>
    </div>

    <button class="press slot" onClick="{{ hear }}" style="position: relative; height: 48px; padding: 0 20px 0 14px; border-radius: 999px; border: none; background: var(--accent-soft); display: flex; align-items: center; gap: 10px; font-size: 20px; font-weight: 700; animation-delay: 250ms;">
      <svg width="24" height="24" viewBox="0 0 24 24"><path class="ic" d="M4 9v6h4l5 4V5L8 9z"></path><path class="ic" d="M16 9a4 4 0 0 1 0 6"></path></svg>
      What letter makes this sound?
    </button>

    <div style="position: relative; display: flex; gap: 22px;">
      <sc-for list="{{ choices }}" as="item" hint-placeholder-count="4">
        <span class="slot" style="{{ item.delay }}">
          <button class="{{ item.cls }}" onClick="{{ item.pick }}" disabled="{{ item.disabled }}" aria-label="letter {{ item.letter }}">{{ item.letter }}</button>
        </span>
      </sc-for>
    </div>
  </div>

  <!-- Luna's perch: what she says; a clue is spoken, never written -->
  <div style="position: absolute; left: 32px; right: 32px; bottom: 18px; height: 148px; display: flex; align-items: center; gap: 18px;">
    <div class="{{ owlClass }}" style="width: 124px; height: 124px; flex: none; transform-origin: 50% 100%;">%%OWL 124%%</div>
    <div class="bubble-in panel" style="position: relative; padding: 18px 22px; border-radius: 22px; display: flex; align-items: center; gap: 16px;">
      <span style="position: absolute; left: -11px; top: 50%; margin-top: -9px; width: 18px; height: 18px; background: var(--card); border-left: 2px solid var(--edge); border-bottom: 2px solid var(--edge); transform: rotate(45deg);"></span>
      <span style="font-size: 21px; line-height: 1.35;">{{ bubble }}</span>
      <sc-if value="{{ showClue }}" hint-placeholder-val="{{ false }}">
        <button class="press" onClick="{{ hear }}" style="height: 48px; padding: 0 16px 0 12px; border-radius: 14px; border: none; background: var(--accent); color: var(--accent-ink); box-shadow: 0 4px 0 var(--accent-edge); display: flex; align-items: center; gap: 8px; font-size: 17px; font-weight: 700; white-space: nowrap;">
          <svg width="22" height="22" viewBox="0 0 24 24"><path class="ic" d="M6 8.5a6 6 0 1 1 12 0c0 3.5-3 4.5-3 7.5a3.5 3.5 0 0 1-6.5 1.8"></path></svg>
          Hear my clue
        </button>
      </sc-if>
    </div>
    <sc-if value="{{ solved }}" hint-placeholder-val="{{ false }}">
      <span style="margin-left: auto; display: flex; gap: 10px;">
        <button class="press" onClick="{{ reset }}" style="height: 48px; padding: 0 18px; border-radius: 16px; border: 2px dashed var(--soil); background: transparent; font-size: 16px; font-weight: 700; color: var(--soft);">Try again</button>
        <a href="R2Done.dc.html" class="press btn btn-action" style="padding: 0 20px;">See the end<svg width="20" height="20" viewBox="0 0 24 24"><path class="ic" d="M5 12h14M13 6l6 6-6 6"></path></svg></a>
      </span>
    </sc-if>
  </div>

  <!-- petals drift down when the round is won -->
  <sc-if value="{{ solved }}" hint-placeholder-val="{{ false }}">
    <sc-for list="{{ petals }}" as="p" hint-placeholder-count="0">
      <span class="{{ p.cls }}" style="{{ p.style }}"></span>
    </sc-for>
  </sc-if>
<!--LOGIC-->
  cleanup() {
    clearTimeout(this.wrongTimer);
  }

  extra(vals, s, dark) {
    var self = this;
    var wrong = s.wrong || null;
    var solved = !!s.solved;
    var misses = s.misses || 0;
    var beat = s.beat || 0;
    var heard = s.heard || 0;
    var target = 'M';
    var flip = beat % 2 === 0 ? 'a' : 'b';
    var bump = function (extraState) {
      var cur = self.state || {};
      self.setState(Object.assign({ beat: (cur.beat || 0) + 1 }, extraState));
    };

    var bubble = 'Ears on! I make a sound, and you find the letter that makes it.';
    if (solved) bubble = misses === 0 ? 'Yes! First try. M says mmm.' : 'You found it! M says mmm.';
    else if (misses === 1) bubble = 'Not that one. Listen again!';
    else if (misses >= 2) bubble = 'Here’s a clue. Listen closely.';

    vals.choices = ['S', 'B', 'M', 'A'].map(function (letter, i) {
      var cls = 'choice';
      if (wrong === letter) cls += ' is-wrong';
      if (solved && letter === target) cls += ' is-right';
      if (solved && letter !== target) cls += ' is-faded';
      return {
        letter: letter,
        cls: cls,
        disabled: solved,
        delay: 'display: block; animation-delay: ' + (450 + i * 90) + 'ms;',
        pick: function () {
          var cur = self.state || {};
          if (cur.solved || cur.wrong) return;
          if (letter === target) { bump({ solved: true, wrong: null }); return; }
          bump({ wrong: letter, misses: (cur.misses || 0) + 1 });
          clearTimeout(self.wrongTimer);
          self.wrongTimer = setTimeout(function () { self.setState({ wrong: null }); }, 600);
        }
      };
    });

    var colors = ['#FFFBF5', '#F1C9BC', '#C8323C', '#D9C4A6', '#FBF1E2', '#EBA9AC', '#C4996A'];
    var petals = [];
    for (var i = 0; i < 30; i++) {
      var left = (i * 37 + 11) % 100;
      var delay = (i * 61) % 700;
      var dur = 1800 + ((i * 83) % 800);
      var w = 10 + (i % 4) * 3;
      var c = colors[i % colors.length];
      var edge = c === '#FFFBF5' || c === '#FBF1E2' ? ' box-shadow: inset 0 0 0 1.5px #C9AE8B;' : '';
      petals.push({
        cls: 'petal ' + (i % 2 === 0 ? 'petal-a' : 'petal-b'),
        style: 'left: ' + left + '%; width: ' + w + 'px; height: ' + Math.round(w * 1.35) + 'px; background: ' + c + '; animation-delay: ' + delay + 'ms; animation-duration: ' + dur + 'ms;' + edge
      });
    }
    vals.petals = petals;

    var owlClass = 'talk-a';
    if (beat > 0) owlClass = (solved ? 'hop-' : (wrong || misses > 0 ? 'tilt-' : 'hop-')) + flip + ' talk-' + flip;
    var ringFlip = heard % 2 === 0 ? 'a' : 'b';
    vals.solved = solved;
    vals.roundFill = solved ? 'rfill q1' : 'rfill q0';
    vals.roundText = solved ? '1 of 4 done' : 'round 1 of 4';
    vals.hidden = !solved;
    vals.cueClass = solved ? 'cue is-found' : 'cue is-hidden';
    vals.ringClass = heard > 0 && !solved ? 'ring ring-' + ringFlip : 'ring';
    vals.ringClass2 = heard > 0 && !solved ? 'ring r2 ring-' + ringFlip : 'ring';
    vals.owlClass = owlClass;
    vals.bubble = bubble;
    vals.showClue = !solved && misses >= 2;
    vals.hear = function () {
      var cur = self.state || {};
      bump({ heard: (cur.heard || 0) + 1 });
    };
    vals.reset = function () {
      clearTimeout(self.wrongTimer);
      bump({ solved: false, wrong: null, misses: 0 });
    };
  }
