// src/components/requests/details/RequestDetailClient.tsx
import { UserHeaderCard } from '@/components/ui/UserHeaderCard';

type RequestDetailClientProps = {
  title: string;
  profileHref: string | null;
  name: string;
  avatarUrl?: string;
  status: 'online' | 'offline';
  statusLabel: string;
  ratingText: string;
  ratingCount: number;
  reviewsLabel: string;
};

export function RequestDetailClient({
  title,
  profileHref,
  name,
  avatarUrl,
  status,
  statusLabel,
  ratingText,
  ratingCount,
  reviewsLabel,
}: RequestDetailClientProps) {
  return (
    <div className="request-detail__section request-detail__client">
      <h3 className="request-detail__section-title">{title}</h3>
      <div className="request-detail__client-card">
        <UserHeaderCard
          name={name}
          avatarUrl={avatarUrl}
          avatarRole="client"
          adaptiveDesktop
          status={status}
          statusLabel={statusLabel}
          href={profileHref}
          rating={ratingText}
          reviewsCount={ratingCount}
          reviewsLabel={reviewsLabel}
        />
      </div>
    </div>
  );
}
