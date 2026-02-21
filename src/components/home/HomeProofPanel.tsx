import { I18N_KEYS } from '@/lib/i18n/keys';
import type { I18nKey } from '@/lib/i18n/keys';
import type { ProofCase } from '@/types/home';
import { ProofReviewCard } from '@/components/reviews/ProofReviewCard';

type HomeProofPanelProps = {
  t: (key: I18nKey) => string;
  proofCases: ProofCase[];
  proofIndex: number;
};

export function HomeProofPanel({ t, proofCases, proofIndex }: HomeProofPanelProps) {
  return (
    <section className="panel home-proof-panel">
      <div className="home-proof-panel__header">
        <p className="home-proof-panel__title">{t(I18N_KEYS.homePublic.proofTitle)}</p>
      </div>
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
    </section>
  );
}
