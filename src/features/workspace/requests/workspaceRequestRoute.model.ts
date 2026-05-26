import { buildWorkspaceHref } from '@/features/workspace/navigation/workspaceLinks';
import {
  DEFAULT_PRIVATE_WORKSPACE_REQUESTS_PERIOD,
  resolveWorkspaceRequestsPeriod,
  type WorkspaceRequestsScope,
} from '@/features/workspace/state/workspaceRequestsScope.model';

export type WorkspaceRequestRouteIntent = 'view' | 'edit' | 'responses' | 'contract' | 'review';
export type WorkspaceRequestRoutePanel = 'detail' | 'offer';

export const WORKSPACE_REQUEST_CREATE_QUERY_KEY = 'requestCreate';
export const WORKSPACE_REQUEST_ID_QUERY_KEY = 'requestId';
export const WORKSPACE_REQUEST_INTENT_QUERY_KEY = 'requestIntent';
export const WORKSPACE_REQUEST_PANEL_QUERY_KEY = 'requestPanel';

export const DEFAULT_PRIVATE_WORKSPACE_CREATE_REQUEST_HREF =
  '/workspace?section=requests&scope=my&period=90d&range=90d&requestCreate=1';

type SearchSource =
  | string
  | URLSearchParams
  | {
      get(name: string): string | null;
      toString(): string;
    };

type SearchReader = {
  get(name: string): string | null;
};

function normalizeSearchParams(currentSearch: SearchSource) {
  if (typeof currentSearch === 'string') {
    return new URLSearchParams(currentSearch);
  }

  return new URLSearchParams(currentSearch.toString());
}

function ensurePrivateRequestsDefaults(searchParams: URLSearchParams) {
  const period = resolveWorkspaceRequestsPeriod(
    searchParams.get('period') ?? searchParams.get('range') ?? DEFAULT_PRIVATE_WORKSPACE_REQUESTS_PERIOD,
  );
  searchParams.set('period', period);
  searchParams.set('range', period);
}

export function resolveWorkspaceRequestRouteIntent(
  value: string | null,
): WorkspaceRequestRouteIntent {
  if (value === 'edit' || value === 'responses' || value === 'contract' || value === 'review') {
    return value;
  }

  return 'view';
}

export function resolveWorkspaceRequestRoutePanel(
  value: string | null,
): WorkspaceRequestRoutePanel {
  return value === 'offer' ? 'offer' : 'detail';
}

export function readWorkspaceRequestRouteState(searchParams: SearchReader) {
  return {
    requestCreate: searchParams.get(WORKSPACE_REQUEST_CREATE_QUERY_KEY) === '1',
    requestId: searchParams.get(WORKSPACE_REQUEST_ID_QUERY_KEY)?.trim() || null,
    requestIntent: resolveWorkspaceRequestRouteIntent(
      searchParams.get(WORKSPACE_REQUEST_INTENT_QUERY_KEY),
    ),
    requestPanel: resolveWorkspaceRequestRoutePanel(
      searchParams.get(WORKSPACE_REQUEST_PANEL_QUERY_KEY),
    ),
  };
}

export function buildWorkspaceCreateRequestHref(params: {
  currentSearch: SearchSource;
}) {
  const searchParams = normalizeSearchParams(params.currentSearch);
  ensurePrivateRequestsDefaults(searchParams);

  return buildWorkspaceHref({
    currentSearch: searchParams,
    section: 'requests',
    patch: {
      scope: 'my',
      [WORKSPACE_REQUEST_CREATE_QUERY_KEY]: '1',
      [WORKSPACE_REQUEST_ID_QUERY_KEY]: null,
      [WORKSPACE_REQUEST_INTENT_QUERY_KEY]: null,
      [WORKSPACE_REQUEST_PANEL_QUERY_KEY]: null,
    },
  });
}

export function buildWorkspaceRequestResponsesHref(params: {
  currentSearch: SearchSource;
  requestId: string;
}) {
  return buildWorkspaceRequestOverlayHref({
    currentSearch: params.currentSearch,
    requestId: params.requestId,
    scope: 'my',
    intent: 'responses',
    panel: 'detail',
  });
}

export function buildWorkspaceRequestOverlayHref(params: {
  currentSearch: SearchSource;
  requestId: string;
  scope?: WorkspaceRequestsScope;
  intent?: WorkspaceRequestRouteIntent;
  panel?: WorkspaceRequestRoutePanel;
}) {
  const searchParams = normalizeSearchParams(params.currentSearch);
  const scope = params.scope ?? 'market';

  if (scope === 'my') {
    ensurePrivateRequestsDefaults(searchParams);
  }

  return buildWorkspaceHref({
    currentSearch: searchParams,
    section: 'requests',
    patch: {
      scope,
      [WORKSPACE_REQUEST_ID_QUERY_KEY]: params.requestId,
      [WORKSPACE_REQUEST_INTENT_QUERY_KEY]:
        params.intent && params.intent !== 'view' ? params.intent : null,
      [WORKSPACE_REQUEST_PANEL_QUERY_KEY]:
        params.panel && params.panel !== 'detail' ? params.panel : null,
      [WORKSPACE_REQUEST_CREATE_QUERY_KEY]: null,
    },
  });
}

export function clearWorkspaceRequestOverlayHref(params: {
  currentSearch: SearchSource;
}) {
  const searchParams = normalizeSearchParams(params.currentSearch);

  return buildWorkspaceHref({
    currentSearch: searchParams,
    patch: {
      [WORKSPACE_REQUEST_CREATE_QUERY_KEY]: null,
      [WORKSPACE_REQUEST_ID_QUERY_KEY]: null,
      [WORKSPACE_REQUEST_INTENT_QUERY_KEY]: null,
      [WORKSPACE_REQUEST_PANEL_QUERY_KEY]: null,
    },
  });
}
