import { readFileSync } from 'node:fs';

const filePath = new URL('../src/styles/home.css', import.meta.url);
const relativePath = 'src/styles/home.css';
const source = readFileSync(filePath, 'utf8');
const lines = source.split(/\r?\n/);
const hexPattern = /#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\b/g;

const violations = [];
for (let index = 0; index < lines.length; index += 1) {
  const line = lines[index];
  const matches = [...line.matchAll(hexPattern)].map((match) => match[0].toLowerCase());
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
    matches: [...new Set(matches)],
    context
  });
}

if (violations.length > 0) {
  console.error(`[ERROR] Found hardcoded hex colors in ${relativePath}:`);
  for (const violation of violations) {
    console.error(`\n${relativePath}:${violation.line} -> ${violation.matches.join(', ')}`);
    for (const line of violation.context) {
      console.error(line);
    }
  }
  console.error(`\nSummary: ${violations.length} line(s) with hardcoded hex colors.`);
  process.exit(1);
}

console.log(`OK: no hardcoded hex colors in ${relativePath}`);
