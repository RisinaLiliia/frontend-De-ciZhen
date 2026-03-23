'use client';

import * as React from 'react';

import { IconChevronDown } from '@/components/ui/icons/icons';

type WorkspaceOverlayShellProps = {
  children: React.ReactNode | ((controls: { headerToggle: React.ReactNode }) => React.ReactNode);
  summary?: string | null;
  compactLabel?: string;
  onCollapsedChange?: (isCollapsed: boolean) => void;
};

export function WorkspaceOverlayShell({
  children,
  summary,
  compactLabel,
  onCollapsedChange,
}: WorkspaceOverlayShellProps) {
  const shellRef = React.useRef<HTMLElement | null>(null);
  const bodyRef = React.useRef<HTMLDivElement | null>(null);
  const expandedHeightRef = React.useRef(0);
  const expandingRef = React.useRef(false);
  const expandFrameRef = React.useRef<number | null>(null);
  const [expandedHeight, setExpandedHeight] = React.useState(0);
  const [isManualCollapsed, setIsManualCollapsed] = React.useState(false);
  const [isAutoCollapsed, setIsAutoCollapsed] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    const shellNode = shellRef.current;
    const bodyNode = bodyRef.current;
    if (!shellNode || !bodyNode) return;
    const topbarNode = document.querySelector('.topbar');
    let syncFrameId = 0;

    const syncOverlayState = () => {
      window.cancelAnimationFrame(syncFrameId);
      syncFrameId = window.requestAnimationFrame(() => {
        if (isManualCollapsed) {
          setIsAutoCollapsed(false);
          return;
        }

        const currentShell = shellRef.current;
        const currentBody = bodyRef.current;
        if (!currentShell || !currentBody) return;

        const nextHeight = Math.ceil(currentBody.scrollHeight);
        expandedHeightRef.current = Math.max(expandedHeightRef.current, nextHeight);
        setExpandedHeight((prev) => (prev === nextHeight ? prev : nextHeight));

        if (expandingRef.current) {
          setIsAutoCollapsed(false);
          return;
        }

        const topbarBottom = topbarNode?.getBoundingClientRect().bottom ?? 96;
        const shellTop = currentShell.offsetTop;
        const expandedBottom = shellTop + Math.max(expandedHeightRef.current, currentBody.scrollHeight);
        const viewportThreshold = window.scrollY + topbarBottom + 8;
        const nextCollapsed = viewportThreshold >= expandedBottom;
        setIsAutoCollapsed((prev) => (prev === nextCollapsed ? prev : nextCollapsed));
      });
    };

    const updateExpandedHeight = () => {
      if (isManualCollapsed) return;
      const nextHeight = Math.ceil(bodyNode.scrollHeight);
      expandedHeightRef.current = Math.max(expandedHeightRef.current, nextHeight);
      setExpandedHeight((prev) => (prev === nextHeight ? prev : nextHeight));
    };

    const onScroll = () => {
      syncOverlayState();
    };

    updateExpandedHeight();
    syncOverlayState();
    const observer =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(() => {
            syncOverlayState();
          })
        : null;
    observer?.observe(shellNode);
    observer?.observe(bodyNode);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      observer?.disconnect();
      window.cancelAnimationFrame(syncFrameId);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (expandFrameRef.current !== null) {
        window.cancelAnimationFrame(expandFrameRef.current);
      }
    };
  }, [isManualCollapsed]);

  const isCollapsed = isManualCollapsed || isAutoCollapsed;

  React.useEffect(() => {
    onCollapsedChange?.(isCollapsed);
  }, [isCollapsed, onCollapsedChange]);

  const collapseOverlay = React.useCallback(() => {
    setIsManualCollapsed(true);
  }, []);

  const expandOverlay = React.useCallback(() => {
    expandingRef.current = true;
    if (typeof window !== 'undefined' && expandFrameRef.current !== null) {
      window.cancelAnimationFrame(expandFrameRef.current);
    }
    setIsManualCollapsed(false);
    setIsAutoCollapsed(false);
    shellRef.current?.scrollIntoView({ block: 'start', behavior: 'smooth' });
    if (typeof window !== 'undefined') {
      const startedAt = window.performance.now();
      const releaseWhenReachedTop = () => {
        const shellNode = shellRef.current;
        const topbarBottom =
          document.querySelector('.topbar')?.getBoundingClientRect().bottom ??
          96;
        const shellTop = shellNode?.getBoundingClientRect().top ?? Number.POSITIVE_INFINITY;
        const reachedTarget = shellTop <= topbarBottom + 8;
        const timedOut = window.performance.now() - startedAt > 1600;

        if (reachedTarget || timedOut) {
          expandingRef.current = false;
          expandFrameRef.current = null;
          return;
        }

        expandFrameRef.current = window.requestAnimationFrame(releaseWhenReachedTop);
      };

      expandFrameRef.current = window.requestAnimationFrame(releaseWhenReachedTop);
    }
  }, []);

  React.useEffect(() => () => {
    if (typeof window !== 'undefined' && expandFrameRef.current !== null) {
      window.cancelAnimationFrame(expandFrameRef.current);
    }
  }, []);

  const compactSummary = summary?.trim() ? summary : compactLabel?.trim() ? compactLabel : null;
  const hasSummary = Boolean(compactSummary);

  const headerToggle = (
    <button
      type="button"
      className="workspace-overlay-shell__header-toggle"
      aria-expanded={!isCollapsed}
      aria-label="Navigation ausblenden"
      title="Navigation ausblenden"
      data-tooltip="Navigation ausblenden"
      onClick={collapseOverlay}
    >
      <span className="workspace-overlay-shell__toggle-icon" aria-hidden="true">
        <IconChevronDown />
      </span>
    </button>
  );

  return (
    <section
      ref={shellRef}
      className={`workspace-overlay-shell ${isCollapsed ? 'is-collapsed' : 'is-expanded'}`.trim()}
      style={expandedHeight > 0 ? { ['--workspace-overlay-body-height' as string]: `${expandedHeight}px` } : undefined}
    >
      <div ref={bodyRef} className="workspace-overlay-shell__body">
        {typeof children === 'function' ? children({ headerToggle }) : children}
      </div>

      <div className="workspace-overlay-shell__compact-bar">
        <button
          type="button"
          className={`workspace-overlay-shell__compact-toggle${hasSummary ? ' workspace-overlay-shell__compact-toggle--summary' : ' workspace-overlay-shell__compact-toggle--icon-only'}`}
          aria-expanded={false}
          aria-label="Navigation einblenden"
          title="Navigation einblenden"
          data-tooltip="Navigation einblenden"
          onClick={expandOverlay}
        >
          <span className="workspace-overlay-shell__toggle-icon" aria-hidden="true">
            <IconChevronDown />
          </span>
          {compactSummary ? (
            <span className="workspace-overlay-shell__summary">{compactSummary}</span>
          ) : null}
        </button>
      </div>
    </section>
  );
}
