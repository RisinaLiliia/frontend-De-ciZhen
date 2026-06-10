'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { RequestDialogShell } from '@/features/workspace/overlays/RequestDialogShell';
import { ProviderPublicProfileContent } from '@/features/providers/profile/ProviderPublicProfileContent';
import { I18N_KEYS } from '@/lib/i18n/keys';
import { useI18n } from '@/lib/i18n/I18nProvider';
import { useT } from '@/lib/i18n/useT';
import {
  buildWorkspaceProviderDetailHref,
  clearWorkspaceProviderDetailHref,
} from '@/features/workspace/providers/workspaceProviderRoute.model';

export function WorkspaceProviderDetailStage({ providerId }: { providerId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { locale } = useI18n();
  const t = useT();

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
  const handleClose = React.useCallback(() => {
    router.push(backHref);
  }, [backHref, router]);

  return (
    <RequestDialogShell
      locale={locale}
      ariaLabel={t(I18N_KEYS.provider.unnamed)}
      onClose={handleClose}
      isLoading={false}
      isError={false}
      errorTitle=""
      errorBody=""
      presentation="inline"
    >
      <ProviderPublicProfileContent
        providerId={providerId}
        nextPath={nextPath}
        profileHrefBuilder={profileHrefBuilder}
        reviewsHrefBuilder={reviewsHrefBuilder}
        surface="dialog"
      />
    </RequestDialogShell>
  );
}
