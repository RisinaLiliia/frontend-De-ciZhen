'use client';

import * as React from 'react';

import type { I18nKey } from '@/lib/i18n/keys';
import type { WorkspacePrivateIntroProps } from '@/features/workspace/intro';
import type { Locale } from '@/lib/i18n/t';
import type { PublicWorkspaceSection } from '@/features/workspace/shell/workspace.types';
import type { WorkspaceTab } from '@/features/workspace/state';
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
  isProvidersLoading: boolean;
  isProvidersError: boolean;
  topProviders: WorkspaceAsideBaseProps['providers'];
  favoriteProviderIds: WorkspaceAsideBaseProps['favoriteProviderIds'];
  preferredRequestsRole?: WorkspacePrivateIntroProps['preferredRequestsRole'];
};

export function useWorkspacePresentation({
  t,
  locale,
  activePublicSection,
  activeWorkspaceTab,
  WorkspacePrivateIntroComponent,
  isProvidersLoading,
  isProvidersError,
  topProviders,
  favoriteProviderIds,
  preferredRequestsRole = null,
}: Args) {
  const workspaceIntroNode = React.useMemo(
    () => (
      <WorkspacePrivateIntroComponent
        {...buildWorkspacePrivateIntroProps({
          locale,
          activePublicSection,
          activeWorkspaceTab,
          preferredRequestsRole,
        })}
      />
    ),
    [
      WorkspacePrivateIntroComponent,
      activePublicSection,
      activeWorkspaceTab,
      locale,
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
