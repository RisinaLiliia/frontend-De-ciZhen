'use client';

import Link from 'next/link';

type WorkspaceDecisionActionCardProps = {
  stamp?: string;
  avatarLabel: string;
  name: string;
  role: string;
  description: string;
  actionLabel: string;
  actionHref?: string;
  onActionClick?: () => void;
  actionAriaHasPopup?: boolean;
  className?: string;
  layout?: 'inline' | 'stacked';
};

export function WorkspaceDecisionActionCard({
  stamp,
  avatarLabel,
  name,
  role,
  description,
  actionLabel,
  actionHref,
  onActionClick,
  actionAriaHasPopup = false,
  className,
  layout = 'inline',
}: WorkspaceDecisionActionCardProps) {
  const rootClassName = [
    'workspace-statistics-ki',
    'workspace-ai-card',
    'workspace-ai-card--decision',
    'workspace-ai-card--action',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  const actionClassName = 'auth-social__btn auth-social__btn--google workspace-ai-card__action';
  const articleClassName = [
    rootClassName,
    stamp ? 'workspace-statistics-ki--meta' : '',
    layout === 'inline' ? 'workspace-statistics-ki--inline-action' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const actionNode = actionHref ? (
    <Link href={actionHref} prefetch={false} className={actionClassName}>
      {actionLabel}
    </Link>
  ) : (
    <button
      type="button"
      className={actionClassName}
      onClick={onActionClick}
      aria-haspopup={actionAriaHasPopup ? 'dialog' : undefined}
    >
      {actionLabel}
    </button>
  );

  return (
    <article className={articleClassName}>
      {stamp ? <span className="workspace-statistics-ki__stamp">{stamp}</span> : null}
      <div className="workspace-statistics-ki__head">
        <span className="workspace-statistics-ki__avatar" aria-hidden="true">
          {avatarLabel.slice(0, 2).toUpperCase()}
        </span>
        <span className="workspace-statistics-ki__copy">
          <strong className="workspace-statistics-ki__name">{name}</strong>
          <span className="workspace-statistics-ki__role">{role}</span>
        </span>
      </div>
      <p className="workspace-statistics-ki__text">{description}</p>
      <div className="workspace-statistics-ki__actions">{actionNode}</div>
    </article>
  );
}
