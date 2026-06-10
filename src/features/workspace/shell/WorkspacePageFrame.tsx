'use client';

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
    aiRail == null ? 'workspace-page-frame--single' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const pageContent = (
    <main className={mainClasses}>
      <div className={pageFrameClasses}>
        <section className="workspace-page-frame__content workspace-main-scroll">
          {intro || filters ? (
            <div className="workspace-page-frame__controls">
              {intro ? <div className="workspace-page-frame__header">{intro}</div> : null}
              {filters ? (
                <WorkspaceContextBar className="workspace-page-frame__filters">
                  {filters}
                </WorkspaceContextBar>
              ) : null}
            </div>
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
        {pageContent}
      </div>
    </div>
  );
}
