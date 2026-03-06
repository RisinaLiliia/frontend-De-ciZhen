import { expect, type Page } from '@playwright/test';
import axeCore from 'axe-core';

type AxeAuditOptions = {
  includeImpacts?: ReadonlyArray<AxeImpact>;
  excludeSelectors?: ReadonlyArray<string>;
};

type AxeImpact = 'critical' | 'serious' | 'moderate' | 'minor';

type AxeViolation = {
  id: string;
  impact: AxeImpact | null;
  description: string;
  help: string;
  nodes: Array<{ target: string[]; failureSummary?: string }>;
};

const AXE_SCRIPT = axeCore.source;

function formatViolation(violation: AxeViolation) {
  const nodeSummary = violation.nodes
    .slice(0, 3)
    .map((node) => `${node.target.join(' ')} :: ${node.failureSummary ?? 'no summary'}`)
    .join('\n');

  return [
    `[${violation.impact ?? 'unknown'}] ${violation.id}: ${violation.help}`,
    violation.description,
    nodeSummary,
  ].join('\n');
}

export async function expectNoAxeViolations(
  page: Page,
  options?: AxeAuditOptions,
) {
  const includeImpacts = options?.includeImpacts ?? ['critical', 'serious'];
  const excludeSelectors = options?.excludeSelectors ?? [];

  await page.addScriptTag({ content: AXE_SCRIPT });

  const violations = await page.evaluate(async ({ excludeSelectorsArg }) => {
    const axeRef = (window as typeof window & { axe?: { run: (...args: unknown[]) => Promise<{ violations: AxeViolation[] }> } }).axe;
    if (!axeRef) return [];

    const context =
      excludeSelectorsArg.length > 0
        ? { exclude: excludeSelectorsArg.map((selector) => [selector]) }
        : undefined;

    const result = await axeRef.run(context ?? document);
    return result.violations as AxeViolation[];
  }, { excludeSelectorsArg: excludeSelectors });

  const blocking = violations.filter((violation) =>
    includeImpacts.includes((violation.impact ?? 'minor') as AxeImpact),
  );

  expect(
    blocking,
    blocking.map((violation) => formatViolation(violation)).join('\n\n'),
  ).toEqual([]);
}
