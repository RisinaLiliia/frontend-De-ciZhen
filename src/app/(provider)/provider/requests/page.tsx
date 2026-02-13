// src/app/provider/requests/page.tsx
'use client';

import * as React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { PageShell } from '@/components/layout/PageShell';
import { AuthActions } from '@/components/layout/AuthActions';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { IconCheck, IconHeart } from '@/components/ui/icons/icons';
import { listPublicRequests } from '@/lib/api/requests';
import { createOffer, listMyProviderOffers } from '@/lib/api/offers';
import { addFavorite, listFavorites, removeFavorite } from '@/lib/api/favorites';
import { useT } from '@/lib/i18n/useT';
import { I18N_KEYS } from '@/lib/i18n/keys';
import { useCities, useServices } from '@/features/catalog/queries';
import { pickI18n } from '@/lib/i18n/helpers';
import { useI18n } from '@/lib/i18n/I18nProvider';

export default function ProviderRequestsPage() {
  const t = useT();
  const { locale } = useI18n();
  const qc = useQueryClient();
  const { data: cities } = useCities('DE');
  const { data: services } = useServices();

  const { data, isLoading } = useQuery({
    queryKey: ['provider-requests'],
    queryFn: () => listPublicRequests(),
  });

  const { data: offers } = useQuery({
    queryKey: ['offers-my'],
    queryFn: () => listMyProviderOffers(),
  });

  const { data: favoriteRequests } = useQuery({
    queryKey: ['favorite-requests'],
    queryFn: () => listFavorites('request'),
  });

  const items = React.useMemo(() => (Array.isArray(data) ? data : (data?.items ?? [])), [data]);

  const offersByRequest = React.useMemo(() => {
    const map = new Map<string, { id: string; amount: number | null }>();
    (offers ?? []).forEach((offer) => {
      if (!map.has(offer.requestId)) {
        map.set(offer.requestId, {
          id: offer.id,
          amount: typeof offer.amount === 'number' ? offer.amount : null,
        });
      }
    });
    return map;
  }, [offers]);

  const favoriteRequestIds = React.useMemo(
    () => new Set((favoriteRequests ?? []).map((item) => item.id)),
    [favoriteRequests],
  );

  const [draft, setDraft] = React.useState<{
    requestId: string;
    amount: string;
    comment: string;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const formatPrice = React.useMemo(
    () =>
      new Intl.NumberFormat(locale === 'de' ? 'de-DE' : 'en-US', {
        style: 'currency',
        currency: 'EUR',
        maximumFractionDigits: 0,
      }),
    [locale],
  );

  const startRespond = React.useCallback((requestId: string, suggestedPrice?: number | null) => {
    setDraft({
      requestId,
      amount: suggestedPrice && suggestedPrice > 0 ? String(Math.round(suggestedPrice)) : '120',
      comment: '',
    });
  }, []);

  const onRespond = React.useCallback(async () => {
    if (!draft) return;
    const amount = Number(draft.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      toast.message(t(I18N_KEYS.requestDetails.responseAmountInvalid));
      return;
    }

    setIsSubmitting(true);
    try {
      await createOffer({
        requestId: draft.requestId,
        amount,
        message: draft.comment.trim() || undefined,
      });
      toast.success(t(I18N_KEYS.provider.responded));
      setDraft(null);
      await Promise.all([
        qc.invalidateQueries({ queryKey: ['offers-my'] }),
        qc.invalidateQueries({ queryKey: ['provider-requests'] }),
      ]);
    } catch (error) {
      const message = error instanceof Error ? error.message : t(I18N_KEYS.common.loadError);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }, [draft, qc, t]);

  const onToggleFavorite = React.useCallback(
    async (requestId: string) => {
      const isSaved = favoriteRequestIds.has(requestId);
      try {
        if (isSaved) {
          await removeFavorite('request', requestId);
          toast.message(t(I18N_KEYS.requestDetails.favoritesRemoved));
        } else {
          await addFavorite('request', requestId);
          toast.success(t(I18N_KEYS.requestDetails.saved));
        }
        await qc.invalidateQueries({ queryKey: ['favorite-requests'] });
      } catch {
        toast.error(t(I18N_KEYS.requestDetails.favoritesFailed));
      }
    },
    [favoriteRequestIds, qc, t],
  );

  return (
    <PageShell right={<AuthActions />} withSpacer={false}>
      <section className="text-center stack-sm">
        <h1 className="typo-h2">{t(I18N_KEYS.provider.feedTitle)}</h1>
        <p className="typo-muted">{t(I18N_KEYS.provider.feedSubtitle)}</p>
      </section>

      {isLoading ? <p className="typo-muted">{t(I18N_KEYS.common.refreshing)}</p> : null}

      <div className="stack-md provider-requests-list">
        {items.length === 0 && !isLoading ? (
          <p className="typo-muted text-center">{t(I18N_KEYS.provider.feedEmpty)}</p>
        ) : null}

        {items.map((item) => {
          const city = cities?.find((c) => c.id === item.cityId);
          const service = services?.find((s) => s.key === item.serviceKey);
          const cityLabel = city ? pickI18n(city.i18n, locale) : item.cityId;
          const serviceLabel = service ? pickI18n(service.i18n, locale) : item.serviceKey;
          const existingOffer = offersByRequest.get(item.id);
          const isSaved = favoriteRequestIds.has(item.id);
          const isResponded = Boolean(existingOffer);
          const showDraftForm = draft?.requestId === item.id;

          return (
            <div key={item.id} className="card stack-sm provider-request-card">
              <div className="provider-request-card__head">
                <div>
                  <p className="text-base font-semibold">{serviceLabel}</p>
                  <p className="typo-small">
                    {item.propertyType} · {item.area} m² · {cityLabel}
                  </p>
                  <p className="typo-small">{new Date(item.preferredDate).toLocaleDateString()}</p>
                </div>
                <div className="provider-request-card__icons">
                  <button
                    type="button"
                    className={`btn-ghost provider-request-card__favorite ${isSaved ? 'is-saved' : ''}`}
                    onClick={() => onToggleFavorite(item.id)}
                    aria-label={t(I18N_KEYS.requestDetails.ctaSave)}
                  >
                    <IconHeart className="icon-heart" />
                  </button>
                  {isResponded ? (
                    <span className="provider-request-card__responded">
                      <IconCheck />
                      <span>
                        {existingOffer?.amount
                          ? `${t(I18N_KEYS.requestDetails.responseYourPrice)} ${formatPrice.format(existingOffer.amount)}`
                          : t(I18N_KEYS.provider.responded)}
                      </span>
                    </span>
                  ) : null}
                </div>
              </div>

              {showDraftForm ? (
                <div className="provider-request-card__form stack-sm">
                  <label className="typo-small">
                    {t(I18N_KEYS.requestDetails.responseAmountLabel)}
                  </label>
                  <Input
                    type="number"
                    min={1}
                    value={draft!.amount}
                    onChange={(event) => setDraft({ ...draft!, amount: event.target.value })}
                  />
                  <label className="typo-small">
                    {t(I18N_KEYS.requestDetails.responseCommentLabel)}
                  </label>
                  <Textarea
                    rows={2}
                    value={draft!.comment}
                    onChange={(event) => setDraft({ ...draft!, comment: event.target.value })}
                    placeholder={t(I18N_KEYS.requestDetails.responseCommentPlaceholder)}
                  />
                  <div className="provider-request-card__form-actions">
                    <Button type="button" onClick={onRespond} loading={isSubmitting}>
                      {t(I18N_KEYS.requestDetails.responseSubmit)}
                    </Button>
                    <button
                      type="button"
                      className="btn-ghost"
                      onClick={() => setDraft(null)}
                      disabled={isSubmitting}
                    >
                      {t(I18N_KEYS.common.back)}
                    </button>
                  </div>
                </div>
              ) : (
                <Button
                  type="button"
                  onClick={() => startRespond(item.id, item.price)}
                  disabled={isResponded}
                >
                  {isResponded
                    ? t(I18N_KEYS.requestDetails.responseAlready)
                    : t(I18N_KEYS.provider.respondCta)}
                </Button>
              )}
            </div>
          );
        })}
      </div>
    </PageShell>
  );
}
