'use client';

type StatisticsKiCardProps = {
  avatarLabel: string;
  name: string;
  role: string;
  stamp?: string | null;
  description?: string | null;
  className?: string;
  metaStamp?: boolean;
  variant?: 'default' | 'plain';
};

export function StatisticsKiCard({
  avatarLabel,
  name,
  role,
  stamp,
  description,
  className,
  metaStamp = false,
  variant = 'default',
}: StatisticsKiCardProps) {
  const rootClassName = [
    'workspace-statistics-ki',
    variant === 'plain' ? 'workspace-statistics-ki--plain' : '',
    metaStamp ? 'workspace-statistics-ki--meta' : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <section className={rootClassName}>
      {stamp ? (
        <span className="workspace-statistics-ki__stamp">{stamp}</span>
      ) : null}
      <div className="workspace-statistics-ki__head">
        <span className="workspace-statistics-ki__avatar" aria-hidden="true">
          {avatarLabel}
        </span>
        <span className="workspace-statistics-ki__copy">
          <strong className="workspace-statistics-ki__name">{name}</strong>
          <span className="workspace-statistics-ki__role">{role}</span>
        </span>
      </div>
      {description ? <p className="workspace-statistics-ki__text">{description}</p> : null}
    </section>
  );
}
