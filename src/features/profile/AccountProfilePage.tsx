'use client';

import * as React from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { PageShell } from '@/components/layout/PageShell';
import { AuthActions } from '@/components/layout/AuthActions';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { LanguageToggle } from '@/components/ui/LanguageToggle';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Input } from '@/components/ui/Input';
import { useAuthUser } from '@/hooks/useAuthSnapshot';
import { useCities, useServices } from '@/features/catalog/queries';
import { getMyProviderProfile, updateMyProviderProfile } from '@/lib/api/providers';
import { listMyProviderOffers, listMyClientOffers } from '@/lib/api/offers';
import { listMyContracts } from '@/lib/api/contracts';
import { listInbox } from '@/lib/api/chat';
import { listMyRequests } from '@/lib/api/requests';
import { useT } from '@/lib/i18n/useT';
import { I18N_KEYS } from '@/lib/i18n/keys';
import { WorkspaceContentState } from '@/components/ui/WorkspaceContentState';
import { getStatusBadgeClass } from '@/lib/statusBadge';

type ProfileFormValues = {
  displayName: string;
  bio: string;
  companyName: string;
  vatId: string;
  cityId: string;
  basePrice: number;
  serviceKeys: string[];
};

async function with403Fallback<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (error instanceof Error && 'status' in error) {
      const status = Number((error as { status?: number }).status ?? 0);
      if (status === 403 || status === 404) return fallback;
    }
    throw error;
  }
}

export function AccountProfilePage() {
  const t = useT();
  const user = useAuthUser();
  const qc = useQueryClient();
  const searchParams = useSearchParams();
  const highlightOffer = searchParams?.get('highlight') === 'offer';

  const { data: cities } = useCities('DE');
  const { data: services } = useServices();

  const { data: providerProfile, isLoading: isProviderLoading } = useQuery({
    queryKey: ['provider-profile-me'],
    queryFn: () => with403Fallback(() => getMyProviderProfile(), null),
  });

  const { data: myRequests = [], isLoading: isMyRequestsLoading } = useQuery({
    queryKey: ['requests-my'],
    queryFn: () => with403Fallback(() => listMyRequests(), []),
  });

  const { data: providerOffers = [], isLoading: isProviderOffersLoading } = useQuery({
    queryKey: ['offers-my'],
    queryFn: () => with403Fallback(() => listMyProviderOffers(), []),
  });

  const { data: clientOffers = [] } = useQuery({
    queryKey: ['offers-my-client'],
    queryFn: () => with403Fallback(() => listMyClientOffers(), []),
  });

  const { data: providerContracts = [] } = useQuery({
    queryKey: ['contracts-my-provider'],
    queryFn: () => with403Fallback(() => listMyContracts({ role: 'provider' }), []),
  });

  const { data: clientContracts = [] } = useQuery({
    queryKey: ['contracts-my-client'],
    queryFn: () => with403Fallback(() => listMyContracts({ role: 'client' }), []),
  });

  const { data: providerInbox = [] } = useQuery({
    queryKey: ['chat-inbox', 'provider'],
    queryFn: () => with403Fallback(() => listInbox('provider'), []),
  });

  const { data: clientInbox = [] } = useQuery({
    queryKey: ['chat-inbox', 'client'],
    queryFn: () => with403Fallback(() => listInbox('client'), []),
  });

  const { register, handleSubmit, reset } = useForm<ProfileFormValues>({
    defaultValues: {
      displayName: '',
      bio: '',
      companyName: '',
      vatId: '',
      cityId: '',
      basePrice: 40,
      serviceKeys: [],
    },
  });

  React.useEffect(() => {
    if (!providerProfile) return;
    reset({
      displayName: providerProfile.displayName || '',
      bio: providerProfile.bio || '',
      companyName: providerProfile.companyName || '',
      vatId: providerProfile.vatId || '',
      cityId: providerProfile.cityId || '',
      basePrice: providerProfile.basePrice ?? 40,
      serviceKeys: providerProfile.serviceKeys || [],
    });
  }, [providerProfile, reset]);

  const unreadCount = React.useMemo(() => {
    const providerUnread = providerInbox.reduce((sum, thread) => sum + (thread.unreadProviderCount || 0), 0);
    const clientUnread = clientInbox.reduce((sum, thread) => sum + (thread.unreadClientCount || 0), 0);
    return providerUnread + clientUnread;
  }, [providerInbox, clientInbox]);

  const offersByRequest = React.useMemo(() => {
    const map = new Map<string, number>();
    clientOffers.forEach((offer) => {
      map.set(offer.requestId, (map.get(offer.requestId) ?? 0) + 1);
    });
    return map;
  }, [clientOffers]);

  const onSubmit = async (values: ProfileFormValues) => {
    try {
      await updateMyProviderProfile({
        ...values,
        serviceKeys: values.serviceKeys || [],
        basePrice: Number(values.basePrice),
      });
      toast.success(t(I18N_KEYS.provider.profileSaved));
      await qc.invalidateQueries({ queryKey: ['provider-profile-me'] });
    } catch (error) {
      const message = error instanceof Error ? error.message : t(I18N_KEYS.common.loadError);
      toast.error(message);
    }
  };

  return (
    <PageShell right={<AuthActions />} withSpacer={false}>
      <section className="card stack-sm">
        <h1 className="typo-h2">{t(I18N_KEYS.auth.profileLabel)}</h1>
        <p className="typo-muted">{user?.name ?? providerProfile?.displayName ?? t(I18N_KEYS.provider.unnamed)}</p>
        <p className="typo-small">{user?.email}</p>
      </section>

      <section className="card stack-sm">
        <h2 className="typo-h3">{t(I18N_KEYS.client.settingsTitle)}</h2>
        <div className="flex items-center justify-between">
          <span className="typo-small">{t(I18N_KEYS.common.themeLabel)}</span>
          <ThemeToggle />
        </div>
        <div className="flex items-center justify-between">
          <span className="typo-small">{t(I18N_KEYS.auth.languageLabel)}</span>
          <LanguageToggle />
        </div>
      </section>

      <section className="card stack-sm">
        <div className="flex items-center justify-between">
          <h2 className="typo-h3">{t(I18N_KEYS.client.chatsTitle)}</h2>
          <Link href="/chat" className="typo-small">{t(I18N_KEYS.client.viewAll)}</Link>
        </div>
        <div className="flex items-center justify-between">
          <span className="typo-small">{t(I18N_KEYS.chat.inboxTitle)}</span>
          <span className="badge">{unreadCount}</span>
        </div>
      </section>

      <section className="card stack-sm">
        <div className="flex items-center justify-between">
          <h2 className="typo-h3">{t(I18N_KEYS.client.requestsTitle)}</h2>
          <Link href="/requests" className="typo-small">{t(I18N_KEYS.client.viewAll)}</Link>
        </div>
        <div className="stack-sm">
          <WorkspaceContentState
            isLoading={isMyRequestsLoading}
            isEmpty={myRequests.length === 0}
            emptyTitle={t(I18N_KEYS.client.requestsEmpty)}
            emptyHint={t(I18N_KEYS.client.requestsTitle)}
            emptyCtaLabel={t(I18N_KEYS.requestsPage.navNewOrders)}
            emptyCtaHref="/orders?tab=new-orders"
          >
            {myRequests.slice(0, 3).map((item) => (
              <div key={item.id} className="flex items-center justify-between workspace-list-item">
                <div>
                  <p className="text-sm font-semibold">{item.serviceKey}</p>
                  <p className="typo-small">{item.propertyType} · {item.area} m²</p>
                </div>
                <div className="text-right">
                  <span className={getStatusBadgeClass(item.status)}>{item.status}</span>
                  <p className="typo-small">{t(I18N_KEYS.client.responsesLabel)}: {offersByRequest.get(item.id) ?? 0}</p>
                </div>
              </div>
            ))}
          </WorkspaceContentState>
        </div>
      </section>

      <section className="card stack-sm">
        <div className="flex items-center justify-between">
          <h2 className="typo-h3">{t(I18N_KEYS.provider.myResponsesTitle)}</h2>
          <Link href="/requests" className="typo-small">{t(I18N_KEYS.client.viewAll)}</Link>
        </div>
        <div className="stack-sm">
          <WorkspaceContentState
            isLoading={isProviderOffersLoading}
            isEmpty={providerOffers.length === 0}
            emptyTitle={t(I18N_KEYS.provider.responsesEmpty)}
            emptyHint={t(I18N_KEYS.provider.myResponsesTitle)}
            emptyCtaLabel={t(I18N_KEYS.requestsPage.navNewOrders)}
            emptyCtaHref="/orders?tab=new-orders"
          >
            {providerOffers.slice(0, 3).map((item) => (
              <div key={item.id} className="flex items-center justify-between workspace-list-item">
                <div>
                  <p className="text-sm font-semibold">{item.requestServiceKey || item.requestId}</p>
                  <p className="typo-small">{item.requestPreferredDate ?? ''}</p>
                </div>
                <span className={getStatusBadgeClass(item.status)}>{item.status}</span>
              </div>
            ))}
          </WorkspaceContentState>
        </div>
      </section>

      <section className="card stack-sm">
        <div className="flex items-center justify-between">
          <h2 className="typo-h3">{t(I18N_KEYS.client.contractsTitle)}</h2>
          <Link href="/orders?tab=completed-jobs" className="typo-small">{t(I18N_KEYS.client.viewAll)}</Link>
        </div>
        <div className="flex items-center justify-between">
          <span className="typo-small">{t(I18N_KEYS.provider.contractsTitle)}</span>
          <span className="badge">{providerContracts.length}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="typo-small">{t(I18N_KEYS.client.contractsSubtitle)}</span>
          <span className="badge">{clientContracts.length}</span>
        </div>
      </section>

      {highlightOffer ? (
        <section className="card stack-sm provider-profile-highlight">
          <p className="typo-small">{t(I18N_KEYS.requestDetails.responseSuccessBody)}</p>
        </section>
      ) : null}

      <section className="text-center stack-sm">
        <h2 className="typo-h3">{t(I18N_KEYS.provider.profileSubtitle)}</h2>
      </section>

      <WorkspaceContentState
        isLoading={isProviderLoading}
        isEmpty={false}
        emptyTitle=""
        emptyHint=""
        skeletonCount={1}
      >
      <form
        className={`card stack-md workspace-list-item ${highlightOffer ? 'provider-profile-form--highlight' : ''}`.trim()}
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="stack-sm">
          <label className="typo-small">{t(I18N_KEYS.provider.displayName)}</label>
          <Field>
            <Input {...register('displayName')} />
          </Field>
        </div>

        <div className="stack-sm">
          <label className="typo-small">{t(I18N_KEYS.provider.bio)}</label>
          <Field>
            <Input {...register('bio')} />
          </Field>
        </div>

        <div className="stack-sm">
          <label className="typo-small">{t(I18N_KEYS.provider.companyName)}</label>
          <Field>
            <Input {...register('companyName')} />
          </Field>
        </div>

        <div className="stack-sm">
          <label className="typo-small">{t(I18N_KEYS.provider.vatId)}</label>
          <Field>
            <Input {...register('vatId')} />
          </Field>
        </div>

        <div className="stack-sm">
          <label className="typo-small">{t(I18N_KEYS.provider.city)}</label>
          <Field>
            <select className="field" {...register('cityId')}>
              <option value="">—</option>
              {(cities ?? []).map((city) => (
                <option key={city.id} value={city.id}>
                  {city.i18n?.de || city.i18n?.en || city.key}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <div className="stack-sm">
          <label className="typo-small">{t(I18N_KEYS.provider.basePrice)}</label>
          <Field>
            <Input type="number" min={10} {...register('basePrice')} />
          </Field>
        </div>

        <div className="stack-sm">
          <label className="typo-small">{t(I18N_KEYS.provider.services)}</label>
          <div className="stack-sm">
            <div className="flex flex-wrap gap-2">
              {(services ?? [])
                .filter((service) => (providerProfile?.serviceKeys || []).includes(service.key))
                .map((service) => (
                  <span key={service.key} className="badge">
                    {service.i18n?.de || service.i18n?.en || service.key}
                  </span>
                ))}
            </div>
            {(services ?? []).map((service) => (
              <label key={service.key} className="flex items-center gap-2 text-sm">
                <input type="checkbox" value={service.key} {...register('serviceKeys')} />
                <span>{service.i18n?.de || service.i18n?.en || service.key}</span>
              </label>
            ))}
          </div>
        </div>

        <Button type="submit">{t(I18N_KEYS.provider.save)}</Button>
      </form>
      </WorkspaceContentState>
    </PageShell>
  );
}
