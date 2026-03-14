'use client';

import type * as React from 'react';

type StatisticsKiCardProps = {
  avatarLabel: string;
  name: string;
  role: string;
  stamp?: string | null;
  description?: string | null;
  actions?: React.ReactNode;
  details?: React.ReactNode;
  className?: string;
  metaStamp?: boolean;
  variant?: 'default' | 'plain';
  layout?: 'default' | 'inline-action';
};

export function StatisticsKiCard({
  avatarLabel,
  name,
  role,
  stamp,
  description,
  actions,
  details,
  className,
  metaStamp = false,
  variant = 'default',
  layout = 'default',
}: StatisticsKiCardProps) {
  const rootClassName = [
    'workspace-statistics-ki',
    variant === 'plain' ? 'workspace-statistics-ki--plain' : '',
    metaStamp ? 'workspace-statistics-ki--meta' : '',
    layout === 'inline-action' ? 'workspace-statistics-ki--inline-action' : '',
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
      {actions ? <div className="workspace-statistics-ki__actions">{actions}</div> : null}
      {details ? <div className="workspace-statistics-ki__details">{details}</div> : null}
    </section>
  );
}
