'use client';

import * as React from 'react';

import type { PayloadViewModel, RequestsStatsPanelProps, StatsTab } from '@/components/requests/requestsStatsPanel.types';

type Args = Pick<
  RequestsStatsPanelProps,
  'defaultTab' | 'preferredTab' | 'storageKey' | 'loading' | 'error' | 'provider' | 'client'
> & {
  forcedTab?: StatsTab;
  providerViewModel: PayloadViewModel;
  clientViewModel: PayloadViewModel;
};

export function useRequestsStatsPanelState({
  defaultTab = 'provider',
  preferredTab,
  storageKey = 'dc_stats_tab',
  loading = false,
  error = false,
  provider,
  client,
  forcedTab,
  providerViewModel,
  clientViewModel,
}: Args) {
  const [tab, setTab] = React.useState<StatsTab>(defaultTab);
  const [stableContentMinHeight, setStableContentMinHeight] = React.useState<number | undefined>(
    undefined,
  );
  const activeContentRef = React.useRef<HTMLDivElement | null>(null);
  const providerMeasureRef = React.useRef<HTMLDivElement | null>(null);
  const clientMeasureRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (preferredTab) {
      setTab(preferredTab);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(storageKey, preferredTab);
      }
      return;
    }
    if (typeof window === 'undefined') return;
    const stored = window.localStorage.getItem(storageKey);
    if (stored === 'provider' || stored === 'client') {
      setTab(stored);
      return;
    }
    setTab(defaultTab);
  }, [defaultTab, preferredTab, storageKey]);

  const switchTab = React.useCallback(
    (next: StatsTab) => {
      setTab(next);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(storageKey, next);
      }
    },
    [storageKey],
  );

  const activeTab = forcedTab ?? tab;
  const activeViewModel = activeTab === 'provider' ? providerViewModel : clientViewModel;

  React.useLayoutEffect(() => {
    if (loading || error) {
      setStableContentMinHeight(undefined);
      return;
    }

    const nodes = [
      activeContentRef.current,
      providerMeasureRef.current,
      clientMeasureRef.current,
    ].filter((node): node is HTMLDivElement => node !== null);

    if (nodes.length === 0) return;

    const measure = () => {
      const nextHeight = Math.max(...nodes.map((node) => Math.ceil(node.getBoundingClientRect().height)));
      if (nextHeight <= 0) return;
      setStableContentMinHeight((prev) => (prev === nextHeight ? prev : nextHeight));
    };

    measure();
    if (typeof ResizeObserver === 'undefined') return;

    const observer = new ResizeObserver(measure);
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [activeTab, client, clientViewModel, error, loading, provider, providerViewModel]);

  return {
    activeTab,
    activeViewModel,
    activeContentRef,
    providerMeasureRef,
    clientMeasureRef,
    stableContentMinHeight,
    switchTab,
  };
}
