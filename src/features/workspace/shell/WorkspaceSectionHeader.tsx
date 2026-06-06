'use client';

export type WorkspaceSectionHeaderCopy = {
  title: string;
  description: string;
};

type WorkspaceSectionHeaderProps = WorkspaceSectionHeaderCopy & {
  className?: string;
};

export function WorkspaceSectionHeader({
  title,
  description,
  className,
}: WorkspaceSectionHeaderProps) {
  return (
    <section className={['workspace-environment', className].filter(Boolean).join(' ')}>
      <div className="workspace-environment__hero">
        <div className="workspace-environment__copy">
          <div className="workspace-environment__heading">
            <h1 className="workspace-environment__title">{title}</h1>
            <p className="workspace-environment__description">{description}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
