import Link from 'next/link';

type HeroCta = {
  href: string;
  label: string;
  variant: 'primary' | 'secondary';
};

type HeroSectionProps = {
  title: string;
  subtitle?: string;
  ctas: HeroCta[];
  mediaSrc?: string;
  mediaAlt?: string;
};

export function HeroSection({
  title,
  subtitle,
  ctas,
  mediaSrc,
  mediaAlt = '',
}: HeroSectionProps) {
  return (
    <section className="hero">
      <div className="hero__copy">
        <h1 className="typo-h1">{title}</h1>
        {subtitle ? <p className="typo-muted">{subtitle}</p> : null}
        <div className="action-row hero__actions">
          {ctas.map((cta) => (
            <Link
              key={cta.href + cta.label}
              href={cta.href}
              className={cta.variant === 'primary' ? 'btn-primary btn-icon' : 'btn-secondary btn-icon'}
            >
              {cta.label}
            </Link>
          ))}
        </div>
      </div>
      {mediaSrc ? (
        <div className="hero__media" aria-hidden="true">
          <img src={mediaSrc} alt={mediaAlt} loading="eager" />
        </div>
      ) : null}
    </section>
  );
}
