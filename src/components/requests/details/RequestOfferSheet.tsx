import * as React from 'react';
import Link from 'next/link';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { OfferActionButton } from '@/components/ui/OfferActionButton';
import { RequestMetaInline } from '@/components/ui/RequestMetaInline';
import { IconUser } from '@/components/ui/icons/icons';
import { UserHeaderCard } from '@/components/ui/UserHeaderCard';
import { focusIfPresent, getTrapFocusTarget, resolveInitialFocusTarget } from '@/lib/a11y/focusTrap';

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

function getFocusableElements(container: HTMLElement) {
  const selectors = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'textarea:not([disabled])',
    'select:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ];
  return Array.from(container.querySelectorAll<HTMLElement>(selectors.join(','))).filter(
    (el) => !el.hasAttribute('disabled') && el.getAttribute('aria-hidden') !== 'true',
  );
}

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
  const dialogTitleId = React.useId();
  const amountInputId = React.useId();
  const commentInputId = React.useId();
  const availabilityInputId = React.useId();
  const panelRef = React.useRef<HTMLDivElement | null>(null);
  const closeButtonRef = React.useRef<HTMLButtonElement | null>(null);

  React.useEffect(() => {
    if (!isOpen) return;

    const panel = panelRef.current;
    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    window.requestAnimationFrame(() => {
      if (!panel) return;
      const target = resolveInitialFocusTarget(closeButtonRef.current, getFocusableElements(panel));
      focusIfPresent(target);
    });

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
        return;
      }

      if (event.key !== 'Tab' || !panel) return;
      const focusable = getFocusableElements(panel);
      if (focusable.length === 0) return;
      const active = document.activeElement as HTMLElement | null;
      const target = getTrapFocusTarget({
        focusable,
        activeElement: active,
        container: panel,
        shiftKey: event.shiftKey,
      });
      if (target) {
        event.preventDefault();
        target.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
      focusIfPresent(previouslyFocused);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="dc-modal request-offer-sheet"
      role="dialog"
      aria-modal="true"
      aria-labelledby={dialogTitleId}
    >
      <button type="button" className="dc-modal__backdrop request-offer-sheet__backdrop" onClick={onClose} aria-label={closeLabel} />
      <div ref={panelRef} className="dc-modal__panel dc-modal__panel--compact request-offer-sheet__panel">
        <div className="request-offer-sheet__header">
          {mode === 'form' ? (
            <h2 id={dialogTitleId} className="typo-h3">{title}</h2>
          ) : null}
          <button
            ref={closeButtonRef}
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
              <h3 id={dialogTitleId} className="typo-h3 request-offer-sheet__success-title">{successTitle}</h3>
              <p className="typo-muted">{successBody}</p>
              <p className="typo-muted request-offer-sheet__success-subline">{successSubline}</p>
            </div>
            {showProfileAdvice ? (
              <div className="request-offer-sheet__success-tip">
                <h4 className="typo-h4">{successTipTitle}</h4>
                <div className="request-offer-sheet__success-tip-card">
                  <UserHeaderCard
                    className="request-offer-sheet__success-tip-person"
                    name={profileName ?? 'Profile'}
                    avatarUrl={profileAvatarUrl}
                    hasProviderProfile
                    status={profileOnline ? 'online' : 'offline'}
                    statusLabel={profileStatusLabel}
                    showRating={false}
                    rating="—"
                    reviewsCount={0}
                    reviewsLabel=""
                  />
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
              <label className="typo-small" htmlFor={amountInputId}>{amountLabel}</label>
              <Input
                id={amountInputId}
                type="number"
                min={1}
                step="1"
                value={amountValue}
                onChange={(event) => onAmountChange(event.target.value)}
                placeholder={amountPlaceholder}
              />

              <label className="typo-small" htmlFor={commentInputId}>{commentLabel}</label>
              <Textarea
                id={commentInputId}
                value={commentValue}
                onChange={(event) => onCommentChange(event.target.value)}
                placeholder={commentPlaceholder}
                rows={3}
              />

              <label className="typo-small" htmlFor={availabilityInputId}>{availabilityLabel}</label>
              <Input
                id={availabilityInputId}
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
