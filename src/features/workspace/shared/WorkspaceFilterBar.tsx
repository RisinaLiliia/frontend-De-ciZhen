import * as React from 'react';

import { cn } from '@/lib/utils/cn';

type Props = {
  children: React.ReactNode;
  className?: string;
};

export function WorkspaceFilterBar({ children, className }: Props) {
  return <div className={cn('workspace-filter-bar', className)}>{children}</div>;
}

export default WorkspaceFilterBar;
