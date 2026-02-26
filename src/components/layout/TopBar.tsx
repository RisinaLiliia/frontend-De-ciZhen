// src/components/layout/TopBar.tsx
import Link from 'next/link';
import Image from 'next/image';

type Props = {
  title?: string;
  left?: React.ReactNode;
  center?: React.ReactNode;
  right?: React.ReactNode;
};

export function TopBar({ title, left, center, right }: Props) {
  return (
    <header className={`topbar ${center ? 'topbar--with-center' : ''}`.trim()}>
      <div className="topbar__left flex items-center gap-2 min-w-0">
        {left}
        {title ? (
          <h1 className="text-base font-semibold truncate">{title}</h1>
        ) : (
          <Link href="/" className="brand">
            <Image src="/logo.svg" alt="De’ciZhen" className="brand__logo" width={26} height={26} />
            <span className="brand__text truncate">De’ciZhen</span>
          </Link>
        )}
      </div>

      {center ? <div className="topbar__center">{center}</div> : null}
      <div className="topbar__right">{right}</div>
    </header>
  );
}
