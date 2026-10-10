<!--CSS-->
%%INCLUDE homecss%%
<!--BODY-->
%%INCLUDE homebg%%

  <!-- status bar: the time and Luna's voice; grown-ups only through the locked gear -->
  <div style="position: absolute; left: 0; right: 0; top: 0; height: 52px; padding: 0 24px; box-sizing: border-box; display: flex; align-items: center; gap: 12px;">
    <span style="font-size: 18px; font-weight: 700;">9:41</span>
    <button class="gear" aria-label="Grown-ups: settings" style="margin-left: auto; width: 40px; height: 40px; border-radius: 12px; background: var(--glass); color: var(--soft); display: flex; align-items: center; justify-content: center;">
      <svg width="22" height="22" viewBox="0 0 24 24"><circle class="ic" cx="12" cy="12" r="3.2"></circle><path class="ic" d="M12 2.5v3M12 18.5v3M4.6 4.6l2.1 2.1M17.3 17.3l2.1 2.1M2.5 12h3M18.5 12h3M4.6 19.4l2.1-2.1M17.3 6.7l2.1-2.1"></path></svg>
    </button>
  </div>

  <!-- the one app, in the middle, like today -->
  <div style="position: absolute; left: 0; right: 0; top: 262px; display: flex; justify-content: center;">
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

  <span style="position: absolute; left: 50%; bottom: 10px; width: 150px; height: 5px; margin-left: -75px; border-radius: 999px; background: var(--indicator);"></span>
<!--LOGIC-->
