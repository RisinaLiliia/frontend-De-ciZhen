/* src/components/home/HomeStatsPanel.tsx */
import Link from 'next/link';
import {
  IconBox,
  IconClock,
  IconCoins,
  IconStar,
} from '@/components/ui/Icons';
import { Badge } from '@/components/ui/Badge';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { I18N_KEYS } from '@/lib/i18n/keys';
import type { I18nKey } from '@/lib/i18n/keys';
import type { LiveStats } from '@/types/home';

type HomeStatsPanelProps = {
  t: (key: I18nKey) => string;
  stats: LiveStats;
  formatNumber: Intl.NumberFormat;
  ordersHref?: string;
};

export function HomeStatsPanel({ t, stats, formatNumber, ordersHref = '/workspace?section=orders' }: HomeStatsPanelProps) {
  return (
    <Card className="home-stats-panel">
      <CardHeader className="home-stats__header">
        <CardTitle className="home-stats__title">{t(I18N_KEYS.homePublic.today)}</CardTitle>
        <Badge className="home-stats__live-badge">{t(I18N_KEYS.homePublic.live)}</Badge>
      </CardHeader>

      <div className="home-stats__grid mt-3">
        <Link href={ordersHref} prefetch={false} className="home-stats__link home-stats__card">
          <div className="flex items-center gap-2">
            <span className="home-stats__icon">
              <IconBox className="h-3.5 w-3.5" />
            </span>
            <span className="home-stats__value home-stats__live">{formatNumber.format(stats.active)}</span>
          </div>
          <span className="home-stats__label">{t(I18N_KEYS.homePublic.statActive)}</span>
        </Link>
        <Link href={ordersHref} prefetch={false} className="home-stats__link home-stats__card">
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
        <Link href={ordersHref} prefetch={false} className="home-stats__link home-stats__card">
          <div className="flex items-center gap-2">
            <span className="home-stats__icon">
              <IconStar className="h-3.5 w-3.5" />
            </span>
            <span className="home-stats__value home-stats__live">{stats.rating.toFixed(2)}</span>
          </div>
          <span className="home-stats__label">{t(I18N_KEYS.homePublic.statRating)}</span>
        </Link>
      </div>
    </Card>
  );
}
