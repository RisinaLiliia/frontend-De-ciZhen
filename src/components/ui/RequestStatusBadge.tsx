import { getStatusBadgeClass } from '@/lib/statusBadge';

type RequestStatusTone = 'review' | 'progress' | 'accepted';

type RequestStatusBadgeProps = {
  tone: RequestStatusTone;
  label: string;
};

export function RequestStatusBadge({ tone, label }: RequestStatusBadgeProps) {
  const status =
    tone === 'progress' ? 'in_progress' : tone === 'accepted' ? 'completed' : 'sent';

  return (
    <span className={getStatusBadgeClass(status)}>{label}</span>
  );
}
