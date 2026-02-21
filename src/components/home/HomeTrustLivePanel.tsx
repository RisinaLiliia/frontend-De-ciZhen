import { useQuery } from '@tanstack/react-query';
import { getPlatformLiveFeed } from '@/lib/api/analytics';

type HomeTrustLivePanelProps = {
  className?: string;
};

const TRUST_ITEMS = [
  { title: '4.8 Durchschnitt', description: 'Bewertet von verifizierten Kunden' },
  { title: 'Verifizierte Anbieter', description: 'Identität und Profile geprüft' },
  { title: 'Sicher bezahlen', description: 'Geschützte Zahlungsabwicklung' },
  { title: 'Geprüfte Services', description: 'Nur qualifizierte Leistungen' },
];

export function HomeTrustLivePanel({ className }: HomeTrustLivePanelProps) {
  const feedQuery = useQuery({
    queryKey: ['home-platform-live-feed'],
    queryFn: () => getPlatformLiveFeed(3),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const liveItems = feedQuery.data?.data ?? [];

  return (
    <section className={`panel home-trust-live-panel ${className ?? ''}`.trim()}>
      <div className="home-trust-live-panel__heading">
        <p className="home-trust-live-panel__title">Vertrauen & Sicherheit</p>
        <p className="home-trust-live-panel__subtitle">Warum Nutzer De&apos;ciZhen täglich wählen</p>
      </div>

      <div className="home-trust-live-panel__trust-list">
        {TRUST_ITEMS.map((item) => (
          <article key={item.title} className="home-trust-live-panel__trust-item">
            <span className="home-trust-live-panel__trust-dot" aria-hidden />
            <div className="home-trust-live-panel__trust-copy">
              <p className="home-trust-live-panel__trust-title">{item.title}</p>
              <p className="home-trust-live-panel__trust-desc">{item.description}</p>
            </div>
          </article>
        ))}
      </div>

      <div className="home-trust-live-panel__divider" />

      <div className="home-trust-live-panel__feed-header">
        <p className="home-trust-live-panel__title">Letzte Aktivitäten</p>
        {feedQuery.data?.source === 'mock' ? (
          <span className="badge badge-live home-trust-live-panel__demo">Demo</span>
        ) : null}
      </div>
      <div className="home-trust-live-panel__feed-copy">
        <p className="home-trust-live-panel__subtitle">Live-Feed aus der Plattform</p>
      </div>

      <div className="home-trust-live-panel__feed">
        {feedQuery.isLoading ? (
          <>
            <div className="skeleton h-10 w-full" />
            <div className="skeleton h-10 w-full" />
            <div className="skeleton h-10 w-full" />
          </>
        ) : feedQuery.isError || liveItems.length === 0 ? (
          <article className="home-trust-live-panel__feed-item">
            <span className="home-trust-live-panel__feed-dot" aria-hidden />
            <p className="home-trust-live-panel__feed-text">Noch keine Live-Aktivität verfügbar</p>
            <span className="home-trust-live-panel__feed-time">jetzt</span>
          </article>
        ) : (
          liveItems.map((item) => (
            <article key={item.id} className="home-trust-live-panel__feed-item">
              <span className="home-trust-live-panel__feed-dot" aria-hidden />
              <p className="home-trust-live-panel__feed-text">{item.text}</p>
              <span className="home-trust-live-panel__feed-time">vor {item.minutesAgo} Min</span>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
