// src/app/offers/[requestId]/page.tsx
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { PageShell } from '@/components/layout/PageShell';
import { AuthActions } from '@/components/layout/AuthActions';
import { Button } from '@/components/ui/Button';
import { listOffersByRequest, acceptOffer } from '@/lib/api/offers';
import { useT } from '@/lib/i18n/useT';
import { I18N_KEYS } from '@/lib/i18n/keys';
import { useAuthStatus } from '@/hooks/useAuthSnapshot';
import Link from 'next/link';

const Star = ({ filled }: { filled: boolean }) => (
  <span
    className={filled ? 'text-[var(--c-primary)]' : 'text-[var(--c-border)]'}
    aria-hidden
  >
    ★
  </span>
);

export default function OffersPage() {
  const params = useParams();
  const requestId = params?.requestId as string;
  const t = useT();
  const qc = useQueryClient();
  const router = useRouter();
  const status = useAuthStatus();

  const { data, isLoading } = useQuery({
    queryKey: ['offers', requestId],
    queryFn: () => listOffersByRequest(requestId),
    enabled: Boolean(requestId),
  });

  const ensureAuth = (next: string) => {
    if (status === 'authenticated') return true;
    router.push(`/auth/register?role=client&next=${encodeURIComponent(next)}`);
    return false;
  };

  const onAccept = async (id: string) => {
    try {
      if (!ensureAuth(`/offers/${requestId}`)) return;
      await acceptOffer(id);
      toast.success(t(I18N_KEYS.offers.accepted));
      await qc.invalidateQueries({ queryKey: ['offers', requestId] });
      await qc.invalidateQueries({ queryKey: ['client-contracts'] });
      router.push('/client/contracts');
    } catch (error) {
      const message = error instanceof Error ? error.message : t(I18N_KEYS.common.loadError);
      toast.error(message);
    }
  };

  const renderStars = (rating?: number | null) => {
    const safe = Math.max(0, Math.min(5, Math.round(rating ?? 0)));
    return (
      <span className="flex items-center gap-1 text-sm">
        {Array.from({ length: 5 }).map((_, idx) => (
          <Star key={idx} filled={idx < safe} />
        ))}
        <span className="ml-1 text-[var(--c-text-muted)]">{rating?.toFixed(1) ?? '—'}</span>
      </span>
    );
  };

  return (
    <PageShell right={<AuthActions />} withSpacer={false}>
      <section className="text-center stack-sm">
          <h1 className="typo-h2">{t(I18N_KEYS.offers.title)}</h1>
          <p className="typo-muted">{t(I18N_KEYS.offers.subtitle)}</p>
        </section>

        {status !== 'authenticated' ? (
          <div className="card stack-sm">
            <p className="typo-small">{t(I18N_KEYS.offers.softSubtitle)}</p>
            <div className="flex items-center gap-2">
              <Link href={`/auth/register?role=client&next=/offers/${requestId}`} className="badge">
                {t(I18N_KEYS.offers.registerCta)}
              </Link>
              <Link href={`/auth/login?next=/offers/${requestId}`} className="badge">
                {t(I18N_KEYS.offers.loginCta)}
              </Link>
            </div>
          </div>
        ) : null}

        {isLoading ? <p className="typo-muted">{t(I18N_KEYS.common.refreshing)}</p> : null}

        <div className="stack-md">
          {(data ?? []).length === 0 && !isLoading ? (
            <p className="typo-muted text-center">{t(I18N_KEYS.offers.empty)}</p>
          ) : null}

          {(data ?? []).map((item) => {
            const displayName = item.providerDisplayName || t(I18N_KEYS.offers.unnamed);
            const initials = displayName
              .split(' ')
              .slice(0, 2)
              .map((part) => part[0]?.toUpperCase())
              .join('');
            return (
              <div key={item.id} className="card stack-md">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 shrink-0 rounded-full border border-[var(--c-border)] bg-[var(--c-panel)] flex items-center justify-center text-sm font-semibold text-[var(--c-text-muted)]">
                    {initials || '•'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-base font-semibold">{displayName}</p>
                        <div className="mt-1">{renderStars(item.providerRatingAvg)}</div>
                      </div>
                      <span className="badge capitalize">{item.status}</span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="badge">
                        {t(I18N_KEYS.offers.jobs)}: {item.providerCompletedJobs ?? '—'}
                      </span>
                      {item.providerBasePrice ? (
                        <span className="badge">€ {item.providerBasePrice}</span>
                      ) : null}
                    </div>
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <Link href={`/providers/${item.providerUserId}`} className="badge">
                        {t(I18N_KEYS.offers.profileCta)}
                      </Link>
                      <button
                        type="button"
                        className="badge"
                        onClick={() => {
                          if (!ensureAuth(`/chat/${item.id}`)) return;
                          router.push(`/chat/${item.id}`);
                        }}
                      >
                        {t(I18N_KEYS.offers.chatCta)}
                      </button>
                      <Button type="button" onClick={() => onAccept(item.id)}>
                        {t(I18N_KEYS.offers.acceptCta)}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
    </PageShell>
  );
}
