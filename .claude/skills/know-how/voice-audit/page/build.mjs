// Assembles the listening page from the template, the packed notes and the findings.
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const here = dirname(fileURLToPath(import.meta.url));
const S = join(here, '..');
const meta = JSON.parse(readFileSync(join(S, 'pack-meta.json'), 'utf8'));
const findings = JSON.parse(readFileSync(join(here, 'findings.json'), 'utf8'));
const plan = readFileSync(join(here, 'plan.frag'), 'utf8');
const js = v => JSON.stringify(v).replace(/</g, '\\u003c');
const html = readFileSync(join(here, 'page.tmpl'), 'utf8')
  .replace('/*META*/null', js(meta))
  .replace('/*FINDINGS*/null', js(findings))
  .replace("/*PLAN*/''", js(plan));
writeFileSync(join(here, 'sound-check.html'), html);
console.log('wrote', (html.length / 1024).toFixed(0), 'KB');
