'use client';

import Link from 'next/link';

import { StatisticsKiCard } from '@/features/workspace/requests/stats/components/StatisticsKiCard';

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
    'workspace-ai-card',
    'workspace-ai-card--decision',
    'workspace-ai-card--action',
    className ?? '',
  ].filter(Boolean).join(' ');

  const actionNode = actionHref ? (
    <Link href={actionHref} prefetch={false} className="auth-social__btn auth-social__btn--google workspace-ai-card__action">
      {actionLabel}
    </Link>
  ) : (
    <button
      type="button"
      className="auth-social__btn auth-social__btn--google workspace-ai-card__action"
      onClick={onActionClick}
      aria-haspopup={actionAriaHasPopup ? 'dialog' : undefined}
    >
      {actionLabel}
    </button>
  );

  return (
    <StatisticsKiCard
      className={rootClassName}
      metaStamp={Boolean(stamp)}
      layout={layout === 'inline' ? 'inline-action' : 'default'}
      stamp={stamp}
      avatarLabel={avatarLabel}
      name={name}
      role={role}
      description={description}
      actions={actionNode}
    />
  );
}
