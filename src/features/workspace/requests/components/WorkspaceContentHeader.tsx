'use client';

import Link from 'next/link';
import * as React from 'react';

import { SectionHeader } from '@/components/ui/SectionHeader';
import { I18N_KEYS } from '@/lib/i18n/keys';
import type { I18nKey } from '@/lib/i18n/keys';
import type { WorkspaceTab } from '../../state';
import type { WorkspaceContentPrimaryAction } from '../workspaceContent.types';
import { getWorkspaceSectionSubtitle, getWorkspaceTabTitles } from '../workspace.content';

type Props = {
  t: (key: I18nKey) => string;
  activeWorkspaceTab: WorkspaceTab;
  showWorkspaceHeading: boolean;
  primaryAction: WorkspaceContentPrimaryAction;
  onPrimaryActionClick: () => void;
};

function shouldRenderPrimaryAction(activeWorkspaceTab: WorkspaceTab) {
  return (
    activeWorkspaceTab !== 'my-requests' &&
    activeWorkspaceTab !== 'my-offers' &&
    activeWorkspaceTab !== 'profile' &&
    activeWorkspaceTab !== 'reviews'
  );
}

export function WorkspaceContentHeader({
  t,
  activeWorkspaceTab,
  showWorkspaceHeading,
  primaryAction,
  onPrimaryActionClick,
}: Props) {
  const workspaceTabTitles = React.useMemo(() => getWorkspaceTabTitles(t), [t]);
  const workspaceSectionSubtitle = React.useMemo(
    () => getWorkspaceSectionSubtitle(t, activeWorkspaceTab),
    [activeWorkspaceTab, t],
  );

  return (
    <SectionHeader
      className="requests-header"
      title={workspaceTabTitles[activeWorkspaceTab] ?? t(I18N_KEYS.requestsPage.navReviews)}
      subtitle={showWorkspaceHeading ? workspaceSectionSubtitle : undefined}
      titleId={showWorkspaceHeading ? 'workspace-section-title' : undefined}
      subtitleId={showWorkspaceHeading ? 'workspace-section-subtitle' : undefined}
      hideHeading={!showWorkspaceHeading}
      actions={
        shouldRenderPrimaryAction(activeWorkspaceTab) ? (
          <Link
            href={primaryAction.href}
            prefetch={false}
            className="btn-primary requests-primary-cta"
            onClick={onPrimaryActionClick}
          >
            {primaryAction.label}
          </Link>
        ) : null
      }
    />
  );
}
