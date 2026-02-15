import Link from 'next/link';
import { IconBriefcase, IconChat, IconEdit, IconSend, IconTrash } from '@/components/ui/icons/icons';

type OfferActionsProps = {
  state: 'none' | 'sent' | 'accepted' | 'declined';
  sendLabel: string;
  editLabel: string;
  withdrawLabel: string;
  contractLabel: string;
  chatLabel: string;
  browseLabel: string;
  detailsLabel: string;
  detailsHref: string;
  contractHref?: string;
  chatHref?: string;
  onSend: () => void;
  onEdit: () => void;
  onWithdraw: () => void;
  isWorking?: boolean;
};

export function OfferActions({
  state,
  sendLabel,
  editLabel,
  withdrawLabel,
  contractLabel,
  chatLabel,
  browseLabel,
  detailsLabel,
  detailsHref,
  contractHref = '/provider/contracts',
  chatHref,
  onSend,
  onEdit,
  onWithdraw,
  isWorking,
}: OfferActionsProps) {
  if (state === 'none') {
    return (
      <div className="offer-actions">
        <button type="button" className="btn-primary offer-actions__btn" onClick={onSend}>
          <IconSend />
          {sendLabel}
        </button>
        <Link href={detailsHref} className="btn-secondary offer-actions__btn">
          {detailsLabel}
        </Link>
      </div>
    );
  }

  if (state === 'sent') {
    return (
      <div className="offer-actions">
        <button type="button" className="btn-secondary offer-actions__btn" onClick={onEdit}>
          <IconEdit />
          <span>{editLabel}</span>
        </button>
        <button
          type="button"
          className="btn-ghost offer-actions__btn"
          onClick={onWithdraw}
          disabled={isWorking}
        >
          <IconTrash />
          <span>{withdrawLabel}</span>
        </button>
      </div>
    );
  }

  if (state === 'accepted') {
    return (
      <div className="offer-actions">
        <Link href={contractHref} className="btn-secondary offer-actions__btn">
          <IconBriefcase />
          {contractLabel}
        </Link>
        {chatHref ? (
          <Link href={chatHref} className="btn-ghost offer-actions__btn">
            <IconChat />
            <span>{chatLabel}</span>
          </Link>
        ) : (
          <button type="button" className="btn-ghost offer-actions__btn" onClick={onEdit}>
            <IconChat />
            <span>{chatLabel}</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="offer-actions">
      <button type="button" className="btn-ghost offer-actions__btn" onClick={onSend}>
        {browseLabel}
      </button>
      <Link href={detailsHref} className="btn-secondary offer-actions__btn">
        {detailsLabel}
      </Link>
    </div>
  );
}
