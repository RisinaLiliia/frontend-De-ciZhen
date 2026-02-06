import Link from 'next/link';

type MoreDotsLinkProps = {
  href: string;
  label: string;
  className?: string;
};

export function MoreDotsLink({ href, label, className }: MoreDotsLinkProps) {
  return (
    <Link href={href} className={`nearby-more ${className ?? ''}`} aria-label={label} title={label}>
      <span className="nearby-dot-item" />
      <span className="nearby-dot-item" />
      <span className="nearby-dot-item" />
    </Link>
  );
}
