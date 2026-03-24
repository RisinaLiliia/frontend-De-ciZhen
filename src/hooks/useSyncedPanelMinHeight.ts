'use client';

import * as React from 'react';

type SyncMode = 'sourceHeight' | 'sourceBottomToTargetTop';

type UseSyncedPanelMinHeightParams = {
  sourceRef: React.RefObject<Element | null>;
  targetRef?: React.RefObject<Element | null>;
  mode: SyncMode;
  minDesktopWidth?: number;
  watchKey?: string | number | boolean | null;
};

export function useSyncedPanelMinHeight({
  sourceRef,
  targetRef,
  mode,
  minDesktopWidth = 1024,
  watchKey = null,
}: UseSyncedPanelMinHeightParams): number | null {
  const [minHeight, setMinHeight] = React.useState<number | null>(null);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    const source = sourceRef.current;
    const target = targetRef?.current ?? null;
    if (!source) {
      setMinHeight(null);
      return;
    }
    if (mode === 'sourceBottomToTargetTop' && !target) {
      setMinHeight(null);
      return;
    }

    const desktopMedia = window.matchMedia(`(min-width: ${minDesktopWidth}px)`);
    let frameId = 0;

    const syncHeight = () => {
      cancelAnimationFrame(frameId);
      frameId = window.requestAnimationFrame(() => {
        if (!desktopMedia.matches) {
          setMinHeight(null);
          return;
        }

        const sourceRect = source.getBoundingClientRect();
        const targetRect = target?.getBoundingClientRect() ?? null;
        const rawHeight = mode === 'sourceHeight'
          ? sourceRect.height
          : sourceRect.bottom - (targetRect?.top ?? 0);
        const nextHeight = Math.max(0, Math.round(rawHeight));
        setMinHeight((prev) => (prev === nextHeight ? prev : nextHeight));
      });
    };

    syncHeight();

    const observer = new ResizeObserver(syncHeight);
    observer.observe(source);
    if (target) observer.observe(target);
    desktopMedia.addEventListener('change', syncHeight);

    return () => {
      cancelAnimationFrame(frameId);
      observer.disconnect();
      desktopMedia.removeEventListener('change', syncHeight);
    };
  }, [minDesktopWidth, mode, sourceRef, targetRef, watchKey]);

  return minHeight;
}
