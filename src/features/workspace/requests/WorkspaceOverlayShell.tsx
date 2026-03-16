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
  const sentinelRef = React.useRef<HTMLDivElement | null>(null);
  const expandedHeightRef = React.useRef(0);
  const expandingRef = React.useRef(false);
  const expandFrameRef = React.useRef<number | null>(null);
  const [expandedHeight, setExpandedHeight] = React.useState(0);
  const [isManualCollapsed, setIsManualCollapsed] = React.useState(false);
  const [isAutoCollapsed, setIsAutoCollapsed] = React.useState(false);

  const isManualCollapsedRef = React.useRef(false);

  React.useEffect(() => {
    isManualCollapsedRef.current = isManualCollapsed;
  }, [isManualCollapsed]);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    const shellNode = shellRef.current;
    const bodyNode = bodyRef.current;
    const sentinelNode = sentinelRef.current;
    if (!shellNode || !bodyNode || !sentinelNode) return;

    const topbarNode = document.querySelector('.topbar');
    const topbarBottom = topbarNode?.getBoundingClientRect().bottom ?? 96;
    const rootMargin = `-${topbarBottom + 8}px 0px 0px 0px`;

    const updateExpandedHeight = () => {
      if (isManualCollapsedRef.current) return;
      const nextHeight = Math.ceil(bodyNode.scrollHeight);
      expandedHeightRef.current = Math.max(expandedHeightRef.current, nextHeight);
      setExpandedHeight((prev) => (prev === nextHeight ? prev : nextHeight));
    };

    updateExpandedHeight();

    const resizeObserver =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(updateExpandedHeight)
        : null;

    resizeObserver?.observe(shellNode);
    resizeObserver?.observe(bodyNode);

    const intersectionObserver =
      typeof IntersectionObserver !== 'undefined'
        ? new IntersectionObserver(
            ([entry]) => {
              if (isManualCollapsedRef.current) {
                setIsAutoCollapsed(false);
                return;
              }

              const nextCollapsed = !entry.isIntersecting;
              setIsAutoCollapsed((prev) => (prev === nextCollapsed ? prev : nextCollapsed));
            },
            { root: null, threshold: 0, rootMargin },
          )
        : null;

    intersectionObserver?.observe(sentinelNode);

    return () => {
      resizeObserver?.disconnect();
      intersectionObserver?.disconnect();
      if (expandFrameRef.current !== null) {
        window.cancelAnimationFrame(expandFrameRef.current);
      }
    };
  }, []);

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

      <div ref={sentinelRef} aria-hidden="true" style={{ height: 1, width: 1, position: 'absolute', top: '100%', left: 0 }} />

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
