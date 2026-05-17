'use client';

import * as React from 'react';

import { WorkspacePageFrame } from '@/features/workspace/shell/WorkspacePageFrame';
import { WorkspaceResponsiveFrame } from '@/features/workspace/shell/WorkspaceResponsiveFrame';
import type { WorkspaceShellProps } from '@/features/workspace/shell/WorkspaceShell.types';

type IntroSlotProps = {
  navHeaderSlot?: React.ReactNode;
  leftColumnSlot?: React.ReactNode;
  preferredRequestsRole?: 'customer' | 'provider' | null;
};

function attachWorkspaceTopbar(intro: React.ReactNode, topbar?: React.ReactNode) {
  if (!topbar || !React.isValidElement(intro)) return intro;

  return React.cloneElement(
    intro as React.ReactElement<IntroSlotProps>,
    {
      navHeaderSlot: topbar,
    },
  );
}

export function WorkspaceShell({
  children,
  intro,
  topbar,
  sidebar,
  aiRail,
  bottomNav,
  frameClassName,
  contentClassName,
}: WorkspaceShellProps) {
  const introWithTopbar = React.useMemo(
    () => attachWorkspaceTopbar(intro, topbar),
    [intro, topbar],
  );

  return (
    <WorkspaceResponsiveFrame bottomNav={bottomNav}>
      <WorkspacePageFrame
        intro={introWithTopbar}
        main={children}
        aiRail={aiRail}
        sidebar={sidebar}
        frameClassName={frameClassName}
        contentClassName={contentClassName}
      />
    </WorkspaceResponsiveFrame>
  );
}
