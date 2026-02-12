// src/components/requests/details/RequestDetailClient.tsx
import Link from 'next/link';
import Image from 'next/image';
import { StatusDot } from '@/components/ui/StatusDot';

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
  const hasAvatar = Boolean(avatarUrl);
  return (
    <div className="request-detail__section request-detail__client">
      <h3 className="request-detail__section-title">{title}</h3>
      <div className="request-detail__client-card">
        {profileHref ? (
          <Link href={profileHref} className="request-detail__client-link">
            <div className="request-detail__client-avatar-wrap">
              <div
                className={`request-detail__client-avatar ${
                  hasAvatar ? '' : 'request-detail__client-avatar--placeholder'
                }`}
              >
                {avatarUrl ? (
                  <Image
                    src={avatarUrl}
                    alt={name}
                    fill
                    sizes="56px"
                    className="request-detail__client-img"
                  />
                ) : (
                  <span className="request-detail__client-initial">
                    {name.slice(0, 1).toUpperCase()}
                  </span>
                )}
              </div>
              <StatusDot status={status} label={statusLabel} />
            </div>
            <div className="request-detail__client-body">
              <div className="request-detail__client-name">{name}</div>
              <div className="request-detail__client-meta" aria-hidden="true" />
            </div>
          </Link>
        ) : (
          <>
            <div className="request-detail__client-avatar-wrap">
              <div
                className={`request-detail__client-avatar ${
                  hasAvatar ? '' : 'request-detail__client-avatar--placeholder'
                }`}
              >
                {avatarUrl ? (
                  <Image
                    src={avatarUrl}
                    alt={name}
                    fill
                    sizes="56px"
                    className="request-detail__client-img"
                  />
                ) : (
                  <span className="request-detail__client-initial">
                    {name.slice(0, 1).toUpperCase()}
                  </span>
                )}
              </div>
              <StatusDot status={status} label={statusLabel} />
            </div>
            <div className="request-detail__client-body">
              <div className="request-detail__client-name">{name}</div>
              <div className="request-detail__client-meta" aria-hidden="true" />
            </div>
          </>
        )}
        <div className="request-detail__client-rating">
          <span className="provider-rating">★★★★★ {ratingText}</span>
          <span className="provider-reviews">
            {ratingCount} {reviewsLabel}
          </span>
        </div>
      </div>
    </div>
  );
}
