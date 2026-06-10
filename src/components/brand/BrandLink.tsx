// src/components/brand/BrandLink.tsx

import Image from 'next/image';
import Link from 'next/link';

type BrandLinkProps = {
  className?: string;
  href?: string;
  compact?: boolean;
};

export function BrandLink({ className, href = '/', compact = false }: BrandLinkProps) {
  return (
    <Link
      href={href}
      prefetch={false}
      className={['brand', className ?? ''].filter(Boolean).join(' ')}
      aria-label="De’ciZhen"
    >
      <Image src="/logo.svg" alt="" width={26} height={26} className="brand__logo" priority />

      {!compact ? <span className="brand__text truncate">De&apos;ciZhen</span> : null}
    </Link>
  );
}
