'use client';

import * as React from 'react';

import type { ProviderPublicDto } from '@/lib/api/dto/providers';
import type { I18nKey } from '@/lib/i18n/keys';
import { buildWorkspacePrivateTopProviders } from '@/features/workspace/requests/workspacePrivateTopProviders.model';

type Translator = (key: I18nKey) => string;

type Params = {
  t: Translator;
  providers: ProviderPublicDto[];
};

export function useWorkspacePrivateTopProviders({ t, providers }: Params) {
  return React.useMemo(
    () => buildWorkspacePrivateTopProviders({ t, providers }),
    [providers, t],
  );
}
