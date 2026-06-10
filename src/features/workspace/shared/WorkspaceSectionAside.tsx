'use client';

import * as React from 'react';

import type { WorkspaceUnifiedRailModel } from './WorkspaceUnifiedRail';
import { WorkspaceUnifiedRail } from './WorkspaceUnifiedRail';
import { WorkspaceRightRailStack } from './WorkspaceRightRailStack';

type Props = {
  model?: WorkspaceUnifiedRailModel | null;
  isLoading?: boolean;
  children?: React.ReactNode;
  className?: string;
  hideBelowTablet?: boolean;
};

export function WorkspaceSectionAside({
  model,
  isLoading = false,
  children,
  className,
  hideBelowTablet = true,
}: Props) {
  if (!model && !isLoading && !children) {
    return null;
  }

  return (
    <WorkspaceRightRailStack
      as="aside"
      className={[
        'workspace-section-aside',
        'workspace-section-aside--viewport',
        hideBelowTablet ? 'hide-below-tablet' : '',
        className ?? '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <WorkspaceUnifiedRail model={model} isLoading={isLoading} />
      {children}
    </WorkspaceRightRailStack>
  );
}
