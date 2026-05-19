import type * as React from 'react';

import { cn } from '@/lib/utils/cn';
import { workspaceRightRailPanelShell } from '@/features/workspace/shared/workspaceSurfaceShell';

type WorkspaceRightRailPanelProps = React.HTMLAttributes<HTMLElement>;

export function WorkspaceRightRailPanel({ className, ...props }: WorkspaceRightRailPanelProps) {
  return <section className={cn(workspaceRightRailPanelShell(), className)} {...props} />;
}
