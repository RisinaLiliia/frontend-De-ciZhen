import { buildWorkspaceHref } from '@/features/workspace/navigation/workspaceLinks';
import {
  DEFAULT_PRIVATE_WORKSPACE_REQUESTS_PERIOD,
  resolveWorkspaceRequestsPeriod,
  type WorkspaceRequestsScope,
} from '@/features/workspace/state/workspaceRequestsScope.model';

export type WorkspaceRequestRouteIntent = 'view' | 'edit' | 'responses' | 'contract' | 'review';
export type WorkspaceRequestRoutePanel = 'detail' | 'offer';
export type WorkspaceRequestRouteMode = 'create' | 'edit';
export type WorkspaceRequestRouteProfile = 'customer';

export const WORKSPACE_REQUEST_CREATE_QUERY_KEY = 'requestCreate';
export const WORKSPACE_REQUEST_ID_QUERY_KEY = 'requestId';
export const WORKSPACE_REQUEST_INTENT_QUERY_KEY = 'requestIntent';
export const WORKSPACE_REQUEST_PANEL_QUERY_KEY = 'requestPanel';
export const WORKSPACE_REQUEST_MODE_QUERY_KEY = 'mode';
export const WORKSPACE_REQUEST_PROFILE_QUERY_KEY = 'requestProfile';

export const DEFAULT_PRIVATE_WORKSPACE_CREATE_REQUEST_HREF =
  '/workspace?section=requests&scope=my&period=90d&range=90d&mode=create';

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

export function resolveWorkspaceRequestRouteProfile(
  value: string | null,
): WorkspaceRequestRouteProfile | null {
  return value === 'customer' ? 'customer' : null;
}

export function readWorkspaceRequestRouteState(searchParams: SearchReader) {
  const mode = searchParams.get(WORKSPACE_REQUEST_MODE_QUERY_KEY);

  return {
    requestCreate:
      mode === 'create' || searchParams.get(WORKSPACE_REQUEST_CREATE_QUERY_KEY) === '1',
    requestId: searchParams.get(WORKSPACE_REQUEST_ID_QUERY_KEY)?.trim() || null,
    requestIntent:
      mode === 'edit'
        ? 'edit'
        : resolveWorkspaceRequestRouteIntent(
            searchParams.get(WORKSPACE_REQUEST_INTENT_QUERY_KEY),
          ),
    requestPanel: resolveWorkspaceRequestRoutePanel(
      searchParams.get(WORKSPACE_REQUEST_PANEL_QUERY_KEY),
    ),
    requestProfile: resolveWorkspaceRequestRouteProfile(
      searchParams.get(WORKSPACE_REQUEST_PROFILE_QUERY_KEY),
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
      [WORKSPACE_REQUEST_MODE_QUERY_KEY]: 'create',
      [WORKSPACE_REQUEST_CREATE_QUERY_KEY]: null,
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
      [WORKSPACE_REQUEST_MODE_QUERY_KEY]:
        params.intent === 'edit' ? 'edit' : null,
      [WORKSPACE_REQUEST_ID_QUERY_KEY]: params.requestId,
      [WORKSPACE_REQUEST_INTENT_QUERY_KEY]:
        params.intent && params.intent !== 'view' && params.intent !== 'edit' ? params.intent : null,
      [WORKSPACE_REQUEST_PANEL_QUERY_KEY]:
        params.panel && params.panel !== 'detail' ? params.panel : null,
      [WORKSPACE_REQUEST_CREATE_QUERY_KEY]: null,
    },
  });
}

export function buildWorkspaceRequestDetailHref(params: {
  currentSearch: SearchSource;
  requestId: string;
}) {
  return buildWorkspaceRequestOverlayHref({
    currentSearch: params.currentSearch,
    requestId: params.requestId,
    scope: 'market',
    intent: 'view',
    panel: 'detail',
  });
}

export function buildWorkspaceOwnRequestDetailHref(params: {
  currentSearch: SearchSource;
  requestId: string;
}) {
  return buildWorkspaceRequestOverlayHref({
    currentSearch: params.currentSearch,
    requestId: params.requestId,
    scope: 'my',
    intent: 'view',
    panel: 'detail',
  });
}

export function buildWorkspaceRequestEditHref(params: {
  currentSearch: SearchSource;
  requestId: string;
}) {
  return buildWorkspaceRequestOverlayHref({
    currentSearch: params.currentSearch,
    requestId: params.requestId,
    scope: 'my',
    intent: 'edit',
    panel: 'detail',
  });
}

export function clearWorkspaceRequestOverlayHref(params: {
  currentSearch: SearchSource;
}) {
  const searchParams = normalizeSearchParams(params.currentSearch);

  return buildWorkspaceHref({
    currentSearch: searchParams,
    patch: {
      [WORKSPACE_REQUEST_MODE_QUERY_KEY]: null,
      [WORKSPACE_REQUEST_CREATE_QUERY_KEY]: null,
      [WORKSPACE_REQUEST_ID_QUERY_KEY]: null,
      [WORKSPACE_REQUEST_INTENT_QUERY_KEY]: null,
      [WORKSPACE_REQUEST_PANEL_QUERY_KEY]: null,
      [WORKSPACE_REQUEST_PROFILE_QUERY_KEY]: null,
    },
  });
}

export function buildWorkspaceRequestCustomerProfileHref(params: {
  currentSearch: SearchSource;
  requestId: string;
  scope?: WorkspaceRequestsScope;
  intent?: WorkspaceRequestRouteIntent;
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
      [WORKSPACE_REQUEST_MODE_QUERY_KEY]:
        params.intent === 'edit' ? 'edit' : null,
      [WORKSPACE_REQUEST_ID_QUERY_KEY]: params.requestId,
      [WORKSPACE_REQUEST_INTENT_QUERY_KEY]:
        params.intent && params.intent !== 'view' && params.intent !== 'edit' ? params.intent : null,
      [WORKSPACE_REQUEST_PANEL_QUERY_KEY]: null,
      [WORKSPACE_REQUEST_CREATE_QUERY_KEY]: null,
      [WORKSPACE_REQUEST_PROFILE_QUERY_KEY]: 'customer',
    },
  });
}

export function clearWorkspaceRequestProfileHref(params: {
  currentSearch: SearchSource;
}) {
  const searchParams = normalizeSearchParams(params.currentSearch);

  return buildWorkspaceHref({
    currentSearch: searchParams,
    patch: {
      [WORKSPACE_REQUEST_PROFILE_QUERY_KEY]: null,
    },
  });
}
