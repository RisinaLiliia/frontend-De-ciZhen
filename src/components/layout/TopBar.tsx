// src/components/layout/TopBar.tsx
import Link from 'next/link';

type Props = {
  title?: string;
  left?: React.ReactNode;
  right?: React.ReactNode;
};

export function TopBar({ title, left, right }: Props) {
  return (
    <header className="topbar">
      <div className="flex items-center gap-2 min-w-0">
        {left}
        {title ? (
          <h1 className="text-base font-semibold truncate">{title}</h1>
        ) : (
          <Link href="/" className="text-base font-semibold tracking-tight">
            De’ciZhen
          </Link>
        )}
      </div>

      <div className="flex items-center gap-2">{right}</div>
    </header>
  );
}
