'use client';

import * as React from 'react';

type WorkspaceContextBarProps = {
  children: React.ReactNode;
  className?: string;
};

export function WorkspaceContextBar({ children, className }: WorkspaceContextBarProps) {
  return (
    <div className={['workspace-context-bar', className ?? ''].filter(Boolean).join(' ')}>
      {children}
    </div>
  );
}
