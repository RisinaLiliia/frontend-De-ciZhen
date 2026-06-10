import { describe, expect, it } from 'vitest';

import { buildProvidersRailDecisionLinks } from './WorkspaceProvidersRail';

describe('WorkspaceProvidersRail', () => {
  it('preserves current filters and sorting when building decision links', () => {
    const links = buildProvidersRailDecisionLinks(
      new URLSearchParams(
        'section=providers&cityId=karlsruhe&categoryKey=cleaning&sort=price_desc&period=90d',
      ),
    );

    expect(links.overviewHref).toBe(
      '/workspace?section=overview&cityId=karlsruhe&categoryKey=cleaning&sort=price_desc&period=90d',
    );
    expect(links.analysisHref).toBe(
      '/workspace?section=stats&cityId=karlsruhe&categoryKey=cleaning&sort=price_desc&period=90d',
    );
    expect(links.providersHref).toBe(
      '/workspace?section=providers&cityId=karlsruhe&categoryKey=cleaning&sort=price_desc&period=90d',
    );
  });
});
