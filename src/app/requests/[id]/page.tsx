//src/app/requests/[id]/page.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { PageShell } from "@/components/layout/PageShell";
import { AuthActions } from "@/components/layout/AuthActions";
import { OrderCard } from "@/components/orders/OrderCard";
import {
  IconCalendar,
  IconCheck,
  IconChat,
  IconHeart,
  IconPin,
} from "@/components/ui/icons/icons";
import { StatusDot } from "@/components/ui/StatusDot";
import { getPublicRequestById, listPublicRequests } from "@/lib/api/requests";
import type { RequestResponseDto } from "@/lib/api/dto/requests";
import { I18N_KEYS } from "@/lib/i18n/keys";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { useT } from "@/lib/i18n/useT";

const SIMILAR_LIMIT = 3;

export default function RequestDetailsPage() {
  const t = useT();
  const { locale } = useI18n();
  const params = useParams();
  const requestId = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const [isSaved, setIsSaved] = React.useState(false);
  const handleToggleSave = React.useCallback(() => {
    setIsSaved((prev) => {
      const next = !prev;
      if (next) {
        toast.success(t(I18N_KEYS.requestDetails.saved));
      }
      return next;
    });
  }, [t]);

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
        subcategoryKey: request?.serviceKey ?? undefined,
        sort: "date_desc",
        limit: 12,
      }),
  });

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
    return items
      .filter(
        (item) =>
          item.id !== request.id &&
          (item.categoryKey === request.categoryKey ||
            item.serviceKey === request.serviceKey),
      )
      .slice(0, SIMILAR_LIMIT);
  }, [request, similarData]);

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


  if (isLoading) {
    return (
      <PageShell right={<AuthActions />} showBack mainClassName="py-6">
        <div className="request-detail request-detail--loading">
          <section className="panel request-detail__panel">
            <div className="skeleton h-7 w-3/4" />
            <div className="skeleton h-4 w-1/2" />
            <div className="request-detail__gallery">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={`photo-${index}`} className="request-detail__photo skeleton" />
              ))}
            </div>
            <div className="skeleton h-20 w-full" />
          </section>
          <aside className="panel request-detail__panel request-detail__aside">
            <div className="skeleton h-6 w-2/3" />
            <div className="skeleton h-10 w-full" />
            <div className="skeleton h-10 w-full" />
          </aside>
        </div>
      </PageShell>
    );
  }

  if (isError || !request) {
    return (
      <PageShell right={<AuthActions />} showBack mainClassName="py-6">
        <section className="panel text-center">
          <p className="typo-muted">{t(I18N_KEYS.requestsPage.error)}</p>
        </section>
      </PageShell>
    );
  }

  const title = request.title?.trim() || request.subcategoryName || request.serviceKey;
  const description =
    request.description?.trim() || t(I18N_KEYS.requestDetails.descriptionFallback);
  const categoryLabel = request.categoryName ?? request.categoryKey ?? "";
  const serviceLabel = request.subcategoryName ?? request.serviceKey;
  const tags = (request.tags ?? []).filter(Boolean);
  const tagList = tags.length ? tags : [categoryLabel, serviceLabel].filter(Boolean);
  const priceLabel =
    request.price != null
      ? formatPrice.format(request.price)
      : t(I18N_KEYS.requestDetails.priceOnRequest);
  const preferredDate =
    request.preferredDate && !Number.isNaN(new Date(request.preferredDate).getTime())
      ? new Date(request.preferredDate)
      : null;
  const images = buildImageList(request);
  const clientProfileHref = request.clientId ? `/clients/${request.clientId}` : null;
  const clientName = request.clientName ?? t(I18N_KEYS.requestDetails.clientUnknown);
  const clientAvatarUrl =
    request.clientAvatarUrl && request.clientAvatarUrl.startsWith("http")
      ? request.clientAvatarUrl
      : undefined;
  const hasClientAvatar = Boolean(clientAvatarUrl);
  const hasClientInfo = Boolean(request.clientId || request.clientName);
  const clientStatusLabel = isClientOnline
    ? t(I18N_KEYS.requestDetails.clientOnline)
    : t(I18N_KEYS.requestDetails.clientActive);
  const clientStatus = isClientOnline ? "online" : "offline";
  const clientRatingAvgRaw =
    typeof request.clientRatingAvg === "number"
      ? request.clientRatingAvg
      : request.clientRatingAvg != null
        ? Number(request.clientRatingAvg)
        : null;
  const clientRatingAvg =
    typeof clientRatingAvgRaw === "number" && Number.isFinite(clientRatingAvgRaw)
      ? clientRatingAvgRaw
      : null;
  const clientRatingCountRaw =
    typeof request.clientRatingCount === "number"
      ? request.clientRatingCount
      : request.clientRatingCount != null
        ? Number(request.clientRatingCount)
        : null;
  const clientRatingCount =
    typeof clientRatingCountRaw === "number" && Number.isFinite(clientRatingCountRaw)
      ? clientRatingCountRaw
      : null;
  const finalRatingAvg = clientRatingAvg ?? 0;
  const finalRatingCount = clientRatingCount ?? 0;
  const clientRatingText = finalRatingAvg.toFixed(1);

  return (
    <PageShell right={<AuthActions />} showBack mainClassName="py-6">
      <div className="request-detail">
        <section className="panel request-detail__panel">
          <header className="request-detail__header">
            <div className="request-detail__title-row">
              <div className="request-detail__title-wrap">
                <h1 className="request-detail__title">{title}</h1>
              </div>
              <div className="request-detail__price">
                <span className="proof-price">{priceLabel}</span>
              </div>
            </div>
            <div className="request-detail__tags">
              {tagList.map((tag) => (
                <span key={tag} className="request-tag">
                  {tag}
                </span>
              ))}
            </div>
          </header>

          <div className="request-detail__gallery">
            {images.map((src, index) => (
              <div key={`${src}-${index}`} className="request-detail__photo">
                <Image
                  src={src}
                  alt={title}
                  fill
                  sizes="(max-width: 768px) 50vw, 180px"
                  className="request-detail__photo-img"
                />
              </div>
            ))}
          </div>

          <div className="request-detail__section">
            <h2 className="request-detail__section-title">
              {t(I18N_KEYS.requestDetails.about)}
            </h2>
            <p className="request-detail__text">{description}</p>
          </div>

          {hasClientInfo ? (
            <div className="request-detail__section request-detail__client">
              <h3 className="request-detail__section-title">
                {t(I18N_KEYS.requestDetails.clientTitle)}
              </h3>
              <div className="request-detail__client-card">
                {clientProfileHref ? (
                  <Link href={clientProfileHref} className="request-detail__client-link">
                    <div className="request-detail__client-avatar-wrap">
                      <div
                        className={`request-detail__client-avatar ${
                          hasClientAvatar ? "" : "request-detail__client-avatar--placeholder"
                        }`}
                      >
                        {clientAvatarUrl ? (
                          <Image
                            src={clientAvatarUrl}
                            alt={clientName}
                            fill
                            sizes="56px"
                            className="request-detail__client-img"
                          />
                        ) : (
                          <span className="request-detail__client-initial">
                            {clientName.slice(0, 1).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <StatusDot status={clientStatus} label={clientStatusLabel} />
                    </div>
                    <div className="request-detail__client-body">
                      <div className="request-detail__client-name">{clientName}</div>
                      <div className="request-detail__client-meta" aria-hidden="true" />
                    </div>
                  </Link>
                ) : (
                  <>
                    <div className="request-detail__client-avatar-wrap">
                      <div
                        className={`request-detail__client-avatar ${
                          hasClientAvatar ? "" : "request-detail__client-avatar--placeholder"
                        }`}
                      >
                        {clientAvatarUrl ? (
                          <Image
                            src={clientAvatarUrl}
                            alt={clientName}
                            fill
                            sizes="56px"
                            className="request-detail__client-img"
                          />
                        ) : (
                          <span className="request-detail__client-initial">
                            {clientName.slice(0, 1).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <StatusDot status={clientStatus} label={clientStatusLabel} />
                    </div>
                    <div className="request-detail__client-body">
                      <div className="request-detail__client-name">{clientName}</div>
                      <div className="request-detail__client-meta" aria-hidden="true" />
                    </div>
                  </>
                )}
                <div className="request-detail__client-rating">
                  <span className="provider-rating">
                    ★★★★★ {clientRatingText}
                  </span>
                  <span className="provider-reviews">
                    {finalRatingCount ?? 0}{" "}
                    {t(I18N_KEYS.requestDetails.clientReviews)}
                  </span>
                </div>
              </div>
            </div>
          ) : null}

        </section>

        <aside className="panel request-detail__panel request-detail__aside">
          <div className="request-detail__meta">
            <div className="request-detail__meta-item">
              <IconPin />
              <span>{request.cityName ?? request.cityId}</span>
            </div>
            <div className="request-detail__meta-item">
              <IconCalendar />
              <span>{preferredDate ? formatDate.format(preferredDate) : "—"}</span>
            </div>
          </div>

          <div className="request-detail__cta">
            <Link
              href={`/auth/login?next=/requests/${request.id}`}
              className="btn-primary request-detail__cta-btn"
            >
              <span>{t(I18N_KEYS.requestDetails.ctaApply)}</span>
              <IconCheck />
            </Link>
            <Link
              href={`/auth/login?next=/requests/${request.id}`}
              className="btn-secondary request-detail__cta-btn"
            >
              <span>{t(I18N_KEYS.requestDetails.ctaChat)}</span>
              <IconChat />
            </Link>
            <button
              type="button"
              className={`btn-ghost is-primary request-detail__save ${
                isSaved ? "is-saved" : ""
              }`}
              onClick={handleToggleSave}
            >
              <span>{t(I18N_KEYS.requestDetails.ctaSave)}</span>
              <IconHeart className="icon-heart" />
            </button>
          </div>

          {similar.length ? (
            <div className="request-detail__section request-detail__similar">
              <h3 className="request-detail__section-title">
                {t(I18N_KEYS.requestDetails.similar)}
              </h3>
              <div className="request-detail__similar-list">
                {similar.map((item) => {
                  const itemTitle =
                    item.title?.trim() || item.subcategoryName || item.serviceKey;
                  const itemPrice =
                    item.price != null
                      ? formatPrice.format(item.price)
                      : t(I18N_KEYS.requestDetails.priceOnRequest);
                  const imageSrc = buildImageList(item)[0];
                  const similarDate =
                    item.preferredDate && !Number.isNaN(new Date(item.preferredDate).getTime())
                      ? formatDate.format(new Date(item.preferredDate))
                      : "—";
                  return (
                    <OrderCard
                      key={item.id}
                      href={`/requests/${item.id}`}
                      ariaLabel={t(I18N_KEYS.requestsPage.openRequest)}
                      imageSrc={imageSrc}
                      imageAlt={itemTitle}
                      dateLabel={similarDate}
                      badges={[
                        t(I18N_KEYS.requestsPage.badgeToday),
                        item.isRecurring
                          ? t(I18N_KEYS.client.recurringLabel)
                          : t(I18N_KEYS.client.onceLabel),
                      ]}
                      category={item.categoryName ?? item.categoryKey ?? ""}
                      title={itemTitle}
                      meta={[item.cityName ?? item.cityId]}
                      bottomMeta={[item.subcategoryName ?? item.serviceKey]}
                      priceLabel={itemPrice}
                      inlineCta={t(I18N_KEYS.requestsPage.detailsCta)}
                    />
                  );
                })}
              </div>
            </div>
          ) : null}
        </aside>
      </div>
      <div className="request-detail__mobile-cta">
        <Link
          href={`/auth/login?next=/requests/${request.id}`}
          className="btn-primary request-detail__cta-btn"
        >
          <span>{t(I18N_KEYS.requestDetails.ctaApply)}</span>
          <IconCheck />
        </Link>
        <Link
          href={`/auth/login?next=/requests/${request.id}`}
          className="btn-secondary request-detail__cta-btn"
        >
          <span>{t(I18N_KEYS.requestDetails.ctaChat)}</span>
          <IconChat />
        </Link>
        <button
          type="button"
          className={`btn-ghost is-primary ${isSaved ? "is-saved" : ""}`}
          onClick={handleToggleSave}
        >
          <span>{t(I18N_KEYS.requestDetails.ctaSave)}</span>
          <IconHeart className="icon-heart" />
        </button>
      </div>
    </PageShell>
  );
}

function buildImageList(request: RequestResponseDto) {
  const photos = request.photos ?? [];
  const image = request.imageUrl ? [request.imageUrl] : [];
  const list = [...photos, ...image].filter(Boolean);
  const unique = Array.from(new Set(list));
  if (unique.length) return unique.slice(0, 4);
  return [pickRequestImage(request.categoryKey ?? "")];
}

function pickRequestImage(categoryKey: string) {
  const map: Record<string, string> = {
    cleaning: "/Reinigung im modernen Wohnzimmer.jpg",
    electric: "/Elektriker bei der Arbeit an Schaltschrank.jpg",
    plumbing: "/Freundlicher Klempner bei der Arbeit.jpg",
    repair: "/Techniker repariert Smartphone in Werkstatt.jpg",
    moving: "/Lädt Kisten aus einem Transporter.jpg",
  };
  return map[categoryKey] ?? "/Handwerker%20in%20einem%20modernen%20Wohnzimmer.jpg";
}
