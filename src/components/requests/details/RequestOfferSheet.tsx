import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { OfferActionButton } from '@/components/ui/OfferActionButton';
import { RequestMetaInline } from '@/components/ui/RequestMetaInline';
import { IconUser } from '@/components/ui/icons/icons';
import { StatusDot } from '@/components/ui/StatusDot';

type RequestOfferSheetProps = {
  isOpen: boolean;
  mode: 'form' | 'success';
  title: string;
  previewTitle: string;
  previewCity: string;
  previewDate: string;
  previewPrice?: string | null;
  amountLabel: string;
  amountValue: string;
  amountPlaceholder?: string;
  commentLabel: string;
  commentValue: string;
  commentPlaceholder: string;
  availabilityLabel: string;
  availabilityValue: string;
  availabilityPlaceholder: string;
  submitLabel: string;
  submitKind: 'submit' | 'edit';
  cancelLabel: string;
  cancelKind: 'back' | 'delete';
  closeLabel: string;
  successTitle: string;
  successBody: string;
  successSubline: string;
  successTipTitle: string;
  successTipCardTitle: string;
  successTipCardBody: string;
  successProfileCta: string;
  successContinueCta: string;
  successProfileHref: string;
  showProfileAdvice: boolean;
  profileAvatarUrl?: string | null;
  profileName?: string | null;
  profileOnline?: boolean;
  profileStatusLabel: string;
  isSubmitting: boolean;
  onAmountChange: (value: string) => void;
  onCommentChange: (value: string) => void;
  onAvailabilityChange: (value: string) => void;
  onClose: () => void;
  onCancel: () => void;
  onSuccessBack: () => void;
  onSubmit: () => void;
};

export function RequestOfferSheet({
  isOpen,
  mode,
  title,
  previewTitle,
  previewCity,
  previewDate,
  previewPrice,
  amountLabel,
  amountValue,
  amountPlaceholder,
  commentLabel,
  commentValue,
  commentPlaceholder,
  availabilityLabel,
  availabilityValue,
  availabilityPlaceholder,
  submitLabel,
  submitKind,
  cancelLabel,
  cancelKind,
  closeLabel,
  successTitle,
  successBody,
  successSubline,
  successTipTitle,
  successTipCardTitle,
  successTipCardBody,
  successProfileCta,
  successContinueCta,
  successProfileHref,
  showProfileAdvice,
  profileAvatarUrl,
  profileName,
  profileOnline,
  profileStatusLabel,
  isSubmitting,
  onAmountChange,
  onCommentChange,
  onAvailabilityChange,
  onClose,
  onCancel,
  onSuccessBack,
  onSubmit,
}: RequestOfferSheetProps) {
  const safeAvatarUrl =
    profileAvatarUrl && profileAvatarUrl.startsWith('http') ? profileAvatarUrl : null;

  const avatarInitial = React.useMemo(() => {
    const value = (profileName ?? '').trim();
    return value ? value[0]?.toUpperCase() : 'P';
  }, [profileName]);

  React.useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="dc-modal request-offer-sheet"
      role="dialog"
      aria-modal="true"
      aria-label={mode === 'success' ? successTitle : title}
    >
      <button type="button" className="dc-modal__backdrop request-offer-sheet__backdrop" onClick={onClose} aria-label={closeLabel} />
      <div className="dc-modal__panel dc-modal__panel--compact request-offer-sheet__panel">
        <div className="request-offer-sheet__header">
          {mode === 'form' ? (
            <h2 className="typo-h3">{title}</h2>
          ) : null}
          <button
            type="button"
            className="request-offer-sheet__close"
            onClick={onClose}
            aria-label={closeLabel}
          >
            ×
          </button>
          <RequestMetaInline
            title={previewTitle}
            city={previewCity}
            date={previewDate}
            price={previewPrice}
            className="request-offer-sheet__preview"
          />
        </div>

        {mode === 'success' ? (
          <div className="request-offer-sheet__success">
            <div className="request-offer-sheet__success-main">
              <h3 className="typo-h3 request-offer-sheet__success-title">{successTitle}</h3>
              <p className="typo-muted">{successBody}</p>
              <p className="typo-muted request-offer-sheet__success-subline">{successSubline}</p>
            </div>
            {showProfileAdvice ? (
              <div className="request-offer-sheet__success-tip">
                <h4 className="typo-h4">{successTipTitle}</h4>
                <div className="request-offer-sheet__success-tip-card">
                  <span className="provider-avatar-wrap request-offer-sheet__success-tip-avatar-wrap">
                    <span
                      className={`provider-avatar request-offer-sheet__success-tip-avatar ${
                        safeAvatarUrl ? '' : 'provider-avatar--placeholder'
                      }`.trim()}
                    >
                      {safeAvatarUrl ? (
                        <Image
                          src={safeAvatarUrl}
                          alt={profileName ?? 'Profile avatar'}
                          width={38}
                          height={38}
                          className="request-offer-sheet__success-tip-avatar-img"
                        />
                      ) : (
                        <span>{avatarInitial}</span>
                      )}
                    </span>
                    <StatusDot
                      status={profileOnline ? 'online' : 'offline'}
                      label={profileStatusLabel}
                    />
                  </span>
                  <div className="request-offer-sheet__success-tip-copy">
                    <p className="request-offer-sheet__success-tip-title">{successTipCardTitle}</p>
                    <p className="typo-small request-offer-sheet__success-advice">{successTipCardBody}</p>
                  </div>
                </div>
              </div>
            ) : null}
            <div className={`request-offer-sheet__actions ${showProfileAdvice ? '' : 'request-offer-sheet__actions--single'}`.trim()}>
              <button type="button" className="btn-secondary request-detail__cta-btn" onClick={onSuccessBack}>
                <span>{successContinueCta}</span>
              </button>
              {showProfileAdvice ? (
                <Link
                  href={successProfileHref}
                  className="btn-primary request-detail__cta-btn request-offer-sheet__profile-cta"
                  onClick={onClose}
                >
                  <IconUser className="request-offer-sheet__profile-icon" />
                  <span>{successProfileCta}</span>
                </Link>
              ) : null}
            </div>
          </div>
        ) : (
          <>
            <div className="request-offer-sheet__body">
              <label className="typo-small">{amountLabel}</label>
              <Input
                type="number"
                min={1}
                step="1"
                value={amountValue}
                onChange={(event) => onAmountChange(event.target.value)}
                placeholder={amountPlaceholder}
              />

              <label className="typo-small">{commentLabel}</label>
              <Textarea
                value={commentValue}
                onChange={(event) => onCommentChange(event.target.value)}
                placeholder={commentPlaceholder}
                rows={3}
              />

              <label className="typo-small">{availabilityLabel}</label>
              <Input
                value={availabilityValue}
                onChange={(event) => onAvailabilityChange(event.target.value)}
                placeholder={availabilityPlaceholder}
              />
            </div>

            <div className="request-offer-sheet__actions">
              {cancelKind === 'delete' ? (
                <OfferActionButton
                  kind="delete"
                  label={cancelLabel}
                  className="request-detail__cta-btn"
                  onClick={onCancel}
                  disabled={isSubmitting}
                />
              ) : (
                <button
                  type="button"
                  className="btn-secondary request-detail__cta-btn"
                  onClick={onCancel}
                  disabled={isSubmitting}
                >
                  <span>{cancelLabel}</span>
                </button>
              )}
              <OfferActionButton
                kind={submitKind}
                label={submitLabel}
                className="request-detail__cta-btn"
                onClick={onSubmit}
                disabled={isSubmitting}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
