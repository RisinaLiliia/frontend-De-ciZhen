import type * as React from 'react';

import { cn } from '@/lib/utils/cn';
import { workspacePanelShell } from '@/features/workspace/shared/workspaceSurfaceShell';

type WorkspacePanelShellProps = React.HTMLAttributes<HTMLElement>;

export function WorkspacePanelShell({ className, ...props }: WorkspacePanelShellProps) {
  return <section className={cn(workspacePanelShell(), className)} {...props} />;
}
