<!--CSS-->
%%INCLUDE homecss%%
.pop { animation: pop 500ms cubic-bezier(0.34, 1.56, 0.64, 1) both; }
.bob { animation: bob 4.5s ease-in-out infinite; }
.talk-a .ow-beak { animation: talkA 240ms ease-in-out 8; }
.talk-b .ow-beak { animation: talkB 240ms ease-in-out 8; }
.talk-a { animation: hopA 600ms cubic-bezier(0.34, 1.56, 0.64, 1); }
.talk-b { animation: hopB 600ms cubic-bezier(0.34, 1.56, 0.64, 1); }
.sq { transform-origin: 50% 100%; }
.sq-a { animation: squishA 700ms cubic-bezier(0.3, 0.7, 0.4, 1); }
.sq-b { animation: squishB 700ms cubic-bezier(0.3, 0.7, 0.4, 1); }
.glow { animation: sproutGlow 2.6s ease-in-out infinite; }
.shelf-pop { animation: pop 450ms cubic-bezier(0.34, 1.56, 0.64, 1) 350ms both; }
@keyframes pop { 0% { transform: scale(0.5); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
@keyframes bob { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
@keyframes talkA { 0%, 100% { transform: scaleY(1); } 50% { transform: scaleY(1.5); } }
@keyframes talkB { 0%, 100% { transform: scaleY(1); } 50% { transform: scaleY(1.5); } }
@keyframes hopA { 0%, 100% { transform: translateY(0); } 40% { transform: translateY(-16px) rotate(-4deg); } }
@keyframes hopB { 0%, 100% { transform: translateY(0); } 40% { transform: translateY(-16px) rotate(4deg); } }
@keyframes squishA { 0%, 100% { transform: scale(1, 1); } 25% { transform: scale(1.3, 0.66); } 50% { transform: scale(0.9, 1.12); } 75% { transform: scale(1.05, 0.96); } }
@keyframes squishB { 0%, 100% { transform: scale(1, 1); } 25% { transform: scale(1.3, 0.66); } 50% { transform: scale(0.9, 1.12); } 75% { transform: scale(1.05, 0.96); } }
@keyframes sproutGlow { 0%, 100% { filter: drop-shadow(0 0 0 rgba(196, 153, 106, 0)); } 50% { filter: drop-shadow(0 0 6px rgba(196, 153, 106, 0.9)); } }
@media (prefers-reduced-motion: reduce) { .shelf-pop, .pop, .bob, .talk-a, .talk-b, .sq-a, .sq-b, .glow { animation: none !important; } }
<!--BODY-->
%%INCLUDE homebg%%

  <!-- status bar: day and time, Luna's voice, the locked gear -->
  <div style="position: absolute; left: 0; right: 0; top: 0; height: 52px; padding: 0 24px; box-sizing: border-box; display: flex; align-items: center; gap: 12px;">
    <span style="font-size: 18px; font-weight: 700;">9:41</span>
    <span class="soft" style="font-size: 16px; font-weight: 700;">Thursday, October 9</span>
    <button class="gear" aria-label="Grown-ups: settings" style="margin-left: auto; width: 40px; height: 40px; border-radius: 12px; background: var(--glass); color: var(--soft); display: flex; align-items: center; justify-content: center;">
      <svg width="22" height="22" viewBox="0 0 24 24"><circle class="ic" cx="12" cy="12" r="3.2"></circle><path class="ic" d="M12 2.5v3M12 18.5v3M4.6 4.6l2.1 2.1M17.3 17.3l2.1 2.1M2.5 12h3M18.5 12h3M4.6 19.4l2.1-2.1M17.3 6.7l2.1-2.1"></path></svg>
    </button>
  </div>

  <!-- Luna says hello from the dune (tap her) -->
  <div style="position: absolute; left: 120px; top: 284px; width: 320px; display: flex; flex-direction: column; align-items: center; gap: 10px;">
    <button class="tap pop" onClick="{{ hi }}" style="position: relative; padding: 14px 52px 14px 20px; border-radius: 22px; background: var(--pill); box-shadow: 0 3px 0 var(--pill-edge); font-size: 21px; line-height: 1.3; text-align: left; animation-delay: 900ms;">
      {{ greeting }}
      <span style="position: absolute; right: 16px; top: 50%; margin-top: -12px; color: var(--accent-text);"><svg width="24" height="24" viewBox="0 0 24 24"><path class="ic" d="M4 9v6h4l5 4V5L8 9z"></path><path class="ic" d="M16 9a4 4 0 0 1 0 6"></path><path class="ic" d="M18.5 6.5a8 8 0 0 1 0 11"></path></svg></span>
      <span style="position: absolute; left: 50%; bottom: -9px; margin-left: -9px; width: 18px; height: 18px; background: var(--pill); transform: rotate(45deg);"></span>
    </button>
    <button class="tap in" onClick="{{ hi }}" aria-label="Say hi to Ms. Luna" style="animation-delay: 700ms;">
      <span class="bob" style="display: block;">
        <span class="{{ owlClass }}" style="display: block; width: 168px; height: 168px; transform-origin: 50% 100%;">%%OWL 168 wings%%</span>
      </span>
    </button>
  </div>

  <!-- the one app, still in the middle -->
  <div style="position: absolute; left: 0; right: 0; top: 168px; display: flex; justify-content: center;">
    <button class="app in" aria-label="Open Reading" style="animation-delay: 500ms;">
      <span class="beckon" style="width: 136px; height: 136px; border-radius: 34px; background: #9A6B45; box-shadow: 0 6px 0 #6B4C35, 0 18px 34px var(--shadow-lg); display: block;">
        <svg width="136" height="136" viewBox="0 0 92 92">
          <path d="M66 14a9 9 0 1 0 8 13 7 7 0 1 1-8-13z" fill="#F2CF63"></path>
          <path d="M46 36c-8-5-18-6-28-4v34c10-2 20-1 28 4z" fill="#FFFBF5"></path>
          <path d="M46 36c8-5 18-6 28-4v34c-10-2-20-1-28 4z" fill="#F2E6D3"></path>
          <path d="M24 44c5-1 11-.5 15 1.5M24 52c5-1 11-.5 15 1.5M53 45.5c4-2 10-2.5 15-1.5M53 53.5c4-2 10-2.5 15-1.5" fill="none" stroke="#C4996A" stroke-linecap="round" style="stroke-width: 2.4;"></path>
        </svg>
      </span>
      <span class="display" style="font-size: 30px; font-weight: 650;">Reading</span>
      <span style="height: 40px; padding: 0 18px 0 14px; border-radius: 999px; background: var(--pill); box-shadow: 0 3px 0 var(--pill-edge); display: flex; align-items: center; gap: 8px; font-size: 17px; font-weight: 700; color: var(--accent-text);">
        <svg width="18" height="18" viewBox="0 0 24 24"><path d="M8 5.5v13l11-6.5z" style="fill: var(--accent-text);"></path></svg>
        Tap to play
      </span>
    </button>
  </div>

  <!-- today's little garden: what's learned so far, and the time -->
  <div class="in" style="position: absolute; left: 50%; top: 476px; width: 380px; margin-left: -190px; box-sizing: border-box; padding: 14px 20px 12px; border-radius: 26px; background: var(--pill); box-shadow: 0 3px 0 var(--pill-edge); display: flex; flex-direction: column; gap: 6px; animation-delay: 800ms;">
    <div style="display: flex; align-items: flex-end; justify-content: space-between;">
      %%PLANT daisy 44 52%%
      %%PLANT daisy 44 52%%
      %%PLANT sprout 44 52 glow%%
      %%PLANT seed 44 52%%
      %%PLANT seed 44 52%%
      %%PLANT seed 44 52%%
    </div>
    <div class="soft" style="display: flex; align-items: center; justify-content: space-between; font-size: 15px; font-weight: 700;">
      <span style="display: flex; align-items: center; gap: 6px;"><svg width="18" height="18" viewBox="0 0 24 24"><circle class="ic" cx="12" cy="13" r="8"></circle><path class="ic" d="M12 9v4l2.5 2"></path></svg>12 min today</span>
      <span>2 of 6 in bloom</span>
    </div>
  </div>

  <!-- the newest squishy waits on the dune (tap to squish) -->
  <button class="tap in" onClick="{{ squish }}" aria-label="Squish Bunny, rare blush colour" style="position: absolute; left: 820px; top: 548px; width: 120px; height: 110px; animation-delay: 1000ms;">
    <span class="{{ sqClass }}" style="display: block; width: 120px; height: 110px;">
      <svg width="120" height="110" viewBox="0 0 100 92">
        <ellipse cx="50" cy="86" rx="30" ry="5" fill="#3B2A20" opacity="0.14"></ellipse>
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
  </button>

  <!-- after a squish, a little button to her shelf pops up -->
  <sc-if value="{{ showShelf }}" hint-placeholder-val="{{ false }}">
    <a href="R2Squishies.dc.html" class="press shelf-pop" aria-label="Open my squishy shelf" style="position: absolute; left: 796px; top: 486px; height: 48px; box-sizing: border-box; padding: 0 16px 0 12px; border-radius: 999px; background: var(--action); color: var(--action-ink); box-shadow: 0 4px 0 var(--action-edge); display: flex; align-items: center; gap: 8px; font-size: 17px; font-weight: 700; white-space: nowrap;">
      <svg width="30" height="24" viewBox="0 0 30 24"><ellipse cx="9" cy="13" rx="7" ry="6" fill="#F1C9BC" stroke="#C98E7B" style="stroke-width: 1.5;"></ellipse><circle cx="21" cy="12" r="6.5" fill="#D2A878" stroke="#9A6B45" style="stroke-width: 1.5;"></circle><rect x="1" y="19" width="28" height="4" rx="2" fill="#FFFBF5"></rect></svg>
      My shelf
    </a>
  </sc-if>

  <span style="position: absolute; left: 50%; bottom: 10px; width: 150px; height: 5px; margin-left: -75px; border-radius: 999px; background: var(--indicator);"></span>
<!--LOGIC-->
  extra(vals, s, dark) {
    var self = this;
    var hiBeat = s.hiBeat || 0;
    var sqBeat = s.sqBeat || 0;
    var greetings = dark
      ? ['Good evening! One more story?', 'Lesson 3 is up next. Let’s grow it!', 'You read 12 minutes today. Wow!']
      : ['Good morning! Ready to read?', 'Lesson 3 is up next. Let’s grow it!', 'You read 12 minutes today. Wow!'];
    vals.greeting = greetings[hiBeat % greetings.length];
    vals.owlClass = hiBeat > 0 ? (hiBeat % 2 === 0 ? 'talk-a' : 'talk-b') : '';
    vals.sqClass = sqBeat > 0 ? (sqBeat % 2 === 0 ? 'sq sq-a' : 'sq sq-b') : 'sq';
    vals.showShelf = sqBeat > 0;
    vals.hi = function () {
      var cur = self.state || {};
      self.setState({ hiBeat: (cur.hiBeat || 0) + 1 });
    };
    vals.squish = function () {
      var cur = self.state || {};
      self.setState({ sqBeat: (cur.sqBeat || 0) + 1 });
    };
  }
