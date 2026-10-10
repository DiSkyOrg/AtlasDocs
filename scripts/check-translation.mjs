// Structural check of translated pages against their English source (no dependencies).
// Usage: node scripts/check-translation.mjs <code> [files...]
// Reports what a translation must never change: code blocks, directive lines, link and image
// targets, inline code, admonition/container/tab markers, the h2/h3 outline and the frontmatter keys.
// The server lint (CI) stays the authority for references and heading ids.
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const ALLOWED_KEYS = new Set(['title', 'description', 'source-hash']);

function walk(dir) {
  return readdirSync(dir).flatMap(name => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : path.endsWith('.md') ? [path] : [];
  });
}

function parse(text) {
  const lines = text.replace(/^﻿/, '').replace(/\r\n/g, '\n').split('\n');
  const keys = [];
  let start = 0;
  if (lines[0] === '---') {
    const end = lines.indexOf('---', 1);
    if (end > 0) {
      for (const line of lines.slice(1, end)) {
        const m = /^([A-Za-z-]+):/.exec(line);
        if (m) keys.push(m[1]);
      }
      start = end + 1;
    }
  }

  const page = { keys, fences: [], directives: [], markers: [], headings: [], targets: [], code: [] };
  // Inline code and links are read per paragraph: a code span may wrap onto the next line.
  let paragraph = [];
  const flush = () => {
    const prose = paragraph.join(' ').replace(/`[^`]*`/g, m => { page.code.push(m.replace(/\s+/g, ' ')); return ''; });
    for (const m of prose.matchAll(/\]\(([^)\s]+)/g)) page.targets.push(m[1]);
    paragraph = [];
  };
  let fence = null;
  for (const raw of lines.slice(start)) {
    const line = raw.trimStart();
    if (fence) {
      if (line.startsWith(fence.marker)) { page.fences.push(fence.body.join('\n')); fence = null; }
      else fence.body.push(raw);
      continue;
    }
    const open = /^(```+|~~~+)(.*)$/.exec(line);
    if (open) { flush(); fence = { marker: open[1], body: [open[2].trim()] }; continue; }
    if (line.length === 0) { flush(); continue; }

    if (/^(syntax|entity|event|doc|toggle):\s/.test(line))
      page.directives.push(line.replace(/"[^"]*"/g, '"…"').trim());
    const marker = /^(!!!|\?\?\?\+?|:::|===)\s*(\S*)/.exec(line);
    if (marker) page.markers.push(marker[1] === '===' ? '===' : `${marker[1]} ${marker[2]}`);
    const heading = /^(#{2,3})\s+(.*)$/.exec(line);
    if (heading) page.headings.push({ level: heading[1].length, text: heading[2] });

    if (heading || marker || /^\|/.test(line)) { flush(); paragraph.push(line); flush(); }
    else paragraph.push(line);
  }
  flush();
  return page;
}

const sorted = list => [...list].sort();
const sameMultiset = (a, b) => JSON.stringify(sorted(a)) === JSON.stringify(sorted(b));
const diff = (a, b) => {
  const rest = [...b];
  const missing = [];
  for (const item of a) {
    const i = rest.indexOf(item);
    if (i >= 0) rest.splice(i, 1); else missing.push(item);
  }
  return { missing, extra: rest };
};

function checkFile(code, file) {
  const rel = relative(join(ROOT, code), file).replace(/\\/g, '/');
  const source = join(ROOT, 'en', rel);
  if (!existsSync(source)) return [`no English page en/${rel}`];

  const en = parse(readFileSync(source, 'utf8'));
  const tr = parse(readFileSync(file, 'utf8'));
  const errors = [];

  for (const key of tr.keys)
    if (!ALLOWED_KEYS.has(key)) errors.push(`frontmatter key "${key}" must not be in a translation`);
  if (!tr.keys.includes('title')) errors.push('frontmatter has no title');
  if (!tr.keys.includes('source-hash')) errors.push('frontmatter has no source-hash (run stamp.mjs)');

  if (en.fences.length !== tr.fences.length)
    errors.push(`code blocks: ${en.fences.length} in English, ${tr.fences.length} here`);
  else en.fences.forEach((body, i) => {
    if (body !== tr.fences[i]) errors.push(`code block #${i + 1} differs from the English one (code is never translated)`);
  });

  if (JSON.stringify(en.directives) !== JSON.stringify(tr.directives))
    errors.push(`directive lines differ:\n      en: ${JSON.stringify(en.directives)}\n      ${code}: ${JSON.stringify(tr.directives)}`);
  if (JSON.stringify(en.markers) !== JSON.stringify(tr.markers))
    errors.push(`admonition/container/tab markers differ:\n      en: ${JSON.stringify(en.markers)}\n      ${code}: ${JSON.stringify(tr.markers)}`);

  const enOutline = en.headings.map(h => h.level).join(',');
  const trOutline = tr.headings.map(h => h.level).join(',');
  if (enOutline !== trOutline) errors.push(`h2/h3 outline differs (en: ${enOutline || 'none'}; ${code}: ${trOutline || 'none'})`);
  for (const h of tr.headings)
    if (!/\{#[^}\s]+\}\s*$/.test(h.text)) errors.push(`heading "${h.text}" has no {#english-id}`);

  if (!sameMultiset(en.targets, tr.targets)) {
    const { missing, extra } = diff(en.targets, tr.targets);
    errors.push(`link/image targets differ (missing: ${JSON.stringify(missing)}; extra: ${JSON.stringify(extra)})`);
  }
  if (!sameMultiset(en.code, tr.code)) {
    // Repeating a span the English page already uses is fine (a sentence restructured around it);
    // dropping one, or inventing one (translated code), is not.
    const { missing, extra } = diff(en.code, tr.code);
    const invented = extra.filter(span => !en.code.includes(span));
    if (missing.length || invented.length)
      errors.push(`inline code differs (missing: ${JSON.stringify(missing)}; not in the English page: ${JSON.stringify(invented)})`);
  }
  return errors;
}

const [code, ...files] = process.argv.slice(2);
if (!code || !existsSync(join(ROOT, code, 'locale.json'))) {
  console.error('usage: node scripts/check-translation.mjs <code> [files...]  (the <code>/ folder needs a locale.json)');
  process.exit(1);
}
const targets = files.length
  ? files.map(f => resolve(existsSync(resolve(f)) ? f : join(ROOT, f)))
  : walk(join(ROOT, code));

let failed = 0;
for (const file of targets) {
  const errors = checkFile(code, file);
  const name = relative(ROOT, file).replace(/\\/g, '/');
  if (errors.length === 0) { console.log(`ok    ${name}`); continue; }
  failed++;
  console.log(`FAIL  ${name}`);
  for (const error of errors) console.log(`    - ${error}`);
}
console.log(`\n${targets.length - failed}/${targets.length} page(s) pass`);
process.exitCode = failed ? 1 : 0;
