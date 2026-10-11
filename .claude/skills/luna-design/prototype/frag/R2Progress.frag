<!--CSS-->
.opt { position: relative; box-sizing: border-box; border-radius: 26px; padding: 18px 24px 18px; display: flex; flex-direction: column; transition: border-color 200ms ease, box-shadow 200ms ease; }
.opt.is-picked { border-color: var(--action); box-shadow: 0 3px 0 var(--action-edge), 0 0 0 6px var(--right-glow); }
.ohead { display: flex; align-items: center; gap: 14px; height: 48px; }
.onum { width: 40px; height: 40px; border-radius: 999px; background: var(--accent-soft); color: var(--accent-text); display: flex; align-items: center; justify-content: center; font-size: 21px; font-weight: 700; flex: none; }
.oname { margin: 0; font-size: 30px; font-weight: 650; white-space: nowrap; }
.opitch { font-size: 17px; color: var(--soft); line-height: 1.3; }
.pickbtn { margin-left: auto; height: 46px; padding: 0 18px; border-radius: 14px; border: 2px solid var(--edge); background: var(--card); box-shadow: 0 3px 0 var(--edge); font-size: 17px; font-weight: 700; display: flex; align-items: center; gap: 6px; flex: none; }
.pickbtn .pk-on { display: none; }
.pickbtn.on { background: var(--action); color: var(--action-ink); border-color: var(--action); box-shadow: 0 3px 0 var(--action-edge); }
.pickbtn.on .pk-on { display: inline-flex; align-items: center; gap: 6px; }
.pickbtn.on .pk-off { display: none; }
.strip { width: 1112px; margin: 16px auto 0; position: relative; }
.g6 { display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 16px; }

/* a lesson card, shared by dots, bar and stars */
.lc { position: relative; box-sizing: border-box; height: 150px; border-radius: 20px; border: 2px solid var(--edge); background: var(--card); box-shadow: 0 3px 0 var(--edge); display: flex; flex-direction: column; align-items: center; gap: 3px; padding: 14px 8px 10px; text-align: center; }
.lc.arch { height: 206px; border-radius: 999px 999px 20px 20px; padding-top: 18px; }
.lnum { font-size: 12px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--soft); }
.ttl { font-size: 16px; font-weight: 700; line-height: 1.2; min-height: 39px; display: flex; align-items: center; justify-content: center; }
.time { margin-top: auto; height: 28px; padding: 0 10px 0 6px; border-radius: 999px; display: inline-flex; align-items: center; gap: 4px; font-size: 13px; font-weight: 700; white-space: nowrap; }
.t-took { display: none; background: var(--right-soft); color: var(--right-text); }
.t-est { background: var(--well); color: var(--soft); }
.st-done .t-took { display: inline-flex; }
.st-done .t-est { display: none; }
.st-now .t-est { background: var(--accent-soft); color: var(--accent-text); }
.st-lock .t-est { background: var(--card); }
.st-done .lnum { color: var(--right-text); }
.st-now .lnum { color: var(--accent-text); }
.st-lock .ttl { color: var(--soft); }
.lc.st-now { border: 3px solid var(--action); box-shadow: none; animation: glow 4s ease-in-out infinite; }
.lc.st-lock { background: var(--well); border-style: dashed; box-shadow: none; cursor: default; }
.lc.st-lock:active, .scell.st-lock:active { transform: none; }
.upnext { display: none; position: absolute; top: -15px; left: 50%; transform: translateX(-50%) rotate(-3deg); padding: 3px 12px; border-radius: 8px; background: var(--accent); color: var(--accent-ink); font-size: 13px; font-weight: 700; white-space: nowrap; }
.lc.st-now .upnext { display: block; }
.i-done, .i-now, .i-lock { display: none; }
.st-done .i-done, .st-now .i-now, .st-lock .i-lock { display: block; }

/* 1 · dots joined by a line */
.drow { position: relative; height: 62px; margin-bottom: 12px; }
.dtrack { position: absolute; left: 86px; top: 28px; width: 940px; height: 6px; background-image: linear-gradient(90deg, var(--soil) 55%, transparent 55%); background-size: 16px 6px; }
.dfill { position: absolute; left: 86px; top: 27px; height: 8px; border-radius: 4px; background: var(--right); transition: width 600ms cubic-bezier(0.34, 1.3, 0.64, 1); }
.w0 { width: 0; } .w1 { width: 188px; } .w2 { width: 376px; } .w3 { width: 564px; } .w4 { width: 752px; } .w5 { width: 940px; }
.dcell { position: relative; height: 62px; display: flex; align-items: center; justify-content: center; }
.dot { width: 50px; height: 50px; box-sizing: border-box; border-radius: 999px; display: flex; align-items: center; justify-content: center; }
.dot.st-done { background: var(--right); color: var(--right-ink); }
.dot.st-now { width: 60px; height: 60px; background: var(--action); color: var(--action-ink); animation: glow 4s ease-in-out infinite; }
.dot.st-lock { background: var(--well); border: 2px dashed var(--soil-dk); color: var(--soft); }
.dot.fresh { animation: popIn 600ms cubic-bezier(0.34, 1.56, 0.64, 1); }

/* 2 · one bar */
.brow { height: 62px; margin-bottom: 12px; display: flex; align-items: center; gap: 18px; }
.blabel { font-size: 19px; color: var(--soft); white-space: nowrap; }
.blabel strong { color: var(--ink); font-size: 24px; }
.bbar { flex: 1; position: relative; height: 30px; box-sizing: border-box; border-radius: 999px; background: var(--well); border: 2px solid var(--edge); overflow: hidden; }
.bfill { position: absolute; left: 0; top: 0; bottom: 0; border-radius: 999px; background: var(--right); transition: width 600ms cubic-bezier(0.34, 1.3, 0.64, 1); }
.f0 { width: 0; } .f1 { width: 16.667%; } .f2 { width: 33.333%; } .f3 { width: 50%; } .f4 { width: 66.667%; } .f5 { width: 83.333%; } .f6 { width: 100%; }
.btick { position: absolute; top: 0; bottom: 0; width: 3px; margin-left: -1px; background: var(--card); opacity: 0.85; }
.cbadge { position: absolute; top: -10px; right: 10px; width: 30px; height: 30px; box-sizing: border-box; border-radius: 999px; display: none; align-items: center; justify-content: center; }
.lc.st-done .cb-done { display: flex; background: var(--right); color: var(--right-ink); }
.lc.st-lock .cb-lock { display: flex; background: var(--card); border: 2px solid var(--edge); color: var(--soft); }
.lc.fresh .cb-done { animation: popIn 600ms cubic-bezier(0.34, 1.56, 0.64, 1); }
.mbar { display: none; position: relative; width: 78%; height: 12px; box-sizing: border-box; margin-top: 4px; border-radius: 999px; background: var(--well); border: 2px solid var(--edge); overflow: hidden; }
.lc.st-now .mbar { display: block; }

/* 3 · stepping stones, and Luna walks them */
.prow { position: relative; height: 238px; }
.trail { position: absolute; left: 0; top: 76px; height: 40px; overflow: hidden; }
.trail svg { display: block; }
.trail-done { transition: width 700ms ease; }
.tw0 { width: 86px; } .tw1 { width: 274px; } .tw2 { width: 462px; } .tw3 { width: 650px; } .tw4 { width: 838px; } .tw5 { width: 1026px; }
.scell { position: relative; padding: 67px 4px 0; display: flex; flex-direction: column; align-items: center; gap: 4px; text-align: center; }
.stone { position: relative; width: 88px; height: 58px; box-sizing: border-box; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex: none; margin-bottom: 6px; }
.scell.st-done .stone { background: var(--accent); box-shadow: 0 4px 0 var(--accent-edge); color: var(--accent-ink); }
.scell.st-now .stone { background: var(--accent-soft); border: 3px solid var(--action); animation: glow 4s ease-in-out infinite; }
.scell.st-lock .stone { background: var(--well); border: 2px dashed var(--soil-dk); color: var(--soft); }
.scell.fresh .stone { animation: popIn 600ms cubic-bezier(0.34, 1.56, 0.64, 1); }
.scell .time { margin-top: 2px; }
.owlpos { position: absolute; top: 2px; width: 76px; height: 76px; z-index: 2; pointer-events: none; transition: left 700ms cubic-bezier(0.34, 1.2, 0.64, 1); }
.owlpos > span { display: block; width: 76px; height: 76px; transform-origin: 50% 100%; }
.at0 { left: 48px; } .at1 { left: 236px; } .at2 { left: 424px; } .at3 { left: 612px; } .at4 { left: 800px; } .at5 { left: 988px; }
.hop-a { animation: hopA 700ms ease-out; }
.hop-b { animation: hopB 700ms ease-out; }
.cheer { animation: cheer 1.1s ease-in-out infinite; }

/* 4 · a star for each lesson */
.starmk { position: relative; width: 62px; height: 62px; flex: none; margin-bottom: 4px; }
.starmk > svg:first-child { display: block; }
.sp { stroke-linejoin: round; stroke-width: 1.4; }
.lc.st-done .sp { fill: #C4996A; stroke: #7A5236; }
.lc.st-now .sp { fill: var(--accent-soft); stroke: var(--action); stroke-dasharray: 2.2 1.6; }
.lc.st-lock .sp { fill: none; stroke: var(--soil-dk); stroke-width: 1.6; }
.spark { position: absolute; top: -4px; right: -10px; display: none; transform-origin: center; }
.lc.st-done .spark { display: block; animation: twinkle 3.2s ease-in-out infinite; }
.lockb { position: absolute; right: -8px; bottom: 0; width: 28px; height: 28px; box-sizing: border-box; border-radius: 999px; background: var(--card); border: 2px solid var(--edge); color: var(--soft); display: none; align-items: center; justify-content: center; }
.lc.st-lock .lockb { display: flex; }
.lc.fresh .starmk { animation: popIn 700ms cubic-bezier(0.34, 1.56, 0.64, 1); }

/* inside a lesson: the round marks in the lesson's top bar */
.inl { margin-top: auto; display: flex; align-items: center; gap: 16px; }
.mh { flex: 1; min-width: 0; height: 62px; box-sizing: border-box; padding: 0 18px 0 10px; border-radius: 16px; background: var(--card); border: 2px solid var(--edge); display: flex; align-items: center; gap: 14px; }
.mh-back { height: 40px; padding: 0 12px 0 8px; box-sizing: border-box; border-radius: 12px; border: 2px solid var(--edge); display: flex; align-items: center; gap: 4px; font-size: 15px; font-weight: 700; flex: none; }
.mh-title { font-size: 20px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; min-width: 0; }
.mh-marks { margin-left: auto; display: flex; align-items: center; gap: 8px; flex: none; }
.mh-count { font-size: 15px; font-weight: 700; color: var(--soft); white-space: nowrap; width: 96px; text-align: right; flex: none; }
.rdot { width: 22px; height: 22px; box-sizing: border-box; border-radius: 999px; background: var(--edge); }
.rdot.rk-done { background: var(--right); }
.rdot.rk-now { background: var(--accent-soft); border: 3px solid var(--action); animation: pulse 1.6s ease-in-out infinite; }
.rbar { position: relative; width: 260px; height: 20px; box-sizing: border-box; border-radius: 999px; background: var(--well); border: 2px solid var(--edge); overflow: hidden; }
.rfill { position: absolute; left: 0; top: 0; bottom: 0; border-radius: 999px; background: var(--right); transition: width 400ms cubic-bezier(0.34, 1.3, 0.64, 1); }
.r0 { width: 0; } .r1 { width: 20%; } .r2 { width: 40%; } .r3 { width: 60%; } .r4 { width: 80%; } .r5 { width: 100%; }
.rstone { width: 38px; height: 25px; box-sizing: border-box; border-radius: 50%; background: var(--well); border: 2px dashed var(--soil-dk); }
.rstone.rk-done { background: var(--accent); border: none; box-shadow: 0 3px 0 var(--accent-edge); }
.rstone.rk-now { background: var(--accent-soft); border: 3px solid var(--action); animation: pulse 1.6s ease-in-out infinite; }
.rstar { display: block; }
.rsp { stroke-linejoin: round; stroke-width: 1.6; fill: none; stroke: var(--soil-dk); }
.rstar.rk-done .rsp { fill: #C4996A; stroke: #7A5236; }
.rstar.rk-now .rsp { fill: var(--accent-soft); stroke: var(--action); }
.rstar.rk-now { animation: pulse 1.6s ease-in-out infinite; }

/* the note: what just happened, or what Luna says out loud */
.note { width: 600px; min-height: 92px; flex: none; box-sizing: border-box; padding: 12px 18px; border-radius: 20px; display: flex; align-items: center; gap: 14px; font-size: 18px; line-height: 1.35; }
.note-ic { width: 44px; height: 44px; border-radius: 999px; background: var(--accent-soft); color: var(--accent-text); display: flex; align-items: center; justify-content: center; flex: none; }
.note-a { animation: noteInA 300ms ease-out; }
.note-b { animation: noteInB 300ms ease-out; }

@keyframes glow { 0%, 100% { box-shadow: 0 0 0 0 rgba(154, 107, 69, 0.45); } 50% { box-shadow: 0 0 0 12px rgba(154, 107, 69, 0); } }
@keyframes popIn { 0% { transform: scale(0.3); } 60% { transform: scale(1.22); } 100% { transform: scale(1); } }
@keyframes wobA { 0%, 100% { transform: translateX(0) rotate(0deg); } 20% { transform: translateX(-7px) rotate(-2deg); } 40% { transform: translateX(7px) rotate(2deg); } 60% { transform: translateX(-4px) rotate(-1deg); } 80% { transform: translateX(3px) rotate(1deg); } }
@keyframes wobB { 0%, 100% { transform: translateX(0) rotate(0deg); } 20% { transform: translateX(-7px) rotate(-2deg); } 40% { transform: translateX(7px) rotate(2deg); } 60% { transform: translateX(-4px) rotate(-1deg); } 80% { transform: translateX(3px) rotate(1deg); } }
.wob-a { animation: wobA 450ms ease-in-out; }
.wob-b { animation: wobB 450ms ease-in-out; }
@keyframes hopA { 0% { transform: translateY(0); } 45% { transform: translateY(-48px); } 75% { transform: translateY(0) scale(1.08, 0.9); } 100% { transform: translateY(0) scale(1); } }
@keyframes hopB { 0% { transform: translateY(0); } 45% { transform: translateY(-48px); } 75% { transform: translateY(0) scale(1.08, 0.9); } 100% { transform: translateY(0) scale(1); } }
@keyframes cheer { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
@keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.15); } }
@keyframes twinkle { 0%, 100% { transform: scale(0.7) rotate(0deg); opacity: 0.5; } 50% { transform: scale(1.1) rotate(20deg); opacity: 1; } }
@keyframes noteInA { 0% { opacity: 0; transform: translateY(6px); } 100% { opacity: 1; transform: translateY(0); } }
@keyframes noteInB { 0% { opacity: 0; transform: translateY(6px); } 100% { opacity: 1; transform: translateY(0); } }
@media (prefers-reduced-motion: reduce) {
  .lc.st-now, .dot.st-now, .dot.fresh, .lc.fresh .cb-done, .scell.st-now .stone, .scell.fresh .stone, .lc.fresh .starmk, .lc.st-done .spark, .rdot.rk-now, .rstone.rk-now, .rstar.rk-now, .wob-a, .wob-b, .hop-a, .hop-b, .cheer, .note-a, .note-b { animation: none !important; }
  .dfill, .bfill, .rfill, .trail-done, .owlpos { transition: none !important; }
}
<!--BODY-->
<div style="position: absolute; inset: 0; box-sizing: border-box; padding: 34px 44px 36px; display: flex; flex-direction: column; gap: 22px;">

  <!-- what this board is, what just happened, and the two controls -->
  <div style="display: flex; align-items: center; gap: 24px;">
    <div style="flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 6px;">
      <h1 class="display" style="margin: 0; font-size: 44px; font-weight: 650;">Lesson progress: she picked One bar</h1>
      <span class="soft" style="font-size: 19px; line-height: 1.35;">The teacher picked 2, One bar (2026-10-10); the Library, Round and Done boards now use it. Lessons go in order: finish one to open the next, and the games stay open. The other three stay here for the record; play a round to compare.</span>
    </div>
    <div class="panel note">
      <span class="note-ic">
        <sc-if value="{{ spoken }}" hint-placeholder-val="{{ false }}"><svg width="24" height="24" viewBox="0 0 24 24"><path class="ic" d="M4 9v6h4l5 4V5L8 9z"></path><path class="ic" d="M16 9a4 4 0 0 1 0 6"></path><path class="ic" d="M18.5 6.5a8 8 0 0 1 0 11"></path></svg></sc-if>
        <sc-if value="{{ notSpoken }}" hint-placeholder-val="{{ true }}"><svg width="24" height="24" viewBox="0 0 24 24"><circle class="ic" cx="12" cy="12" r="9"></circle><path class="ic" d="M12 11v6"></path><path class="ic" d="M12 7.5v.1"></path></svg></sc-if>
      </span>
      <span class="{{ noteClass }}" style="display: flex; flex-direction: column; gap: 2px;">
        <sc-if value="{{ spoken }}" hint-placeholder-val="{{ false }}"><span class="lbl" style="color: var(--accent-text);">Luna says, out loud</span></sc-if>
        <span>{{ note }}</span>
      </span>
    </div>
    <button class="press btn btn-action" onClick="{{ play }}" style="height: 60px; padding: 0 22px 0 18px; font-size: 19px; border-radius: 18px; flex: none;">
      <svg width="24" height="24" viewBox="0 0 24 24"><path d="M8 5.5v13l10.5-6.5z" stroke-linejoin="round" style="fill: currentColor; stroke: currentColor; stroke-width: 2;"></path></svg>
      {{ playLabel }}
    </button>
    <button class="press btn" onClick="{{ reset }}" style="height: 60px; padding: 0 20px 0 16px; font-size: 19px; border-radius: 18px; flex: none;">
      <svg width="22" height="22" viewBox="0 0 24 24"><path class="ic" d="M3 12a9 9 0 1 0 3-6.7"></path><path class="ic" d="M3 4v5h5"></path></svg>
      Start over
    </button>
  </div>

  <div style="flex: 1; min-height: 0; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); grid-template-rows: repeat(2, minmax(0, 1fr)); gap: 24px;">

    <!-- 1 · dots -->
    <section class="panel opt {{ po1 }}">
      <div class="ohead">
        <span class="onum">1</span>
        <h2 class="display oname">Dots</h2>
        <span class="opitch">A dot for each lesson, joined by a line. Green means done; the big one is next.</span>
        <button class="press pickbtn {{ pk1 }}" onClick="{{ pick1 }}"><span class="pk-off">Pick this</span><span class="pk-on"><svg width="16" height="16" viewBox="0 0 24 24"><path class="ic" style="stroke-width: 3.4;" d="M5 12.5l4.5 4.5L19 7.5"></path></svg>Her pick</span></button>
      </div>
      <div class="strip">
        <div class="drow">
          <span class="dtrack"></span>
          <span class="dfill {{ lineW }}"></span>
          <div class="g6">
            <sc-for list="{{ lessons }}" as="l" hint-placeholder-count="6">
              <span class="dcell"><span class="dot {{ l.cls }} {{ l.fresh }}">
                <svg class="i-done" width="26" height="26" viewBox="0 0 24 24"><path class="ic" style="stroke-width: 3.4;" d="M5 12.5l4.5 4.5L19 7.5"></path></svg>
                <svg class="i-now" width="26" height="26" viewBox="0 0 24 24"><path d="M8 5.5v13l10.5-6.5z" stroke-linejoin="round" style="fill: currentColor; stroke: currentColor; stroke-width: 2;"></path></svg>
                <svg class="i-lock" width="22" height="22" viewBox="0 0 24 24"><rect class="ic" x="5" y="10.5" width="14" height="10" rx="2.5"></rect><path class="ic" d="M8 10.5V8a4 4 0 0 1 8 0v2.5"></path></svg>
              </span></span>
            </sc-for>
          </div>
        </div>
        <div class="g6">
          <sc-for list="{{ lessons }}" as="l" hint-placeholder-count="6">
            <button class="press lc {{ l.cls }} {{ l.wob }}" onClick="{{ l.tap }}" aria-label="{{ l.aria }}">
              <span class="lnum">Lesson {{ l.n }}</span>
              <span class="ttl">{{ l.title }}</span>
              <span class="time t-took"><svg width="16" height="16" viewBox="0 0 24 24"><path class="ic" style="stroke-width: 3;" d="M5 12.5l4.5 4.5L19 7.5"></path></svg>took {{ l.took }} min</span>
              <span class="time t-est"><svg width="16" height="16" viewBox="0 0 24 24"><circle class="ic" cx="12" cy="13" r="8"></circle><path class="ic" d="M12 9v4l2.5 2"></path></svg>about {{ l.est }} min</span>
            </button>
          </sc-for>
        </div>
      </div>
      <div class="inl">
        <span class="lbl" style="width: 76px; line-height: 1.3;">Inside a lesson</span>
        <div class="mh">
          <span class="mh-back"><svg width="18" height="18" viewBox="0 0 24 24"><path class="ic" d="M15 5l-7 7 7 7"></path></svg>Library</span>
          <span class="display mh-title">{{ curTitle }}</span>
          <span class="mh-marks">
            <sc-for list="{{ rounds }}" as="r" hint-placeholder-count="5"><span class="rdot {{ r.cls }}"></span></sc-for>
          </span>
          <span class="mh-count">{{ roundText }}</span>
        </div>
      </div>
    </section>

    <!-- 2 · one bar -->
    <section class="panel opt {{ po2 }}">
      <div class="ohead">
        <span class="onum">2</span>
        <h2 class="display oname">One bar</h2>
        <span class="opitch">One bar fills up as lessons are done. Cards just say done, next or locked.</span>
        <button class="press pickbtn {{ pk2 }}" onClick="{{ pick2 }}"><span class="pk-off">Pick this</span><span class="pk-on"><svg width="16" height="16" viewBox="0 0 24 24"><path class="ic" style="stroke-width: 3.4;" d="M5 12.5l4.5 4.5L19 7.5"></path></svg>Her pick</span></button>
      </div>
      <div class="strip">
        <div class="brow">
          <span class="blabel"><strong>{{ doneCount }} of 6</strong> lessons done</span>
          <span class="bbar">
            <span class="bfill {{ barW }}"></span>
            <span class="btick" style="left: 16.667%;"></span><span class="btick" style="left: 33.333%;"></span><span class="btick" style="left: 50%;"></span><span class="btick" style="left: 66.667%;"></span><span class="btick" style="left: 83.333%;"></span>
          </span>
        </div>
        <div class="g6">
          <sc-for list="{{ lessons }}" as="l" hint-placeholder-count="6">
            <button class="press lc {{ l.cls }} {{ l.fresh }} {{ l.wob }}" onClick="{{ l.tap }}" aria-label="{{ l.aria }}">
              <span class="upnext">Up next</span>
              <span class="cbadge cb-done"><svg width="16" height="16" viewBox="0 0 24 24"><path class="ic" style="stroke-width: 3.4;" d="M5 12.5l4.5 4.5L19 7.5"></path></svg></span>
              <span class="cbadge cb-lock"><svg width="15" height="15" viewBox="0 0 24 24"><rect class="ic" x="5" y="10.5" width="14" height="10" rx="2.5"></rect><path class="ic" d="M8 10.5V8a4 4 0 0 1 8 0v2.5"></path></svg></span>
              <span class="lnum">Lesson {{ l.n }}</span>
              <span class="ttl">{{ l.title }}</span>
              <span class="mbar"><span class="rfill {{ roundW }}"></span></span>
              <span class="time t-took"><svg width="16" height="16" viewBox="0 0 24 24"><path class="ic" style="stroke-width: 3;" d="M5 12.5l4.5 4.5L19 7.5"></path></svg>took {{ l.took }} min</span>
              <span class="time t-est"><svg width="16" height="16" viewBox="0 0 24 24"><circle class="ic" cx="12" cy="13" r="8"></circle><path class="ic" d="M12 9v4l2.5 2"></path></svg>about {{ l.est }} min</span>
            </button>
          </sc-for>
        </div>
      </div>
      <div class="inl">
        <span class="lbl" style="width: 76px; line-height: 1.3;">Inside a lesson</span>
        <div class="mh">
          <span class="mh-back"><svg width="18" height="18" viewBox="0 0 24 24"><path class="ic" d="M15 5l-7 7 7 7"></path></svg>Library</span>
          <span class="display mh-title">{{ curTitle }}</span>
          <span class="mh-marks">
            <span class="rbar"><span class="rfill {{ roundW }}"></span><span class="btick" style="left: 20%;"></span><span class="btick" style="left: 40%;"></span><span class="btick" style="left: 60%;"></span><span class="btick" style="left: 80%;"></span></span>
          </span>
          <span class="mh-count">{{ roundText }}</span>
        </div>
      </div>
    </section>

    <!-- 3 · stepping stones -->
    <section class="panel opt {{ po3 }}">
      <div class="ohead">
        <span class="onum">3</span>
        <h2 class="display oname">Stepping stones</h2>
        <span class="opitch">Luna stands on the lesson you’re on and hops to the next stone when it’s done.</span>
        <button class="press pickbtn {{ pk3 }}" onClick="{{ pick3 }}"><span class="pk-off">Pick this</span><span class="pk-on"><svg width="16" height="16" viewBox="0 0 24 24"><path class="ic" style="stroke-width: 3.4;" d="M5 12.5l4.5 4.5L19 7.5"></path></svg>Her pick</span></button>
      </div>
      <div class="strip prow">
        <span class="trail" style="width: 1112px;"><svg width="1112" height="40" viewBox="0 0 1112 40"><path d="M86 20 C146 6 214 34 274 20 C334 6 402 34 462 20 C522 6 590 34 650 20 C710 6 778 34 838 20 C898 6 966 34 1026 20" stroke-dasharray="3 13" style="fill: none; stroke: var(--soil-dk); stroke-width: 6; stroke-linecap: round;"></path></svg></span>
        <span class="trail trail-done {{ trailW }}"><svg width="1112" height="40" viewBox="0 0 1112 40"><path d="M86 20 C146 6 214 34 274 20 C334 6 402 34 462 20 C522 6 590 34 650 20 C710 6 778 34 838 20 C898 6 966 34 1026 20" style="fill: none; stroke: var(--accent); stroke-width: 7; stroke-linecap: round;"></path></svg></span>
        <span class="owlpos {{ owlAt }}"><span class="{{ owlMove }}">%%OWL 76 wings%%</span></span>
        <div class="g6">
          <sc-for list="{{ lessons }}" as="l" hint-placeholder-count="6">
            <button class="tap scell {{ l.cls }} {{ l.fresh }} {{ l.wob }}" onClick="{{ l.tap }}" aria-label="{{ l.aria }}">
              <span class="stone">
                <svg class="i-done" width="28" height="28" viewBox="0 0 24 24"><path class="ic" style="stroke-width: 3.4;" d="M5 12.5l4.5 4.5L19 7.5"></path></svg>
                <svg class="i-lock" width="22" height="22" viewBox="0 0 24 24"><rect class="ic" x="5" y="10.5" width="14" height="10" rx="2.5"></rect><path class="ic" d="M8 10.5V8a4 4 0 0 1 8 0v2.5"></path></svg>
              </span>
              <span class="lnum">Lesson {{ l.n }}</span>
              <span class="ttl">{{ l.title }}</span>
              <span class="time t-took"><svg width="16" height="16" viewBox="0 0 24 24"><path class="ic" style="stroke-width: 3;" d="M5 12.5l4.5 4.5L19 7.5"></path></svg>took {{ l.took }} min</span>
              <span class="time t-est"><svg width="16" height="16" viewBox="0 0 24 24"><circle class="ic" cx="12" cy="13" r="8"></circle><path class="ic" d="M12 9v4l2.5 2"></path></svg>about {{ l.est }} min</span>
            </button>
          </sc-for>
        </div>
      </div>
      <div class="inl">
        <span class="lbl" style="width: 76px; line-height: 1.3;">Inside a lesson</span>
        <div class="mh">
          <span class="mh-back"><svg width="18" height="18" viewBox="0 0 24 24"><path class="ic" d="M15 5l-7 7 7 7"></path></svg>Library</span>
          <span class="display mh-title">{{ curTitle }}</span>
          <span class="mh-marks">
            <sc-for list="{{ rounds }}" as="r" hint-placeholder-count="5"><span class="rstone {{ r.cls }}"></span></sc-for>
          </span>
          <span class="mh-count">{{ roundText }}</span>
        </div>
      </div>
    </section>

    <!-- 4 · stars -->
    <section class="panel opt {{ po4 }}">
      <div class="ohead">
        <span class="onum">4</span>
        <h2 class="display oname">Stars</h2>
        <span class="opitch">Each lesson earns its star. An empty star is next; a locked one waits its turn.</span>
        <button class="press pickbtn {{ pk4 }}" onClick="{{ pick4 }}"><span class="pk-off">Pick this</span><span class="pk-on"><svg width="16" height="16" viewBox="0 0 24 24"><path class="ic" style="stroke-width: 3.4;" d="M5 12.5l4.5 4.5L19 7.5"></path></svg>Her pick</span></button>
      </div>
      <div class="strip" style="margin-top: 26px;">
        <div class="g6">
          <sc-for list="{{ lessons }}" as="l" hint-placeholder-count="6">
            <button class="press lc arch {{ l.cls }} {{ l.fresh }} {{ l.wob }}" onClick="{{ l.tap }}" aria-label="{{ l.aria }}">
              <span class="upnext">Up next</span>
              <span class="starmk">
                <svg width="62" height="62" viewBox="0 0 24 24"><path class="sp" d="M12 2.6l2.8 5.9 6.4.9-4.7 4.5 1.1 6.4L12 17.3l-5.6 3 1.1-6.4-4.7-4.5 6.4-.9z"></path></svg>
                <svg class="spark" width="20" height="20" viewBox="0 0 24 24"><path d="M12 2l2.6 7.4L22 12l-7.4 2.6L12 22l-2.6-7.4L2 12l7.4-2.6z" fill="#C4996A"></path></svg>
                <span class="lockb"><svg width="14" height="14" viewBox="0 0 24 24"><rect class="ic" x="5" y="10.5" width="14" height="10" rx="2.5"></rect><path class="ic" d="M8 10.5V8a4 4 0 0 1 8 0v2.5"></path></svg></span>
              </span>
              <span class="lnum">Lesson {{ l.n }}</span>
              <span class="ttl">{{ l.title }}</span>
              <span class="time t-took"><svg width="16" height="16" viewBox="0 0 24 24"><path class="ic" style="stroke-width: 3;" d="M5 12.5l4.5 4.5L19 7.5"></path></svg>took {{ l.took }} min</span>
              <span class="time t-est"><svg width="16" height="16" viewBox="0 0 24 24"><circle class="ic" cx="12" cy="13" r="8"></circle><path class="ic" d="M12 9v4l2.5 2"></path></svg>about {{ l.est }} min</span>
            </button>
          </sc-for>
        </div>
      </div>
      <div class="inl">
        <span class="lbl" style="width: 76px; line-height: 1.3;">Inside a lesson</span>
        <div class="mh">
          <span class="mh-back"><svg width="18" height="18" viewBox="0 0 24 24"><path class="ic" d="M15 5l-7 7 7 7"></path></svg>Library</span>
          <span class="display mh-title">{{ curTitle }}</span>
          <span class="mh-marks">
            <sc-for list="{{ rounds }}" as="r" hint-placeholder-count="5"><svg class="rstar {{ r.cls }}" width="30" height="30" viewBox="0 0 24 24"><path class="rsp" d="M12 2.6l2.8 5.9 6.4.9-4.7 4.5 1.1 6.4L12 17.3l-5.6 3 1.1-6.4-4.7-4.5 6.4-.9z"></path></svg></sc-for>
          </span>
          <span class="mh-count">{{ roundText }}</span>
        </div>
      </div>
    </section>
  </div>
</div>
<!--LOGIC-->
  extra(vals, s, dark) {
    var self = this;
    var LESSONS = [
      { title: 'Sounds for M, S, B & T', est: 4, took: 4 },
      { title: 'Find A, M, S & B', est: 5, took: 6 },
      { title: 'Pet & Animal Words', est: 4, took: 5 },
      { title: 'Everyday Words', est: 4, took: 4 },
      { title: 'Starter Sight Words', est: 4, took: 3 },
      { title: 'Rhyme Matcher', est: 6, took: 7 }
    ];
    var ROUNDS = 5;
    var START = 'Tap the glowing lesson, or Play a round. Five rounds finish a lesson and open the next. Tap a locked one to hear Luna.';
    var get = function () {
      var c = self.state || {};
      return { done: typeof c.done === 'number' ? c.done : 2, rounds: c.rounds || 0, c: c };
    };
    var play = function () {
      var g = get();
      var nb = (g.c.noteBeat || 0) + 1;
      if (g.done >= LESSONS.length) {
        self.setState({ note: 'All six are done. Start over to watch it again.', spoken: false, noteBeat: nb });
        return;
      }
      var r = g.rounds + 1;
      if (r >= ROUNDS) {
        var d = g.done + 1;
        var msg = d >= LESSONS.length ? 'Lesson ' + d + ' done. That’s all six!' : 'Lesson ' + d + ' done, so Lesson ' + (d + 1) + ' opens.';
        self.setState({ done: d, rounds: 0, fresh: d, freshBeat: (g.c.freshBeat || 0) + 1, wobN: null, note: msg, spoken: false, noteBeat: nb });
      } else {
        self.setState({ rounds: r, note: 'Round ' + r + ' of ' + ROUNDS + ' done in Lesson ' + (g.done + 1) + '.', spoken: false, noteBeat: nb });
      }
    };
    var tapLesson = function (n) {
      var g = get();
      var nb = (g.c.noteBeat || 0) + 1;
      if (n === g.done + 1) { play(); return; }
      if (n <= g.done) {
        self.setState({ note: 'Lesson ' + n + ' plays again. A finished lesson stays open.', spoken: false, noteBeat: nb });
        return;
      }
      self.setState({ wobN: n, wobBeat: (g.c.wobBeat || 0) + 1, note: '“Let’s finish Lesson ' + (g.done + 1) + ' first!”', spoken: true, noteBeat: nb });
    };

    var done = typeof s.done === 'number' ? s.done : 2;
    var rounds = s.rounds || 0;
    var allDone = done >= LESSONS.length;
    var k = Math.min(done, 5);

    vals.lessons = LESSONS.map(function (L, i) {
      var n = i + 1;
      var st = n <= done ? 'st-done' : (n === done + 1 ? 'st-now' : 'st-lock');
      return {
        n: n,
        title: L.title,
        est: L.est,
        took: L.took,
        cls: st,
        fresh: n === s.fresh ? 'fresh' : '',
        wob: n === s.wobN ? ((s.wobBeat || 0) % 2 ? 'wob-a' : 'wob-b') : '',
        aria: 'Lesson ' + n + ', ' + L.title + (st === 'st-done' ? ', done, took ' + L.took + ' minutes' : (st === 'st-now' ? ', up next, about ' + L.est + ' minutes' : ', locked')),
        tap: function () { tapLesson(n); }
      };
    });
    vals.rounds = [0, 1, 2, 3, 4].map(function (i) {
      return { cls: allDone || i < rounds ? 'rk-done' : (i === rounds ? 'rk-now' : 'rk-todo') };
    });
    vals.doneCount = done;
    vals.lineW = 'w' + k;
    vals.barW = 'f' + done;
    vals.trailW = 'tw' + k;
    vals.owlAt = 'at' + k;
    vals.owlMove = allDone ? 'cheer' : (s.fresh ? ((s.freshBeat || 0) % 2 ? 'hop-a' : 'hop-b') : '');
    vals.roundW = 'r' + (allDone ? 5 : rounds);
    vals.curTitle = allDone ? 'All six lessons done!' : 'Lesson ' + (done + 1) + ' · ' + LESSONS[done].title;
    vals.roundText = allDone ? '6 of 6' : 'round ' + (rounds + 1) + ' of ' + ROUNDS;
    vals.playLabel = allDone ? 'All done' : 'Play a round';
    vals.play = play;
    vals.reset = function () {
      var c = self.state || {};
      self.setState({ done: 2, rounds: 0, fresh: null, wobN: null, note: START, spoken: false, noteBeat: (c.noteBeat || 0) + 1 });
    };
    vals.note = s.note || START;
    vals.spoken = !!s.spoken;
    vals.notSpoken = !s.spoken;
    vals.noteClass = (s.noteBeat || 0) % 2 ? 'note-a' : 'note-b';

    var picked = s.picked || { 2: true };
    for (var i = 1; i <= 4; i++) {
      (function (o) {
        vals['pk' + o] = picked[o] ? 'on' : '';
        vals['po' + o] = picked[o] ? 'is-picked' : '';
        vals['pick' + o] = function () {
          var cur = self.state || {};
          var p = Object.assign({}, cur.picked || {});
          p[o] = !p[o];
          self.setState({ picked: p });
        };
      })(i);
    }
  }
