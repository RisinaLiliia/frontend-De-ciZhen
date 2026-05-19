'use client';

import * as React from 'react';

import { WorkspacePageFrame } from '@/features/workspace/shell/WorkspacePageFrame';
import { WorkspaceResponsiveFrame } from '@/features/workspace/shell/WorkspaceResponsiveFrame';
import type { WorkspaceShellProps } from '@/features/workspace/shell/WorkspaceShell.types';

export function WorkspaceShell({
  children,
  intro,
  sidebar,
  aiRail,
  bottomNav,
  frameClassName,
  contentClassName,
}: WorkspaceShellProps) {
  return (
    <WorkspaceResponsiveFrame bottomNav={bottomNav}>
      <WorkspacePageFrame
        intro={intro}
        main={children}
        aiRail={aiRail}
        sidebar={sidebar}
        frameClassName={frameClassName}
        contentClassName={contentClassName}
      />
    </WorkspaceResponsiveFrame>
  );
}
