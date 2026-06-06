'use client';

import * as React from 'react';
import { toast } from 'sonner';

import { Popover } from '@/components/ui/Popover';
import { IconHeart, IconShare } from '@/components/ui/icons/icons';
import { I18N_KEYS, type I18nKey } from '@/lib/i18n/keys';

type Translate = (key: I18nKey) => string;

type ProviderDetailHeroActionsProps = {
  t: Translate;
  title: string;
  isFavorite: boolean;
  isFavoritePending?: boolean;
  onToggleFavorite: () => void;
};

export function ProviderDetailHeroActions({
  t,
  title,
  isFavorite,
  isFavoritePending = false,
  onToggleFavorite,
}: ProviderDetailHeroActionsProps) {
  const [open, setOpen] = React.useState(false);

  const handleShare = React.useCallback(async () => {
    if (typeof window === 'undefined') return;

    const shareUrl = window.location.href;

    try {
      if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
        await navigator.share({ title, url: shareUrl });
      } else if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
        toast.success(t(I18N_KEYS.requestDetails.workspaceLinkCopied));
      } else {
        window.prompt(t(I18N_KEYS.requestDetails.workspaceShareLink), shareUrl);
      }
      setOpen(false);
    } catch {
      toast.error(t(I18N_KEYS.requestDetails.workspaceShareFailed));
    }
  }, [t, title]);

  const handleFavorite = React.useCallback(() => {
    onToggleFavorite();
    setOpen(false);
  }, [onToggleFavorite]);

  return (
    <div className="my-request-card__owner-menu provider-detail-hero__menu">
      <Popover
        open={open}
        onOpenChange={setOpen}
        align="end"
        className="provider-detail-hero__menu-popover"
        triggerAriaLabel={t(I18N_KEYS.requestDetails.workspaceActionsOpen)}
        triggerTitle={t(I18N_KEYS.requestDetails.workspaceActionsOpen)}
        trigger={(
          <span
            className={`nearby-more my-request-card__owner-menu-trigger ${open ? 'is-open' : ''}`.trim()}
            aria-hidden="true"
          >
            <span className="nearby-dot-item" />
            <span className="nearby-dot-item" />
            <span className="nearby-dot-item" />
          </span>
        )}
      >
        <div className="my-request-card__owner-menu-surface provider-detail-hero__menu-surface">
          <button
            type="button"
            className="my-request-card__owner-menu-item"
            onClick={handleShare}
          >
            <span className="my-request-card__owner-menu-item-label">{t(I18N_KEYS.requestDetails.workspaceShareLink)}</span>
            <span className="my-request-card__owner-menu-item-icon" aria-hidden="true">
              <IconShare />
            </span>
          </button>
          <button
            type="button"
            className="my-request-card__owner-menu-item"
            onClick={handleFavorite}
            disabled={isFavoritePending}
          >
            <span className="my-request-card__owner-menu-item-label">{t(I18N_KEYS.requestDetails.ctaSave)}</span>
            <span className="my-request-card__owner-menu-item-icon" aria-hidden="true">
              <IconHeart className={isFavorite ? 'is-active' : undefined} />
            </span>
          </button>
        </div>
      </Popover>
    </div>
  );
}
