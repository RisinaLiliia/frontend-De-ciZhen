'use client';

import * as React from 'react';

import { WorkspaceOverlaySurface } from '@/features/workspace/shared/WorkspaceOverlaySurface';
import { WorkspaceContextBar } from '@/features/workspace/shell/WorkspaceContextBar';
import type { WorkspacePageFrameProps } from '@/features/workspace/shell/WorkspaceShell.types';

export function WorkspacePageFrame({
  topBar,
  intro,
  filters,
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
    'workspace-page-layout',
    intro ? 'workspace-page-frame--inside-overlay' : '',
    aiRail == null ? 'workspace-page-frame--single' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const pageContent = (
    <main className={mainClasses}>
      <div className={pageFrameClasses}>
        <section className="workspace-page-frame__content workspace-main-scroll">
          {filters ? (
            <WorkspaceContextBar className="workspace-page-frame__filters">
              {filters}
            </WorkspaceContextBar>
          ) : null}
          {main}
        </section>

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
        {topBar ? <div className="workspace-shell__topbar">{topBar}</div> : null}
        {intro ? (
          <WorkspaceOverlaySurface intro={intro}>{pageContent}</WorkspaceOverlaySurface>
        ) : (
          pageContent
        )}
      </div>
    </div>
  );
}
