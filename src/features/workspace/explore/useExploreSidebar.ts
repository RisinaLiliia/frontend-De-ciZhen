'use client';

import * as React from 'react';

import { HOME_PROOF_CASES } from '@/data/home';
import type { I18nKey } from '@/lib/i18n/keys';
import type { ProofCase } from '@/types/home';

type Translator = (key: I18nKey) => string;

export function useExploreSidebar(t: Translator) {
  const [exploreListDensity, setExploreListDensity] = React.useState<'single' | 'double'>('single');

  const proofCases = React.useMemo<ProofCase[]>(
    () =>
      HOME_PROOF_CASES.map((item) => ({
        id: item.id,
        title: t(item.titleKey),
        info: t(item.infoKey),
        review: t(item.reviewKey),
        price: t(item.priceKey),
        rating: item.rating,
        publishedAt: item.publishedAt,
      })),
    [t],
  );

  const proofCasesPreview = React.useMemo(() => proofCases.slice(0, 3), [proofCases]);

  const proofIndex = 0;

  const sidebarTopProvidersLimit = React.useMemo(
    () => (exploreListDensity === 'double' ? 2 : 5),
    [exploreListDensity],
  );
  const sidebarNearbyLimit = React.useMemo(
    () => (exploreListDensity === 'double' ? 2 : 5),
    [exploreListDensity],
  );
  const sidebarProofCases = React.useMemo(
    () => (exploreListDensity === 'double' ? proofCasesPreview.slice(0, 2) : proofCasesPreview),
    [exploreListDensity, proofCasesPreview],
  );
  const trustPanelClassName = 'home-trust-live-panel--compact';

  return {
    exploreListDensity,
    setExploreListDensity,
    proofIndex,
    sidebarTopProvidersLimit,
    sidebarNearbyLimit,
    sidebarProofCases,
    trustPanelClassName,
  };
}
