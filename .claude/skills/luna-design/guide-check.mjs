#!/usr/bin/env node
// Checks the design guide hook (.claude/hooks/design-guide.mjs, DES-25): each
// path gets the right area, a session sees each section's standards once and
// then only the reminder line, and the text comes live from the docs. It feeds
// the hook pretend edits with made-up session ids; nothing in the repo is
// written. Run it after changing the hook, the docs' headings or the folders:
//
//   node .claude/skills/luna-design/guide-check.mjs "$PWD"

import { spawnSync } from 'node:child_process';
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const root = process.argv[2] ?? process.cwd();
const hook = join(root, '.claude/hooks/design-guide.mjs');
const docs = join(root, 'docs/design-system');
const sessions = [];
let n = 0;
const newSession = () => {
  const id = `guide-check-${process.pid}-${n++}`;
  sessions.push(id);
  return id;
};

// One pretend edit. Returns { kind: 'silent' | 'refused' | 'reminder', areas, text }.
function run(file, session, { tool = 'Edit', projectDir = root, raw } = {}) {
  const tool_input = tool === 'Write' ? { file_path: join(projectDir, file), content: '' } : { file_path: join(projectDir, file), old_string: 'a', new_string: 'b' };
  const r = spawnSync('node', [hook], {
    input: raw ?? JSON.stringify({ session_id: session, cwd: root, hook_event_name: 'PreToolUse', tool_name: tool, tool_input }),
    encoding: 'utf8',
    env: { ...process.env, CLAUDE_PROJECT_DIR: projectDir }
  });
  if (r.status !== 0) return { kind: `error (exit ${r.status}): ${r.stderr.trim().split('\n').pop()}` };
  if (!r.stdout.trim()) return { kind: 'silent', areas: '', text: '' };
  const out = JSON.parse(r.stdout).hookSpecificOutput;
  const text = out.permissionDecisionReason ?? out.additionalContext ?? '';
  const kind = out.permissionDecision === 'deny' ? 'refused' : 'reminder';
  return { kind, areas: text.match(/^Design guide \(([^)]+)\)/)?.[1] ?? '?', text };
}

// A line from each section, read live, to look for in what the hook shows.
const doc = name => readFileSync(join(docs, name), 'utf8');
const body = (text, heading) => text.split(`\n## ${heading}\n`)[1].split(/\n#{1,2} /)[0];
const firstLine = text => text.trim().split('\n')[0].trim();
const lines = {
  colourRules: firstLine(body(doc('colour.md'), 'Rules')),
  ladder: firstLine(body(doc('fitting-in.md'), 'The ladder')),
  kitRules: firstLine(body(doc('components.md'), 'Rules')),
  screenRules: firstLine(body(doc('screens.md'), 'Rules')),
  illustrations: firstLine(body(doc('colour.md'), 'Illustrations')),
  motionRules: firstLine(body(doc('foundations.md'), 'Rules').split('**Motion**')[1]),
  layoutRules: firstLine(body(doc('foundations.md'), 'Rules').split('**Layout**')[1])
};

const results = [];
const expect = (name, ok, got) => results.push([ok, name, got]);
const has = (r, ...keys) => keys.every(k => r.text.includes(lines[k]));
const lacks = (r, ...keys) => keys.every(k => !r.text.includes(lines[k]));

// ---- 1. every path gets the right area (each in a fresh session) ----
const AREA_CASES = [
  ['src/apps/reading/games/games.scss', 'screens'],
  ['src/apps/reading/games/FeedLuna/FeedLuna.module.scss', 'screens'],
  ['src/apps/reading/lessons/BlendAndRead/BlendAndRead.tsx', 'screens'],
  ['src/apps/reading/components/lesson.scss', 'screens'],
  ['src/apps/reading/pages/ReadingHub.scss', 'screens'],
  ['src/apps/reading/engine/GameShell.tsx', 'screens'],
  ['src/components/os/HomeScreen.scss', 'screens'],
  ['src/App.tsx', 'screens'],
  ['src/dev/KitPage/KitPage.tsx', 'screens'],
  ['src/styles/tokens/_roles.scss', 'tokens'],
  ['src/styles/tokens/_primitives.scss', 'tokens'],
  ['src/styles/_variables.scss', 'tokens'],
  ['src/styles/global.scss', 'tokens'],
  ['src/styles/motion/_keyframes.scss', 'motion'],
  ['src/components/kit/ChunkyButton/ChunkyButton.module.scss', 'kit'],
  ['src/components/kit/ChunkyButton/ChunkyButton.kit.tsx', 'kit'],
  ['src/components/kit/index.ts', 'kit'],
  ['src/components/ui/Button.scss', 'kit'],
  ['src/styles/tokens/_illustration.scss', 'tokens + illustrations'],
  ['src/components/kit/Luna/Luna.module.scss', 'kit + illustrations'],
  ['src/components/kit/Squishy/Squishy.tsx', 'kit + illustrations'],
  ['src/apps/reading/engine/LunaOwl.scss', 'screens + illustrations'],
  ['src/apps/reading/engine/LunaOwl/LunaOwl.tsx', 'screens + illustrations'],
  // not UI: the hook stays out of the way
  ['src/utils/audio.ts', ''],
  ['src/index.css', ''],
  ['docs/design-system/colour.md', ''],
  ['scripts/ui/shots.mjs', '']
];
for (const [file, want] of AREA_CASES) {
  const r = run(file, newSession());
  const ok = want ? r.kind === 'refused' && r.areas === want : r.kind === 'silent';
  expect(`area of ${file} is ${want || 'none (silent)'}`, ok, `${r.kind}${r.areas ? ` (${r.areas})` : ''}`);
}

// ---- 2. a game's .scss: screens.md's rules once, then only the reminder ----
{
  const s = newSession();
  const first = run('src/apps/reading/games/games.scss', s);
  expect("first game edit is refused once with screens.md's rules", first.kind === 'refused' && has(first, 'screenRules') && lacks(first, 'colourRules', 'kitRules'), first.kind);
  const second = run('src/apps/reading/games/FeedLuna.tsx', s);
  expect('the next edit in the area gets only the reminder line', second.kind === 'reminder' && lacks(second, 'screenRules') && !second.text.includes('\n'), `${second.kind}: ${second.text.slice(0, 90)}`);
  const write = run('src/apps/reading/games/FeedLuna.tsx', s, { tool: 'Write' });
  expect('a Write in the same area gets the reminder too', write.kind === 'reminder', write.kind);
  const kit = run('src/components/kit/Chip/Chip.module.scss', s);
  expect("a new area in the same session brings its own rules (components.md's)", kit.kind === 'refused' && has(kit, 'kitRules') && lacks(kit, 'screenRules'), kit.kind);
}

// ---- 3. a token file: the colour rules and the ladder ----
{
  const s = newSession();
  const r = run('src/styles/tokens/_roles.scss', s);
  expect('a token file brings in the colour rules and the ladder', r.kind === 'refused' && has(r, 'colourRules', 'ladder'), r.kind);
  // a section two areas share shows once per session
  const luna = run('src/components/kit/Luna/Luna.tsx', s);
  expect(
    "then Luna's kit file brings components.md and the Illustrations part, not the colour rules again",
    luna.kind === 'refused' && has(luna, 'kitRules', 'illustrations') && lacks(luna, 'colourRules'),
    luna.kind
  );
  const again = run('src/styles/tokens/_illustration.scss', s);
  expect('then the illustration palette gets only the reminder', again.kind === 'reminder', again.kind);
}

// ---- 4. motion brings only the Motion part of foundations.md's rules ----
{
  const r = run('src/styles/motion/_keyframes.scss', newSession());
  expect("motion shows foundations.md's Motion block and not its Layout block", r.kind === 'refused' && has(r, 'motionRules') && lacks(r, 'layoutRules'), r.kind);
}

// ---- 5. the text is read live: change a doc, the hook shows the change ----
{
  const fake = mkdtempSync(join(tmpdir(), 'guide-check-'));
  try {
    cpSync(docs, join(fake, 'docs/design-system'), { recursive: true });
    const screens = join(fake, 'docs/design-system/screens.md');
    writeFileSync(screens, readFileSync(screens, 'utf8').replace('\n## Where screens live', '10. PLANTED-SCREEN-RULE\n\n## Where screens live'));
    const foundations = join(fake, 'docs/design-system/foundations.md');
    writeFileSync(foundations, readFileSync(foundations, 'utf8').replace('\n**Layout**', '- PLANTED-MOTION-RULE\n\n**Layout**'));
    const r = run('src/apps/reading/games/games.scss', newSession(), { projectDir: fake });
    expect("a line added to screens.md's ## Rules shows up", r.text.includes('PLANTED-SCREEN-RULE'), r.kind);
    const m = run('src/styles/motion/_keyframes.scss', newSession(), { projectDir: fake });
    expect("a line added to foundations.md's Motion block shows up", m.text.includes('PLANTED-MOTION-RULE'), m.kind);
    // a doc whose section is gone: no refusal, a pointer to the doc instead
    writeFileSync(screens, readFileSync(screens, 'utf8').replace('\n## Rules\n', '\n## Rulez\n'));
    const gone = run('src/apps/reading/games/games.scss', newSession(), { projectDir: fake });
    expect("a missing section doesn't refuse; it points at the doc", gone.kind === 'reminder' && gone.text.includes("couldn't find"), gone.kind);
  } finally {
    rmSync(fake, { recursive: true, force: true });
  }
}

// ---- 6. bad input stays silent ----
{
  const r = run('src/App.tsx', newSession(), { raw: '{not json' });
  expect('bad input is ignored silently', r.kind === 'silent', r.kind);
}

for (const id of sessions) rmSync(join(tmpdir(), 'luna-design-guide', `${id}.json`), { force: true });

let failed = 0;
for (const [ok, name, got] of results) {
  if (!ok) failed++;
  console.log(`${ok ? '✓' : '✗'} ${name}${ok ? '' : `: got ${got}`}`);
}
console.log(failed ? `\n${failed} case(s) wrong` : `\nall ${results.length} cases as expected`);
process.exit(failed ? 1 : 0);
