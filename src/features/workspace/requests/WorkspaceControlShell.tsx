'use client';

import type { ReactNode } from 'react';

type WorkspaceControlShellProps = {
  navigation: ReactNode;
  context?: ReactNode;
  aside?: ReactNode;
};

export function WorkspaceControlShell({
  navigation,
  context,
  aside,
}: WorkspaceControlShellProps) {
  const hasContext = Boolean(context);
  const hasAside = Boolean(aside);

  return (
    <section className="workspace-control-shell" data-mode="static">
      <div className="workspace-control-shell__body">
        <div
          className={`workspace-control-shell__layout${hasContext ? ' has-context' : ''}${hasAside ? ' has-aside' : ''}`.trim()}
        >
          <div className="workspace-control-shell__main">
            <div className="workspace-control-shell__section workspace-control-shell__section--navigation">
              {navigation}
            </div>
            {context ? (
              <div className="workspace-control-shell__section workspace-control-shell__section--context">
                {context}
              </div>
            ) : null}
          </div>
          {aside ? (
            <aside className="workspace-control-shell__aside">
              {aside}
            </aside>
          ) : null}
        </div>
      </div>
    </section>
  );
}
