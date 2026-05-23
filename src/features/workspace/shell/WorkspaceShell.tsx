'use client';

import * as React from 'react';

import { WorkspacePageFrame } from '@/features/workspace/shell/WorkspacePageFrame';
import type { WorkspaceShellProps } from '@/features/workspace/shell/WorkspaceShell.types';

export function WorkspaceShell({
  children,
  intro,
  filters,
  sidebar,
  aiRail,
  bottomNav,
  frameClassName,
  contentClassName,
}: WorkspaceShellProps) {
  return (
    <>
      <WorkspacePageFrame
        intro={intro}
        filters={filters}
        main={children}
        aiRail={aiRail}
        sidebar={sidebar}
        frameClassName={frameClassName}
        contentClassName={contentClassName}
      />
      {bottomNav}
    </>
  );
}
