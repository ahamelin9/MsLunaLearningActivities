#!/usr/bin/env node
// After moving styles into CSS modules (DES-18b–e): every `styles.x` in a
// .tsx must be a class its imported .module.scss defines, and no className
// may still be a plain string or template literal (a global class).
//
//   node .claude/skills/know-how/module-refs-check.mjs "$PWD" src/components src/App.tsx
//
// Lists MISSING references (a typo, or a class only another file defines),
// GLOBAL classNames, and plain .scss files left in the folders, then exits 1.
// Classes a module defines but nothing uses are listed as a note only (often
// old dead CSS, kept so a refactor stays identical).

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';

const [root, ...targets] = process.argv.slice(2);
if (!root || !targets.length) {
  console.error('Usage: node module-refs-check.mjs <repo> <folder or file>...');
  process.exit(2);
}
const walk = p => (statSync(p).isDirectory() ? readdirSync(p).flatMap(f => walk(join(p, f))) : [p]);
const camel = s => s.replace(/-+(\w)/g, (_, c) => c.toUpperCase());
const files = targets.flatMap(t => walk(join(root, t)));
const rel = f => relative(root, f);

let problems = 0;
const problem = line => {
  console.log(line);
  problems++;
};

for (const f of files.filter(f => f.endsWith('.scss') && !f.endsWith('.module.scss'))) {
  problem(`PLAIN    ${rel(f)} (not a module)`);
}

for (const f of files.filter(f => f.endsWith('.tsx'))) {
  const src = readFileSync(f, 'utf8');
  for (const m of src.matchAll(/className=("[^"]*"|\{'[^']*'\}|\{`[^`]*`\})/g)) {
    problem(`GLOBAL   ${rel(f)}: className=${m[1]}`);
  }
  for (const imp of src.matchAll(/import (\w+) from '([^']+\.module\.scss)'/g)) {
    const css = readFileSync(resolve(dirname(f), imp[2]), 'utf8')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\/\/.*$/gm, '');
    const defined = new Set([...css.matchAll(/\.([a-zA-Z][\w-]*)/g)].map(m => camel(m[1])));
    const used = new Set([...src.matchAll(new RegExp(`\\b${imp[1]}\\.(\\w+)`, 'g'))].map(m => m[1]));
    for (const u of used) if (!defined.has(u)) problem(`MISSING  ${rel(f)}: ${imp[1]}.${u}`);
    const unused = [...defined].filter(d => !used.has(d));
    if (unused.length) console.log(`(unused) ${rel(f)}: ${unused.join(', ')}`);
  }
}

console.log(problems ? `\n❌ ${problems} problem(s)` : '\n✅ every styles.x resolves, and no global class is left');
process.exit(problems ? 1 : 0);
