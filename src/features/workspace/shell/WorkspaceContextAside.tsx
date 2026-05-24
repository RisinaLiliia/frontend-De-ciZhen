'use client';

import * as React from 'react';

import type { PublicWorkspaceSection } from '@/features/workspace/navigation/resolveActiveWorkspaceSection';
import type { WorkspaceTab } from '@/features/workspace/state';
import type { I18nKey } from '@/lib/i18n/keys';
import type { Locale } from '@/lib/i18n/t';

import { WorkspaceContextFocusPanel } from '@/features/workspace/shell/WorkspaceContextFocusPanel';

type Translator = (key: I18nKey) => string;

export function WorkspaceContextAside({
  t,
  locale,
  activePublicSection,
  activeWorkspaceTab,
  preferredRequestsRole = null,
  className,
  topSlot,
  panelRef,
  children,
}: {
  t: Translator;
  locale: Locale;
  activePublicSection: PublicWorkspaceSection | null;
  activeWorkspaceTab: WorkspaceTab;
  preferredRequestsRole?: 'customer' | 'provider' | null;
  className?: string;
  topSlot?: React.ReactNode;
  panelRef?: React.Ref<HTMLElement>;
  children?: React.ReactNode;
}) {
  return (
    <div className={['workspace-statistics-layout', 'workspace-context-rail', className ?? ''].filter(Boolean).join(' ')}>
      {topSlot}

      <WorkspaceContextFocusPanel
        t={t}
        locale={locale}
        activePublicSection={activePublicSection}
        activeWorkspaceTab={activeWorkspaceTab}
        preferredRequestsRole={preferredRequestsRole}
        panelRef={panelRef}
      />

      {children}
    </div>
  );
}
