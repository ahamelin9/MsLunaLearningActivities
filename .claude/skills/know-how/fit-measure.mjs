// What doesn't fit on a screen, measured in the page: shared by fit-check.mjs
// and story-answers-check.mjs. Pass it to page.evaluate.

/** In the page: what scrolls, or runs past the screen or the stage. */
export function measure() {
  const H = innerHeight;
  const W = innerWidth;
  const out = [];
  for (const el of document.querySelectorAll('*')) {
    if (/(auto|scroll)/.test(getComputedStyle(el).overflowY) && el.scrollHeight > el.clientHeight + 1) out.push(`scrolls by ${el.scrollHeight - el.clientHeight}px`);
  }
  if (document.scrollingElement.scrollHeight > H + 1) out.push(`the page scrolls by ${document.scrollingElement.scrollHeight - H}px`);
  const stage = document.querySelector('[data-shot="stage"]');
  if (!stage) return ['no stage'];
  const box = stage.getBoundingClientRect();
  if (box.bottom > H + 1) out.push(`the stage runs ${Math.round(box.bottom - H)}px past the screen`);
  for (const el of stage.querySelectorAll('button, p, h2, h3')) {
    const b = el.getBoundingClientRect();
    if (b.width === 0 || b.height === 0) continue;
    const said = (el.getAttribute('aria-label') ?? el.textContent).trim().slice(0, 24);
    if (b.bottom > box.bottom + 1 || b.bottom > H + 1) { out.push(`"${said}" runs ${Math.round(Math.max(b.bottom - box.bottom, b.bottom - H))}px past the stage`); break; }
    if (b.right > W + 1) { out.push(`"${said}" runs past the side`); break; }
  }
  return [...new Set(out)];
}
