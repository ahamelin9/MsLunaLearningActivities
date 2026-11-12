// The library shows one skill's lessons at a time (CUR-7): a row of skill
// cards, and only the open skill's lesson cards below. A check that wants a
// lesson's card opens its skill first; these do it. Lesson cards are named
// "Lesson N, <title>, <done | up next | locked>…" (the kit's LessonCard).
//
//   import { lessonCard, allLessonCards, lessonCount } from './library.mjs';
//   await (await lessonCard(page, 0)).click();          // Lesson 1, by its place on the path
//   await (await lessonCard(page, 'Sight Words 2')).click(); // or by its title

const SKILL = '[data-shot="skill-card"]';
const wait = ms => new Promise(r => setTimeout(r, ms));

/** The card on screen for a lesson (its place on the path from 0, or its title), or null. */
export const shownLessonCard = async (page, which) =>
  (
    await page.evaluateHandle(
      w =>
        [...document.querySelectorAll('[data-shot="lesson-tile"]')].find(t => {
          const label = t.getAttribute('aria-label') ?? '';
          return typeof w === 'number' ? label.startsWith(`Lesson ${w + 1},`) : label.includes(`, ${w},`);
        }) ?? null,
      which
    )
  ).asElement();

/** A lesson's card, opening its skill first if another skill is open. */
export async function lessonCard(page, which) {
  let card = await shownLessonCard(page, which);
  if (card) return card;
  for (const skill of await page.$$(SKILL)) {
    await skill.click();
    await wait(150);
    card = await shownLessonCard(page, which);
    if (card) return card;
  }
  throw new Error(`the library has no card for lesson ${typeof which === 'number' ? which + 1 : `"${which}"`}`);
}

/** How many lessons the grade has: the skill cards' totals ("…, 2 of 5 lessons done"). */
export const lessonCount = page =>
  page.$$eval(SKILL, els => els.reduce((n, el) => n + Number(/ of (\d+) lessons done/.exec(el.getAttribute('aria-label'))?.[1] ?? 0), 0));

/**
 * Every lesson's card, read in path order: opens each skill in turn, reads
 * its cards with `read` (in the page), then opens the skill that was open.
 */
export async function allLessonCards(page, read = el => ({ label: el.getAttribute('aria-label'), state: el.getAttribute('data-state') ?? '', text: el.textContent })) {
  const skills = await page.$$(SKILL);
  const wasOpen = await page.$$eval(SKILL, els => els.findIndex(el => el.getAttribute('aria-expanded') === 'true'));
  const byNumber = new Map();
  for (const skill of skills) {
    await skill.click();
    await wait(150);
    const cards = await page.$$eval('[data-shot="lesson-tile"]', (els, fn) => {
      const f = new Function(`return (${fn})`)();
      return els.map(el => ({ n: Number(/^Lesson (\d+),/.exec(el.getAttribute('aria-label'))?.[1]), value: f(el) }));
    }, read.toString());
    for (const { n, value } of cards) byNumber.set(n, value);
  }
  if (wasOpen >= 0) {
    await skills[wasOpen].click();
    await wait(150);
  }
  return [...byNumber.keys()].sort((a, b) => a - b).map(n => byNumber.get(n));
}

/** A lesson card's state, read from its data-state: done, locked or next. */
export const stateOf = dataState => (/\bdone\b/.test(dataState) ? 'done' : /\blocked\b/.test(dataState) ? 'locked' : 'next');
