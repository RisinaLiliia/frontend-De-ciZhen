'use client';

import * as React from 'react';
import { buildFunnelVisualRows } from '../statisticsFunnel.utils';
import type { WorkspaceStatisticsModel } from '../statistics.model';

type UseStatisticsFunnelLayoutParams = {
  funnel: WorkspaceStatisticsModel['funnel'];
  copy: WorkspaceStatisticsModel['copy'];
  mode: WorkspaceStatisticsModel['mode'];
};

export function useStatisticsFunnelLayout({ funnel, copy, mode }: UseStatisticsFunnelLayoutParams) {
  const funnelContainerRef = React.useRef<HTMLOListElement | null>(null);
  const [funnelContainerWidth, setFunnelContainerWidth] = React.useState(0);
  const [isNarrowViewport, setNarrowViewport] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const media = window.matchMedia('(max-width: 767px)');
    const sync = () => setNarrowViewport(media.matches);
    sync();
    media.addEventListener('change', sync);
    return () => media.removeEventListener('change', sync);
  }, []);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const target = funnelContainerRef.current;
    if (!target) return;

    const observer = new ResizeObserver((entries) => {
      const [entry] = entries;
      if (!entry) return;
      setFunnelContainerWidth(Math.round(entry.contentRect.width));
    });

    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  const funnelVisualRows = React.useMemo(
    () => buildFunnelVisualRows({ funnel, copy, isNarrowViewport, funnelContainerWidth, mode }),
    [copy, funnel, funnelContainerWidth, isNarrowViewport, mode],
  );

  return {
    funnelContainerRef,
    funnelVisualRows,
  };
}
