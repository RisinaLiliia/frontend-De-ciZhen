'use client';

import * as React from 'react';
import { RequestsStatsPanelBody } from '@/components/requests/RequestsStatsPanelBody';
import { toPayloadViewModel } from '@/components/requests/requestsStatsPanel.model';
import type { RequestsStatsPanelProps } from '@/components/requests/requestsStatsPanel.types';
import { useRequestsStatsPanelState } from '@/components/requests/useRequestsStatsPanelState';

export function RequestsStatsPanel({
  title,
  titleByTab,
  tabsLabel,
  provider,
  client,
  tab: forcedTab,
  showTabs = true,
  defaultTab = 'provider',
  preferredTab,
  storageKey = 'dc_stats_tab',
  loading = false,
  error = false,
  errorLabel = 'Failed to load stats.',
  className,
  surface = 'panel',
}: RequestsStatsPanelProps) {
  const providerViewModel = React.useMemo(() => toPayloadViewModel(provider), [provider]);
  const clientViewModel = React.useMemo(() => toPayloadViewModel(client), [client]);
  const {
    activeTab,
    activeViewModel,
    activeContentRef,
    providerMeasureRef,
    clientMeasureRef,
    stableContentMinHeight,
    switchTab,
  } = useRequestsStatsPanelState({
    defaultTab,
    preferredTab,
    storageKey,
    loading,
    error,
    provider,
    client,
    forcedTab,
    providerViewModel,
    clientViewModel,
  });
  const resolvedTitle = titleByTab?.[activeTab] ?? title;

  return (
    <section
      className={`${surface === 'panel' ? 'panel ' : ''}requests-stats${surface === 'embedded' ? ' requests-stats--embedded' : ''} ${className ?? ''}`.trim()}
      style={{ position: 'relative' }}
    >
      <div className="requests-stats__header">
        <p className="section-title">{resolvedTitle}</p>
        {showTabs ? (
          <div className="howitworks-tabs" role="group" aria-label={resolvedTitle}>
            <button
              type="button"
              aria-pressed={activeTab === 'provider'}
              className={`howitworks-tab ${activeTab === 'provider' ? 'is-active' : ''}`.trim()}
              onClick={() => switchTab('provider')}
            >
              {tabsLabel.provider}
            </button>
            <button
              type="button"
              aria-pressed={activeTab === 'client'}
              className={`howitworks-tab ${activeTab === 'client' ? 'is-active' : ''}`.trim()}
              onClick={() => switchTab('client')}
            >
              {tabsLabel.client}
            </button>
          </div>
        ) : null}
      </div>
      {!loading && !error ? (
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            visibility: 'hidden',
            pointerEvents: 'none',
            zIndex: -1,
          }}
        >
          <div ref={providerMeasureRef}>
            <RequestsStatsPanelBody viewModel={providerViewModel} />
          </div>
          <div ref={clientMeasureRef}>
            <RequestsStatsPanelBody viewModel={clientViewModel} />
          </div>
        </div>
      ) : null}

      {loading ? (
        <div className="requests-stats__loading">
          <div className="skeleton h-20 w-full" />
          <div className="skeleton h-28 w-full" />
          <div className="skeleton h-14 w-full" />
        </div>
      ) : error ? (
        <div className="requests-stats__error">
          <p className="typo-small">{errorLabel}</p>
        </div>
      ) : (
        <div ref={activeContentRef} style={stableContentMinHeight ? { minHeight: stableContentMinHeight } : undefined}>
          <RequestsStatsPanelBody viewModel={activeViewModel} />
        </div>
      )}
    </section>
  );
}
