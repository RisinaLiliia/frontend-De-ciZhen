'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';

import { BackButton } from '@/components/layout/BackButton';
import { ProviderPublicProfileContent } from '@/features/providers/publicProfile/ProviderPublicProfileContent';
import {
  buildWorkspaceProviderDetailHref,
  clearWorkspaceProviderDetailHref,
} from '@/features/workspace/providers/workspaceProviderRoute.model';

export function WorkspaceProviderDetailStage({
  providerId,
}: {
  providerId: string;
}) {
  const searchParams = useSearchParams();

  const nextPath = React.useMemo(
    () => buildWorkspaceProviderDetailHref({ currentSearch: searchParams, providerId }),
    [providerId, searchParams],
  );
  const backHref = React.useMemo(
    () => clearWorkspaceProviderDetailHref({ currentSearch: searchParams }),
    [searchParams],
  );
  const profileHrefBuilder = React.useCallback(
    (nextProviderId: string) =>
      buildWorkspaceProviderDetailHref({
        currentSearch: searchParams,
        providerId: nextProviderId,
      }),
    [searchParams],
  );
  const reviewsHrefBuilder = React.useCallback(
    (nextProviderId: string) => `${profileHrefBuilder(nextProviderId)}#reviews`,
    [profileHrefBuilder],
  );

  return (
    <div className="workspace-provider-detail-stage">
      <div className="workspace-provider-detail-stage__toolbar">
        <BackButton fallbackHref={backHref} />
      </div>
      <ProviderPublicProfileContent
        providerId={providerId}
        nextPath={nextPath}
        profileHrefBuilder={profileHrefBuilder}
        reviewsHrefBuilder={reviewsHrefBuilder}
      />
    </div>
  );
}
