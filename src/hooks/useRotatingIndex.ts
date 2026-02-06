'use client';

import * as React from 'react';

type RotatingIndexOptions = {
  intervalMs?: number;
  holdMs?: number;
};

const DEFAULT_INTERVAL = 5200;
const DEFAULT_HOLD = 600;

export function useRotatingIndex(length: number, options: RotatingIndexOptions = {}) {
  const intervalMs = options.intervalMs ?? DEFAULT_INTERVAL;
  const holdMs = options.holdMs ?? DEFAULT_HOLD;
  const [index, setIndex] = React.useState(0);
  const isAnimatingRef = React.useRef(false);

  React.useEffect(() => {
    if (length <= 1) return;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    const interval = setInterval(() => {
      if (isAnimatingRef.current) return;
      isAnimatingRef.current = true;
      setIndex((prev) => (prev + 1) % length);
      timeoutId = setTimeout(() => {
        isAnimatingRef.current = false;
      }, holdMs);
    }, intervalMs);

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      clearInterval(interval);
    };
  }, [length, intervalMs, holdMs]);

  return index;
}
