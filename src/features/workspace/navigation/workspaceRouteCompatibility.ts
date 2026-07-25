'use client';

import type { ReadonlyURLSearchParams } from 'next/navigation';

import {
  type PublicWorkspaceSection,
  resolveCanonicalWorkspaceSection,
  resolvePublicWorkspaceSection,
  type WorkspaceSection,
} from '@/features/workspace/navigation/resolveActiveWorkspaceSection';
import { buildWorkspaceHref } from '@/features/workspace/navigation/workspaceLinks';
import {
  buildWorkspacePrivateRequestsHref,
  buildWorkspaceRequestsScopeHref,
  isWorkspaceTab,
  resolveWorkspaceTab,
  type WorkspaceRequestsRole,
  type WorkspaceRequestsState,
  type WorkspaceTab,
} from '@/features/workspace/state';

export type WorkspaceRouteAuthStatus =
  | 'idle'
  | 'loading'
  | 'authenticated'
  | 'unauthenticated';

const LEGACY_WORKSPACE_ROUTE_REMOVE_KEYS = ['tab', 'status', 'fav', 'reviewRole'] as const;

type SearchReader = string | URLSearchParams | ReadonlyURLSearchParams;

function cloneSearchParams(currentSearch: SearchReader) {
  return typeof currentSearch === 'string'
    ? new URLSearchParams(currentSearch)
    : new URLSearchParams(currentSearch.toString());
}

function buildWorkspaceHrefFromSearchParams(searchParams: URLSearchParams) {
  const query = searchParams.toString();
  return query ? `/workspace?${query}` : '/workspace';
}

function parseWorkspaceHrefSearchParams(href: string) {
  const queryIndex = href.indexOf('?');
  return new URLSearchParams(queryIndex >= 0 ? href.slice(queryIndex + 1) : '');
}

function resolveLegacyWorkspaceRole(tab: WorkspaceTab | null): WorkspaceRequestsRole | undefined {
  if (tab === 'my-requests') return 'customer';
  if (tab === 'my-offers') return 'provider';
  return undefined;
}

function resolveLegacyWorkspaceState(
  tab: WorkspaceTab | null,
  status: string | null,
): WorkspaceRequestsState | undefined {
  if (status === 'open') return 'attention';
  if (status === 'in_progress') return 'execution';
  if (status === 'completed') return 'completed';
  if (tab === 'completed-jobs') return 'completed';
  return undefined;
}

export function buildWorkspaceLegacyTabCanonicalHref(params: {
  currentSearch: SearchReader;
  isAuthed: boolean;
}) {
  const searchParams = cloneSearchParams(params.currentSearch);
  const rawTab = searchParams.get('tab');
  const legacyTab = isWorkspaceTab(rawTab) ? rawTab : null;

  if (!legacyTab) {
    return buildWorkspaceHrefFromSearchParams(searchParams);
  }

  if (legacyTab === 'reviews') {
    return buildWorkspaceHref({
      currentSearch: searchParams,
      section: 'reviews',
      removeKeys: [...LEGACY_WORKSPACE_ROUTE_REMOVE_KEYS],
    });
  }

  if (legacyTab === 'profile') {
    return buildWorkspaceHref({
      currentSearch: searchParams,
      section: 'profile',
      removeKeys: [...LEGACY_WORKSPACE_ROUTE_REMOVE_KEYS],
    });
  }

  if (legacyTab === 'favorites') {
    return buildWorkspaceHref({
      currentSearch: searchParams,
      section: 'providers',
      removeKeys: [...LEGACY_WORKSPACE_ROUTE_REMOVE_KEYS],
    });
  }

  if (!params.isAuthed) {
    return buildWorkspaceHref({
      currentSearch: searchParams,
      section: 'requests',
      patch: {
        scope: 'market',
      },
      removeKeys: [...LEGACY_WORKSPACE_ROUTE_REMOVE_KEYS, 'role', 'state'],
    });
  }

  return buildWorkspacePrivateRequestsHref({
    currentSearch: searchParams,
    role: resolveLegacyWorkspaceRole(legacyTab),
    state: resolveLegacyWorkspaceState(legacyTab, searchParams.get('status')),
  });
}

export function normalizeWorkspaceRouteSearchParams(params: {
  searchParams: SearchReader;
  authStatus: WorkspaceRouteAuthStatus;
}) {
  const currentSearchParams = cloneSearchParams(params.searchParams);
  const rawTab = currentSearchParams.get('tab');
  const legacyTab = isWorkspaceTab(rawTab) ? rawTab : null;
  const hasKnownAuth =
    params.authStatus === 'authenticated' || params.authStatus === 'unauthenticated';

  let normalizedSearchParams = new URLSearchParams(currentSearchParams.toString());

  if (legacyTab && hasKnownAuth) {
    normalizedSearchParams = parseWorkspaceHrefSearchParams(
      buildWorkspaceLegacyTabCanonicalHref({
        currentSearch: currentSearchParams,
        isAuthed: params.authStatus === 'authenticated',
      }),
    );
  } else if (!legacyTab) {
    const sectionParam = currentSearchParams.get('section');
    const canonicalSection = resolveCanonicalWorkspaceSection(sectionParam);

    if (sectionParam && canonicalSection && sectionParam !== canonicalSection) {
      normalizedSearchParams.set('section', canonicalSection);
    }
  }

  if (params.authStatus === 'unauthenticated') {
    const routeSection = resolvePublicWorkspaceSection(normalizedSearchParams.get('section'));

    if (routeSection === 'requests' && normalizedSearchParams.get('scope') === 'my') {
      normalizedSearchParams = parseWorkspaceHrefSearchParams(
        buildWorkspaceRequestsScopeHref({
          currentSearch: normalizedSearchParams,
          scope: 'market',
        }),
      );
    }
  }

  return normalizedSearchParams;
}

export function resolveWorkspaceRouteCompatibility(params: {
  searchParams: SearchReader;
  authStatus: WorkspaceRouteAuthStatus;
}) {
  const currentSearchParams = cloneSearchParams(params.searchParams);
  const canonicalSearchParams = normalizeWorkspaceRouteSearchParams(params);
  const currentWorkspaceHref = buildWorkspaceHrefFromSearchParams(currentSearchParams);
  const canonicalWorkspaceHref = buildWorkspaceHrefFromSearchParams(canonicalSearchParams);
  const routeSection = resolveCanonicalWorkspaceSection(canonicalSearchParams.get('section'));
  const publicSection = resolvePublicWorkspaceSection(canonicalSearchParams.get('section'));
  const hasExplicitWorkspaceTab = isWorkspaceTab(currentSearchParams.get('tab'));
  const activeWorkspaceTab = resolveWorkspaceTab(currentSearchParams.get('tab'));
  const guestChatRedirectHref =
    params.authStatus === 'unauthenticated' && publicSection === 'chat'
      ? `/auth/login?next=${encodeURIComponent(canonicalWorkspaceHref)}`
      : null;
  const redirectHref =
    guestChatRedirectHref
    ?? (canonicalWorkspaceHref !== currentWorkspaceHref ? canonicalWorkspaceHref : null);

  return {
    activeWorkspaceTab,
    canonicalSearchParams,
    canonicalWorkspaceHref,
    currentWorkspaceHref,
    hasExplicitWorkspaceTab,
    isGuestChatRedirect: guestChatRedirectHref !== null,
    publicSection,
    redirectHref,
    routeSection,
  } as const satisfies {
    activeWorkspaceTab: WorkspaceTab;
    canonicalSearchParams: URLSearchParams;
    canonicalWorkspaceHref: string;
    currentWorkspaceHref: string;
    hasExplicitWorkspaceTab: boolean;
    isGuestChatRedirect: boolean;
    publicSection: PublicWorkspaceSection | null;
    redirectHref: string | null;
    routeSection: WorkspaceSection | null;
  };
}
