import { describe, expect, it } from 'vitest';

import {
  buildWorkspaceLegacyTabCanonicalHref,
  normalizeWorkspaceRouteSearchParams,
  resolveWorkspaceRouteCompatibility,
} from '@/features/workspace/navigation/workspaceRouteCompatibility';

describe('workspaceRouteCompatibility', () => {
  it('keeps canonical workspace urls unchanged when no legacy params are present', () => {
    const result = resolveWorkspaceRouteCompatibility({
      searchParams: 'section=requests&scope=market&period=90d&range=90d',
      authStatus: 'unauthenticated',
    });

    expect(result.canonicalWorkspaceHref).toBe('/workspace?section=requests&scope=market&period=90d&range=90d');
    expect(result.redirectHref).toBeNull();
    expect(result.routeSection).toBe('requests');
  });

  it('normalizes legacy section aliases into canonical sections', () => {
    const statsRoute = resolveWorkspaceRouteCompatibility({
      searchParams: 'section=statistics&period=90d',
      authStatus: 'authenticated',
    });
    const requestsRoute = resolveWorkspaceRouteCompatibility({
      searchParams: 'section=orders',
      authStatus: 'unauthenticated',
    });

    expect(statsRoute.canonicalWorkspaceHref).toBe('/workspace?section=stats&period=90d');
    expect(statsRoute.redirectHref).toBe('/workspace?section=stats&period=90d');
    expect(requestsRoute.canonicalWorkspaceHref).toBe('/workspace?section=requests');
    expect(requestsRoute.redirectHref).toBe('/workspace?section=requests');
  });

  it('normalizes authenticated legacy tab routes into canonical private requests params', () => {
    expect(
      buildWorkspaceLegacyTabCanonicalHref({
        currentSearch: 'tab=my-offers&status=in_progress',
        isAuthed: true,
      }),
    ).toBe('/workspace?section=requests&scope=my&period=30d&range=30d&role=provider&state=execution');
  });

  it('normalizes guest legacy tab routes into canonical market requests params', () => {
    expect(
      buildWorkspaceLegacyTabCanonicalHref({
        currentSearch: 'tab=completed-jobs&status=completed&fav=providers',
        isAuthed: false,
      }),
    ).toBe('/workspace?section=requests&scope=market');
  });

  it('gives explicit legacy tab precedence over conflicting canonical section params', () => {
    const result = resolveWorkspaceRouteCompatibility({
      searchParams: 'section=stats&tab=profile&viewerMode=customer',
      authStatus: 'authenticated',
    });

    expect(result.canonicalWorkspaceHref).toBe('/workspace?section=profile&viewerMode=customer');
    expect(result.redirectHref).toBe('/workspace?section=profile&viewerMode=customer');
    expect(result.routeSection).toBe('profile');
  });

  it('applies alias normalization before guest scope downgrades in a single redirect', () => {
    const result = resolveWorkspaceRouteCompatibility({
      searchParams: 'section=orders&scope=my&role=provider&state=execution',
      authStatus: 'unauthenticated',
    });

    expect(result.canonicalWorkspaceHref).toBe('/workspace?section=requests&scope=market');
    expect(result.redirectHref).toBe('/workspace?section=requests&scope=market');
  });

  it('redirects guest chat routes to login but keeps authenticated chat routes canonical', () => {
    const guestResult = resolveWorkspaceRouteCompatibility({
      searchParams: 'section=chat&conversation=thread-1',
      authStatus: 'unauthenticated',
    });
    const authedResult = resolveWorkspaceRouteCompatibility({
      searchParams: 'section=chat&conversation=thread-1',
      authStatus: 'authenticated',
    });

    expect(guestResult.redirectHref).toBe(
      '/auth/login?next=%2Fworkspace%3Fsection%3Dchat%26conversation%3Dthread-1',
    );
    expect(guestResult.isGuestChatRedirect).toBe(true);
    expect(authedResult.redirectHref).toBeNull();
    expect(authedResult.routeSection).toBe('chat');
  });

  it('removes legacy params after canonicalization while preserving canonical route state', () => {
    const params = normalizeWorkspaceRouteSearchParams({
      searchParams: 'tab=favorites&status=all&fav=providers&reviewRole=client&viewerMode=provider',
      authStatus: 'authenticated',
    });

    expect(params.get('section')).toBe('providers');
    expect(params.get('viewerMode')).toBe('provider');
    expect(params.get('tab')).toBeNull();
    expect(params.get('status')).toBeNull();
    expect(params.get('fav')).toBeNull();
    expect(params.get('reviewRole')).toBeNull();
  });
});
