'use client';

import type { WorkspaceResponsiveFrameProps } from '@/features/workspace/shell/WorkspaceShell.types';

export function WorkspaceResponsiveFrame({
  children,
  bottomNav,
}: WorkspaceResponsiveFrameProps) {
  return (
    <>
      {children}
      {bottomNav}
    </>
  );
}
