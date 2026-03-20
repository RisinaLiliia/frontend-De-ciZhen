'use client';

import * as React from 'react';
import type { ReactNode } from 'react';

type WorkspaceControlShellProps = {
  navigation: ReactNode;
  context?: ReactNode;
  aside?: ReactNode;
};

export function WorkspaceControlShell({
  navigation,
  context,
  aside,
}: WorkspaceControlShellProps) {
  const hasContext = Boolean(context);
  const hasAside = Boolean(aside);
  const anchorRef = React.useRef<HTMLDivElement | null>(null);
  const shellRef = React.useRef<HTMLElement | null>(null);
  const condensedThresholdRef = React.useRef(0);
  const pinnedStateRef = React.useRef(false);
  const [isCondensed, setIsCondensed] = React.useState(false);
  const [isPinned, setIsPinned] = React.useState(false);
  const [pinnedMetrics, setPinnedMetrics] = React.useState<{ left: number; width: number; height: number }>({
    left: 0,
    width: 0,
    height: 0,
  });

  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    let frame = 0;

    const readStickyTop = () => {
      const shell = shellRef.current;
      if (!shell) return 0;

      const top = Number.parseFloat(window.getComputedStyle(shell).top);
      return Number.isFinite(top) ? top : 0;
    };

    const measureThreshold = () => {
      const anchor = anchorRef.current;
      if (!anchor) return;

      condensedThresholdRef.current =
        anchor.getBoundingClientRect().top + window.scrollY - readStickyTop();
    };

    const measurePinnedMetrics = () => {
      const anchor = anchorRef.current;
      const shell = shellRef.current;
      if (!anchor || !shell) return;

      const rect = anchor.getBoundingClientRect();
      const nextHeight = shell.offsetHeight;
      setPinnedMetrics((current) => {
        if (
          current.left === rect.left &&
          current.width === rect.width &&
          current.height === nextHeight
        ) {
          return current;
        }

        return {
          left: rect.left,
          width: rect.width,
          height: nextHeight,
        };
      });
    };

    const syncCondensedState = () => {
      const nextIsCondensed = window.scrollY >= condensedThresholdRef.current;
      const nextIsPinned = nextIsCondensed;
      if (nextIsPinned && !pinnedStateRef.current) {
        measurePinnedMetrics();
      }
      pinnedStateRef.current = nextIsPinned;
      setIsCondensed((current) => (current === nextIsCondensed ? current : nextIsCondensed));
      setIsPinned((current) => (current === nextIsPinned ? current : nextIsPinned));
    };

    const scheduleSync = () => {
      if (frame) window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(syncCondensedState);
    };

    const handleResize = () => {
      measureThreshold();
      measurePinnedMetrics();
      scheduleSync();
    };

    const resizeObserver = typeof ResizeObserver === 'undefined'
      ? null
      : new ResizeObserver(() => {
        measureThreshold();
        measurePinnedMetrics();
        scheduleSync();
      });

    if (shellRef.current) resizeObserver?.observe(shellRef.current);
    if (anchorRef.current) resizeObserver?.observe(anchorRef.current);

    measureThreshold();
    measurePinnedMetrics();
    syncCondensedState();
    window.addEventListener('scroll', scheduleSync, { passive: true });
    window.addEventListener('resize', handleResize);

    return () => {
      pinnedStateRef.current = false;
      resizeObserver?.disconnect();
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', scheduleSync);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const anchorStyle = isPinned && pinnedMetrics.height
    ? { minHeight: `${pinnedMetrics.height}px` }
    : undefined;
  const shellStyle = isPinned
    ? {
        left: `${pinnedMetrics.left}px`,
        width: `${pinnedMetrics.width}px`,
      }
    : undefined;

  return (
    <div
      ref={anchorRef}
      className="workspace-control-shell-anchor"
      data-pinned={isPinned ? 'true' : 'false'}
      style={anchorStyle}
    >
      <section
        ref={shellRef}
        className="workspace-control-shell"
        data-mode="static"
        data-condensed={isCondensed ? 'true' : 'false'}
        data-pinned={isPinned ? 'true' : 'false'}
        style={shellStyle}
      >
        <div className="workspace-control-shell__body">
          <div
            className={`workspace-control-shell__layout${hasContext ? ' has-context' : ''}${hasAside ? ' has-aside' : ''}`.trim()}
          >
            <div className="workspace-control-shell__main">
              <div className="workspace-control-shell__section workspace-control-shell__section--navigation">
                {navigation}
              </div>
              {context ? (
                <div className="workspace-control-shell__section workspace-control-shell__section--context">
                  {context}
                </div>
              ) : null}
            </div>
            {aside ? (
              <aside className="workspace-control-shell__aside">
                {aside}
              </aside>
            ) : null}
          </div>
        </div>
      </section>
    </div>
  );
}
