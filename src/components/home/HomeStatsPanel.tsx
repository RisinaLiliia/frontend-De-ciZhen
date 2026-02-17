import Link from 'next/link';
import {
  IconBox,
  IconClock,
  IconCoins,
  IconStar,
} from '@/components/ui/Icons';
import { I18N_KEYS } from '@/lib/i18n/keys';
import type { I18nKey } from '@/lib/i18n/keys';
import type { LiveStats } from '@/types/home';

type HomeStatsPanelProps = {
  t: (key: I18nKey) => string;
  stats: LiveStats;
  formatNumber: Intl.NumberFormat;
};

export function HomeStatsPanel({ t, stats, formatNumber }: HomeStatsPanelProps) {
  return (
    <section className="panel">
      <div className="panel-header">
        <p className="section-title">{t(I18N_KEYS.homePublic.today)}</p>
        <span className="badge badge-live">{t(I18N_KEYS.homePublic.live)}</span>
      </div>

      <div className="stat-grid mt-3">
        <Link href="/requests?tab=new-orders" className="stat-link stat-card stat-divider">
          <div className="flex items-center gap-2">
            <span className="stat-icon">
              <IconBox className="h-3.5 w-3.5" />
            </span>
            <span className="stat-value stat-live">{formatNumber.format(stats.active)}</span>
          </div>
          <span className="stat-label">{t(I18N_KEYS.homePublic.statActive)}</span>
        </Link>
        <Link href="/requests" className="stat-link stat-card stat-divider">
          <div className="flex items-center gap-2">
            <span className="stat-icon">
              <IconCoins className="h-3.5 w-3.5" />
            </span>
            <span className="stat-value stat-live">{formatNumber.format(stats.completed)}</span>
          </div>
          <span className="stat-label">{t(I18N_KEYS.homePublic.statCompleted)}</span>
        </Link>
        <div className="stat-card stat-divider hide-mobile">
          <div className="flex items-center gap-2">
            <span className="stat-icon">
              <IconClock className="h-3.5 w-3.5" />
            </span>
            <span className="stat-value stat-live">
              {stats.responseMin} {t(I18N_KEYS.homePublic.statMinutes)}
            </span>
          </div>
          <span className="stat-label">{t(I18N_KEYS.homePublic.statResponse)}</span>
        </div>
        <Link href="/requests" className="stat-link stat-card stat-divider">
          <div className="flex items-center gap-2">
            <span className="stat-icon">
              <IconStar className="h-3.5 w-3.5" />
            </span>
            <span className="stat-value stat-live">{stats.rating.toFixed(2)}</span>
          </div>
          <span className="stat-label">{t(I18N_KEYS.homePublic.statRating)}</span>
        </Link>
      </div>
    </section>
  );
}
