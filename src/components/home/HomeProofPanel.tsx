/* src/components/home/HomeProofPanel.tsx */
import { I18N_KEYS } from '@/lib/i18n/keys';
import type { I18nKey } from '@/lib/i18n/keys';
import type { ProofCase } from '@/types/home';
import { ProofReviewCard } from '@/components/reviews/ProofReviewCard';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { MoreDotsLink } from '@/components/ui/MoreDotsLink';

type HomeProofPanelProps = {
  t: (key: I18nKey) => string;
  proofCases: ProofCase[];
  proofIndex: number;
};

export function HomeProofPanel({ t, proofCases, proofIndex }: HomeProofPanelProps) {
  return (
    <Card className="home-proof-panel">
      <CardHeader className="home-panel-header home-proof-panel__header">
        <CardTitle className="home-panel-title home-proof-panel__title">{t(I18N_KEYS.homePublic.proofTitle)}</CardTitle>
      </CardHeader>
      <div className="home-proof-panel__feed">
        {proofCases.map((item, index) => (
          <ProofReviewCard
            key={item.id}
            title={item.title}
            info={item.info}
            review={item.review}
            rating={item.rating}
            price={item.price}
            isActive={index === proofIndex}
            hideMobile={index === 3}
          />
        ))}
      </div>
      <div className="top-providers-footer flex justify-center">
        <MoreDotsLink
          href="/workspace?tab=reviews&reviewSort=published_desc"
          label={t(I18N_KEYS.homePublic.viewAll)}
        />
      </div>
    </Card>
  );
}
