// Usage: node scripts/lint-report.mjs <result.json>   (response of POST /api/v1/docs/lint)
import { appendFileSync, existsSync, readFileSync } from 'node:fs';

// Expected warnings (e.g. the deliberately broken reference in contributing/linking.md):
// [{ "locale": "en", "slug": "...", "message": "substring of the message" }]
const ALLOW_FILE = new URL('lint-allow.json', import.meta.url);
const allowed = existsSync(ALLOW_FILE) ? JSON.parse(readFileSync(ALLOW_FILE, 'utf8')) : [];
const isAllowed = w => allowed.some(a =>
  (a.locale ?? 'en') === w.locale && a.slug === w.slug && w.message.includes(a.message));

const escapeData = value => String(value).replace(/%/g, '%25').replace(/\r/g, '%0D').replace(/\n/g, '%0A');
const escapeProperty = value => escapeData(value).replace(/:/g, '%3A').replace(/,/g, '%2C');

function annotate(warning) {
  const file = warning.file ? ` file=${escapeProperty(warning.file)}` : '';
  console.log(`::warning${file}::${escapeData(`[${warning.locale}] ${warning.message}`)}`);
}

function summaryMarkdown(result) {
  const rows = result.locales.map(l =>
    `| ${l.name} | \`${l.code}\` | ${l.aiTranslated ? 'yes' : 'no'} | ${l.translated} | ${l.outdated} | ${l.total} | ${l.percent}% |`);
  const lines = [
    '## Docs lint',
    '',
    '| Language | Code | AI | Translated | Outdated | Total | % |',
    '| --- | --- | --- | ---: | ---: | ---: | ---: |',
    ...rows,
    '',
    result.warnings.length === 0 ? 'No warnings.' : `${result.warnings.length} warning(s).`,
    ''
  ];
  return lines.join('\n');
}

function main() {
  const [file] = process.argv.slice(2);
  if (!file) throw new Error('usage: lint-report.mjs <result.json>');
  const result = JSON.parse(readFileSync(file, 'utf8'));
  result.warnings = result.warnings.filter(w => !isAllowed(w));

  for (const warning of result.warnings) annotate(warning);

  if (process.env.GITHUB_STEP_SUMMARY)
    appendFileSync(process.env.GITHUB_STEP_SUMMARY, summaryMarkdown(result));

  process.exitCode = result.warnings.length > 0 ? 1 : 0;
}

try {
  main();
} catch (error) {
  console.error(`lint-report: ${error.message}`);
  process.exitCode = 1;
}
