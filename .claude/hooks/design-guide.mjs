#!/usr/bin/env node
// PreToolUse hook (Edit, Write, MultiEdit): brings in the design standards
// the moment a UI file is edited (DES-25), so an edit follows them from the
// start and nothing needs cleaning up afterwards.
//
// It works out the file's area from its path and reads that area's sections
// live from docs/design-system/, so nothing is copied here:
//
//   tokens         colour.md "## Rules" + fitting-in.md "## The ladder"
//   motion         the **Motion** block of foundations.md "## Rules"
//   kit            components.md "## Rules"
//   screens        screens.md "## Rules" (games, lessons, pages, os)
//   illustrations  colour.md "## Rules" + "## Illustrations", on top of the
//                  file's own area
//
// The first time a section comes up in a session, the edit is refused once
// with the sections as the reason, and the retry goes through. (PreToolUse's
// additionalContext only reaches Claude with the tool result, after the edit
// has landed, too late for that first edit.) After that, an edit in the area
// gets one reminder line through additionalContext. What a session has seen
// is kept per section, in a small state file in the temp folder.
//
// It never blocks for anything but a first look at the rules: on bad input or
// any error it stays silent, so a bug here never wedges a session.
//
// Check it with: node .claude/skills/luna-design/guide-check.mjs "$PWD"

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, relative, resolve } from 'node:path';

const DOCS = 'docs/design-system';

const SECTIONS = {
  colourRules: { doc: 'colour.md', heading: 'Rules' },
  ladder: { doc: 'fitting-in.md', heading: 'The ladder' },
  motionRules: { doc: 'foundations.md', heading: 'Rules', block: 'Motion' },
  kitRules: { doc: 'components.md', heading: 'Rules' },
  screenRules: { doc: 'screens.md', heading: 'Rules' },
  illustrations: { doc: 'colour.md', heading: 'Illustrations' }
};

const AREAS = {
  tokens: ['colourRules', 'ladder'],
  motion: ['motionRules'],
  kit: ['kitRules'],
  screens: ['screenRules'],
  illustrations: ['colourRules', 'illustrations']
};

// The areas a repo-relative path belongs to; [] when the hook doesn't apply.
function areasFor(rel) {
  const inScope = /^src\/.*\.(scss|tsx)$/.test(rel) || /^src\/(styles|components\/kit)\//.test(rel);
  if (!inScope) return [];
  let own;
  if (rel.startsWith('src/styles/motion/')) own = 'motion';
  else if (rel.startsWith('src/styles/')) own = 'tokens'; // token files, plus the legacy and global styles
  else if (/^src\/components\/(kit|ui)\//.test(rel)) own = 'kit'; // ui/ is the legacy kit
  else own = 'screens'; // components/os, apps/, App, main, dev/
  const drawn =
    rel === 'src/styles/tokens/_illustration.scss' ||
    /^src\/components\/kit\/(Luna|MilestoneMoon|Squishy)\//.test(rel) ||
    /(^|\/)LunaOwl[./]/.test(rel);
  return drawn ? [own, 'illustrations'] : [own];
}

// The body of "## heading", up to the next # or ## heading. With a block, only
// the part from a "**block**" line to the next bold label line.
function sectionText(root, { doc, heading, block }) {
  let lines;
  try {
    lines = readFileSync(join(root, DOCS, doc), 'utf8').split('\n');
  } catch {
    return null;
  }
  const start = lines.findIndex(l => l.trim() === `## ${heading}`);
  if (start < 0) return null;
  let end = lines.findIndex((l, i) => i > start && /^#{1,2} /.test(l));
  lines = lines.slice(start + 1, end < 0 ? undefined : end);
  if (block) {
    const label = /^\*\*[^*]+\*\*$/;
    const from = lines.findIndex(l => l.trim() === `**${block}**`);
    if (from < 0) return null;
    end = lines.findIndex((l, i) => i > from && label.test(l.trim()));
    lines = lines.slice(from + 1, end < 0 ? undefined : end);
  }
  const text = lines.join('\n').trim();
  return text || null;
}

const keyOf = ({ doc, heading, block }) => `${doc}#${heading}${block ? `/${block}` : ''}`;
const titleOf = ({ doc, heading, block }) => `${DOCS}/${doc}, "## ${heading}"${block ? `, the **${block}** part` : ''}`;

function main() {
  let input;
  try {
    input = JSON.parse(readFileSync(0, 'utf8'));
  } catch {
    return;
  }
  const file = input.tool_input?.file_path;
  if (!file) return;
  const root = process.env.CLAUDE_PROJECT_DIR || input.cwd || process.cwd();
  const rel = relative(root, resolve(root, file)).split('\\').join('/');
  const areas = areasFor(rel);
  if (!areas.length) return;

  const stateFile = join(tmpdir(), 'luna-design-guide', `${String(input.session_id || 'no-session').replace(/[^\w-]/g, '_')}.json`);
  let shown = [];
  try {
    shown = JSON.parse(readFileSync(stateFile, 'utf8')).shown ?? [];
  } catch {
    // a new session
  }

  const ids = [...new Set(areas.flatMap(a => AREAS[a]))];
  const fresh = [];
  const missing = [];
  for (const id of ids) {
    const s = SECTIONS[id];
    if (shown.includes(keyOf(s))) continue;
    const text = sectionText(root, s);
    if (text) fresh.push({ s, text });
    else missing.push(titleOf(s));
  }

  const head = `Design guide (${areas.join(' + ')}) for ${rel}`;
  const docs = [...new Set(ids.map(id => `${DOCS}/${SECTIONS[id].doc}`))].join(' and ');
  const out = fields => process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName: 'PreToolUse', ...fields } }));

  if (fresh.length) {
    try {
      mkdirSync(join(tmpdir(), 'luna-design-guide'), { recursive: true });
      writeFileSync(stateFile, JSON.stringify({ shown: [...shown, ...fresh.map(f => keyOf(f.s))] }));
    } catch {
      return; // without the state file a refusal would repeat on every retry
    }
    const known = ids.filter(id => shown.includes(keyOf(SECTIONS[id]))).map(id => titleOf(SECTIONS[id]));
    out({
      permissionDecision: 'deny',
      permissionDecisionReason: [
        `${head}: this edit was not made yet. It's your first edit in this area this session, so here are its standards first. Make the edit again, following them, and it will go through.`,
        ...(known.length ? [`(Still in force from earlier: ${known.join('; ')}.)`] : []),
        ...(missing.length ? [`(Couldn't find ${missing.join('; ')}: read the doc itself.)`] : []),
        ...fresh.map(f => `\n=== ${titleOf(f.s)} ===\n${f.text}`),
        `\nFor a job bigger than one edit, read ${docs} in full.`
      ].join('\n')
    });
    return;
  }

  out({
    additionalContext: missing.length
      ? `${head}: couldn't find ${missing.join('; ')}. Read ${docs} before editing UI here.`
      : `${head}: the standards from ${docs} (shown earlier this session) apply to this edit.`
  });
}

try {
  main();
} catch {
  // never wedge a session over a bug here
}
