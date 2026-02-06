'use client';

import * as React from 'react';

type Options = {
  intervalMs?: number;
};

const DEFAULT_INTERVAL = 5200;

export function useRandomActiveIndex(length: number, options: Options = {}) {
  const intervalMs = options.intervalMs ?? DEFAULT_INTERVAL;
  const [index, setIndex] = React.useState(0);

  React.useEffect(() => {
    if (length <= 1) return;
    const interval = setInterval(() => {
      setIndex((prev) => {
        if (length <= 1) return 0;
        let next = Math.floor(Math.random() * length);
        if (next === prev && length > 1) {
          next = (next + 1) % length;
        }
        return next;
      });
    }, intervalMs);

    return () => clearInterval(interval);
  }, [length, intervalMs]);

  return index;
}
