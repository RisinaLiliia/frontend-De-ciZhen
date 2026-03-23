'use client';

import type { I18nKey } from '@/lib/i18n/keys';
import type { Locale } from '@/lib/i18n/t';
import { WorkspacePlatformReviewsMain } from './WorkspacePlatformReviewsMain';

type Translate = (key: I18nKey) => string;

type WorkspacePlatformReviewsPanelProps = {
  t: Translate;
  locale: Locale;
  showInlineRail?: boolean;
};

export function WorkspacePlatformReviewsPanel({
  t,
  locale,
  showInlineRail = false,
}: WorkspacePlatformReviewsPanelProps) {
  return <WorkspacePlatformReviewsMain t={t} locale={locale} showInlineRail={showInlineRail} />;
}
