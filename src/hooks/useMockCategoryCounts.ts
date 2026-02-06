'use client';

import * as React from 'react';
import type { CategoryCounts } from '@/types/home';

type Options = {
  enabled?: boolean;
};

export function useMockCategoryCounts(initial: CategoryCounts, options: Options = {}) {
  const [categoryCounts, setCategoryCounts] = React.useState<CategoryCounts>(initial);
  const enabled = options.enabled ?? true;

  React.useEffect(() => {
    if (!enabled) return;
    const interval = setInterval(() => {
      setCategoryCounts((prev) => {
        const bump = (value: number) =>
          Math.max(1, value + (Math.random() > 0.5 ? 1 : -1));
        return {
          cleaning: bump(prev.cleaning),
          electric: bump(prev.electric),
          plumbing: bump(prev.plumbing),
          repair: bump(prev.repair),
          moving: bump(prev.moving),
        };
      });
    }, 3200);

    return () => clearInterval(interval);
  }, [enabled]);

  return categoryCounts;
}
