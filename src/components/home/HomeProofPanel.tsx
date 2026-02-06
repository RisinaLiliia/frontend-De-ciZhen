import { I18N_KEYS } from '@/lib/i18n/keys';
import type { I18nKey } from '@/lib/i18n/keys';
import type { ProofCase } from '@/types/home';

type HomeProofPanelProps = {
  t: (key: I18nKey) => string;
  proofCases: ProofCase[];
  proofIndex: number;
};

export function HomeProofPanel({ t, proofCases, proofIndex }: HomeProofPanelProps) {
  return (
    <section className="panel">
      <div className="panel-header">
        <p className="section-title">{t(I18N_KEYS.homePublic.proofTitle)}</p>
      </div>
      <div className="proof-feed">
        {proofCases.map((item, index) => (
          <div
            key={item.id}
            className={`proof-card ${index === proofIndex ? 'is-active' : 'is-dim'} ${
              index === 3 ? 'hide-mobile' : ''
            }`}
          >
            <div className="proof-header">
              <div className="proof-avatars">
                <span className="proof-avatar avatar-spark" />
                <span className="proof-avatar avatar-ember" />
              </div>
              <div className="proof-title">{item.title}</div>
              <span className="proof-price">{item.price}</span>
            </div>
            <p className="proof-info">{item.info}</p>
            <div className="proof-rating">
              <span className="proof-stars">★★★★★</span>
              <span className="proof-score">{item.rating}</span>
            </div>
            <p className="proof-review">{item.review}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
