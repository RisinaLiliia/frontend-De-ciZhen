import * as React from 'react';
import { IconEdit, IconSend, IconTrash } from '@/components/ui/icons/icons';

type OfferActionKind = 'submit' | 'edit' | 'delete';

type OfferActionButtonProps = {
  kind: OfferActionKind;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  title?: string;
  ariaLabel?: string;
  className?: string;
  type?: 'button' | 'submit';
  iconOnly?: boolean;
};

export function OfferActionButton({
  kind,
  label,
  onClick,
  disabled,
  title,
  ariaLabel,
  className,
  type = 'button',
  iconOnly = false,
}: OfferActionButtonProps) {
  const baseClass =
    kind === 'delete'
      ? 'btn-secondary offer-action-btn offer-action-btn--delete'
      : 'btn-primary offer-action-btn offer-action-btn--accent';

  const icon =
    kind === 'edit' ? <IconEdit /> : kind === 'delete' ? <IconTrash /> : <IconSend />;

  return (
    <button
      type={type}
      className={`${baseClass} ${iconOnly ? 'offer-action-btn--icon-only' : ''} ${className ?? ''}`.trim()}
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={ariaLabel ?? label}
    >
      {iconOnly ? null : <span>{label}</span>}
      <i className="offer-action-btn__icon">{icon}</i>
    </button>
  );
}
