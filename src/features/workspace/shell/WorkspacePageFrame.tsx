'use client';

import * as React from 'react';

import { WorkspaceOverlaySurface } from '@/features/workspace/shared/WorkspaceOverlaySurface';
import type { WorkspacePageFrameProps } from '@/features/workspace/shell/WorkspaceShell.types';

export function WorkspacePageFrame({
  intro,
  main,
  aiRail,
  sidebar,
  frameClassName,
  contentClassName,
}: WorkspacePageFrameProps) {
  const frameClasses = ['workspace-shell', frameClassName ?? ''].filter(Boolean).join(' ');
  const mainClasses = ['workspace-main', contentClassName ?? ''].filter(Boolean).join(' ');
  const pageFrameClasses = [
    'workspace-page-frame',
    aiRail == null ? 'workspace-page-frame--single' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const pageContent = (
    <main className={mainClasses}>
      <div className={pageFrameClasses}>
        <section className="workspace-page-frame__content">{main}</section>

        {aiRail ? (
          <aside className="workspace-page-frame__rail" aria-label="Workspace AI tools">
            {aiRail}
          </aside>
        ) : null}
      </div>
    </main>
  );

  return (
    <div className={frameClasses}>
      {sidebar ? <div className="workspace-shell__sidebar">{sidebar}</div> : null}

      <div className="workspace-shell__main">
        {intro ? (
          <WorkspaceOverlaySurface intro={intro}>{pageContent}</WorkspaceOverlaySurface>
        ) : (
          pageContent
        )}
      </div>
    </div>
  );
}
