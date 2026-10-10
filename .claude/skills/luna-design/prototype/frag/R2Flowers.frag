<!--CSS-->
.fcard { position: relative; height: 172px; padding: 0; border-radius: 22px; border: 2px solid var(--edge); background: var(--card); box-shadow: 0 3px 0 var(--edge); overflow: visible; display: flex; flex-direction: column; align-items: center; cursor: pointer; font-family: 'Andika', sans-serif; color: var(--ink); transition: transform 120ms cubic-bezier(0.2, 0, 0, 1), border-color 200ms ease, box-shadow 200ms ease; }
.fcard:active { transform: translateY(3px); }
.fcard:focus-visible { outline: 3px solid var(--focus); outline-offset: 3px; }
.fcard.is-picked { border-color: var(--action); box-shadow: 0 3px 0 var(--action-edge), 0 0 0 5px var(--right-glow); }
.fstage { position: relative; width: 100%; height: 110px; border-radius: 20px 20px 0 0; background: var(--well); display: flex; align-items: flex-end; justify-content: center; overflow: hidden; }
.fstage::before { content: ''; position: absolute; bottom: -60px; left: 50%; width: 130px; height: 130px; margin-left: -65px; border-radius: 999px 999px 0 0; background: var(--edge); }
.fstage svg { position: relative; }
.fname { margin-top: 8px; font-size: 16px; font-weight: 700; }
.fnote { font-size: 13px; color: var(--soft); }
.picked-tag { position: absolute; top: -12px; right: 10px; height: 26px; padding: 0 10px 0 6px; border-radius: 999px; background: var(--action); color: var(--action-ink); display: flex; align-items: center; gap: 4px; font-size: 13px; font-weight: 700; animation: pop 400ms cubic-bezier(0.34, 1.56, 0.64, 1); }
.fh { transform-box: fill-box; transform-origin: 50% 100%; }
.ba .fh { animation: bloomA 800ms cubic-bezier(0.34, 1.56, 0.64, 1) both; }
.bb .fh { animation: bloomB 800ms cubic-bezier(0.34, 1.56, 0.64, 1) both; }
.row-a > :nth-child(2) .fh, .row-b > :nth-child(2) .fh { animation-delay: 80ms; }
.row-a > :nth-child(3) .fh, .row-b > :nth-child(3) .fh { animation-delay: 160ms; }
.row-a > :nth-child(4) .fh, .row-b > :nth-child(4) .fh { animation-delay: 240ms; }
.row-a > :nth-child(5) .fh, .row-b > :nth-child(5) .fh { animation-delay: 320ms; }
.row-a > :nth-child(6) .fh, .row-b > :nth-child(6) .fh { animation-delay: 400ms; }
.row-b .fh { animation-delay: 500ms; }
.sway { transform-box: fill-box; transform-origin: 50% 100%; animation: sway 6s ease-in-out infinite; }
.grow { transform-box: fill-box; transform-origin: 50% 100%; animation: sproutPulse 2.4s ease-in-out infinite; }
@keyframes bloomA { 0% { transform: scale(0.1) rotate(-30deg); opacity: 0; } 70% { transform: scale(1.12) rotate(4deg); opacity: 1; } 100% { transform: scale(1) rotate(0deg); opacity: 1; } }
@keyframes bloomB { 0% { transform: scale(0.1) rotate(-30deg); opacity: 0; } 70% { transform: scale(1.12) rotate(4deg); opacity: 1; } 100% { transform: scale(1) rotate(0deg); opacity: 1; } }
@keyframes pop { 0% { transform: scale(0.5); } 100% { transform: scale(1); } }
@keyframes sway { 0%, 100% { transform: rotate(-3deg); } 50% { transform: rotate(3deg); } }
@keyframes sproutPulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.08, 1.12); } }
@media (prefers-reduced-motion: reduce) { .ba .fh, .bb .fh, .sway, .grow, .picked-tag { animation: none !important; } }
<!--BODY-->
<div style="position: absolute; inset: 0; box-sizing: border-box; padding: 30px 44px; display: flex; flex-direction: column; gap: 12px;">
  <div style="display: flex; align-items: baseline; gap: 16px;">
    <h1 class="display" style="margin: 0; font-size: 38px; font-weight: 650;">Flowers for the lesson garden</h1>
    <span class="soft" style="font-size: 16px;">Tap one to watch it bloom and mark it as a pick.</span>
  </div>

  <div style="display: flex; align-items: center; gap: 10px;">
    <h2 class="display" style="margin: 0; font-size: 23px; font-weight: 600;">Roses</h2>
    <span class="chip chip-accent" style="height: 28px; font-size: 13px;">her favourite</span>
  </div>
  <div class="row-a" style="display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 14px;">
    <button class="fcard {{ c1 }}" onClick="{{ f1 }}"><sc-if value="{{ s1 }}" hint-placeholder-val="{{ false }}"><span class="picked-tag"><svg width="14" height="14" viewBox="0 0 24 24"><path class="ic" style="stroke-width: 3.4;" d="M5 12.5l4.5 4.5L19 7.5"></path></svg>pick</span></sc-if><span class="fstage {{ b1 }}">%%PLANT rose:red 84 98 sway fh%%</span><span class="fname">Classic red</span><span class="fnote">the one she loves</span></button>
    <button class="fcard {{ c2 }}" onClick="{{ f2 }}"><sc-if value="{{ s2 }}" hint-placeholder-val="{{ false }}"><span class="picked-tag"><svg width="14" height="14" viewBox="0 0 24 24"><path class="ic" style="stroke-width: 3.4;" d="M5 12.5l4.5 4.5L19 7.5"></path></svg>pick</span></sc-if><span class="fstage {{ b2 }}">%%PLANT rose:blush 84 98 sway fh%%</span><span class="fname">Blush pink</span><span class="fnote">soft and sweet</span></button>
    <button class="fcard {{ c3 }}" onClick="{{ f3 }}"><sc-if value="{{ s3 }}" hint-placeholder-val="{{ false }}"><span class="picked-tag"><svg width="14" height="14" viewBox="0 0 24 24"><path class="ic" style="stroke-width: 3.4;" d="M5 12.5l4.5 4.5L19 7.5"></path></svg>pick</span></sc-if><span class="fstage {{ b3 }}">%%PLANT rose:cream 84 98 sway fh%%</span><span class="fname">Cream</span><span class="fnote">matches the palette</span></button>
    <button class="fcard {{ c4 }}" onClick="{{ f4 }}"><sc-if value="{{ s4 }}" hint-placeholder-val="{{ false }}"><span class="picked-tag"><svg width="14" height="14" viewBox="0 0 24 24"><path class="ic" style="stroke-width: 3.4;" d="M5 12.5l4.5 4.5L19 7.5"></path></svg>pick</span></sc-if><span class="fstage {{ b4 }}">%%PLANT rose:coral 84 98 sway fh%%</span><span class="fname">Coral</span><span class="fnote">warm and bright</span></button>
    <button class="fcard {{ c5 }}" onClick="{{ f5 }}"><sc-if value="{{ s5 }}" hint-placeholder-val="{{ false }}"><span class="picked-tag"><svg width="14" height="14" viewBox="0 0 24 24"><path class="ic" style="stroke-width: 3.4;" d="M5 12.5l4.5 4.5L19 7.5"></path></svg>pick</span></sc-if><span class="fstage {{ b5 }}">%%PLANT rose:yellow 84 98 sway fh%%</span><span class="fname">Yellow</span><span class="fnote">sunny</span></button>
    <button class="fcard {{ c6 }}" onClick="{{ f6 }}"><sc-if value="{{ s6 }}" hint-placeholder-val="{{ false }}"><span class="picked-tag"><svg width="14" height="14" viewBox="0 0 24 24"><path class="ic" style="stroke-width: 3.4;" d="M5 12.5l4.5 4.5L19 7.5"></path></svg>pick</span></sc-if><span class="fstage {{ b6 }}">%%PLANT rose:mauve 84 98 sway fh%%</span><span class="fname">Dried mauve</span><span class="fnote">the most boho</span></button>
  </div>

  <div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px;">
    <div class="panel" style="border-radius: 22px; padding: 12px 18px;">
      <div style="display: flex; align-items: baseline; gap: 10px;">
        <h2 class="display" style="margin: 0; font-size: 19px; font-weight: 600;">A red rose, growing</h2>
        <span class="soft" style="font-size: 13px;">how each lesson would look</span>
      </div>
      <div style="display: flex; justify-content: space-around; align-items: flex-end; margin-top: 4px;">
        <span style="display: flex; flex-direction: column; align-items: center;">%%PLANT seed 56 65%%<span class="fnote">not yet</span></span>
        <span style="display: flex; flex-direction: column; align-items: center;">%%PLANT sprout 56 65 - grow%%<span class="fnote">up next</span></span>
        <span style="display: flex; flex-direction: column; align-items: center;">%%PLANT rosebud:red 56 65%%<span class="fnote">started</span></span>
        <span style="display: flex; flex-direction: column; align-items: center;">%%PLANT rose:red 56 65 sway%%<span style="font-size: 13px; font-weight: 700; color: var(--right-text);">learned!</span></span>
      </div>
    </div>
    <div class="panel" style="border-radius: 22px; padding: 12px 18px;">
      <div style="display: flex; align-items: baseline; gap: 10px;">
        <h2 class="display" style="margin: 0; font-size: 19px; font-weight: 600;">Or a mixed garden</h2>
        <span class="soft" style="font-size: 13px;">each lesson blooms a different flower</span>
      </div>
      <div style="display: flex; justify-content: space-around; align-items: flex-end; margin-top: 4px;">
        %%PLANT rose:red 50 58 sway%%
        %%PLANT daisy 50 58 sway%%
        %%PLANT tulip 50 58 sway%%
        %%PLANT cosmos 50 58 sway%%
        %%PLANT sunflower 50 58 sway%%
        %%PLANT lavender 50 58 sway%%
      </div>
    </div>
  </div>

  <div style="display: flex; align-items: center; gap: 10px;">
    <h2 class="display" style="margin: 0; font-size: 23px; font-weight: 600;">Other flowers</h2>
  </div>
  <div class="row-b" style="display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 14px;">
    <button class="fcard {{ c7 }}" onClick="{{ f7 }}"><sc-if value="{{ s7 }}" hint-placeholder-val="{{ false }}"><span class="picked-tag"><svg width="14" height="14" viewBox="0 0 24 24"><path class="ic" style="stroke-width: 3.4;" d="M5 12.5l4.5 4.5L19 7.5"></path></svg>pick</span></sc-if><span class="fstage {{ b7 }}">%%PLANT daisy 84 98 sway fh%%</span><span class="fname">Daisy</span><span class="fnote">in round 2 now</span></button>
    <button class="fcard {{ c8 }}" onClick="{{ f8 }}"><sc-if value="{{ s8 }}" hint-placeholder-val="{{ false }}"><span class="picked-tag"><svg width="14" height="14" viewBox="0 0 24 24"><path class="ic" style="stroke-width: 3.4;" d="M5 12.5l4.5 4.5L19 7.5"></path></svg>pick</span></sc-if><span class="fstage {{ b8 }}">%%PLANT tulip 84 98 sway fh%%</span><span class="fname">Tulip</span><span class="fnote">simple shape</span></button>
    <button class="fcard {{ c9 }}" onClick="{{ f9 }}"><sc-if value="{{ s9 }}" hint-placeholder-val="{{ false }}"><span class="picked-tag"><svg width="14" height="14" viewBox="0 0 24 24"><path class="ic" style="stroke-width: 3.4;" d="M5 12.5l4.5 4.5L19 7.5"></path></svg>pick</span></sc-if><span class="fstage {{ b9 }}">%%PLANT cosmos 84 98 sway fh%%</span><span class="fname">Cosmos</span><span class="fnote">a wildflower</span></button>
    <button class="fcard {{ c10 }}" onClick="{{ f10 }}"><sc-if value="{{ s10 }}" hint-placeholder-val="{{ false }}"><span class="picked-tag"><svg width="14" height="14" viewBox="0 0 24 24"><path class="ic" style="stroke-width: 3.4;" d="M5 12.5l4.5 4.5L19 7.5"></path></svg>pick</span></sc-if><span class="fstage {{ b10 }}">%%PLANT sunflower 84 98 sway fh%%</span><span class="fname">Sunflower</span><span class="fnote">big and happy</span></button>
    <button class="fcard {{ c11 }}" onClick="{{ f11 }}"><sc-if value="{{ s11 }}" hint-placeholder-val="{{ false }}"><span class="picked-tag"><svg width="14" height="14" viewBox="0 0 24 24"><path class="ic" style="stroke-width: 3.4;" d="M5 12.5l4.5 4.5L19 7.5"></path></svg>pick</span></sc-if><span class="fstage {{ b11 }}">%%PLANT lavender 84 98 sway fh%%</span><span class="fname">Lavender</span><span class="fnote">calm</span></button>
    <button class="fcard {{ c12 }}" onClick="{{ f12 }}"><sc-if value="{{ s12 }}" hint-placeholder-val="{{ false }}"><span class="picked-tag"><svg width="14" height="14" viewBox="0 0 24 24"><path class="ic" style="stroke-width: 3.4;" d="M5 12.5l4.5 4.5L19 7.5"></path></svg>pick</span></sc-if><span class="fstage {{ b12 }}">%%PLANT strawflower 84 98 sway fh%%</span><span class="fname">Strawflower</span><span class="fnote">dried, boho</span></button>
  </div>
</div>
<!--LOGIC-->
  extra(vals, s, dark) {
    var self = this;
    var picked = s.picked || {};
    var beats = s.beats || {};
    for (var i = 1; i <= 12; i++) {
      (function (n) {
        vals['s' + n] = !!picked[n];
        vals['c' + n] = picked[n] ? 'is-picked' : '';
        vals['b' + n] = (beats[n] || 0) % 2 === 0 ? 'ba' : 'bb';
        vals['f' + n] = function () {
          var cur = self.state || {};
          var p = Object.assign({}, cur.picked || {});
          var b = Object.assign({}, cur.beats || {});
          p[n] = !p[n];
          b[n] = (b[n] || 0) + 1;
          self.setState({ picked: p, beats: b });
        };
      })(i);
    }
  }
