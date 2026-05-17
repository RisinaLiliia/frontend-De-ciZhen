'use client';

import {
  WorkspaceMobileContextSection,
  WorkspaceModeHeader,
} from '@/features/workspace/shell/WorkspaceModeHeader';
import type { WorkspaceTopbarProps } from '@/features/workspace/shell/WorkspaceShell.types';

export function WorkspaceTopbar(props: WorkspaceTopbarProps) {
  return <WorkspaceModeHeader {...props} />;
}

export { WorkspaceMobileContextSection };
