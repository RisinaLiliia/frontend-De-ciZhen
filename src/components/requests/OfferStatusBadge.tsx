import { getStatusBadgeClass } from '@/lib/statusBadge';

export type OfferCardStatus = 'sent' | 'accepted' | 'declined';

type OfferStatusBadgeProps = {
  status: OfferCardStatus;
  label: string;
  title?: string;
};

export function OfferStatusBadge({ status, label, title }: OfferStatusBadgeProps) {
  return (
    <span className={`${getStatusBadgeClass(status)} capitalize`} title={title}>
      {label}
    </span>
  );
}
