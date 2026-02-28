'use client';

import { IconHeart } from '@/components/ui/icons/icons';

type FavoriteButtonVariant = 'icon' | 'cta' | 'compact';

type FavoriteButtonProps = {
  isFavorite: boolean;
  isPending?: boolean;
  onToggle?: () => void;
  ariaLabel: string;
  title?: string;
  label?: string;
  variant?: FavoriteButtonVariant;
  className?: string;
};

export function FavoriteButton({
  isFavorite,
  isPending = false,
  onToggle,
  ariaLabel,
  title,
  label,
  variant = 'icon',
  className,
}: FavoriteButtonProps) {
  if (variant === 'compact') {
    return (
      <button
        type="button"
        className={`btn-secondary offer-action-btn offer-action-btn--icon-only request-card__status-action request-detail__save ${isFavorite ? 'is-saved' : ''} ${isPending ? 'is-pending' : ''} ${className ?? ''}`.trim()}
        onClick={() => onToggle?.()}
        aria-label={ariaLabel}
        aria-pressed={isFavorite}
        title={title ?? ariaLabel}
        disabled={isPending || !onToggle}
      >
        <i className="offer-action-btn__icon">
          <IconHeart className="icon-heart" />
        </i>
      </button>
    );
  }

  if (variant === 'cta') {
    return (
      <button
        type="button"
        className={`btn-ghost is-primary request-detail__save ${isFavorite ? 'is-saved' : ''} ${isPending ? 'is-pending' : ''} ${className ?? ''}`.trim()}
        onClick={() => onToggle?.()}
        aria-label={ariaLabel}
        aria-pressed={isFavorite}
        title={title ?? ariaLabel}
        disabled={isPending || !onToggle}
      >
        {label ? <span>{label}</span> : null}
        <IconHeart className="icon-heart" />
      </button>
    );
  }

  return (
    <button
      type="button"
      className={`request-card__favorite-btn ${isFavorite ? 'is-active' : ''} ${isPending ? 'is-pending' : ''} ${className ?? ''}`.trim()}
      onClick={() => onToggle?.()}
      aria-label={ariaLabel}
      aria-pressed={isFavorite}
      title={title ?? ariaLabel}
      disabled={isPending || !onToggle}
    >
      <IconHeart />
    </button>
  );
}

