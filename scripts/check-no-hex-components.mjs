import { readFileSync } from 'node:fs';

const strict = process.argv.includes('--strict');
const checkRgb = process.argv.includes('--check-rgb');
const filePath = new URL('../src/styles/components.css', import.meta.url);
const relativePath = 'src/styles/components.css';
const source = readFileSync(filePath, 'utf8');
const lines = source.split(/\r?\n/);

// Comma-separated allowlist, e.g. CSS_HEX_ALLOWLIST="#fff,#ffffff"
const hexAllowlist = new Set(
  (process.env.CSS_HEX_ALLOWLIST ?? '')
    .split(',')
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean)
);

const hexPattern = /#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\b/g;
const rgbPattern = /\brgba?\([^\n\r)]*\)/g;

const violations = [];

for (let index = 0; index < lines.length; index += 1) {
  const line = lines[index];

  const hexMatches = [...line.matchAll(hexPattern)]
    .map((match) => match[0].toLowerCase())
    .filter((color) => !hexAllowlist.has(color));

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

  violations.push({
    line: index + 1,
    matches,
    context
  });
}

if (violations.length === 0) {
  console.log(`OK: no hardcoded colors in ${relativePath}`);
  process.exit(0);
}

const modeLabel = strict ? 'ERROR' : 'WARN';
console.error(`[${modeLabel}] Found hardcoded colors in ${relativePath}:`);

for (const violation of violations) {
  console.error(`\n${relativePath}:${violation.line} -> ${violation.matches.join(', ')}`);
  for (const line of violation.context) {
    console.error(line);
  }
}

console.error(`\nSummary: ${violations.length} line(s) with hardcoded colors.`);
if (hexAllowlist.size > 0) {
  console.error(`Allowlist applied: ${[...hexAllowlist].join(', ')}`);
}

if (strict) {
  process.exit(1);
}
