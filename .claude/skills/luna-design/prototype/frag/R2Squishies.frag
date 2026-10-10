<!--CSS-->
.talk-a .ow-beak { animation: talkA 240ms ease-in-out 7; }
.talk-b .ow-beak { animation: talkB 240ms ease-in-out 7; }
.sq { display: block; transform-origin: 50% 100%; animation: idle 4s ease-in-out infinite; }
.sq-a { animation: squishA 700ms cubic-bezier(0.3, 0.7, 0.4, 1); }
.sq-b { animation: squishB 700ms cubic-bezier(0.3, 0.7, 0.4, 1); }
.nod-a { display: block; animation: nodA 500ms ease-in-out; }
.nod-b { display: block; animation: nodB 500ms ease-in-out; }
.spark { transform-box: fill-box; transform-origin: center; animation: twinkle 2.4s ease-in-out infinite; }
.in { animation: enter 500ms cubic-bezier(0.34, 1.56, 0.64, 1) both; }
.say-a, .say-b { animation: bubbleIn 300ms cubic-bezier(0.34, 1.56, 0.64, 1); }
.slot { position: relative; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; gap: 4px; height: 112px; }
.squishy { position: relative; width: 100px; height: 90px; background: none; border: none; padding: 0; cursor: pointer; display: flex; align-items: flex-end; justify-content: center; font-family: 'Andika', sans-serif; color: var(--soft); }
.squishy:focus-visible { outline: 3px solid var(--focus); outline-offset: 4px; border-radius: 20px; }
.ghost svg { opacity: 0.9; }
.qslot { width: 80px; height: 72px; margin-bottom: 2px; border-radius: 26px 26px 18px 18px; border: 2.5px dashed var(--soil); background: var(--well); box-sizing: border-box; display: flex; align-items: center; justify-content: center; font-family: 'Fraunces', serif; font-size: 40px; font-weight: 700; color: var(--soft); }
.dots { height: 16px; display: flex; gap: 4px; }
.cdot { width: 16px; height: 16px; border-radius: 999px; box-sizing: border-box; border: 1.5px solid rgba(59, 42, 32, 0.25); display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 700; line-height: 1; color: var(--soft); }
.cdot.grey { background: var(--edge); border-color: var(--edge); }
.cdot.q { background: transparent; border: 1.5px dashed var(--soil); }
.plank { height: 14px; margin: 0 -14px; border-radius: 6px; background: var(--soil); border-bottom: 6px solid var(--soil-dk); }
.badge { position: absolute; top: 0; right: 4px; }
.new { position: absolute; top: -4px; left: 2px; padding: 2px 8px; border-radius: 8px; background: var(--action); color: var(--action-ink); font-size: 12px; font-weight: 700; transform: rotate(-6deg); }
.niche { position: relative; width: 112px; height: 118px; border-radius: 999px 999px 22px 22px; border: 3px solid #BDB3C9; background: var(--well); overflow: hidden; isolation: isolate; cursor: pointer; padding: 0; display: flex; align-items: flex-end; justify-content: center; font-family: 'Andika', sans-serif; animation: pearlGlow 3s ease-in-out infinite; }
.niche:focus-visible { outline: 3px solid var(--focus); outline-offset: 4px; }
.niche::after { content: ''; position: absolute; top: -10px; bottom: -10px; width: 40%; left: -60%; background: linear-gradient(100deg, transparent 0%, var(--shine) 50%, transparent 100%); transform: skewX(-18deg); animation: sweep 3.2s ease-in-out infinite; pointer-events: none; }
.pearl { transform-box: fill-box; transform-origin: 50% 100%; animation: idle 4s ease-in-out infinite; }
@keyframes talkA { 0%, 100% { transform: scaleY(1); } 50% { transform: scaleY(1.5); } }
@keyframes talkB { 0%, 100% { transform: scaleY(1); } 50% { transform: scaleY(1.5); } }
@keyframes squishA { 0%, 100% { transform: scale(1, 1); } 25% { transform: scale(1.32, 0.64); } 50% { transform: scale(0.9, 1.14); } 75% { transform: scale(1.05, 0.96); } }
@keyframes squishB { 0%, 100% { transform: scale(1, 1); } 25% { transform: scale(1.32, 0.64); } 50% { transform: scale(0.9, 1.14); } 75% { transform: scale(1.05, 0.96); } }
@keyframes nodA { 0%, 100% { transform: rotate(0deg); } 30% { transform: rotate(-6deg); } 70% { transform: rotate(6deg); } }
@keyframes nodB { 0%, 100% { transform: rotate(0deg); } 30% { transform: rotate(-6deg); } 70% { transform: rotate(6deg); } }
@keyframes idle { 0%, 100% { transform: scale(1, 1); } 50% { transform: scale(1.03, 0.97); } }
@keyframes twinkle { 0%, 100% { opacity: 0.25; transform: scale(0.6); } 50% { opacity: 1; transform: scale(1.1); } }
@keyframes enter { 0% { transform: translateY(20px) scale(0.9); opacity: 0; } 100% { transform: translateY(0) scale(1); opacity: 1; } }
@keyframes bubbleIn { 0% { transform: scale(0.85); opacity: 0.4; } 100% { transform: scale(1); opacity: 1; } }
@keyframes sweep { 0%, 40% { left: -60%; } 80%, 100% { left: 130%; } }
@keyframes pearlGlow { 0%, 100% { box-shadow: 0 0 0 0 rgba(189, 179, 201, 0); } 50% { box-shadow: 0 0 16px 4px rgba(189, 179, 201, 0.6); } }
@media (prefers-reduced-motion: reduce) { .sq, .sq-a, .sq-b, .nod-a, .nod-b, .spark, .in, .say-a, .say-b, .niche, .niche::after, .pearl, .talk-a .ow-beak, .talk-b .ow-beak { animation: none !important; } .niche::after { display: none; } }
<!--BODY-->
  <header class="bar">
    <a href="R2Library.dc.html" class="press btn">
      <svg width="22" height="22" viewBox="0 0 24 24"><path class="ic" d="M19 12H5"></path><path class="ic" d="M11 6l-6 6 6 6"></path></svg>
      Library
    </a>
    <h1 class="display" style="margin: 0; font-size: 26px; font-weight: 650;">Luna’s Squishy Shelf</h1>
    <span style="margin-left: auto; height: 40px; padding: 0 16px; border-radius: 999px; background: var(--accent-soft); display: flex; align-items: center; font-size: 17px; font-weight: 700;">8 of 18</span>
  </header>

  <!-- the arched shelf -->
  <div class="panel" style="position: absolute; left: 28px; top: 84px; width: 770px; height: 716px; box-sizing: border-box; padding: 150px 44px 0; border-radius: 240px 240px 28px 28px; box-shadow: 0 4px 0 var(--edge); display: flex; flex-direction: column; gap: 22px;">

    <!-- the last one: a secret, super-duper rare squishy at the top of the arch -->
    <div style="position: absolute; left: 50%; top: 18px; margin-left: -56px; display: flex; flex-direction: column; align-items: center; gap: 4px;">
      <button class="niche" onClick="{{ pFinal }}" aria-label="The last squishy: a secret">
        <sc-if value="{{ finalHidden }}" hint-placeholder-val="{{ true }}">
          <span style="position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-family: 'Fraunces', serif; font-size: 54px; font-weight: 700; color: #8E819E;">?</span>
        </sc-if>
        <sc-if value="{{ finalShown }}" hint-placeholder-val="{{ false }}">
          <svg class="pearl" width="96" height="88" viewBox="0 0 100 92" style="margin-bottom: 4px;">
            <ellipse cx="50" cy="88" rx="28" ry="4" fill="#3B2A20" opacity="0.12"></ellipse>
            <circle cx="50" cy="54" r="34" fill="#F7F3F8" stroke="#BDB3C9" style="stroke-width: 3;"></circle>
            <ellipse cx="36" cy="40" rx="12" ry="7" fill="#E3DAF0" opacity="0.9"></ellipse>
            <ellipse cx="64" cy="70" rx="14" ry="6" fill="#D6E8EE" opacity="0.8"></ellipse>
            <ellipse cx="62" cy="38" rx="6" ry="4" fill="#FBEFD9" opacity="0.9"></ellipse>
            <path d="M47 26 a7 7 0 1 0 8 8 a5.5 5.5 0 1 1 -8 -8 z" fill="#F2CF63" stroke="#C9A23A" style="stroke-width: 1;"></path>
            <path d="M38 56 q4 -4 8 0 M54 56 q4 -4 8 0" fill="none" stroke="#3B2A20" stroke-linecap="round" style="stroke-width: 2.6;"></path>
            <path d="M46 63 q4 4 8 0" fill="none" stroke="#3B2A20" stroke-linecap="round" style="stroke-width: 2.4;"></path>
            <ellipse cx="34" cy="63" rx="5" ry="3" fill="#E9B8C8" opacity="0.7"></ellipse>
            <ellipse cx="66" cy="63" rx="5" ry="3" fill="#E9B8C8" opacity="0.7"></ellipse>
          </svg>
        </sc-if>
      </button>
      <svg class="spark" style="position: absolute; left: -18px; top: 14px;" width="16" height="16" viewBox="0 0 24 24"><path d="M12 2l2.6 7.4L22 12l-7.4 2.6L12 22l-2.6-7.4L2 12l7.4-2.6z" fill="#EEE8F2" stroke="#8E819E" stroke-linejoin="round"></path></svg>
      <svg class="spark" style="position: absolute; right: -20px; top: 40px; animation-delay: 0.9s;" width="20" height="20" viewBox="0 0 24 24"><path d="M12 2l2.6 7.4L22 12l-7.4 2.6L12 22l-2.6-7.4L2 12l7.4-2.6z" fill="#EEE8F2" stroke="#8E819E" stroke-linejoin="round"></path></svg>
      <svg class="spark" style="position: absolute; left: -10px; top: 78px; animation-delay: 1.6s;" width="12" height="12" viewBox="0 0 24 24"><path d="M12 2l2.6 7.4L22 12l-7.4 2.6L12 22l-2.6-7.4L2 12l7.4-2.6z" fill="#EEE8F2" stroke="#8E819E" stroke-linejoin="round"></path></svg>
    </div>

    <!-- shelf 1 -->
    <div>
      <div style="display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 8px;">
        <div class="slot in" style="animation-delay: 100ms;">
          <button class="squishy" onClick="{{ p1 }}" aria-label="Squish Ball, oat">
            <span class="{{ k1 }}"><svg width="92" height="84" viewBox="0 0 100 92"><ellipse cx="50" cy="88" rx="28" ry="4" fill="#3B2A20" opacity="0.12"></ellipse><circle cx="50" cy="52" r="34" fill="#EFE3D1" stroke="#C9AE8B" style="stroke-width: 3;"></circle><ellipse cx="38" cy="36" rx="9" ry="5.5" fill="#FFFFFF" opacity="0.7"></ellipse><circle cx="41" cy="56" r="3" fill="#3B2A20"></circle><circle cx="59" cy="56" r="3" fill="#3B2A20"></circle><path d="M46 62 q4 4 8 0" fill="none" stroke="#3B2A20" stroke-linecap="round" style="stroke-width: 2.4;"></path></svg></span>
          </button>
          <span class="dots" aria-label="Colours: oat found, rare and super rare still to find"><span class="cdot" style="background: #EFE3D1;"></span><span class="cdot q">?</span><span class="cdot q">?</span></span>
        </div>
        <div class="slot in" style="animation-delay: 160ms;">
          <button class="squishy" onClick="{{ p2 }}" aria-label="Mochi Cat, caramel">
            <span class="{{ k2 }}"><svg width="92" height="84" viewBox="0 0 100 92"><ellipse cx="50" cy="88" rx="30" ry="4" fill="#3B2A20" opacity="0.12"></ellipse><path d="M24 44 L28 22 L44 34 Z" fill="#D2A878" stroke="#9A6B45" stroke-linejoin="round" style="stroke-width: 3;"></path><path d="M76 44 L72 22 L56 34 Z" fill="#D2A878" stroke="#9A6B45" stroke-linejoin="round" style="stroke-width: 3;"></path><ellipse cx="50" cy="60" rx="38" ry="26" fill="#D2A878" stroke="#9A6B45" style="stroke-width: 3;"></ellipse><circle cx="40" cy="58" r="3" fill="#3B2A20"></circle><circle cx="60" cy="58" r="3" fill="#3B2A20"></circle><path d="M45 64 q2.5 3 5 0 q2.5 3 5 0" fill="none" stroke="#3B2A20" stroke-linecap="round" style="stroke-width: 2.2;"></path><path d="M22 60 h10 M22 66 l10 -2 M78 60 h-10 M78 66 l-10 -2" stroke="#9A6B45" stroke-linecap="round" style="stroke-width: 1.8;"></path></svg></span>
          </button>
          <span class="dots" aria-label="Colours: caramel found, rare and super rare still to find"><span class="cdot" style="background: #D2A878;"></span><span class="cdot q">?</span><span class="cdot q">?</span></span>
        </div>
        <div class="slot in" style="animation-delay: 220ms;">
          <button class="squishy" onClick="{{ p3 }}" aria-label="Butter Block, rare butter colour">
            <span class="{{ k3 }}"><svg width="92" height="84" viewBox="0 0 100 92"><ellipse cx="50" cy="88" rx="32" ry="4" fill="#3B2A20" opacity="0.12"></ellipse><rect x="16" y="38" width="68" height="46" rx="16" fill="#F5E2A0" stroke="#C9A94F" style="stroke-width: 3;"></rect><rect x="30" y="28" width="40" height="18" rx="8" fill="#FFF4CC" stroke="#C9A94F" style="stroke-width: 3;"></rect><circle cx="40" cy="62" r="3" fill="#3B2A20"></circle><circle cx="60" cy="62" r="3" fill="#3B2A20"></circle><path d="M46 68 q4 4 8 0" fill="none" stroke="#3B2A20" stroke-linecap="round" style="stroke-width: 2.4;"></path></svg></span>
            <svg class="badge spark" width="20" height="20" viewBox="0 0 24 24"><path d="M12 2l2.6 7.4L22 12l-7.4 2.6L12 22l-2.6-7.4L2 12l7.4-2.6z" fill="#E2B9A6" stroke="#9A5A44" stroke-linejoin="round"></path></svg>
          </button>
          <span class="dots" aria-label="Colours: usual still to find, rare butter found, super rare still to find"><span class="cdot grey"></span><span class="cdot" style="background: #F5E2A0;"></span><span class="cdot q">?</span></span>
        </div>
        <div class="slot in" style="animation-delay: 280ms;">
          <button class="squishy" onClick="{{ p4 }}" aria-label="Peach, rare blush colour">
            <span class="{{ k4 }}"><svg width="92" height="84" viewBox="0 0 100 92"><ellipse cx="50" cy="88" rx="28" ry="4" fill="#3B2A20" opacity="0.12"></ellipse><circle cx="50" cy="54" r="32" fill="#F1C9BC" stroke="#C98E7B" style="stroke-width: 3;"></circle><path d="M50 24 q-10 30 0 62" fill="none" stroke="#C98E7B" opacity="0.6" style="stroke-width: 2.5;"></path><path d="M52 24 q8 -14 22 -12 q-6 14 -22 12 z" fill="#A9B391" stroke="#5C6849" stroke-linejoin="round" style="stroke-width: 2;"></path><circle cx="40" cy="58" r="3" fill="#3B2A20"></circle><circle cx="60" cy="58" r="3" fill="#3B2A20"></circle><path d="M46 64 q4 4 8 0" fill="none" stroke="#3B2A20" stroke-linecap="round" style="stroke-width: 2.4;"></path></svg></span>
            <svg class="badge spark" style="animation-delay: 0.8s;" width="20" height="20" viewBox="0 0 24 24"><path d="M12 2l2.6 7.4L22 12l-7.4 2.6L12 22l-2.6-7.4L2 12l7.4-2.6z" fill="#E2B9A6" stroke="#9A5A44" stroke-linejoin="round"></path></svg>
          </button>
          <span class="dots" aria-label="Colours: usual still to find, rare blush found, super rare still to find"><span class="cdot grey"></span><span class="cdot" style="background: #F1C9BC;"></span><span class="cdot q">?</span></span>
        </div>
        <div class="slot">
          <button class="squishy ghost" onClick="{{ p5 }}" aria-label="Not found yet: Frog">
            <span class="{{ k5 }}"><svg width="92" height="84" viewBox="0 0 100 92"><g style="fill: var(--edge);"><circle cx="32" cy="40" r="12"></circle><circle cx="68" cy="40" r="12"></circle><ellipse cx="50" cy="64" rx="36" ry="24"></ellipse></g></svg></span>
          </button>
          <span class="dots"></span>
        </div>
        <div class="slot">
          <button class="squishy ghost" onClick="{{ p6 }}" aria-label="Not found yet: Donut">
            <span class="{{ k6 }}"><svg width="92" height="84" viewBox="0 0 100 92"><path d="M16 56 a34 34 0 1 0 68 0 a34 34 0 1 0 -68 0 Z M39 56 a11 11 0 1 0 22 0 a11 11 0 1 0 -22 0 Z" fill-rule="evenodd" style="fill: var(--edge);"></path></svg></span>
          </button>
          <span class="dots"></span>
        </div>
      </div>
      <div class="plank"></div>
    </div>

    <!-- shelf 2 -->
    <div>
      <div style="display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 8px;">
        <div class="slot in" style="animation-delay: 340ms;">
          <button class="squishy" onClick="{{ p7 }}" aria-label="Cloud, cream">
            <span class="{{ k7 }}"><svg width="92" height="84" viewBox="0 0 100 92"><ellipse cx="50" cy="88" rx="34" ry="4" fill="#3B2A20" opacity="0.12"></ellipse><path d="M24 82 C8 82 6 60 20 56 C18 38 40 30 50 42 C56 26 82 28 82 48 C96 50 96 82 78 82 Z" fill="#FFF6E8" stroke="#CDB592" stroke-linejoin="round" style="stroke-width: 3;"></path><circle cx="42" cy="64" r="3" fill="#3B2A20"></circle><circle cx="60" cy="64" r="3" fill="#3B2A20"></circle><path d="M47 70 q4 4 8 0" fill="none" stroke="#3B2A20" stroke-linecap="round" style="stroke-width: 2.4;"></path></svg></span>
          </button>
          <span class="dots" aria-label="Colours: cream found, rare and super rare still to find"><span class="cdot" style="background: #FFF6E8;"></span><span class="cdot q">?</span><span class="cdot q">?</span></span>
        </div>
        <div class="slot in" style="animation-delay: 400ms;">
          <button class="squishy" onClick="{{ p8 }}" aria-label="Little Moon, super rare swirl">
            <span class="{{ k8 }}"><svg width="92" height="84" viewBox="0 0 100 92">
              <defs><clipPath id="sq-moon-clip"><path d="M40 60.2 A72 72 0 1 0 160 60.2 A60 60 0 1 1 40 60.2 Z" transform="scale(0.5) rotate(-18 100 110)"></path></clipPath></defs>
              <ellipse cx="50" cy="88" rx="26" ry="4" fill="#3B2A20" opacity="0.12"></ellipse>
              <path d="M40 60.2 A72 72 0 1 0 160 60.2 A60 60 0 1 1 40 60.2 Z" transform="scale(0.5) rotate(-18 100 110)" fill="#D2A878"></path>
              <g clip-path="url(#sq-moon-clip)"><path d="M0 40 Q25 28 50 44 T100 40 M0 62 Q25 50 50 66 T100 62 M0 84 Q25 72 50 88 T100 84" fill="none" stroke="#FFF6E8" style="stroke-width: 7;"></path></g>
              <path d="M40 60.2 A72 72 0 1 0 160 60.2 A60 60 0 1 1 40 60.2 Z" transform="scale(0.5) rotate(-18 100 110)" fill="none" stroke="#9A6B45" stroke-linejoin="round" style="stroke-width: 6;"></path>
              <circle cx="47" cy="72" r="2.6" fill="#3B2A20"></circle><circle cx="62" cy="67" r="2.6" fill="#3B2A20"></circle><path d="M52 77 q4 2.5 8 -1.5" fill="none" stroke="#3B2A20" stroke-linecap="round" style="stroke-width: 2.2;"></path>
            </svg></span>
            <svg class="badge spark" width="22" height="22" viewBox="0 0 24 24"><path d="M12 2l2.6 7.4L22 12l-7.4 2.6L12 22l-2.6-7.4L2 12l7.4-2.6z" fill="#E6C47A" stroke="#7A5236" stroke-linejoin="round"></path></svg>
            <svg class="spark" style="position: absolute; left: 6px; top: 18px; animation-delay: 1.1s;" width="14" height="14" viewBox="0 0 24 24"><path d="M12 2l2.6 7.4L22 12l-7.4 2.6L12 22l-2.6-7.4L2 12l7.4-2.6z" fill="#E6C47A" stroke="#7A5236" stroke-linejoin="round"></path></svg>
          </button>
          <span class="dots" aria-label="Colours: usual still to find, rare still to find, super rare swirl found"><span class="cdot grey"></span><span class="cdot q">?</span><span class="cdot" style="background: #D2A878; box-shadow: inset 0 0 0 3px #FFF6E8;"></span></span>
        </div>
        <div class="slot in" style="animation-delay: 460ms;">
          <button class="squishy" onClick="{{ p9 }}" aria-label="Bear, toffee">
            <span class="{{ k9 }}"><svg width="92" height="84" viewBox="0 0 100 92"><ellipse cx="50" cy="88" rx="28" ry="4" fill="#3B2A20" opacity="0.12"></ellipse><circle cx="26" cy="30" r="11" fill="#B07D52" stroke="#7A5236" style="stroke-width: 3;"></circle><circle cx="74" cy="30" r="11" fill="#B07D52" stroke="#7A5236" style="stroke-width: 3;"></circle><circle cx="50" cy="54" r="32" fill="#B07D52" stroke="#7A5236" style="stroke-width: 3;"></circle><ellipse cx="50" cy="65" rx="13" ry="9" fill="#E9D3AE"></ellipse><ellipse cx="50" cy="61" rx="4" ry="3" fill="#3B2A20"></ellipse><circle cx="39" cy="50" r="3" fill="#3B2A20"></circle><circle cx="61" cy="50" r="3" fill="#3B2A20"></circle><path d="M47 67 q3 3 6 0" fill="none" stroke="#3B2A20" stroke-linecap="round" style="stroke-width: 2.2;"></path></svg></span>
          </button>
          <span class="dots" aria-label="Colours: toffee found, rare and super rare still to find"><span class="cdot" style="background: #B07D52;"></span><span class="cdot q">?</span><span class="cdot q">?</span></span>
        </div>
        <div class="slot in" style="animation-delay: 520ms;">
          <button class="squishy" onClick="{{ p10 }}" aria-label="Bunny, rare blush colour, new">
            <span class="{{ k10 }}"><svg width="92" height="84" viewBox="0 0 100 92"><ellipse cx="50" cy="88" rx="30" ry="4" fill="#3B2A20" opacity="0.12"></ellipse><ellipse cx="38" cy="28" rx="8" ry="20" fill="#F1C9BC" stroke="#C98E7B" style="stroke-width: 3;"></ellipse><ellipse cx="62" cy="28" rx="8" ry="20" fill="#F1C9BC" stroke="#C98E7B" style="stroke-width: 3;"></ellipse><ellipse cx="38" cy="30" rx="3.5" ry="12" fill="#FFFBF5" opacity="0.7"></ellipse><ellipse cx="62" cy="30" rx="3.5" ry="12" fill="#FFFBF5" opacity="0.7"></ellipse><ellipse cx="50" cy="62" rx="36" ry="24" fill="#F1C9BC" stroke="#C98E7B" style="stroke-width: 3;"></ellipse><circle cx="41" cy="60" r="3" fill="#3B2A20"></circle><circle cx="59" cy="60" r="3" fill="#3B2A20"></circle><path d="M46 66 q4 4 8 0" fill="none" stroke="#3B2A20" stroke-linecap="round" style="stroke-width: 2.4;"></path><ellipse cx="33" cy="67" rx="5" ry="3" fill="#E59C8A" opacity="0.6"></ellipse><ellipse cx="67" cy="67" rx="5" ry="3" fill="#E59C8A" opacity="0.6"></ellipse></svg></span>
            <span class="new">New</span>
            <svg class="badge spark" style="animation-delay: 1.4s;" width="20" height="20" viewBox="0 0 24 24"><path d="M12 2l2.6 7.4L22 12l-7.4 2.6L12 22l-2.6-7.4L2 12l7.4-2.6z" fill="#E2B9A6" stroke="#9A5A44" stroke-linejoin="round"></path></svg>
          </button>
          <span class="dots" aria-label="Colours: usual still to find, rare blush found, super rare still to find"><span class="cdot grey"></span><span class="cdot" style="background: #F1C9BC;"></span><span class="cdot q">?</span></span>
        </div>
        <div class="slot">
          <button class="squishy ghost" onClick="{{ p11 }}" aria-label="Not found yet: Mushroom">
            <span class="{{ k11 }}"><svg width="92" height="84" viewBox="0 0 100 92"><g style="fill: var(--edge);"><path d="M14 56 Q14 18 50 18 Q86 18 86 56 Z"></path><rect x="36" y="50" width="28" height="34" rx="10"></rect></g></svg></span>
          </button>
          <span class="dots"></span>
        </div>
        <div class="slot">
          <button class="squishy" onClick="{{ p12 }}" aria-label="Not found yet: a mystery squishy">
            <span class="{{ k12 }}"><span class="qslot">?</span></span>
          </button>
          <span class="dots"></span>
        </div>
      </div>
      <div class="plank"></div>
    </div>

    <!-- shelf 3 -->
    <div>
      <div style="display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 8px;">
        <div class="slot">
          <button class="squishy ghost" onClick="{{ p13 }}" aria-label="Not found yet: Dumpling">
            <span class="{{ k13 }}"><svg width="92" height="84" viewBox="0 0 100 92"><path d="M12 80 Q12 38 50 32 Q88 38 88 80 Q50 90 12 80 Z" style="fill: var(--edge);"></path></svg></span>
          </button>
          <span class="dots"></span>
        </div>
        <div class="slot">
          <button class="squishy" onClick="{{ p14 }}" aria-label="Not found yet: a mystery squishy">
            <span class="{{ k14 }}"><span class="qslot">?</span></span>
          </button>
          <span class="dots"></span>
        </div>
        <div class="slot">
          <button class="squishy ghost" onClick="{{ p15 }}" aria-label="Not found yet: Hamster">
            <span class="{{ k15 }}"><svg width="92" height="84" viewBox="0 0 100 92"><g style="fill: var(--edge);"><circle cx="28" cy="38" r="9"></circle><circle cx="72" cy="38" r="9"></circle><ellipse cx="50" cy="62" rx="38" ry="26"></ellipse></g></svg></span>
          </button>
          <span class="dots"></span>
        </div>
        <div class="slot">
          <button class="squishy ghost" onClick="{{ p16 }}" aria-label="Not found yet: Heart">
            <span class="{{ k16 }}"><svg width="92" height="84" viewBox="0 0 100 92"><path d="M50 86 C20 66 12 48 22 36 C32 24 46 28 50 40 C54 28 68 24 78 36 C88 48 80 66 50 86 Z" style="fill: var(--edge);"></path></svg></span>
          </button>
          <span class="dots"></span>
        </div>
        <div class="slot">
          <button class="squishy" onClick="{{ p17 }}" aria-label="Not found yet: a mystery squishy">
            <span class="{{ k17 }}"><span class="qslot">?</span></span>
          </button>
          <span class="dots"></span>
        </div>
        <div class="slot">
          <button class="squishy" onClick="{{ p18 }}" aria-label="Not found yet: a mystery squishy">
            <span class="{{ k18 }}"><span class="qslot">?</span></span>
          </button>
          <span class="dots"></span>
        </div>
      </div>
      <div class="plank"></div>
    </div>
  </div>

  <!-- right: Luna tells you about the one you tapped, and what the marks mean -->
  <div style="position: absolute; left: 822px; right: 28px; top: 84px; bottom: 20px; display: flex; flex-direction: column; gap: 14px;">
    <div class="{{ sayClass }} panel" style="position: relative; padding: 16px 18px; border-radius: 22px; display: flex; flex-direction: column; gap: 6px; min-height: 140px; box-sizing: border-box;">
      <sc-if value="{{ picked }}" hint-placeholder-val="{{ false }}">
        <span style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
          <strong style="font-size: 22px;">{{ name }}</strong>
          <span style="{{ tagStyle }}">{{ tag }}</span>
        </span>
      </sc-if>
      <span style="font-size: 19px; line-height: 1.35;">{{ line }}</span>
      <span style="position: absolute; left: 60px; bottom: -11px; width: 18px; height: 18px; background: var(--card); border-right: 2px solid var(--edge); border-bottom: 2px solid var(--edge); transform: rotate(45deg);"></span>
    </div>
    <div class="{{ owlClass }}" style="width: 112px; height: 112px; margin-left: 10px;">%%OWL 112%%</div>

    <div class="panel" style="margin-top: auto; padding: 14px 16px; border-radius: 22px; display: flex; flex-direction: column; gap: 10px;">
      <span class="lbl">Colours</span>
      <div style="display: flex; flex-direction: column; gap: 3px;">
        <span style="font-size: 15px; font-weight: 700;">Usual</span>
        <span style="display: flex; gap: 6px;"><span class="cdot" style="width: 20px; height: 20px; background: #EFE3D1;"></span><span class="cdot" style="width: 20px; height: 20px; background: #FFF6E8;"></span><span class="cdot" style="width: 20px; height: 20px; background: #D2A878;"></span><span class="cdot" style="width: 20px; height: 20px; background: #B07D52;"></span><span class="cdot" style="width: 20px; height: 20px; background: #8A6446;"></span></span>
      </div>
      <div style="display: flex; flex-direction: column; gap: 3px;">
        <span style="font-size: 15px; font-weight: 700; display: flex; align-items: center; gap: 6px;"><svg width="16" height="16" viewBox="0 0 24 24"><path d="M12 2l2.6 7.4L22 12l-7.4 2.6L12 22l-2.6-7.4L2 12l7.4-2.6z" fill="#E2B9A6" stroke="#9A5A44" stroke-linejoin="round"></path></svg>Rare</span>
        <span style="display: flex; gap: 6px;"><span class="cdot" style="width: 20px; height: 20px; background: #F1C9BC;"></span><span class="cdot" style="width: 20px; height: 20px; background: #CFD8BE;"></span><span class="cdot" style="width: 20px; height: 20px; background: #CADBE4;"></span><span class="cdot" style="width: 20px; height: 20px; background: #F5E2A0;"></span><span class="cdot" style="width: 20px; height: 20px; background: #DCCFE6;"></span></span>
      </div>
      <div style="display: flex; flex-direction: column; gap: 3px;">
        <span style="font-size: 15px; font-weight: 700; display: flex; align-items: center; gap: 6px;"><svg width="16" height="16" viewBox="0 0 24 24"><path d="M12 2l2.6 7.4L22 12l-7.4 2.6L12 22l-2.6-7.4L2 12l7.4-2.6z" fill="#E6C47A" stroke="#7A5236" stroke-linejoin="round"></path></svg>Super rare</span>
        <span class="soft" style="font-size: 13px;">swirl · shimmer · glow</span>
      </div>
      <div style="display: flex; flex-direction: column; gap: 6px; border-top: 2px dashed var(--edge); padding-top: 10px;">
        <span class="lbl">Still to find</span>
        <span style="display: flex; align-items: center; gap: 8px; font-size: 14px;"><span class="cdot grey"></span>a usual colour</span>
        <span style="display: flex; align-items: center; gap: 8px; font-size: 14px;"><span class="cdot q">?</span>a rare colour</span>
        <span style="display: flex; align-items: center; gap: 8px; font-size: 14px;"><svg width="22" height="20" viewBox="0 0 100 92"><ellipse cx="50" cy="56" rx="40" ry="30" style="fill: var(--edge);"></ellipse></svg>an easy one, coming soon</span>
        <span style="display: flex; align-items: center; gap: 8px; font-size: 14px;"><span style="width: 22px; height: 20px; border-radius: 8px; border: 2px dashed var(--soil); box-sizing: border-box; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700;" class="soft">?</span>a hard one, a mystery</span>
      </div>
    </div>
  </div>
<!--LOGIC-->
  extra(vals, s, dark) {
    var self = this;
    var sel = s.sel || 0;
    var beat = s.beat || 0;
    var finalTaps = s.finalTaps || 0;
    var flip = beat % 2 === 0 ? 'a' : 'b';
    var mystery = { kind: 'mystery', name: 'A mystery!', line: 'Nobody knows what this one is yet. Keep reading and it might turn up.' };
    var items = [
      null,
      { kind: 'found', name: 'Squish Ball', rarity: 'usual', colour: 'oat', line: 'Squeeze me! I always bounce back.' },
      { kind: 'found', name: 'Mochi Cat', rarity: 'usual', colour: 'caramel', line: 'Mrrp. Soft as a pillow.' },
      { kind: 'found', name: 'Butter Block', rarity: 'rare', colour: 'butter', line: 'Slow to rise, like me on a Monday.' },
      { kind: 'found', name: 'Peach', rarity: 'rare', colour: 'blush', line: 'Smells sweet. Please do not eat.' },
      { kind: 'ghost', name: 'Frog', line: 'Keep playing to find the Frog. Ribbit!' },
      { kind: 'ghost', name: 'Donut', line: 'A Donut is waiting for you. Keep reading!' },
      { kind: 'found', name: 'Cloud', rarity: 'usual', colour: 'cream', line: 'Fluffy, floaty, squishy.' },
      { kind: 'found', name: 'Little Moon', rarity: 'super', colour: 'swirl', line: 'A moon of your very own. So rare!' },
      { kind: 'found', name: 'Bear', rarity: 'usual', colour: 'toffee', line: 'A bear hug you can hold.' },
      { kind: 'found', name: 'Bunny', rarity: 'rare', colour: 'blush', line: 'Boing! A brand-new friend.' },
      { kind: 'ghost', name: 'Mushroom', line: 'A Mushroom will pop up soon.' },
      mystery,
      { kind: 'ghost', name: 'Dumpling', line: 'Keep playing to find the Dumpling.' },
      mystery,
      { kind: 'ghost', name: 'Hamster', line: 'A Hamster is hiding somewhere. Keep reading!' },
      { kind: 'ghost', name: 'Heart', line: 'Keep playing to find the Heart.' },
      mystery,
      mystery
    ];
    for (var i = 1; i <= 18; i++) {
      (function (n) {
        var it = items[n];
        var anim = it.kind === 'found' ? 'sq sq-' : 'nod-';
        vals['k' + n] = sel === n && beat > 0 ? anim + flip : (it.kind === 'found' ? 'sq' : '');
        vals['p' + n] = function () {
          var cur = self.state || {};
          self.setState({ sel: n, beat: (cur.beat || 0) + 1 });
        };
      })(i);
    }
    var chip = 'height: 26px; padding: 0 10px; border-radius: 999px; display: inline-flex; align-items: center; font-size: 13px; font-weight: 700;';
    var name = '';
    var tag = '';
    var tagStyle = chip;
    var line = 'Tap a squishy to give it a squeeze!';
    if (sel === 'final') {
      name = 'The last one';
      tag = finalTaps % 2 === 0 ? 'peek for grown-ups' : 'super-duper rare';
      tagStyle = chip + ' background: #EEE8F2; color: #5B4A6E;';
      line = finalTaps % 2 === 0
        ? 'This is Pearl Moon. A child sees only the “?” until every other squishy is home.'
        : 'This one is a secret! Find every squishy and it’s yours.';
    } else if (sel) {
      var it = items[sel];
      name = it.name;
      line = it.line;
      if (it.kind === 'found') {
        tag = it.rarity === 'super' ? 'Super rare · ' + it.colour : it.rarity === 'rare' ? 'Rare · ' + it.colour : it.colour;
        tagStyle = it.rarity === 'super' ? chip + ' background: var(--super-soft); color: var(--super-text);' : it.rarity === 'rare' ? chip + ' background: var(--rare-soft); color: var(--rare-text);' : chip + ' background: var(--well); color: var(--soft);';
      } else {
        tag = it.kind === 'ghost' ? 'not found yet' : 'mystery';
        tagStyle = chip + ' background: var(--well); color: var(--soft);';
      }
    }
    vals.picked = !!sel;
    vals.name = name;
    vals.tag = tag;
    vals.tagStyle = tagStyle;
    vals.line = line;
    vals.finalShown = sel === 'final' && finalTaps % 2 === 0 && finalTaps > 0;
    vals.finalHidden = !vals.finalShown;
    vals.pFinal = function () {
      var cur = self.state || {};
      self.setState({ sel: 'final', finalTaps: (cur.finalTaps || 0) + 1, beat: (cur.beat || 0) + 1 });
    };
    vals.sayClass = beat > 0 ? 'say-' + flip : '';
    vals.owlClass = beat > 0 ? 'talk-' + flip : '';
  }
