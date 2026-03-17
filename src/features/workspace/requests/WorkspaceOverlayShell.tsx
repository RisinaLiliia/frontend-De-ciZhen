'use client';

import * as React from 'react';

import { IconChevronDown } from '@/components/ui/icons/icons';

type WorkspaceOverlayShellProps = {
  children: React.ReactNode | ((controls: { headerToggle: React.ReactNode }) => React.ReactNode);
  summary?: string | null;
  compactLabel?: string;
  compactContent?: React.ReactNode;
  onCollapsedChange?: (isCollapsed: boolean) => void;
};

export function WorkspaceOverlayShell({
  children,
  summary,
  compactLabel,
  compactContent,
  onCollapsedChange,
}: WorkspaceOverlayShellProps) {
  const shellRef = React.useRef<HTMLElement | null>(null);
  const bodyRef = React.useRef<HTMLDivElement | null>(null);
  const sentinelRef = React.useRef<HTMLDivElement | null>(null);
  const expandFrameRef = React.useRef<number | null>(null);
  const [expandedHeight, setExpandedHeight] = React.useState(0);
  const [isManualCollapsed, setIsManualCollapsed] = React.useState(false);
  const [isAutoCollapsed, setIsAutoCollapsed] = React.useState(false);
  const [isManualOverride, setIsManualOverride] = React.useState(false);
  const overlayId = React.useId();
  const isManualOverrideRef = React.useRef(false);

  React.useEffect(() => {
    isManualOverrideRef.current = isManualOverride;
  }, [isManualOverride]);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    const shellNode = shellRef.current;
    const bodyNode = bodyRef.current;
    const sentinelNode = sentinelRef.current;
    if (!shellNode || !bodyNode || !sentinelNode) return;

    const updateExpandedHeight = () => {
      const nextHeight = Math.ceil(bodyNode.scrollHeight);
      setExpandedHeight((prev) => (prev === nextHeight ? prev : nextHeight));
    };

    updateExpandedHeight();

    const resizeObserver =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(updateExpandedHeight)
        : null;

    resizeObserver?.observe(shellNode);
    resizeObserver?.observe(bodyNode);

    const handleIntersection: IntersectionObserverCallback = ([entry]) => {
      if (isManualOverrideRef.current) return;

      const nextCollapsed = !entry.isIntersecting;
      setIsAutoCollapsed((prev) => (prev === nextCollapsed ? prev : nextCollapsed));
    };

    let intersectionObserver: IntersectionObserver | null = null;
    let currentRootMargin = '';
    const getTopbarBottom = () =>
      document.querySelector('.topbar')?.getBoundingClientRect().bottom ?? 96;
    const updateIntersectionObserver = () => {
      const nextRootMargin = `-${getTopbarBottom() + 8}px 0px 0px 0px`;
      if (intersectionObserver && nextRootMargin === currentRootMargin) return;
      currentRootMargin = nextRootMargin;
      intersectionObserver?.disconnect();
      intersectionObserver =
        typeof IntersectionObserver !== 'undefined'
          ? new IntersectionObserver(handleIntersection, {
              root: null,
              threshold: 0,
              rootMargin: currentRootMargin,
            })
          : null;
      intersectionObserver?.observe(sentinelNode);
    };

    updateIntersectionObserver();

    const topbarNode = document.querySelector('.topbar');
    const topbarObserver =
      typeof ResizeObserver !== 'undefined' && topbarNode
        ? new ResizeObserver(updateIntersectionObserver)
        : null;
    topbarObserver?.observe(topbarNode);
    window.addEventListener('resize', updateIntersectionObserver, { passive: true });

    return () => {
      resizeObserver?.disconnect();
      topbarObserver?.disconnect();
      intersectionObserver?.disconnect();
      window.removeEventListener('resize', updateIntersectionObserver);
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
    setIsManualOverride(true);
    setIsManualCollapsed(true);
    setIsAutoCollapsed(false);
  }, []);

  const expandOverlay = React.useCallback(() => {
    if (typeof window !== 'undefined' && expandFrameRef.current !== null) {
      window.cancelAnimationFrame(expandFrameRef.current);
    }
    setIsManualOverride(true);
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
  const bodyId = `${overlayId}-body`;
  const compactBarId = compactContent || hasSummary ? `${overlayId}-compact` : undefined;

  const toggleLabel = isCollapsed ? 'Navigation einblenden' : 'Navigation ausblenden';
  const toggleAction = isCollapsed ? expandOverlay : collapseOverlay;
  const toggleButton = (
    <button
      type="button"
      className="workspace-overlay-shell__toggle-button"
      aria-expanded={!isCollapsed}
      aria-label={toggleLabel}
      title={toggleLabel}
      data-tooltip={toggleLabel}
      aria-controls={compactBarId ? `${bodyId} ${compactBarId}` : bodyId}
      onClick={toggleAction}
    >
      <span className="workspace-overlay-shell__toggle-icon" aria-hidden="true">
        <IconChevronDown />
      </span>
    </button>
  );
  const compactNode = compactContent ? (
    <div className="workspace-overlay-shell__compact-content">
      {compactContent}
    </div>
  ) : hasSummary ? (
    <div className="workspace-overlay-shell__compact-content">
      <span className="workspace-overlay-shell__summary">{compactSummary}</span>
    </div>
  ) : null;

  return (
    <section
      ref={shellRef}
      className={`workspace-overlay-shell ${isCollapsed ? 'is-collapsed' : 'is-expanded'}`.trim()}
      style={expandedHeight > 0 ? { ['--workspace-overlay-body-height' as string]: `${expandedHeight}px` } : undefined}
    >
      <div className="workspace-overlay-shell__toggle-rail">
        {toggleButton}
      </div>

      <div ref={bodyRef} id={bodyId} className="workspace-overlay-shell__body">
        {typeof children === 'function' ? children({ headerToggle: null }) : children}
      </div>

      <div ref={sentinelRef} aria-hidden="true" style={{ height: 1, width: 1, position: 'absolute', top: '100%', left: 0 }} />

      {isCollapsed && compactNode ? (
        <div
          id={compactBarId}
          className="workspace-overlay-shell__compact-bar"
          aria-hidden={!isCollapsed}
        >
          {compactNode}
        </div>
      ) : null}
    </section>
  );
}
