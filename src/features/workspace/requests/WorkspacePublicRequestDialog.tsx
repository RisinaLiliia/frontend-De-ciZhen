'use client';

import * as React from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { MoreDotsLink } from '@/components/ui/MoreDotsLink';
import { IconHeart, IconSend, IconShare, IconTrash } from '@/components/ui/icons/icons';
import { deleteOffer } from '@/lib/api/offers';
import { useAuthStatus, useAuthUser, useAuthMe } from '@/hooks/useAuthSnapshot';
import { useRequestDetailsContentState } from '@/features/requests/details/useRequestDetailsContentState';
import { useRequestDetailsPageData } from '@/features/requests/details/useRequestDetailsPageData';
import { RequestDetailsContent } from '@/features/requests/details/RequestDetailsContent';
import type { RequestDialogIntent } from '@/features/workspace/requests/useWorkspaceRequestOverlayFlow';
import type { WorkspaceChatConversationInput } from '@/features/workspace/private/workspaceActions.model';
import type { Locale } from '@/lib/i18n/t';
import { useT } from '@/lib/i18n/useT';
import { I18N_KEYS } from '@/lib/i18n/keys';
import { providerQK } from '@/features/provider/queries';
import { DEFAULT_PRIVATE_WORKSPACE_REQUESTS_HREF } from '@/features/workspace/requests/workspaceRequestsScope.model';
import { WorkspaceRequestDialogShell } from '@/features/workspace/requests/WorkspaceRequestDialogShell';
import { resolveOfferCardState } from '@/features/requests/uiState';
import { getStatusBadgeClass } from '@/lib/statusBadge';

function RequestDetailInteractionMenuItem({
  children,
  icon,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  icon: React.ReactNode;
}) {
  return (
    <button
      {...props}
      type={props.type ?? 'button'}
      className={`my-request-card__owner-menu-item ${className ?? ''}`.trim()}
    >
      <span className="my-request-card__owner-menu-item-label">{children}</span>
      <span className="my-request-card__owner-menu-item-icon" aria-hidden="true">{icon}</span>
    </button>
  );
}

function RequestDetailInteractionMenu({
  locale,
  isSaved,
  isSavePending,
  canEditOffer,
  canDeleteOffer,
  isDeletingOffer,
  onToggleFavorite,
  onEditOffer,
  onDeleteOffer,
  onShare,
}: {
  locale: Locale;
  isSaved: boolean;
  isSavePending: boolean;
  canEditOffer: boolean;
  canDeleteOffer: boolean;
  isDeletingOffer: boolean;
  onToggleFavorite: () => void;
  onEditOffer: () => void;
  onDeleteOffer: () => void;
  onShare: () => void;
}) {
  const [isOpen, setIsOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (!isOpen) return undefined;

    const handlePointerDown = (event: MouseEvent) => {
      if (!menuRef.current) return;
      if (menuRef.current.contains(event.target as Node)) return;
      setIsOpen(false);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setIsOpen(false);
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div ref={menuRef} className="my-request-card__owner-menu request-detail__interaction-menu" data-card-action="true">
      <MoreDotsLink
        label={locale === 'de' ? 'Aktionen öffnen' : 'Open actions'}
        className={`my-request-card__owner-menu-trigger ${isOpen ? 'is-open' : ''}`.trim()}
        onClick={() => setIsOpen((prev) => !prev)}
      />
      {isOpen ? (
        <div className="my-request-card__owner-menu-surface" role="menu">
          {canEditOffer ? (
            <RequestDetailInteractionMenuItem
              role="menuitem"
              icon={<IconSend />}
              onClick={() => {
                setIsOpen(false);
                onEditOffer();
              }}
            >
              {locale === 'de' ? 'Angebot bearbeiten' : 'Edit offer'}
            </RequestDetailInteractionMenuItem>
          ) : null}
          {canDeleteOffer ? (
            <RequestDetailInteractionMenuItem
              className="is-danger"
              role="menuitem"
              icon={<IconTrash />}
              disabled={isDeletingOffer}
              onClick={() => {
                setIsOpen(false);
                onDeleteOffer();
              }}
            >
              {locale === 'de' ? 'Angebot löschen' : 'Delete offer'}
            </RequestDetailInteractionMenuItem>
          ) : null}
          <RequestDetailInteractionMenuItem
            role="menuitem"
            icon={<IconHeart />}
            disabled={isSavePending}
            onClick={() => {
              setIsOpen(false);
              onToggleFavorite();
            }}
          >
            {isSaved
              ? (locale === 'de' ? 'Gespeichert' : 'Saved')
              : (locale === 'de' ? 'In Favoriten' : 'Save')}
          </RequestDetailInteractionMenuItem>
          <RequestDetailInteractionMenuItem
            role="menuitem"
            icon={<IconShare />}
            onClick={() => {
              setIsOpen(false);
              onShare();
            }}
          >
            {locale === 'de' ? 'Teilen' : 'Share'}
          </RequestDetailInteractionMenuItem>
        </div>
      ) : null}
    </div>
  );
}

export function WorkspacePublicRequestDialog({
  locale,
  requestId,
  initialIntent,
  onClose,
  onOpenRequest,
  onOpenOfferSheet,
  onOpenChatConversation,
  surface = 'modal',
}: {
  locale: Locale;
  requestId: string;
  initialIntent: RequestDialogIntent;
  onClose: () => void;
  onOpenRequest: (requestId: string, intent?: RequestDialogIntent) => void;
  onOpenOfferSheet: (requestId: string) => void;
  onOpenChatConversation: (payload: WorkspaceChatConversationInput, title?: string) => void;
  surface?: 'modal' | 'embedded';
}) {
  const t = useT();
  const authStatus = useAuthStatus();
  const authUser = useAuthUser();
  const authMe = useAuthMe();
  const qc = useQueryClient();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isHydrated, setIsHydrated] = React.useState(false);

  React.useEffect(() => {
    setIsHydrated(true);
  }, []);

  const isAuthed = authStatus === 'authenticated';
  const currentUserId = authUser?.id ?? authMe?.id ?? null;
  const {
    request,
    isLoading,
    isError,
    providerProfile,
    existingResponse,
    pendingFavoriteRequestIds,
    toggleRequestFavorite,
    isSaved,
  } = useRequestDetailsPageData({
    t,
    locale,
    requestId,
    isHydrated,
    authStatus,
    isAuthed,
    pathname,
    searchParams,
    router,
    qc,
    attemptOwner: initialIntent === 'edit',
    preferOwner: initialIntent === 'edit',
  });

  const isOwner = isAuthed && Boolean(request?.clientId) && request?.clientId === currentUserId;
  const showOwnerBadge = isAuthed && isOwner;
  const {
    activeOwnerSubmitIntent,
    applyLabel,
    applyState,
    applyTitle,
    formatPriceValue,
    handleOwnerClearText,
    handleOwnerPhotoPick,
    handleOwnerSave,
    isOwnerEditMode,
    isSavingOwner,
    isUploadingOwnerPhoto,
    ownerDescription,
    ownerCityId,
    ownerPhotos,
    ownerPrice,
    ownerPreferredDate,
    ownerPriceTrend,
    ownerTitle,
    requestPriceTrend,
    requestPriceTrendLabel,
    requestStatusView,
    setIsOwnerEditMode,
    setOwnerDescription,
    setOwnerCityId,
    setOwnerPhotos,
    setOwnerPrice,
    setOwnerPreferredDate,
    setOwnerTitle,
    similarFallbackMessage,
    similarForRender,
    similarHref,
    similarTitle,
    viewModel,
  } = useRequestDetailsContentState({
    request,
    locale,
    t,
    qc,
    isOwner,
    shouldOpenOwnerEdit: initialIntent === 'edit',
    hasOffer: isAuthed && Boolean(existingResponse),
    isOfferAccepted: existingResponse?.status === 'accepted',
    providerProfile,
    isHydrated,
  });
  const isOfferAccepted = existingResponse?.status === 'accepted';
  const offerCardState = React.useMemo(
    () => resolveOfferCardState(existingResponse),
    [existingResponse],
  );
  const isPending = !isHydrated || isLoading;
  const resolvedRequest = request ?? null;
  const resolvedViewModel = viewModel ?? null;
  const hasResolvedContent = Boolean(resolvedRequest && resolvedViewModel);
  const hasDialogError = !isPending && (isError || !hasResolvedContent);
  const [isDeletingOffer, setIsDeletingOffer] = React.useState(false);

  const replaceWithOfferSheet = React.useCallback((targetRequestId: string) => {
    onOpenOfferSheet(targetRequestId);
  }, [onOpenOfferSheet]);

  const handleEditOffer = React.useCallback(() => {
    replaceWithOfferSheet(requestId);
  }, [replaceWithOfferSheet, requestId]);

  const handleApply = React.useCallback(() => {
    if (!request) return;
    if (!isAuthed) {
      const qs = searchParams?.toString();
      const nextPath = `${pathname}${qs ? `?${qs}` : ''}`;
      router.push(`/auth/login?next=${encodeURIComponent(nextPath)}`);
      toast.message(t(I18N_KEYS.requestDetails.loginRequired));
      return;
    }
    if (isOwner) {
      setIsOwnerEditMode(true);
      return;
    }
    if (isOfferAccepted) {
      router.push(DEFAULT_PRIVATE_WORKSPACE_REQUESTS_HREF);
      return;
    }
    if (applyState === 'edit') {
      handleEditOffer();
      return;
    }
    replaceWithOfferSheet(request.id);
  }, [applyState, handleEditOffer, isAuthed, isOfferAccepted, isOwner, pathname, replaceWithOfferSheet, request, router, searchParams, setIsOwnerEditMode, t]);

  const handleChat = React.useCallback(() => {
    if (!request) return;
    if (!isAuthed) {
      const qs = searchParams?.toString();
      const nextPath = `${pathname}${qs ? `?${qs}` : ''}`;
      router.push(`/auth/login?next=${encodeURIComponent(nextPath)}`);
      toast.message(t(I18N_KEYS.requestDetails.loginRequired));
      return;
    }
    if (isOwner) {
      toast.message(t(I18N_KEYS.requestDetails.ownerHint));
      return;
    }
    const participantUserId = request.clientId?.trim();
    if (!participantUserId) {
      toast.message(t(I18N_KEYS.requestDetails.chatSoon));
      return;
    }
    onOpenChatConversation({
      relatedEntity: { type: 'request', id: request.id },
      participantUserId,
      participantRole: 'customer',
      requestId: request.id,
    }, request.title?.trim() || viewModel?.title);
  }, [isAuthed, isOwner, onOpenChatConversation, pathname, request, router, searchParams, t, viewModel?.title]);

  const handleFavorite = React.useCallback(() => {
    if (!request) return;
    if (isOwner) {
      toast.message(t(I18N_KEYS.requestDetails.ownerHint));
      return;
    }
    void toggleRequestFavorite(request.id);
  }, [isOwner, request, t, toggleRequestFavorite]);

  const handleDeleteOffer = React.useCallback(async () => {
    if (!existingResponse?.id || isDeletingOffer) return;

    setIsDeletingOffer(true);
    try {
      await deleteOffer(existingResponse.id);
      toast.success(t(I18N_KEYS.requestDetails.responseCancelled));
      await Promise.all([
        qc.invalidateQueries({ queryKey: ['offers-my'] }),
        qc.invalidateQueries({ queryKey: ['request-detail', requestId] }),
        qc.invalidateQueries({ queryKey: ['workspace-managed-request', requestId] }),
        qc.invalidateQueries({ queryKey: providerQK.myProfile() }),
      ]);
    } catch {
      toast.error(t(I18N_KEYS.requestDetails.responseFailed));
    } finally {
      setIsDeletingOffer(false);
    }
  }, [existingResponse?.id, isDeletingOffer, qc, requestId, t]);

  const handleShare = React.useCallback(async () => {
    if (typeof window === 'undefined') return;

    const sharePath = request?.id ? `/requests/${request.id}` : `/requests/${requestId}`;
    const shareUrl = new URL(sharePath, window.location.origin).toString();

    try {
      if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
        await navigator.share({
          title: request?.title?.trim() || viewModel?.title || (locale === 'de' ? 'Anfrage' : 'Request'),
          url: shareUrl,
        });
      } else if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
        toast.success(locale === 'de' ? 'Link kopiert.' : 'Link copied.');
      } else {
        window.prompt(locale === 'de' ? 'Link teilen' : 'Share link', shareUrl);
      }
    } catch {
      toast.error(locale === 'de' ? 'Link konnte nicht geteilt werden.' : 'Could not share link.');
    }
  }, [locale, request?.id, request?.title, requestId, viewModel?.title]);

  const offerStatusBadge = React.useMemo(() => {
    if (offerCardState === 'none') return null;

    const statusLabel = offerCardState === 'accepted'
      ? t(I18N_KEYS.requestDetails.statusAccepted)
      : offerCardState === 'declined'
        ? t(I18N_KEYS.requestDetails.statusDeclined)
        : t(I18N_KEYS.requestDetails.statusReview);

    return (
      <span className="request-card__status-actions request-detail__status-actions">
        <span className={`${getStatusBadgeClass(offerCardState)} capitalize`}>{statusLabel}</span>
      </span>
    );
  }, [offerCardState, t]);

  const content = hasResolvedContent ? (
    <RequestDetailsContent
      t={t}
      locale={locale}
      request={resolvedRequest!}
      viewModel={resolvedViewModel!}
      surface="dialog"
      statusBadgeContent={offerStatusBadge ?? undefined}
      headerActionSlot={!isOwner ? (
        <RequestDetailInteractionMenu
          locale={locale}
          isSaved={isSaved}
          isSavePending={pendingFavoriteRequestIds.has(resolvedRequest!.id)}
          canEditOffer={offerCardState === 'sent'}
          canDeleteOffer={offerCardState === 'sent'}
          isDeletingOffer={isDeletingOffer}
          onToggleFavorite={handleFavorite}
          onEditOffer={handleEditOffer}
          onDeleteOffer={() => {
            void handleDeleteOffer();
          }}
          onShare={() => {
            void handleShare();
          }}
        />
      ) : undefined}
      requestStatusView={requestStatusView}
      requestPriceTrend={requestPriceTrend}
      requestPriceTrendLabel={requestPriceTrendLabel}
      applyLabel={applyLabel}
      applyState={applyState}
      applyTitle={applyTitle}
      showOfferCta={!isOwner}
      showChatCta={!isOwner}
      showFavoriteCta={!isOwner}
      showOwnerBadge={showOwnerBadge}
      isSaved={isSaved}
      isSavePending={pendingFavoriteRequestIds.has(resolvedRequest!.id)}
      onApply={handleApply}
      onChat={handleChat}
      onFavorite={handleFavorite}
      isOwnerEditMode={isOwnerEditMode}
      ownerTitle={ownerTitle}
      ownerDescription={ownerDescription}
      ownerPrice={ownerPrice}
      ownerCityId={ownerCityId}
      ownerPreferredDate={ownerPreferredDate}
      ownerPhotos={ownerPhotos}
      isSavingOwner={isSavingOwner}
      isUploadingOwnerPhoto={isUploadingOwnerPhoto}
      activeOwnerSubmitIntent={activeOwnerSubmitIntent}
      ownerPriceTrend={ownerPriceTrend}
      onToggleOwnerEdit={() => setIsOwnerEditMode((prev) => !prev)}
      onOwnerClearText={handleOwnerClearText}
      onOwnerTitleChange={setOwnerTitle}
      onOwnerDescriptionChange={setOwnerDescription}
      onOwnerPriceChange={setOwnerPrice}
      onOwnerCityChange={setOwnerCityId}
      onOwnerPreferredDateChange={setOwnerPreferredDate}
      onOwnerPhotoPick={(files) => {
        void handleOwnerPhotoPick(files);
      }}
      onOwnerPhotoRemove={(index) => {
        setOwnerPhotos((prev) => prev.filter((_, photoIndex) => photoIndex !== index));
      }}
      onOwnerCancelEdit={() => setIsOwnerEditMode(false)}
      onOwnerSave={(intent) => {
        void handleOwnerSave(intent);
      }}
      formatPriceValue={formatPriceValue}
      similarTitle={similarTitle}
      similarFallbackMessage={similarFallbackMessage}
      similarForRender={similarForRender}
      similarHref={similarHref}
      onOpenSimilarRequest={(nextRequestId) => onOpenRequest(nextRequestId, 'view')}
    />
  ) : null;

  if (surface === 'embedded') {
    if (isPending) {
      return (
        <div className="my-request-dialog__state">
          <div className="skeleton h-8 w-56" />
          <div className="skeleton h-24 w-full" />
          <div className="skeleton h-10 w-40" />
        </div>
      );
    }

    if (hasDialogError) {
      return (
        <div className="my-request-dialog__state">
          <div className="my-request-inline-state my-request-inline-state--error" role="alert">
            <span className="my-request-inline-state__icon" aria-hidden="true">!</span>
            <div className="my-request-inline-state__copy">
              <strong>{locale === 'de' ? 'Anfrage konnte nicht geladen werden' : 'Request could not be loaded'}</strong>
              <p>{locale === 'de'
                ? 'Der Workspace bleibt an derselben Stelle. Versuche es erneut, ohne die Seite zu verlassen.'
                : 'The workspace stays in place. Please try again without leaving this page.'}</p>
            </div>
            <span className="my-request-inline-state__meta">
              {locale === 'de' ? 'Inline' : 'Inline'}
            </span>
          </div>
        </div>
      );
    }

    return content;
  }

  return (
    <WorkspaceRequestDialogShell
      locale={locale}
      ariaLabel={request?.title?.trim() || viewModel?.title || (locale === 'de' ? 'Anfrage' : 'Request')}
      onClose={onClose}
      isLoading={isPending}
      isError={hasDialogError}
      errorTitle={locale === 'de' ? 'Anfrage konnte nicht geladen werden' : 'Request could not be loaded'}
      errorBody={locale === 'de'
        ? 'Der Workspace bleibt an derselben Stelle. Versuche es erneut, ohne die Seite zu verlassen.'
        : 'The workspace stays in place. Please try again without leaving this page.'}
    >
      {content}
    </WorkspaceRequestDialogShell>
  );
}
