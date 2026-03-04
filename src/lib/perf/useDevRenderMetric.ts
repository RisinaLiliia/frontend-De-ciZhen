'use client';

import * as React from 'react';

import { devPerfDuration, devPerfNow } from '@/lib/perf/devPerf';

type MetaFactory = () => Record<string, unknown>;

export function useDevRenderMetric(scope: string, getMeta?: MetaFactory) {
  const startedAt = devPerfNow();

  React.useEffect(() => {
    devPerfDuration(scope, 'commit', startedAt, getMeta?.());
  });
}
