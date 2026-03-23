'use client';

import * as React from 'react';

type Params = {
  activeSelector: string;
  enabled?: boolean;
  watchKey?: string;
};

export function useSlidingIndicator<T extends HTMLElement>({
  activeSelector,
  enabled = true,
  watchKey = '',
}: Params) {
  const containerRef = React.useRef<T | null>(null);
  const [indicatorStyle, setIndicatorStyle] = React.useState<React.CSSProperties | null>(null);
  const indicatorSnapshotRef = React.useRef<string>('');

  const syncIndicator = React.useCallback(() => {
    if (!enabled) {
      indicatorSnapshotRef.current = '';
      setIndicatorStyle(null);
      return;
    }

    const container = containerRef.current;
    if (!container) return;

    const activeItem = container.querySelector<HTMLElement>(activeSelector);
    if (!activeItem) {
      indicatorSnapshotRef.current = '';
      setIndicatorStyle(null);
      return;
    }

    const containerRect = container.getBoundingClientRect();
    const itemRect = activeItem.getBoundingClientRect();
    const nextStyle = {
      transform: `translate3d(${itemRect.left - containerRect.left}px, ${itemRect.top - containerRect.top}px, 0)`,
      width: `${itemRect.width}px`,
      height: `${itemRect.height}px`,
    } satisfies React.CSSProperties;
    const nextSnapshot = `${nextStyle.transform}|${nextStyle.width}|${nextStyle.height}`;
    if (indicatorSnapshotRef.current === nextSnapshot) return;
    indicatorSnapshotRef.current = nextSnapshot;
    setIndicatorStyle(nextStyle);
  }, [activeSelector, enabled]);

  React.useEffect(() => {
    if (!enabled) {
      setIndicatorStyle(null);
      return;
    }

    syncIndicator();
    const raf = window.requestAnimationFrame(syncIndicator);
    const onResize = () => syncIndicator();

    window.addEventListener('resize', onResize);
    const container = containerRef.current;
    const observer = typeof ResizeObserver !== 'undefined' && container ? new ResizeObserver(syncIndicator) : null;
    if (observer && container) observer.observe(container);

    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      observer?.disconnect();
    };
  }, [enabled, syncIndicator, watchKey]);

  return {
    containerRef,
    indicatorStyle,
    syncIndicator,
  };
}
