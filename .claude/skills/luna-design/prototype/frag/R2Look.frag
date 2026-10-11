<!--CSS-->
.sw { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.sw-chip { height: 58px; border-radius: 14px; display: flex; align-items: flex-end; padding: 6px 8px; box-sizing: border-box; font-size: 14px; transition: background-color 300ms ease; }
.sw strong { font-size: 14px; }
.sw .note { font-size: 12px; color: var(--soft); line-height: 1.3; }
.grow { transform-box: fill-box; transform-origin: 50% 100%; animation: grow 2.4s cubic-bezier(0.34, 1.56, 0.64, 1) infinite; }
.pbar { flex: 1; position: relative; height: 22px; box-sizing: border-box; border-radius: 999px; background: var(--well); border: 2px solid var(--edge); overflow: hidden; }
.pfill { position: absolute; left: 0; top: 0; bottom: 0; width: 33.333%; border-radius: 999px; background: var(--right); animation: fill 4s cubic-bezier(0.34, 1.3, 0.64, 1) infinite; }
.ptick { position: absolute; top: 0; bottom: 0; width: 3px; margin-left: -1px; background: var(--card); opacity: 0.85; }
.pmark { width: 42px; height: 42px; box-sizing: border-box; border-radius: 999px; display: flex; align-items: center; justify-content: center; }
.pm-done { background: var(--right); color: var(--right-ink); }
.pm-now { background: var(--action); color: var(--action-ink); animation: glow 4s ease-in-out infinite; }
.pm-lock { background: var(--well); border: 2px dashed var(--soil-dk); color: var(--soft); }
.sq { transform-box: fill-box; transform-origin: 50% 100%; animation: squish 3.6s ease-in-out infinite; }
.spark { transform-box: fill-box; transform-origin: center; animation: twinkle 2.2s ease-in-out infinite; }
@keyframes grow { 0% { transform: scaleY(0.2); opacity: 0; } 30%, 100% { transform: scaleY(1); opacity: 1; } }
@keyframes fill { 0%, 15% { width: 16.667%; } 45%, 100% { width: 33.333%; } }
@keyframes glow { 0%, 100% { box-shadow: 0 0 0 0 rgba(154, 107, 69, 0.45); } 50% { box-shadow: 0 0 0 10px rgba(154, 107, 69, 0); } }
@keyframes squish { 0%, 60%, 100% { transform: scale(1, 1); } 68% { transform: scale(1.22, 0.74); } 78% { transform: scale(0.92, 1.1); } 88% { transform: scale(1.04, 0.97); } }
@keyframes twinkle { 0%, 100% { opacity: 0.2; transform: scale(0.6); } 50% { opacity: 1; transform: scale(1.1); } }
@media (prefers-reduced-motion: reduce) { .grow, .pfill, .pm-now, .sq, .spark { animation: none !important; } }
<!--BODY-->
<div style="position: absolute; inset: 0; box-sizing: border-box; padding: 40px 52px; display: grid; grid-template-columns: 440px minmax(0, 1fr); column-gap: 48px;">

  <!-- soft arches in sand and latte: the motif stays, the rainbow goes -->
  <div style="position: absolute; right: -70px; bottom: -160px; width: 300px; height: 300px; border-radius: 999px 999px 0 0; border: 34px solid var(--soil); border-bottom: none; opacity: 0.6;"></div>
  <div style="position: absolute; right: -2px; bottom: -160px; width: 164px; height: 232px; border-radius: 999px 999px 0 0; border: 30px solid var(--edge); border-bottom: none;"></div>

  <!-- left: what the teacher chose -->
  <div style="display: flex; flex-direction: column; gap: 16px; position: relative;">
    <div class="lbl" style="font-size: 14px; letter-spacing: 0.12em;">Round 2 · from the teacher’s notes</div>
    <h1 class="display" style="margin: 0; font-size: 56px; line-height: 1; font-weight: 650;">Boho, in sand<br>and cocoa</h1>
    <p class="soft" style="margin: 0; font-size: 18px; line-height: 1.5;">Option A’s warm, hand-made classroom, now in light tans and browns instead of the rainbow. Paper, soft arches and drawn icons stay.</p>

    <div style="display: flex; flex-direction: column; gap: 10px;">
      <div style="display: flex; gap: 14px; align-items: flex-start;">
        <span style="flex: none; width: 38px; height: 38px; border-radius: 12px; background: var(--action); color: var(--action-ink); display: flex; align-items: center; justify-content: center;"><svg width="22" height="22" viewBox="0 0 24 24"><rect class="ic" x="6" y="3" width="12" height="18" rx="3"></rect><path class="ic" d="M10.5 18h3"></path></svg></span>
        <span style="font-size: 16px; line-height: 1.4;"><strong>A simple home screen.</strong> Just her Reading app, like today.</span>
      </div>
      <div style="display: flex; gap: 14px; align-items: flex-start;">
        <span style="flex: none; width: 38px; height: 38px; border-radius: 12px; background: #A9B391; color: #3B2A20; display: flex; align-items: center; justify-content: center;"><svg width="22" height="22" viewBox="0 0 24 24"><rect class="ic" x="2.5" y="8.5" width="19" height="7" rx="3.5"></rect><path class="ic" d="M6 12h6.5"></path></svg></span>
        <span style="font-size: 16px; line-height: 1.4;"><strong>Lessons in order, one bar.</strong> The next lesson opens when the one before is done, and one bar fills up.</span>
      </div>
      <div style="display: flex; gap: 14px; align-items: flex-start;">
        <span style="flex: none; width: 38px; height: 38px; border-radius: 12px; background: #C4996A; color: #3B2A20; display: flex; align-items: center; justify-content: center;"><svg width="22" height="22" viewBox="0 0 24 24"><circle class="ic" cx="12" cy="13" r="8"></circle><path class="ic" d="M12 9v4l2.5 2M9 2.5h6"></path></svg></span>
        <span style="font-size: 16px; line-height: 1.4;"><strong>Time you can see.</strong> About how long a lesson takes before, and how long it took after.</span>
      </div>
      <div style="display: flex; gap: 14px; align-items: flex-start;">
        <span style="flex: none; width: 38px; height: 38px; border-radius: 12px; background: #E2B9A6; color: #3B2A20; display: flex; align-items: center; justify-content: center;"><svg width="22" height="22" viewBox="0 0 24 24"><path class="ic" d="M4 15c0-5 3.5-9 8-9s8 4 8 9c0 3-3 4-8 4s-8-1-8-4z"></path><path class="ic" d="M9.5 13h0M14.5 13h0"></path></svg></span>
        <span style="font-size: 16px; line-height: 1.4;"><strong>Squishies, not stickers.</strong> Squish balls, mochi animals and butter blocks, some in rare colours.</span>
      </div>
      <div style="display: flex; gap: 14px; align-items: flex-start;">
        <span style="flex: none; width: 38px; height: 38px; border-radius: 12px; background: #3B2A20; color: #F2CF63; display: flex; align-items: center; justify-content: center;"><svg width="22" height="22" viewBox="0 0 24 24"><path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" fill="#F2CF63"></path></svg></span>
        <span style="font-size: 16px; line-height: 1.4;"><strong>Light and dark.</strong> Every colour has a night twin. Try the button below.</span>
      </div>
    </div>

    <div class="panel" style="border-radius: 20px; padding: 14px 20px; display: flex; flex-direction: column; gap: 6px;">
      <div style="display: flex; align-items: baseline; justify-content: space-between; gap: 12px;">
        <span class="display" style="font-size: 30px; font-weight: 650;">Luna’s Lessons</span>
        <span class="soft" style="font-size: 13px;">Fraunces Soft · titles</span>
      </div>
      <div style="display: flex; align-items: baseline; justify-content: space-between; gap: 12px;">
        <span style="font-size: 28px;">The cat is big.</span>
        <span class="soft" style="font-size: 13px;">Andika · all a child reads</span>
      </div>
      <div style="display: flex; align-items: baseline; justify-content: space-between; gap: 12px; border-top: 2px dashed var(--edge); padding-top: 6px;">
        <span style="font-size: 40px; line-height: 1.1; color: var(--accent-text);">I l 1 a g</span>
        <span class="soft" style="font-size: 13px;">every letter looks different</span>
      </div>
    </div>
  </div>

  <!-- right: colour, then the new ideas in small -->
  <div style="display: flex; flex-direction: column; gap: 18px; position: relative;">
    <div>
      <div style="display: flex; align-items: baseline; gap: 12px; margin-bottom: 10px;">
        <h2 class="display" style="margin: 0; font-size: 26px; font-weight: 600;">Colour</h2>
        <span class="soft" style="font-size: 15px;">{{ modeName }}</span>
      </div>
      <div style="display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 10px;">
        <sc-for list="{{ swatches }}" as="sw" hint-placeholder-count="12">
          <div class="sw">
            <div class="sw-chip" style="{{ sw.chip }}">{{ sw.ratio }}</div>
            <strong>{{ sw.role }}</strong>
            <span class="note">{{ sw.name }} · {{ sw.hex }}</span>
          </div>
        </sc-for>
      </div>
      <p class="soft" style="margin: 8px 0 0; font-size: 13px;">Numbers are contrast ratios for text on that colour; every pairing passes WCAG AA. Components only ever use the role names, so each one works in light and dark. Moon gold is the one colour outside the palette, and only the moon wears it.</p>
    </div>

    <div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 18px;">
      <div class="panel" style="border-radius: 22px; padding: 14px 18px;">
        <h2 class="display" style="margin: 0 0 8px; font-size: 21px; font-weight: 600;">Lessons, in order</h2>
        <div style="display: flex; align-items: center; gap: 10px;">
          <span class="pbar" aria-hidden="true"><span class="pfill"></span><span class="ptick" style="left: 16.667%;"></span><span class="ptick" style="left: 33.333%;"></span><span class="ptick" style="left: 50%;"></span><span class="ptick" style="left: 66.667%;"></span><span class="ptick" style="left: 83.333%;"></span></span>
          <span style="font-size: 14px; white-space: nowrap;"><strong>2 of 6</strong> done</span>
        </div>
        <div style="display: flex; justify-content: space-around; margin-top: 12px;">
          <span style="display: flex; flex-direction: column; align-items: center; gap: 4px;"><span class="pmark pm-done"><svg width="22" height="22" viewBox="0 0 24 24"><path class="ic" style="stroke-width: 3.4;" d="M5 12.5l4.5 4.5L19 7.5"></path></svg></span><span style="font-size: 13px; font-weight: 700; color: var(--right-text);">done</span></span>
          <span style="display: flex; flex-direction: column; align-items: center; gap: 4px;"><span class="pmark pm-now"><svg width="20" height="20" viewBox="0 0 24 24"><path d="M8 5.5v13l10.5-6.5z" stroke-linejoin="round" style="fill: currentColor; stroke: currentColor; stroke-width: 2;"></path></svg></span><span style="font-size: 13px; font-weight: 700; color: var(--accent-text);">up next</span></span>
          <span style="display: flex; flex-direction: column; align-items: center; gap: 4px;"><span class="pmark pm-lock"><svg width="18" height="18" viewBox="0 0 24 24"><rect class="ic" x="5" y="10.5" width="14" height="10" rx="2.5"></rect><path class="ic" d="M8 10.5V8a4 4 0 0 1 8 0v2.5"></path></svg></span><span class="soft" style="font-size: 13px;">locked</span></span>
        </div>
      </div>

      <div class="panel" style="border-radius: 22px; padding: 14px 18px;">
        <h2 class="display" style="margin: 0 0 6px; font-size: 21px; font-weight: 600;">Squishies</h2>
        <div style="display: flex; justify-content: space-between; align-items: flex-end;">
          <span style="display: flex; flex-direction: column; align-items: center; gap: 2px;">
            <svg width="66" height="66" viewBox="0 0 100 100"><ellipse cx="50" cy="92" rx="30" ry="5" fill="#3B2A20" opacity="0.12"></ellipse><g class="sq"><circle cx="50" cy="56" r="34" fill="#EFE3D1" stroke="#C9AE8B" style="stroke-width: 3;"></circle><ellipse cx="38" cy="42" rx="9" ry="5.5" fill="#FFFFFF" opacity="0.7"></ellipse><circle cx="41" cy="60" r="3" fill="#3B2A20"></circle><circle cx="59" cy="60" r="3" fill="#3B2A20"></circle><path d="M46 66 q4 4 8 0" fill="none" stroke="#3B2A20" stroke-linecap="round" style="stroke-width: 2.4;"></path></g></svg>
            <span class="soft" style="font-size: 13px;">usual</span>
          </span>
          <span style="display: flex; flex-direction: column; align-items: center; gap: 2px;">
            <svg width="66" height="66" viewBox="0 0 100 100"><ellipse cx="50" cy="92" rx="30" ry="5" fill="#3B2A20" opacity="0.12"></ellipse><g class="sq" style="animation-delay: 1.2s;"><path d="M26 40 L30 20 L44 32 Z" fill="#F1C9BC" stroke="#C98E7B" stroke-linejoin="round" style="stroke-width: 3;"></path><path d="M74 40 L70 20 L56 32 Z" fill="#F1C9BC" stroke="#C98E7B" stroke-linejoin="round" style="stroke-width: 3;"></path><ellipse cx="50" cy="60" rx="38" ry="30" fill="#F1C9BC" stroke="#C98E7B" style="stroke-width: 3;"></ellipse><circle cx="40" cy="58" r="3" fill="#3B2A20"></circle><circle cx="60" cy="58" r="3" fill="#3B2A20"></circle><path d="M45 64 q2.5 3 5 0 q2.5 3 5 0" fill="none" stroke="#3B2A20" stroke-linecap="round" style="stroke-width: 2.2;"></path></g></svg>
            <span style="font-size: 13px; font-weight: 700; color: var(--retry-text);">rare</span>
          </span>
          <span style="display: flex; flex-direction: column; align-items: center; gap: 2px;">
            <svg width="66" height="66" viewBox="0 0 100 100"><ellipse cx="50" cy="92" rx="30" ry="5" fill="#3B2A20" opacity="0.12"></ellipse><g class="sq" style="animation-delay: 2.4s;"><rect x="16" y="38" width="68" height="46" rx="16" fill="#E6C47A" stroke="#A9832F" style="stroke-width: 3;"></rect><rect x="30" y="28" width="40" height="18" rx="8" fill="#F5E2A0" stroke="#A9832F" style="stroke-width: 3;"></rect><circle cx="40" cy="62" r="3" fill="#3B2A20"></circle><circle cx="60" cy="62" r="3" fill="#3B2A20"></circle><path d="M46 68 q4 4 8 0" fill="none" stroke="#3B2A20" stroke-linecap="round" style="stroke-width: 2.4;"></path></g><path class="spark" d="M84 18 l3 7 7 3 -7 3 -3 7 -3 -7 -7 -3 7 -3z" fill="#FFFBF5" stroke="#A9832F" stroke-linejoin="round" style="stroke-width: 1.5;"></path><path class="spark" style="animation-delay: 0.8s;" d="M14 24 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2z" fill="#FFFBF5" stroke="#A9832F" stroke-linejoin="round" style="stroke-width: 1.5;"></path></svg>
            <span style="font-size: 13px; font-weight: 700; color: var(--accent-text);">super rare</span>
          </span>
        </div>
      </div>
    </div>

    <div class="panel" style="border-radius: 22px; padding: 14px 18px; display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
      <h2 class="display" style="margin: 0; font-size: 21px; font-weight: 600;">Time</h2>
      <span class="chip chip-time"><svg width="20" height="20" viewBox="0 0 24 24"><circle class="ic" cx="12" cy="13" r="8"></circle><path class="ic" d="M12 9v4l2.5 2"></path></svg>about 5 min</span>
      <span class="chip chip-took"><svg width="20" height="20" viewBox="0 0 24 24"><path class="ic" style="stroke-width: 3;" d="M5 12.5l4.5 4.5L19 7.5"></path></svg>took 4 min</span>
      <span class="chip chip-accent"><svg width="20" height="20" viewBox="0 0 24 24"><path class="ic" d="M4 19.5V6a2 2 0 0 1 2-2h12v14H6a2 2 0 0 0-2 2z"></path></svg>12 min today</span>
      <span class="soft" style="flex-basis: 100%; font-size: 13px;">On each lesson before it starts, on the done screen after, and as today’s total on the library.</span>
    </div>
  </div>
</div>
<!--LOGIC-->
  extra(vals, s, dark) {
    var light = [
      ['Card', 'Cream', '#FFFBF5', '#3B2A20', '13.2', 'border: 2px solid #E9DCC9;'],
      ['Ground', 'Oat', '#F5EDE1', '#3B2A20', '11.8', 'border: 2px solid #E9DCC9;'],
      ['Edge', 'Sand', '#E9DCC9', '#3B2A20', '10.1', ''],
      ['Soil', 'Latte', '#D9C4A6', '#3B2A20', '8.1', ''],
      ['Accent', 'Caramel', '#C4996A', '#3B2A20', '5.3', ''],
      ['Action', 'Toffee', '#9A6B45', '#FFFFFF', '4.6', ''],
      ['Pressed', 'Walnut', '#6B4C35', '#FFFFFF', '7.7', ''],
      ['Ink', 'Cocoa', '#3B2A20', '#FFFBF5', '13.2', ''],
      ['Soft ink', 'Mocha', '#6E5747', '#FFFFFF', '6.7', ''],
      ['Right', 'Sage', '#A9B391', '#3B2A20', '6.2', ''],
      ['Try again', 'Clay', '#E2B9A6', '#3B2A20', '7.6', ''],
      ['Moon', 'Moon gold', '#F2CF63', '#3B2A20', '9.0', '']
    ];
    var night = [
      ['Card', 'Espresso', '#2A211B', '#F4EADC', '13.3', 'border: 2px solid #433629;'],
      ['Ground', 'Night cocoa', '#1E1813', '#F4EADC', '14.8', 'border: 2px solid #433629;'],
      ['Edge', 'Bark', '#433629', '#F4EADC', '9.8', ''],
      ['Soil', 'Loam', '#5A4636', '#F4EADC', '7.5', ''],
      ['Accent', 'Caramel glow', '#D9AE7C', '#1E1813', '8.6', ''],
      ['Action', 'Caramel glow', '#D9AE7C', '#1E1813', '8.6', ''],
      ['Pressed', 'Toffee', '#9C7651', '#1E1813', 'edge', ''],
      ['Ink', 'Milk', '#F4EADC', '#1E1813', '14.8', ''],
      ['Soft ink', 'Oat milk', '#C9B6A1', '#1E1813', '8.9', ''],
      ['Right', 'Sage', '#A9B88C', '#1E1813', '8.3', ''],
      ['Try again', 'Clay', '#D79C86', '#1E1813', '7.5', ''],
      ['Moon', 'Moon gold', '#F2CF63', '#1E1813', '11.6', '']
    ];
    vals.modeName = dark ? 'dark mode: the night twins' : 'light mode';
    vals.swatches = (dark ? night : light).map(function (r) {
      return {
        role: r[0],
        name: r[1],
        hex: r[2],
        ratio: r[4] === 'edge' ? 'edge only' : 'Aa ' + r[4],
        chip: 'background: ' + r[2] + '; color: ' + r[3] + '; ' + r[5]
      };
    });
  }
