'use client';

import * as React from 'react';

type WorkspaceOverlaySurfaceProps = {
  intro: React.ReactNode;
  children: React.ReactNode;
};

export function WorkspaceOverlaySurface({
  intro,
  children,
}: WorkspaceOverlaySurfaceProps) {
  return (
    <section className="workspace-primary-overlay-shell workspace-overlay-surface">
      <div className="workspace-primary-overlay-shell__intro">{intro}</div>
      <div className="workspace-primary-overlay-shell__body">
        {children}
      </div>
    </section>
  );
}
