import { readFileSync } from 'node:fs';

const strict = process.argv.includes('--strict');
const checkRgb = process.argv.includes('--check-rgb');

const targets = [
  'src/styles/requests.css',
  'src/styles/overlays.css',
  'src/styles/order-card.css'
];

const hexPattern = /#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\b/g;
const rgbPattern = /\brgba?\([^\n\r)]*\)/g;

const allowlist = new Set(
  (process.env.CSS_HEX_ALLOWLIST ?? '')
    .split(',')
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean)
);

const fileViolations = [];
for (const relativePath of targets) {
  const fileUrl = new URL(`../${relativePath}`, import.meta.url);
  const source = readFileSync(fileUrl, 'utf8');
  const lines = source.split(/\r?\n/);

  const violations = [];

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];

    const hexMatches = [...line.matchAll(hexPattern)]
      .map((match) => match[0].toLowerCase())
      .filter((color) => !allowlist.has(color));

    const rgbMatches = checkRgb ? [...line.matchAll(rgbPattern)].map((match) => match[0]) : [];

    const matches = [...new Set([...hexMatches, ...rgbMatches])];
    if (matches.length === 0) continue;

    const contextStart = Math.max(0, index - 1);
    const contextEnd = Math.min(lines.length - 1, index + 1);
    const context = [];

    for (let lineNo = contextStart; lineNo <= contextEnd; lineNo += 1) {
      const marker = lineNo === index ? '>' : ' ';
      context.push(`${marker} ${lineNo + 1}: ${lines[lineNo]}`);
    }

    violations.push({ line: index + 1, matches, context });
  }

  if (violations.length > 0) {
    fileViolations.push({ relativePath, violations });
  }
}

if (fileViolations.length === 0) {
  console.log(`OK: no hardcoded colors in ${targets.join(', ')}`);
  process.exit(0);
}

const modeLabel = strict ? 'ERROR' : 'WARN';
console.error(`[${modeLabel}] Found hardcoded colors in page styles:`);

for (const file of fileViolations) {
  console.error(`\n${file.relativePath}: ${file.violations.length} line(s)`);
  for (const violation of file.violations) {
    console.error(`${file.relativePath}:${violation.line} -> ${violation.matches.join(', ')}`);
    for (const line of violation.context) {
      console.error(line);
    }
  }
}

const totalLines = fileViolations.reduce((sum, file) => sum + file.violations.length, 0);
console.error(`\nSummary: ${totalLines} violating line(s) across ${fileViolations.length} file(s).`);
if (allowlist.size > 0) {
  console.error(`Allowlist applied: ${[...allowlist].join(', ')}`);
}

if (strict) {
  process.exit(1);
}
