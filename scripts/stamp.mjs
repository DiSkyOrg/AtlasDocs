#!/usr/bin/env node
// Usage: node scripts/stamp.mjs [--check] [--ids] [<locale> [files...]]
import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const EN = 'en';
const EXPLICIT_ID = /\{#([^}\s]+)\}\s*$/;

function hash(text) {
  const normalized = text.replace(/^﻿+/, '').replace(/\r\n/g, '\n');
  return createHash('sha256').update(normalized, 'utf8').digest('hex').slice(0, 12);
}

function walkMarkdown(dir) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walkMarkdown(path));
    else if (entry.isFile() && entry.name.endsWith('.md')) out.push(path);
  }
  return out.sort();
}

function relKey(base, file) {
  return relative(base, file).split(sep).join('/');
}

function readText(file) {
  return readFileSync(file, 'utf8');
}

function frontmatterRange(lines) {
  if (lines[0]?.trimEnd() !== '---') return null;
  for (let i = 1; i < lines.length; i++)
    if (lines[i].trimEnd() === '---') return [1, i];
  return null;
}

function frontmatterValue(text, key) {
  const lines = text.replace(/^﻿/, '').split(/\r?\n/);
  const range = frontmatterRange(lines);
  if (!range) return undefined;
  const line = lines.slice(range[0], range[1]).find(l => l.startsWith(`${key}:`));
  return line?.slice(key.length + 1).trim();
}

function eolOf(text) {
  return text.includes('\r\n') ? '\r\n' : '\n';
}

function stampText(text, sourceHash) {
  const bom = text.startsWith('﻿') ? '﻿' : '';
  const body = text.slice(bom.length);
  const lines = body.split(/\r?\n/);
  const entry = `source-hash: ${sourceHash}`;
  const range = frontmatterRange(lines);
  if (!range) {
    lines.unshift('---', entry, '---');
  } else {
    const [start, end] = range;
    const index = lines.slice(start, end).findIndex(l => l.startsWith('source-hash:'));
    if (index >= 0) lines[start + index] = entry;
    else lines.splice(end, 0, entry);
  }
  return bom + lines.join(eolOf(body));
}

function scanHeadings(lines) {
  const headings = [];
  let fence = null;
  lines.forEach((line, index) => {
    const marker = /^\s{0,3}(`{3,}|~{3,})/.exec(line)?.[1];
    if (fence) {
      if (marker && marker[0] === fence[0] && marker.length >= fence.length) fence = null;
      return;
    }
    if (marker) {
      fence = marker;
      return;
    }
    const match = /^(#{2,3}) (.+?)\s*$/.exec(line);
    if (match) headings.push({ index, text: match[2] });
  });
  return headings;
}

// Approximates GitHub's heading slugs; the server lint is the authority if they ever differ.
function slugify(text) {
  const plain = text
    .replace(EXPLICIT_ID, '')
    .replace(/`([^`]*)`/g, '$1')
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/(^|[^\p{L}\p{N}])(\*{1,3}|_{1,3})(?=\S)(.+?)(?<=\S)\2(?=[^\p{L}\p{N}]|$)/gu, '$1$3')
    .trim()
    .toLowerCase();
  return plain.replace(/[^\p{L}\p{N} _-]/gu, '').replace(/ /g, '-');
}

function englishIds(headings) {
  const counts = new Map();
  return headings.map(({ text }) => {
    const explicit = EXPLICIT_ID.exec(text);
    if (explicit) return explicit[1];
    const base = slugify(text);
    const n = counts.get(base) ?? 0;
    counts.set(base, n + 1);
    return n === 0 ? base : `${base}-${n}`;
  });
}

function applyIds(text, enText) {
  const bom = text.startsWith('﻿') ? '﻿' : '';
  const body = text.slice(bom.length);
  const lines = body.split(/\r?\n/);
  const translated = scanHeadings(lines);
  const english = scanHeadings(enText.replace(/^﻿+/, '').split(/\r?\n/));
  if (translated.length !== english.length)
    return { text, warning: `h2/h3 count differs (${translated.length} vs ${english.length} in English); ids skipped` };

  const ids = englishIds(english);
  translated.forEach((heading, i) => {
    if (!EXPLICIT_ID.test(heading.text)) lines[heading.index] += ` {#${ids[i]}}`;
  });
  return { text: bom + lines.join(eolOf(body)) };
}

function parseArgs(argv) {
  const flags = new Set();
  const positional = [];
  for (const arg of argv) {
    if (arg === '--check' || arg === '--ids') flags.add(arg);
    else if (arg.startsWith('--')) throw new Error(`unknown option ${arg}`);
    else positional.push(arg);
  }
  return { flags, positional };
}

function readConfig() {
  const file = join(ROOT, 'docs.json');
  if (!existsSync(file)) return new Set();
  const json = JSON.parse(readText(file).replace(/^﻿/, ''));
  return new Set((json.untranslatable ?? []).map(s => String(s).toLowerCase()));
}

function listLocales() {
  return readdirSync(ROOT, { withFileTypes: true })
    .filter(e => e.isDirectory() && e.name !== EN && !e.name.startsWith('.') && existsSync(join(ROOT, e.name, 'locale.json')))
    .map(e => e.name)
    .sort();
}

function loadEnglish(untranslatable) {
  const base = join(ROOT, EN);
  const pages = new Map();
  if (!existsSync(base)) return pages;
  for (const file of walkMarkdown(base)) {
    const key = relKey(base, file);
    const text = readText(file);
    const lines = text.replace(/^﻿/, '').split(/\r?\n/);
    const range = frontmatterRange(lines);
    const hidden = range !== null && lines.slice(range[0], range[1]).some(l => /^hidden:\s*true\s*$/i.test(l));
    const section = key.split('/')[0].toLowerCase();
    pages.set(key, {
      file,
      text,
      hash: hash(text),
      translatable: !untranslatable.has(section) && !hidden
    });
  }
  return pages;
}

function percent(translated, total) {
  return total === 0 ? 100 : Math.floor((translated / total) * 100);
}

function check(code, english, localeDir) {
  const translations = new Map(walkMarkdown(localeDir).map(f => [relKey(localeDir, f), f]));
  const stats = { translated: 0, outdated: [], missing: [], total: 0 };
  for (const [key, page] of english) {
    if (!page.translatable) continue;
    stats.total++;
    const file = translations.get(key);
    if (!file) {
      stats.missing.push(key);
      continue;
    }
    if (frontmatterValue(readText(file), 'source-hash') === page.hash) stats.translated++;
    else stats.outdated.push(key);
  }
  const orphans = [...translations.keys()].filter(k => !english.has(k));

  console.log(`${code}: ${stats.translated}/${stats.total} translated (${percent(stats.translated, stats.total)}%), ` +
    `${stats.outdated.length} outdated, ${stats.missing.length} missing`);
  for (const key of stats.outdated) console.log(`  outdated: ${key}`);
  for (const key of stats.missing) console.log(`  missing:  ${key}`);
  for (const key of orphans) console.log(`  orphan (no English page): ${key}`);
}

function stamp(code, english, localeDir, files, flags) {
  const translations = walkMarkdown(localeDir);
  const wanted = new Set(files.map(f => [resolve(f), resolve(ROOT, f), resolve(localeDir, f)].find(existsSync) ?? resolve(f)));
  const matched = new Set();
  let stamped = 0;
  let unchanged = 0;

  for (const file of translations) {
    if (wanted.size > 0 && !wanted.has(file)) continue;
    matched.add(file);
    const key = relKey(localeDir, file);
    const page = english.get(key);
    if (!page) {
      console.log(`  orphan (no English page, left untouched): ${code}/${key}`);
      continue;
    }

    let text = stampText(readText(file), page.hash);
    if (flags.has('--ids')) {
      const result = applyIds(text, page.text);
      text = result.text;
      if (result.warning) console.log(`  warning: ${code}/${key}: ${result.warning}`);
    }

    if (text === readText(file)) {
      unchanged++;
      continue;
    }
    writeFileSync(file, text, 'utf8');
    stamped++;
    console.log(`  stamped: ${code}/${key}`);
  }

  for (const file of wanted) {
    if (!matched.has(file)) console.log(`  skipped (not a page of ${code}): ${relative(ROOT, file)}`);
  }
  console.log(`${code}: ${stamped} stamped, ${unchanged} unchanged`);
}

async function main() {
  const { flags, positional } = parseArgs(process.argv.slice(2));
  const [localeArg, ...files] = positional;
  const available = listLocales();
  const targets = localeArg ? [localeArg] : available;
  for (const code of targets) {
    if (!available.includes(code)) throw new Error(`unknown locale "${code}" (locale folders hold a locale.json)`);
  }

  const untranslatable = readConfig();
  const english = loadEnglish(untranslatable);
  if (english.size === 0) throw new Error(`no English pages under ${EN}/`);

  for (const code of targets) {
    const localeDir = join(ROOT, code);
    if (flags.has('--check')) check(code, english, localeDir);
    else stamp(code, english, localeDir, files, flags);
  }
}

main().catch(error => {
  console.error(`stamp: ${error.message}`);
  process.exitCode = 1;
});
