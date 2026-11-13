// The library shows one skill's lessons at a time (CUR-7): a row of skill
// cards, and only the open skill's lesson cards below. A check that wants a
// lesson's card opens its skill first; these do it. Lesson cards are named
// "Lesson N, <title>, <done | up next | locked>…" (the kit's LessonCard),
// where N is the lesson's number in its skill (CUR-11), so a lesson is found
// by its title, which is unique within a grade.
//
//   import { lessonCard, allLessonCards, lessonCount } from './library.mjs';
//   await (await lessonCard(page, 0)).click();               // the first lesson in lessonsFor(grade)
//   await (await lessonCard(page, 'Sight Words 2')).click(); // or by its title

const SKILL = '[data-shot="skill-card"]';
const KEY = 'ms_luna_learning_progress_v1';
const wait = ms => new Promise(r => setTimeout(r, ms));

/** The selected grade's lesson titles, in `lessonsFor` order (the curriculum's). */
export const lessonTitles = page =>
  page.evaluate(async key => {
    const grade = JSON.parse(localStorage.getItem(key) ?? '{}').selectedGrade ?? 'kindergarten';
    const { lessonsFor } = await import('/src/apps/reading/engine/lessons.ts');
    return lessonsFor(grade).map(l => l.title);
  }, KEY);

const titleOf = async (page, which) => (typeof which === 'number' ? (await lessonTitles(page))[which] : which);

/** The card on screen for a lesson (its place in `lessonsFor`, from 0, or its title), or null. */
export const shownLessonCard = async (page, which) => {
  const title = await titleOf(page, which);
  return (
    await page.evaluateHandle(
      t => [...document.querySelectorAll('[data-shot="lesson-tile"]')].find(el => (el.getAttribute('aria-label') ?? '').includes(`, ${t},`)) ?? null,
      title
    )
  ).asElement();
};

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
 * Every lesson's card, read in `lessonsFor` order: opens each skill in turn,
 * reads its cards with `read` (in the page), then opens the skill that was open.
 */
export async function allLessonCards(page, read = el => ({ label: el.getAttribute('aria-label'), state: el.getAttribute('data-state') ?? '', text: el.textContent })) {
  const titles = await lessonTitles(page);
  const skills = await page.$$(SKILL);
  const wasOpen = await page.$$eval(SKILL, els => els.findIndex(el => el.getAttribute('aria-expanded') === 'true'));
  const byTitle = new Map();
  for (const skill of skills) {
    await skill.click();
    await wait(150);
    const cards = await page.$$eval('[data-shot="lesson-tile"]', (els, fn) => {
      const f = new Function(`return (${fn})`)();
      return els.map(el => ({ label: el.getAttribute('aria-label') ?? '', value: f(el) }));
    }, read.toString());
    for (const { label, value } of cards) {
      const title = titles.find(t => label.includes(`, ${t},`));
      if (title) byTitle.set(title, value);
    }
  }
  if (wasOpen >= 0) {
    await skills[wasOpen].click();
    await wait(150);
  }
  return titles.filter(t => byTitle.has(t)).map(t => byTitle.get(t));
}

/** A lesson card's state, read from its data-state: done, locked or next. */
export const stateOf = dataState => (/\bdone\b/.test(dataState) ? 'done' : /\blocked\b/.test(dataState) ? 'locked' : 'next');
