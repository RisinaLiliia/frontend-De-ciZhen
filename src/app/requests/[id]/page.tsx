//src/app/requests/[id]/page.tsx
"use client";

import * as React from "react";
import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { PageShell } from "@/components/layout/PageShell";
import { AuthActions } from "@/components/layout/AuthActions";
import {
  RequestDetailAbout,
  RequestDetailAside,
  RequestDetailClient,
  RequestDetailError,
  RequestDetailGallery,
  RequestDetailHeader,
  RequestDetailLoading,
  RequestDetailMobileCta,
  RequestDetailSimilar,
} from "@/components/requests/details";
import { getPublicRequestById, listPublicRequests } from "@/lib/api/requests";
import { respondToRequest } from "@/lib/api/responses";
import { useAuthStatus } from "@/hooks/useAuthSnapshot";
import { listMyProviderResponses } from "@/lib/api/responses";
import { I18N_KEYS } from "@/lib/i18n/keys";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { useT } from "@/lib/i18n/useT";
import { buildRequestImageList } from "@/lib/requests/images";
import {
  buildRequestDetailsViewModel,
  type RequestDetailsViewModel,
} from "@/features/requests/details/viewModel";

const SIMILAR_LIMIT = 2;

export default function RequestDetailsPage() {
  const t = useT();
  const { locale } = useI18n();
  const authStatus = useAuthStatus();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const params = useParams();
  const requestId = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const actionHandledRef = React.useRef(false);

  const {
    data: request,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["request-detail", requestId],
    enabled: Boolean(requestId),
    queryFn: () => getPublicRequestById(String(requestId)),
  });

  const {
    data: similarData,
  } = useQuery({
    queryKey: [
      "request-similar",
      request?.id,
      request?.categoryKey,
      request?.serviceKey,
    ],
    enabled: Boolean(request?.id),
    queryFn: () =>
      listPublicRequests({
        categoryKey: request?.categoryKey ?? undefined,
        sort: "date_desc",
        limit: 20,
      }),
  });

  const {
    data: myResponses,
  } = useQuery({
    queryKey: ["responses-my"],
    enabled: authStatus === 'authenticated',
    queryFn: () => listMyProviderResponses(),
  });

  const [isSaved, setIsSaved] = React.useState(false);
  const isAlreadyResponded = React.useMemo(() => {
    if (!request || !myResponses) return false;
    return myResponses.some((response) => response.requestId === request.id);
  }, [myResponses, request]);

  const buildNextUrl = React.useCallback(
    (action: string) => {
      const nextParams = new URLSearchParams(searchParams?.toString());
      nextParams.set('action', action);
      const qs = nextParams.toString();
      return `${pathname}${qs ? `?${qs}` : ''}`;
    },
    [pathname, searchParams],
  );

  const requireAuth = React.useCallback(
    (action: string) => {
      const nextUrl = buildNextUrl(action);
      router.push(`/auth/login?next=${encodeURIComponent(nextUrl)}`);
      toast.message(t(I18N_KEYS.requestDetails.loginRequired));
    },
    [buildNextUrl, router, t],
  );

  const handleApply = React.useCallback(async () => {
    if (!request) return;
    if (authStatus !== 'authenticated') {
      requireAuth('respond');
      return;
    }
    if (isAlreadyResponded) {
      toast.message(t(I18N_KEYS.requestDetails.responseAlready));
      return;
    }
    try {
      await respondToRequest({ requestId: request.id });
      toast.success(t(I18N_KEYS.requestDetails.responseSent));
    } catch {
      toast.error(t(I18N_KEYS.requestDetails.responseFailed));
    }
  }, [authStatus, isAlreadyResponded, request, requireAuth, t]);

  const handleChat = React.useCallback(() => {
    if (authStatus !== 'authenticated') {
      requireAuth('chat');
      return;
    }
    toast.message(t(I18N_KEYS.requestDetails.chatSoon));
  }, [authStatus, requireAuth, t]);

  const handleFavorite = React.useCallback(() => {
    if (authStatus !== 'authenticated') {
      requireAuth('favorite');
      return;
    }
    setIsSaved((prev) => !prev);
    toast.message(t(I18N_KEYS.requestDetails.favoritesSoon));
  }, [authStatus, requireAuth, t]);

  const localeTag = locale === "de" ? "de-DE" : "en-US";
  const formatPrice = React.useMemo(
    () =>
      new Intl.NumberFormat(localeTag, {
        style: "currency",
        currency: "EUR",
        maximumFractionDigits: 0,
      }),
    [localeTag],
  );
  const formatDate = React.useMemo(
    () =>
      new Intl.DateTimeFormat(localeTag, {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }),
    [localeTag],
  );

  const similar = React.useMemo(() => {
    if (!request) return [];
    const items = similarData?.items ?? [];
    const filtered = items
      .filter(
        (item) =>
          item.id !== request.id &&
          (item.categoryKey === request.categoryKey ||
            item.serviceKey === request.serviceKey),
      )
      .slice(0, SIMILAR_LIMIT);
    if (filtered.length) return filtered;
    return items.filter((item) => item.id !== request.id).slice(0, SIMILAR_LIMIT);
  }, [request, similarData]);

  const {
    data: latestData,
  } = useQuery({
    queryKey: ["requests-latest"],
    enabled: Boolean(request?.id) && similar.length === 0,
    queryFn: () =>
      listPublicRequests({
        sort: "date_desc",
        limit: 12,
      }),
  });

  const latest = React.useMemo(() => {
    if (!request) return [];
    const items = latestData?.items ?? [];
    return items.filter((item) => item.id !== request.id).slice(0, SIMILAR_LIMIT);
  }, [latestData, request]);

  const similarFallbackMessage =
    similar.length === 0 && latest.length
      ? t(I18N_KEYS.requestDetails.noSimilarMessage)
      : undefined;
  const similarTitle =
    similar.length === 0 && latest.length
      ? t(I18N_KEYS.requestDetails.latestTitle)
      : t(I18N_KEYS.requestDetails.similar);
  const similarHref = React.useMemo(() => {
    const params = new URLSearchParams();
    if (request?.categoryKey) params.set('categoryKey', request.categoryKey);
    if (request?.serviceKey) params.set('subcategoryKey', request.serviceKey);
    const qs = params.toString();
    return `/requests${qs ? `?${qs}` : ''}`;
  }, [request]);
  const similarForRender = similar.length ? similar : latest;

  const [isClientOnline, setIsClientOnline] = React.useState(false);

  React.useEffect(() => {
    if (!request) return;
    if (typeof request.clientIsOnline === "boolean") {
      setIsClientOnline(request.clientIsOnline);
      return;
    }
    if (request.clientLastSeenAt) {
      const lastSeen = new Date(request.clientLastSeenAt).getTime();
      const isRecent = Number.isFinite(lastSeen)
        ? Date.now() - lastSeen < 5 * 60 * 1000
        : false;
      setIsClientOnline(isRecent);
      return;
    }
    setIsClientOnline(false);
  }, [request]);


  const viewModel = React.useMemo<RequestDetailsViewModel | null>(() => {
    if (!request) return null;
    return buildRequestDetailsViewModel({
      request,
      t,
      formatPrice: (value) => formatPrice.format(value),
      formatDate: (value) => formatDate.format(value),
      isClientOnline,
    });
  }, [formatDate, formatPrice, isClientOnline, request, t]);

  React.useEffect(() => {
    if (actionHandledRef.current) return;
    if (!request || authStatus !== 'authenticated') return;
    const action = searchParams?.get('action');
    if (!action) return;
    actionHandledRef.current = true;
    if (action === 'respond') {
      void respondToRequest({ requestId: request.id })
        .then(() => toast.success(t(I18N_KEYS.requestDetails.responseSent)))
        .catch(() => toast.error(t(I18N_KEYS.requestDetails.responseFailed)));
    } else if (action === 'chat') {
      toast.message(t(I18N_KEYS.requestDetails.chatSoon));
    } else if (action === 'favorite') {
      toast.message(t(I18N_KEYS.requestDetails.favoritesSoon));
    }
    const nextParams = new URLSearchParams(searchParams?.toString());
    nextParams.delete('action');
    const nextQs = nextParams.toString();
    router.replace(`${pathname}${nextQs ? `?${nextQs}` : ''}`);
  }, [authStatus, pathname, request, router, searchParams, t]);

  if (isLoading) {
    return <RequestDetailLoading />;
  }

  if (isError || !request || !viewModel) {
    return <RequestDetailError message={t(I18N_KEYS.requestsPage.error)} />;
  }

  return (
    <PageShell right={<AuthActions />} showBack mainClassName="py-6">
      <div className="request-detail">
        <section className="panel request-detail__panel">
          <RequestDetailHeader
            title={viewModel.title}
            priceLabel={viewModel.priceLabel}
            tags={viewModel.tagList}
          />
          <RequestDetailGallery images={viewModel.images} title={viewModel.title} />
          <RequestDetailAbout
            title={t(I18N_KEYS.requestDetails.about)}
            description={viewModel.description}
          />
          {viewModel.hasClientInfo ? (
            <RequestDetailClient
              title={t(I18N_KEYS.requestDetails.clientTitle)}
              profileHref={viewModel.clientProfileHref}
              name={viewModel.clientName}
              avatarUrl={viewModel.clientAvatarUrl}
              status={viewModel.clientStatus}
              statusLabel={viewModel.clientStatusLabel}
              ratingText={viewModel.clientRatingText}
              ratingCount={viewModel.clientRatingCount}
              reviewsLabel={t(I18N_KEYS.requestDetails.clientReviews)}
            />
          ) : null}
        </section>
        <RequestDetailAside
          cityLabel={viewModel.cityLabel}
          dateLabel={viewModel.preferredDateLabel}
          ctaApplyLabel={
            authStatus === 'authenticated' && isAlreadyResponded
              ? t(I18N_KEYS.requestDetails.responseAlready)
              : t(I18N_KEYS.requestDetails.ctaApply)
          }
          ctaChatLabel={t(I18N_KEYS.requestDetails.ctaChat)}
          ctaSaveLabel={t(I18N_KEYS.requestDetails.ctaSave)}
          isSaved={isSaved}
          onApply={handleApply}
          onChat={handleChat}
          onToggleSave={handleFavorite}
          applyDisabled={authStatus === 'authenticated' && isAlreadyResponded}
          applyState={authStatus === 'authenticated' && isAlreadyResponded ? 'done' : 'default'}
        >
          <RequestDetailSimilar
            title={similarTitle}
            message={similarFallbackMessage}
            items={similarForRender}
            footerLabel={t(I18N_KEYS.requestDetails.showAll)}
            footerHref={similarHref}
            formatDate={(value) => formatDate.format(value)}
            formatPrice={(value) => formatPrice.format(value)}
            badgeTodayLabel={t(I18N_KEYS.requestsPage.badgeToday)}
            recurringLabel={t(I18N_KEYS.client.recurringLabel)}
            onceLabel={t(I18N_KEYS.client.onceLabel)}
            openRequestLabel={t(I18N_KEYS.requestsPage.openRequest)}
            detailsCtaLabel={t(I18N_KEYS.requestsPage.detailsCta)}
            priceOnRequestLabel={t(I18N_KEYS.requestDetails.priceOnRequest)}
            getImage={(item) => buildRequestImageList(item)[0]}
          />
        </RequestDetailAside>
      </div>
      <RequestDetailMobileCta
        ctaApplyLabel={
          authStatus === 'authenticated' && isAlreadyResponded
            ? t(I18N_KEYS.requestDetails.responseAlready)
            : t(I18N_KEYS.requestDetails.ctaApply)
        }
        ctaChatLabel={t(I18N_KEYS.requestDetails.ctaChat)}
        ctaSaveLabel={t(I18N_KEYS.requestDetails.ctaSave)}
        isSaved={isSaved}
        onApply={handleApply}
        onChat={handleChat}
        onToggleSave={handleFavorite}
        applyDisabled={authStatus === 'authenticated' && isAlreadyResponded}
        applyState={authStatus === 'authenticated' && isAlreadyResponded ? 'done' : 'default'}
      />
    </PageShell>
  );
}
