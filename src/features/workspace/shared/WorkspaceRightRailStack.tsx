'use client';

import type * as React from 'react';

import { cn } from '@/lib/utils/cn';

type WorkspaceRightRailStackProps<T extends React.ElementType = 'div'> = {
  as?: T;
  className?: string;
} & Omit<React.ComponentPropsWithoutRef<T>, 'as' | 'className'>;

export function WorkspaceRightRailStack<T extends React.ElementType = 'div'>({
  as,
  className,
  ...props
}: WorkspaceRightRailStackProps<T>) {
  const Component = as ?? 'div';

  return <Component className={cn('workspace-right-rail-stack', className)} {...props} />;
}
