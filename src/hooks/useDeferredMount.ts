'use client';

import * as React from 'react';

type IdleWindow = Window & {
  requestIdleCallback?: (callback: () => void, options?: { timeout?: number }) => number;
  cancelIdleCallback?: (id: number) => void;
};

export function useDeferredMount(delayMs = 120) {
  const [isReady, setIsReady] = React.useState(false);

  React.useEffect(() => {
    const idleWindow = window as IdleWindow;
    if (typeof idleWindow.requestIdleCallback === 'function') {
      const idleId = idleWindow.requestIdleCallback(() => setIsReady(true), { timeout: delayMs });
      return () => {
        if (typeof idleWindow.cancelIdleCallback === 'function') {
          idleWindow.cancelIdleCallback(idleId);
        }
      };
    }

    const timeoutId = window.setTimeout(() => setIsReady(true), delayMs);
    return () => window.clearTimeout(timeoutId);
  }, [delayMs]);

  return isReady;
}
