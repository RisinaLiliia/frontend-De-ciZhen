'use client';

import * as React from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import {
  resolveDecisionActiveRequestId,
  resolveDecisionQueueIds,
  type ActiveDecisionState,
} from '@/features/workspace/requests/requestsDecision.model';
import type { WorkspaceRequestsDecisionPanelDto } from '@/lib/api/dto/workspace';

type UseDecisionModeParams = {
  panel: WorkspaceRequestsDecisionPanelDto | null | undefined;
};

type UseDecisionModeResult = {
  state: ActiveDecisionState;
  queueIds: string[];
  enterDecisionMode: (requestId?: string | null) => void;
  openDecisionItem: (requestId: string) => void;
  exitDecisionMode: () => void;
};

export function useDecisionMode({
  panel,
}: UseDecisionModeParams): UseDecisionModeResult {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queueIds = React.useMemo(() => resolveDecisionQueueIds(panel), [panel]);
  const mode = searchParams.get('mode') === 'decision' ? 'decision' : 'default';
  const activeRequestIdParam = searchParams.get('activeRequestId');
  const [completedInSession, setCompletedInSession] = React.useState(0);
  const prevRef = React.useRef<{
    mode: ActiveDecisionState['mode'];
    activeRequestId: string | null;
    queueIds: string[];
  }>({
    mode,
    activeRequestId: activeRequestIdParam,
    queueIds,
  });

  const replaceSearch = React.useCallback((mutate: (params: URLSearchParams) => void) => {
    const params = new URLSearchParams(searchParams.toString());
    mutate(params);
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [pathname, router, searchParams]);

  React.useEffect(() => {
    if (mode !== 'decision') {
      setCompletedInSession(0);
      prevRef.current = {
        mode,
        activeRequestId: activeRequestIdParam,
        queueIds,
      };
      return;
    }

    const prev = prevRef.current;
    if (
      prev.mode === 'decision' &&
      prev.activeRequestId &&
      prev.queueIds.includes(prev.activeRequestId) &&
      !queueIds.includes(prev.activeRequestId)
    ) {
      setCompletedInSession((value) => value + 1);
    }

    prevRef.current = {
      mode,
      activeRequestId: activeRequestIdParam,
      queueIds,
    };
  }, [activeRequestIdParam, mode, queueIds]);

  React.useEffect(() => {
    if (mode !== 'decision') return;

    const resolvedActiveRequestId = resolveDecisionActiveRequestId({
      mode,
      queueIds,
      activeRequestId: activeRequestIdParam,
    });

    if (resolvedActiveRequestId === activeRequestIdParam) return;

    replaceSearch((params) => {
      params.set('section', 'requests');
      params.set('scope', 'my');
      params.set('mode', 'decision');
      if (resolvedActiveRequestId) {
        params.set('activeRequestId', resolvedActiveRequestId);
      } else {
        params.delete('activeRequestId');
      }
    });
  }, [activeRequestIdParam, mode, queueIds, replaceSearch]);

  const enterDecisionMode = React.useCallback((requestId?: string | null) => {
    const nextActiveRequestId = requestId ?? queueIds[0] ?? null;
    replaceSearch((params) => {
      params.set('section', 'requests');
      params.set('scope', 'my');
      params.set('mode', 'decision');
      if (nextActiveRequestId) {
        params.set('activeRequestId', nextActiveRequestId);
      } else {
        params.delete('activeRequestId');
      }
    });
  }, [queueIds, replaceSearch]);

  const openDecisionItem = React.useCallback((requestId: string) => {
    replaceSearch((params) => {
      params.set('section', 'requests');
      params.set('scope', 'my');
      params.set('mode', 'decision');
      params.set('activeRequestId', requestId);
    });
  }, [replaceSearch]);

  const exitDecisionMode = React.useCallback(() => {
    replaceSearch((params) => {
      params.delete('mode');
      params.delete('activeRequestId');
    });
  }, [replaceSearch]);

  return {
    state: {
      mode,
      activeRequestId: resolveDecisionActiveRequestId({
        mode,
        queueIds,
        activeRequestId: activeRequestIdParam,
      }),
      completedInSession,
    },
    queueIds,
    enterDecisionMode,
    openDecisionItem,
    exitDecisionMode,
  };
}
