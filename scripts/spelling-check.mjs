#!/usr/bin/env node
// American spelling in everything a screen shows or Luna says (BUG-31; the
// teacher, 2026-11-12: "Memorise!" slipped in). Run by `npm run lint`.
//
//   node scripts/spelling-check.mjs            -> checks src/
//   node scripts/spelling-check.mjs <files…>   -> checks just those
//
// It reads the words people see: string literals and template literals with
// a space or a closing mark in them ("Rare colour: blush!"), and JSX text
// (<span>Memorise!</span>). Comments, and one-word strings that name things
// in code ('grey' as a dot, `colour` as a prop), are left alone.

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

/** British spelling → American. Whole words, any case, with their endings. */
const BRITISH = [
  [/\bcolour(s|ed|ful|ing)?\b/i, 'color'],
  [/\bfavourite(s)?\b/i, 'favorite'],
  [/\bmemoris(e|ed|es|ing)\b/i, 'memorize'],
  [/\borganis(e|ed|es|ing)\b/i, 'organize'],
  [/\brecognis(e|ed|es|ing)\b/i, 'recognize'],
  [/\brealis(e|ed|es|ing)\b/i, 'realize'],
  [/\bapologis(e|ed|es|ing)\b/i, 'apologize'],
  [/\bpractis(e|ed|es|ing)\b/i, 'practice'],
  [/\bcentre(s|d)?\b/i, 'center'],
  [/\btheatre(s)?\b/i, 'theater'],
  [/\bgrey(s|er|ish)?\b/i, 'gray'],
  [/\b(neighbour|behaviour|honour|humour|flavour|labour|harbour|rumour|odour|savour)(s|ed|ing|ite)?\b/i, '-or'],
  [/\b(travell|cancell|label?l|model?l|signall)(ed|ing|er)\b/i, 'one l'],
  [/\bjewellery\b/i, 'jewelry'],
  [/\bpyjamas?\b/i, 'pajamas'],
  [/\bprogramme(s)?\b/i, 'program'],
  [/\b(whilst|amongst)\b/i, 'while / among'],
  [/\bmaths\b/i, 'math'],
  [/\bmum(s|my)?\b/i, 'mom'],
  [/\btyre(s)?\b/i, 'tire'],
  [/\bcosy\b/i, 'cozy'],
  [/\bdoughnut(s)?\b/i, 'donut'],
  [/\baeroplane(s)?\b/i, 'airplane'],
  [/\bautumn\b/i, 'fall (fine either way, but kids here say fall)']
];

const files = process.argv.length > 2 ? process.argv.slice(2) : walk('src');

function walk(dir) {
  return readdirSync(dir).flatMap(name => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return walk(path);
    // the Kit page and specimens are dev tools, never on a child's or teacher's screen
    return /\.(ts|tsx)$/.test(name) && !/\.kit\.tsx$/.test(name) && !path.startsWith(join('src', 'dev')) ? [path] : [];
  });
}

/** Blanks out comments, keeping line numbers and string contents intact. */
function withoutComments(text) {
  let out = '';
  let i = 0;
  let quote = null;
  while (i < text.length) {
    const c = text[i];
    const next = text[i + 1];
    if (quote) {
      out += c;
      if (c === '\\') { out += next ?? ''; i += 2; continue; }
      if (c === quote) quote = null;
      i += 1;
    } else if (c === '/' && next === '/') {
      while (i < text.length && text[i] !== '\n') { out += ' '; i += 1; }
    } else if (c === '/' && next === '*') {
      while (i < text.length && !(text[i] === '*' && text[i + 1] === '/')) { out += text[i] === '\n' ? '\n' : ' '; i += 1; }
      out += '  ';
      i += 2;
    } else {
      if (c === '"' || c === "'" || c === '`') quote = c;
      out += c;
      i += 1;
    }
  }
  return out;
}

// strings and JSX text: what a screen can show or a line can say
const SHOWN = [
  /'(?:[^'\\\n]|\\.)*'/g,
  /"(?:[^"\\\n]|\\.)*"/g,
  /`(?:[^`\\]|\\.)*`/g,
  // JSX text: no code marks in it, so `a > b && c < d` isn't read as words
  />([^<>{}();=&|]*[A-Za-z][^<>{}();=&|]*)</g
];
const looksShown = s => /\s|[!?.:]['"`]?$/.test(s.trim());

let problems = 0;
for (const file of files) {
  const text = withoutComments(readFileSync(file, 'utf8'));
  for (const pattern of SHOWN) {
    for (const match of text.matchAll(pattern)) {
      if (pattern.source.startsWith('>') && !file.endsWith('.tsx')) continue;
      // a template's ${…} is code (`${worn?.look ?? colour}`), not words
      const piece = match[0].replace(/\$\{[^}]*\}/g, '…');
      if (!looksShown(piece.slice(1, -1)) && !pattern.source.startsWith('>')) continue;
      for (const [word, american] of BRITISH) {
        const found = piece.match(word);
        if (!found) continue;
        const line = text.slice(0, match.index).split('\n').length;
        console.log(`${relative(process.cwd(), file)}:${line}  "${found[0]}" → ${american}   in ${piece.trim().slice(0, 70)}`);
        problems += 1;
      }
    }
  }
}

if (problems) {
  console.log(`\n${problems} British spelling${problems === 1 ? '' : 's'} in what screens show or Luna says. The app speaks American English (BUG-31).`);
  process.exit(1);
}
console.log('✅ American spelling throughout.');
