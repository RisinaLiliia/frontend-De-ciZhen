'use client';

import * as React from 'react';

import { RequestCard } from '@/components/requests/RequestCard';
import { LocationMeta } from '@/components/ui/LocationMeta';
import { IconCalendar } from '@/components/ui/icons/icons';
import { WorkspaceBadge } from '@/features/workspace/shared/WorkspaceBadge';

type WorkspaceGuestRequestCardProps = {
  href: string;
  ariaLabel: string;
  prefetch?: boolean;
  imageSrc?: string | null;
  imageAlt?: string;
  categoryLabel: string;
  title: string;
  excerpt?: string | null;
  cityLabel?: string | null;
  dateLabel?: string | null;
  priceLabel: string;
  priceTrend?: 'up' | 'down' | null;
  priceTrendLabel?: string | null;
  badgeLabel?: string | null;
  bottomMeta?: React.ReactNode[];
  statusSlot?: React.ReactNode;
  overlaySlot?: React.ReactNode;
  contentSlot?: React.ReactNode;
  actionSlot?: React.ReactNode;
  onOpen?: () => void;
  isActive?: boolean;
  className?: string;
  imagePriority?: boolean;
  mediaPlacement?: 'shell' | 'body';
  pricePlacement?: 'footer' | 'body';
};

export function WorkspaceGuestRequestCard({
  href,
  ariaLabel,
  prefetch = false,
  imageSrc = null,
  imageAlt = '',
  categoryLabel,
  title,
  excerpt = null,
  cityLabel = null,
  dateLabel = null,
  priceLabel,
  priceTrend = null,
  priceTrendLabel = null,
  badgeLabel = null,
  bottomMeta = [],
  statusSlot,
  overlaySlot,
  contentSlot,
  actionSlot,
  onOpen,
  isActive = false,
  className,
  imagePriority = false,
  mediaPlacement = 'shell',
  pricePlacement = 'footer',
}: WorkspaceGuestRequestCardProps) {
  const meta: React.ReactNode[] = [];

  if (cityLabel) {
    meta.push(<LocationMeta key="city" label={cityLabel} />);
  }

  if (dateLabel) {
    meta.push(
      <React.Fragment key="date">
        <IconCalendar />
        {dateLabel}
      </React.Fragment>,
    );
  }

  return (
    <RequestCard
      prefetch={prefetch}
      href={href}
      className={className}
      ariaLabel={ariaLabel}
      imageSrc={imageSrc}
      imageAlt={imageAlt}
      imagePriority={imagePriority}
      badges={[]}
      category={categoryLabel}
      title={title}
      excerpt={excerpt}
      mediaPlacement={mediaPlacement}
      pricePlacement={pricePlacement}
      meta={meta}
      bottomMeta={bottomMeta}
      priceLabel={priceLabel}
      priceTrend={priceTrend}
      priceTrendLabel={priceTrendLabel}
      mode="link"
      onOpen={onOpen}
      isActive={isActive}
      statusSlot={
        statusSlot ??
        (badgeLabel ? <WorkspaceBadge variant="success">{badgeLabel}</WorkspaceBadge> : null)
      }
      overlaySlot={overlaySlot}
      contentSlot={contentSlot}
      actionSlot={actionSlot}
    />
  );
}
