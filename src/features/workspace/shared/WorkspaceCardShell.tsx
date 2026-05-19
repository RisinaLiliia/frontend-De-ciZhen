import type * as React from 'react';

import { cn } from '@/lib/utils/cn';
import { workspaceCardShell } from '@/features/workspace/shared/workspaceSurfaceShell';

type WorkspaceCardShellProps = React.HTMLAttributes<HTMLDivElement>;

export function WorkspaceCardShell({ className, ...props }: WorkspaceCardShellProps) {
  return <div className={cn(workspaceCardShell(), className)} {...props} />;
}
