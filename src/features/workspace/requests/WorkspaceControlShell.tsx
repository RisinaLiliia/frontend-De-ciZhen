'use client';

import * as React from 'react';
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
  const shellRef = React.useRef<HTMLElement | null>(null);
  const condensedThresholdRef = React.useRef(0);
  const [isCondensed, setIsCondensed] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    let frame = 0;

    const measureThreshold = () => {
      const shell = shellRef.current;
      if (!shell) return;

      condensedThresholdRef.current = shell.getBoundingClientRect().top + window.scrollY + 32;
    };

    const syncCondensedState = () => {
      const nextIsCondensed = window.scrollY > condensedThresholdRef.current;
      setIsCondensed((current) => (current === nextIsCondensed ? current : nextIsCondensed));
    };

    const scheduleSync = () => {
      if (frame) window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(syncCondensedState);
    };

    const handleResize = () => {
      measureThreshold();
      scheduleSync();
    };

    measureThreshold();
    syncCondensedState();
    window.addEventListener('scroll', scheduleSync, { passive: true });
    window.addEventListener('resize', handleResize);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', scheduleSync);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <section
      ref={shellRef}
      className="workspace-control-shell"
      data-mode="static"
      data-condensed={isCondensed ? 'true' : 'false'}
    >
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
