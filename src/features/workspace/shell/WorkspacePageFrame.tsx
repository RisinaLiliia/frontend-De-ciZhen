'use client';

import * as React from 'react';

import {
  WorkspaceFrame,
  WorkspaceOverlaySurface,
} from '@/features/workspace/requests';
import type { WorkspacePageFrameProps } from '@/features/workspace/shell/WorkspaceShell.types';

export function WorkspacePageFrame({
  intro,
  main,
  aiRail,
  sidebar,
  frameClassName,
  contentClassName,
}: WorkspacePageFrameProps) {
  if (aiRail == null) {
    const contentWrapperClassName = ['stack-md', contentClassName ?? ''].filter(Boolean).join(' ');
    const mainNode = (
      <div className={frameClassName}>
        <div className={contentWrapperClassName}>{main}</div>
      </div>
    );
    const content = intro ? (
      <WorkspaceOverlaySurface intro={intro}>{mainNode}</WorkspaceOverlaySurface>
    ) : (
      mainNode
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

  return (
    <WorkspaceFrame
      intro={intro}
      main={main}
      aside={aiRail}
      sidebar={sidebar}
      frameClassName={frameClassName}
      contentClassName={contentClassName}
    />
  );
}
