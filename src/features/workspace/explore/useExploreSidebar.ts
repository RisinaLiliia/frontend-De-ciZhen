'use client';

import * as React from 'react';

import { HOME_PROOF_CASES } from '@/data/home';
import { useRotatingIndex } from '@/hooks/useRotatingIndex';
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

  const proofCasesPreview = React.useMemo(() => proofCases.slice(0, 4), [proofCases]);

  const proofIndex = useRotatingIndex(proofCasesPreview.length, {
    intervalMs: 5200,
    holdMs: 600,
  });

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
  const trustPanelClassName = exploreListDensity === 'double'
    ? 'home-trust-live-panel--compact'
    : undefined;

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
