'use client';

import * as React from 'react';

import type { ProviderPublicDto } from '@/lib/api/dto/providers';
import type { I18nKey } from '@/lib/i18n/keys';
import type { Locale } from '@/lib/i18n/t';
import { buildWorkspacePrivateTopProviders } from '@/features/workspace/requests/workspacePrivateTopProviders.model';

type Translator = (key: I18nKey) => string;

type Params = {
  t: Translator;
  locale: Locale;
  providers: ProviderPublicDto[];
};

export function useWorkspacePrivateTopProviders({ t, locale, providers }: Params) {
  return React.useMemo(
    () => buildWorkspacePrivateTopProviders({ t, locale, providers }),
    [locale, providers, t],
  );
}
