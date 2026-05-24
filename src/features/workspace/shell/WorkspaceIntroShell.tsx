'use client';

type WorkspaceIntroShellProps = {
  navHeaderSlot?: React.ReactNode;
  header: React.ReactNode;
  leftColumnSlot?: React.ReactNode;
  children?: React.ReactNode;
};

export function WorkspaceIntroShell({
  navHeaderSlot,
  header,
  leftColumnSlot,
  children,
}: WorkspaceIntroShellProps) {
  return (
    <section className="workspace-intro-shell">
      <div className="stack-md">
        {navHeaderSlot ?? null}
        {header}
        {leftColumnSlot ?? null}
        {children ?? null}
      </div>
    </section>
  );
}
