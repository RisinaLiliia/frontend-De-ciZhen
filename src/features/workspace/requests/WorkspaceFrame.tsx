'use client';

import type { ReactNode } from 'react';
import { WorkspaceOverlaySurface } from '@/features/workspace/shared/WorkspaceOverlaySurface';

export { WorkspaceTopProvidersAside } from '@/features/workspace/shared';

type WorkspaceFrameProps = {
  intro?: ReactNode;
  main: ReactNode;
  aside: ReactNode;
  sidebar?: ReactNode;
  frameClassName?: string;
  contentClassName?: string;
};

export function WorkspaceFrame({
  intro,
  main,
  aside,
  sidebar,
  frameClassName,
  contentClassName,
}: WorkspaceFrameProps) {
  const desktopAsideClassName = ['stack-md', 'hide-below-desktop'].filter(Boolean).join(' ');
  const contentWrapperClassName = ['stack-md', contentClassName ?? ''].filter(Boolean).join(' ');
  const gridClassName = [
    'requests-grid',
    intro ? 'requests-grid--equal-cols' : '',
    frameClassName ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  const grid = (
    <div className={gridClassName}>
      <div className={contentWrapperClassName}>{main}</div>
      <aside className={desktopAsideClassName}>{aside}</aside>
    </div>
  );

  const content = intro ? (
    <WorkspaceOverlaySurface intro={intro}>{grid}</WorkspaceOverlaySurface>
  ) : (
    grid
  );

  if (sidebar) {
    return (
      <div className="workspace-frame__body">
        <div className="workspace-frame__sidebar">{sidebar}</div>
        <div className="workspace-frame__content">{content}</div>
      </div>
    );
  }

  return content;
}
