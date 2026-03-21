'use client';

import type { I18nKey } from '@/lib/i18n/keys';
import type { Locale } from '@/lib/i18n/t';
import { WorkspaceReviewsPanel } from '@/components/reviews/WorkspaceReviewsPanel';

type Translate = (key: I18nKey) => string;

type WorkspacePlatformReviewsPanelProps = {
  t: Translate;
  locale: Locale;
};

export function WorkspacePlatformReviewsPanel({ t, locale }: WorkspacePlatformReviewsPanelProps) {
  return <WorkspaceReviewsPanel t={t} locale={locale} source="platform" />;
}
