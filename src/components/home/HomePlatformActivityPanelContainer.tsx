/* src/components/home/HomePlatformActivityPanelContainer.tsx */
'use client';

import type { I18nKey } from '@/lib/i18n/keys';
import type { Locale } from '@/lib/i18n/t';
import { HomePlatformActivityPanel } from '@/components/home/HomePlatformActivityPanel';
import { useHomePlatformActivityPanel } from '@/components/home/useHomePlatformActivityPanel';

type HomePlatformActivityPanelContainerProps = {
  t: (key: I18nKey) => string;
  locale: Locale;
};

export function HomePlatformActivityPanelContainer({
  t,
  locale,
}: HomePlatformActivityPanelContainerProps) {
  const viewModel = useHomePlatformActivityPanel({ t, locale });

  return <HomePlatformActivityPanel {...viewModel} />;
}
