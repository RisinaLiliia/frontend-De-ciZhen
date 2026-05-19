'use client';

type WorkspaceIntroShellProps = {
  navHeaderSlot?: React.ReactNode;
  header: React.ReactNode;
  mobileContext?: React.ReactNode;
  leftColumnSlot?: React.ReactNode;
  children?: React.ReactNode;
};

export function WorkspaceIntroShell({
  navHeaderSlot,
  header,
  mobileContext,
  leftColumnSlot,
  children,
}: WorkspaceIntroShellProps) {
  return (
    <section className="workspace-intro-shell">
      <div className="stack-md">
        {navHeaderSlot ?? null}
        {header}
        {mobileContext ?? null}
        {leftColumnSlot ?? null}
        {children ?? null}
      </div>
    </section>
  );
}
