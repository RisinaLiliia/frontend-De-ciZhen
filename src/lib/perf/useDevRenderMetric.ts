'use client';

import * as React from 'react';

import { devPerfCanProfile, devPerfDuration, devPerfNow } from '@/lib/perf/devPerf';

type MetaFactory = () => Record<string, unknown>;

export function useDevRenderMetric(scope: string, getMeta?: MetaFactory) {
  const profilingEnabled = devPerfCanProfile();
  const metaDetail = React.useMemo(
    () => (profilingEnabled && getMeta ? getMeta() : undefined),
    [getMeta, profilingEnabled],
  );
  const metaSignature = React.useMemo(
    () => (metaDetail ? JSON.stringify(metaDetail) : ''),
    [metaDetail],
  );
  const startedAt = profilingEnabled ? devPerfNow() : 0;

  React.useEffect(() => {
    if (!profilingEnabled) return;
    devPerfDuration(scope, 'commit', startedAt, metaDetail);
  }, [metaDetail, metaSignature, profilingEnabled, scope, startedAt]);
}
