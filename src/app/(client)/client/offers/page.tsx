// src/app/client/offers/page.tsx
'use client';

import * as React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

import { PageShell } from '@/components/layout/PageShell';
import { AuthActions } from '@/components/layout/AuthActions';
import { Button } from '@/components/ui/Button';
import { listMyClientOffers, acceptOffer } from '@/lib/api/offers';
import { createThread } from '@/lib/api/chat';
import { useT } from '@/lib/i18n/useT';
import { I18N_KEYS } from '@/lib/i18n/keys';
import Link from 'next/link';
import { UserHeaderCard } from '@/components/ui/UserHeaderCard';

export default function ClientOffersPage() {
  const t = useT();
  const qc = useQueryClient();
  const router = useRouter();

  const { data, isLoading } = useQuery({
    queryKey: ['client-offers'],
    queryFn: () => listMyClientOffers(),
  });

  const onAccept = async (id: string) => {
    try {
      await acceptOffer(id);
      toast.success(t(I18N_KEYS.offers.accepted));
      await qc.invalidateQueries({ queryKey: ['client-offers'] });
      await qc.invalidateQueries({ queryKey: ['client-contracts'] });
      router.push('/client/contracts');
    } catch (error) {
      const message = error instanceof Error ? error.message : t(I18N_KEYS.common.loadError);
      toast.error(message);
    }
  };

  return (
    <PageShell right={<AuthActions />} withSpacer={false}>
      <section className="text-center stack-sm">
        <h1 className="typo-h2">{t(I18N_KEYS.client.offersTitle)}</h1>
        <p className="typo-muted">{t(I18N_KEYS.client.offersSubtitle)}</p>
      </section>

        {isLoading ? <p className="typo-muted">{t(I18N_KEYS.common.refreshing)}</p> : null}

      <div className="stack-md">
        {(data ?? []).length === 0 && !isLoading ? (
          <p className="typo-muted text-center">{t(I18N_KEYS.client.offersEmpty)}</p>
        ) : null}

          {(data ?? []).map((item) => {
            const displayName = item.providerDisplayName || t(I18N_KEYS.offers.unnamed);
            return (
              <div key={item.id} className="card stack-md">
                <div className="flex items-start gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <UserHeaderCard
                        name={displayName}
                        avatarUrl={item.providerAvatarUrl}
                        hasProviderProfile
                        rating={item.providerRatingAvg?.toFixed(1) ?? '—'}
                        reviewsCount={item.providerRatingCount ?? 0}
                        reviewsLabel={t(I18N_KEYS.homePublic.reviews)}
                      />
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
                        onClick={async () => {
                          try {
                            const thread = await createThread({
                              requestId: item.requestId,
                              providerUserId: item.providerUserId ?? '',
                              offerId: item.id,
                            });
                            router.push(`/chat/${thread.id}`);
                          } catch (error) {
                            const message = error instanceof Error ? error.message : t(I18N_KEYS.common.loadError);
                            toast.error(message);
                          }
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
