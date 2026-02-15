import { IconCheck, IconClock } from '@/components/ui/icons/icons';

export type OfferCardStatus = 'sent' | 'accepted' | 'declined';

type OfferStatusBadgeProps = {
  status: OfferCardStatus;
  label: string;
  title?: string;
};

export function OfferStatusBadge({ status, label, title }: OfferStatusBadgeProps) {
  return (
    <span
      className={`offer-status-badge offer-status-badge--${status}`}
      title={title}
      aria-label={title ?? label}
    >
      <i className="offer-status-badge__icon">
        {status === 'accepted' ? <IconCheck /> : status === 'sent' ? <IconClock /> : <span>✕</span>}
      </i>
      <span>{label}</span>
    </span>
  );
}
