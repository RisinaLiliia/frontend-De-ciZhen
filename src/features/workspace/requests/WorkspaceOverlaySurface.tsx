'use client';

import * as React from 'react';

type WorkspaceOverlaySurfaceProps = {
  intro: React.ReactNode;
  children: React.ReactNode;
  bodyClassName?: string;
};

export function WorkspaceOverlaySurface({
  intro,
  children,
  bodyClassName,
}: WorkspaceOverlaySurfaceProps) {
  return (
    <section className="workspace-primary-overlay-shell">
      <div className="workspace-primary-overlay-shell__intro">{intro}</div>
      <div className={`workspace-primary-overlay-shell__body${bodyClassName ? ` ${bodyClassName}` : ''}`.trim()}>
        {children}
      </div>
    </section>
  );
}
