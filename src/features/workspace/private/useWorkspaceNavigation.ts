'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { trackUXEvent } from '@/lib/analytics';
import { devPerfDuration, devPerfLog, devPerfNow } from '@/lib/perf/devPerf';
import type {
  FavoritesView,
  WorkspaceStatusFilter,
  WorkspaceTab,
} from '@/features/workspace/requests';
import {
  buildWorkspaceCurrentHref,
  buildWorkspaceFavoritesViewHref,
  buildWorkspaceStatusFilterHref,
  buildWorkspaceTabHref,
} from '@/features/workspace/private/workspaceNavigation.model';

type Args = {
  activeWorkspaceTab: WorkspaceTab;
  workspacePath: string;
};

export function useWorkspaceNavigation({
  activeWorkspaceTab,
  workspacePath,
}: Args) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rafIdRef = React.useRef<number | null>(null);
  const queuedHrefRef = React.useRef<string | null>(null);
  const queuedAtRef = React.useRef(0);
  const lastRequestedHrefRef = React.useRef<string | null>(null);

  const currentHref = React.useMemo(() => {
    return buildWorkspaceCurrentHref({
      search: searchParams.toString(),
      workspacePath,
    });
  }, [searchParams, workspacePath]);

  const scheduleReplace = React.useCallback((nextHref: string) => {
    if (nextHref === currentHref) {
      devPerfLog('workspace.nav', 'skip_same_href', { nextHref });
      return false;
    }
    if (nextHref === lastRequestedHrefRef.current) {
      devPerfLog('workspace.nav', 'skip_duplicate_href', { nextHref });
      return false;
    }

    queuedHrefRef.current = nextHref;
    queuedAtRef.current = devPerfNow();
    devPerfLog('workspace.nav', 'queue_replace', { nextHref });
    if (rafIdRef.current !== null) return true;

    rafIdRef.current = window.requestAnimationFrame(() => {
      rafIdRef.current = null;
      const href = queuedHrefRef.current;
      queuedHrefRef.current = null;
      if (!href || href === lastRequestedHrefRef.current) return;
      lastRequestedHrefRef.current = href;
      devPerfDuration('workspace.nav', 'flush_replace', queuedAtRef.current, { href });
      router.replace(href, { scroll: false });
    });

    return true;
  }, [currentHref, router]);

  React.useEffect(() => {
    if (currentHref === lastRequestedHrefRef.current) {
      lastRequestedHrefRef.current = null;
    }
  }, [currentHref]);

  React.useEffect(() => () => {
    if (rafIdRef.current !== null) {
      window.cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
  }, []);

  const setWorkspaceTab = React.useCallback(
    (tab: WorkspaceTab) => {
      const nextHref = buildWorkspaceTabHref({
        search: searchParams.toString(),
        workspacePath,
        tab,
      });
      const didSchedule = scheduleReplace(nextHref);
      if (!didSchedule) return;
      trackUXEvent('workspace_tab_change', { tab });
    },
    [scheduleReplace, searchParams, workspacePath],
  );

  const setStatusFilter = React.useCallback(
    (status: WorkspaceStatusFilter) => {
      const nextHref = buildWorkspaceStatusFilterHref({
        search: searchParams.toString(),
        workspacePath,
        activeWorkspaceTab,
        status,
      });
      const didSchedule = scheduleReplace(nextHref);
      if (!didSchedule) return;
      trackUXEvent('workspace_status_filter_change', { tab: activeWorkspaceTab, status });
    },
    [activeWorkspaceTab, scheduleReplace, searchParams, workspacePath],
  );

  const setFavoritesView = React.useCallback(
    (view: FavoritesView) => {
      const nextHref = buildWorkspaceFavoritesViewHref({
        search: searchParams.toString(),
        workspacePath,
        view,
      });
      scheduleReplace(nextHref);
    },
    [scheduleReplace, searchParams, workspacePath],
  );

  return {
    setWorkspaceTab,
    setStatusFilter,
    setFavoritesView,
  };
}
