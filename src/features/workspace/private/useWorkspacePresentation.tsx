'use client';

import * as React from 'react';

import type { I18nKey } from '@/lib/i18n/keys';
import type { WorkspacePrivateIntroProps } from '@/features/workspace/requests';
import type { Locale } from '@/lib/i18n/t';
import type { PublicWorkspaceSection } from '@/features/workspace/shell/workspace.types';
import type { WorkspaceTab } from '@/features/workspace/requests/workspace.types';
import {
  buildWorkspaceAsideBaseProps,
  buildWorkspacePrivateIntroProps,
  type WorkspaceAsideBaseProps,
} from '@/features/workspace/private/workspacePresentation.model';

type Translator = (key: I18nKey) => string;

type Args = {
  t: Translator;
  locale: Locale;
  activePublicSection: PublicWorkspaceSection | null;
  activeWorkspaceTab: WorkspaceTab;
  WorkspacePrivateIntroComponent: React.ComponentType<WorkspacePrivateIntroProps>;
  createRequestHref: string;
  isProvidersLoading: boolean;
  isProvidersError: boolean;
  topProviders: WorkspaceAsideBaseProps['providers'];
  favoriteProviderIds: WorkspaceAsideBaseProps['favoriteProviderIds'];
  showQuickAction?: boolean;
  preferredRequestsRole?: WorkspacePrivateIntroProps['preferredRequestsRole'];
};

export function useWorkspacePresentation({
  t,
  locale,
  activePublicSection,
  activeWorkspaceTab,
  WorkspacePrivateIntroComponent,
  createRequestHref,
  isProvidersLoading,
  isProvidersError,
  topProviders,
  favoriteProviderIds,
  showQuickAction = true,
  preferredRequestsRole = null,
}: Args) {
  const workspaceIntroNode = React.useMemo(
    () => (
      <WorkspacePrivateIntroComponent
        {...buildWorkspacePrivateIntroProps({
          locale,
          activePublicSection,
          activeWorkspaceTab,
          createRequestHref,
          showQuickAction,
          preferredRequestsRole,
        })}
      />
    ),
    [
      WorkspacePrivateIntroComponent,
      activePublicSection,
      activeWorkspaceTab,
      createRequestHref,
      locale,
      showQuickAction,
      preferredRequestsRole,
    ],
  );

  const workspaceAsideBaseProps = React.useMemo<WorkspaceAsideBaseProps>(
    () =>
      buildWorkspaceAsideBaseProps({
        t,
        isProvidersLoading,
        isProvidersError,
        topProviders,
        favoriteProviderIds,
      }),
    [favoriteProviderIds, isProvidersError, isProvidersLoading, t, topProviders],
  );

  return {
    workspaceIntroNode,
    workspaceAsideBaseProps,
  };
}
