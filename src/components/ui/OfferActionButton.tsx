import * as React from 'react';
import { IconEdit, IconSend, IconTrash } from '@/components/ui/icons/icons';

type OfferActionKind = 'submit' | 'edit' | 'delete';

type OfferActionButtonProps = {
  kind: OfferActionKind;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  title?: string;
  className?: string;
  type?: 'button' | 'submit';
};

export function OfferActionButton({
  kind,
  label,
  onClick,
  disabled,
  title,
  className,
  type = 'button',
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
      className={`${baseClass} ${className ?? ''}`.trim()}
      onClick={onClick}
      disabled={disabled}
      title={title}
    >
      <span>{label}</span>
      <i className="offer-action-btn__icon">{icon}</i>
    </button>
  );
}
