'use client';

import * as React from 'react';

type Params<T extends HTMLElement> = {
  activeSelector: string;
  enabled?: boolean;
  deps?: React.DependencyList;
};

export function useSlidingIndicator<T extends HTMLElement>({
  activeSelector,
  enabled = true,
  deps = [],
}: Params<T>) {
  const containerRef = React.useRef<T | null>(null);
  const [indicatorStyle, setIndicatorStyle] = React.useState<React.CSSProperties | null>(null);

  const syncIndicator = React.useCallback(() => {
    if (!enabled) {
      setIndicatorStyle(null);
      return;
    }

    const container = containerRef.current;
    if (!container) return;

    const activeItem = container.querySelector<HTMLElement>(activeSelector);
    if (!activeItem) {
      setIndicatorStyle(null);
      return;
    }

    const containerRect = container.getBoundingClientRect();
    const itemRect = activeItem.getBoundingClientRect();
    setIndicatorStyle({
      transform: `translate3d(${itemRect.left - containerRect.left}px, ${itemRect.top - containerRect.top}px, 0)`,
      width: `${itemRect.width}px`,
      height: `${itemRect.height}px`,
    });
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
  }, [enabled, syncIndicator, ...deps]);

  return {
    containerRef,
    indicatorStyle,
    syncIndicator,
  };
}
