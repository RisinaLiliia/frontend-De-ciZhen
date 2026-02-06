'use client';

import * as React from 'react';
import type { LiveStats } from '@/types/home';

type Options = {
  enabled?: boolean;
};

export function useMockLiveStats(initial: LiveStats, options: Options = {}) {
  const [stats, setStats] = React.useState<LiveStats>(initial);
  const enabled = options.enabled ?? true;

  React.useEffect(() => {
    if (!enabled) return;
    const interval = setInterval(() => {
      setStats((prev) => {
        const nextActive = Math.max(
          900,
          prev.active + (Math.random() > 0.5 ? 1 : -1) * (2 + Math.floor(Math.random() * 6)),
        );
        const nextCompleted = Math.max(
          2000,
          prev.completed +
            (Math.random() > 0.4 ? 1 : -1) * (3 + Math.floor(Math.random() * 8)),
        );
        const nextResponse = Math.min(
          28,
          Math.max(10, prev.responseMin + (Math.random() > 0.5 ? 1 : -1)),
        );
        const nextRating = Math.min(
          4.99,
          Math.max(
            4.3,
            +(
              prev.rating + (Math.random() > 0.55 ? 0.01 : -0.01)
            ).toFixed(2),
          ),
        );
        const nextReviews = Math.max(
          9000,
          prev.reviews +
            (Math.random() > 0.45 ? 1 : -1) * (6 + Math.floor(Math.random() * 12)),
        );
        return {
          active: nextActive,
          completed: nextCompleted,
          responseMin: nextResponse,
          rating: nextRating,
          reviews: nextReviews,
        };
      });
    }, 2400);

    return () => clearInterval(interval);
  }, [enabled]);

  return stats;
}
