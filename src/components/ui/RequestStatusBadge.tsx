import { IconBriefcase, IconCheck, IconClock } from '@/components/ui/icons/icons';

type RequestStatusTone = 'review' | 'progress' | 'accepted';

type RequestStatusBadgeProps = {
  tone: RequestStatusTone;
  label: string;
};

export function RequestStatusBadge({ tone, label }: RequestStatusBadgeProps) {
  const icon =
    tone === 'progress' ? <IconBriefcase /> : tone === 'accepted' ? <IconCheck /> : <IconClock />;

  return (
    <span className={`request-status-badge request-status-badge--${tone}`}>
      <i className="request-status-badge__icon">{icon}</i>
      <span>{label}</span>
    </span>
  );
}

