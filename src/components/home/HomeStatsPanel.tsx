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

      <div className="home-stats__grid mt-3">
        <Link href="/orders?tab=new-orders" prefetch={false} className="home-stats__link home-stats__card">
          <div className="flex items-center gap-2">
            <span className="home-stats__icon">
              <IconBox className="h-3.5 w-3.5" />
            </span>
            <span className="home-stats__value home-stats__live">{formatNumber.format(stats.active)}</span>
          </div>
          <span className="home-stats__label">{t(I18N_KEYS.homePublic.statActive)}</span>
        </Link>
        <Link href="/requests" prefetch={false} className="home-stats__link home-stats__card">
          <div className="flex items-center gap-2">
            <span className="home-stats__icon">
              <IconCoins className="h-3.5 w-3.5" />
            </span>
            <span className="home-stats__value home-stats__live">{formatNumber.format(stats.completed)}</span>
          </div>
          <span className="home-stats__label">{t(I18N_KEYS.homePublic.statCompleted)}</span>
        </Link>
        <div className="home-stats__card hide-mobile">
          <div className="flex items-center gap-2">
            <span className="home-stats__icon">
              <IconClock className="h-3.5 w-3.5" />
            </span>
            <span className="home-stats__value home-stats__live">
              {stats.responseMin} {t(I18N_KEYS.homePublic.statMinutes)}
            </span>
          </div>
          <span className="home-stats__label">{t(I18N_KEYS.homePublic.statResponse)}</span>
        </div>
        <Link href="/requests" prefetch={false} className="home-stats__link home-stats__card">
          <div className="flex items-center gap-2">
            <span className="home-stats__icon">
              <IconStar className="h-3.5 w-3.5" />
            </span>
            <span className="home-stats__value home-stats__live">{stats.rating.toFixed(2)}</span>
          </div>
          <span className="home-stats__label">{t(I18N_KEYS.homePublic.statRating)}</span>
        </Link>
      </div>
    </section>
  );
}
