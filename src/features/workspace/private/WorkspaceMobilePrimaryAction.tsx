'use client';

import Link from 'next/link';

import { trackUXEvent } from '@/lib/analytics';
import type { WorkspaceTab } from '@/features/workspace/requests';

type Props = {
  isWorkspaceAuthed: boolean;
  activeWorkspaceTab: WorkspaceTab;
  href: string;
  label: string;
};

export function WorkspaceMobilePrimaryAction({
  isWorkspaceAuthed,
  activeWorkspaceTab,
  href,
  label,
}: Props) {
  if (
    !isWorkspaceAuthed ||
    activeWorkspaceTab === 'favorites' ||
    activeWorkspaceTab === 'my-requests' ||
    activeWorkspaceTab === 'my-offers'
  ) {
    return null;
  }

  return (
    <div className="workspace-mobile-action">
      <Link
        href={href}
        prefetch={false}
        className="btn-primary workspace-mobile-action__btn"
        onClick={() => trackUXEvent('workspace_primary_cta_click', { tab: activeWorkspaceTab, mobile: true })}
      >
        {label}
      </Link>
    </div>
  );
}
