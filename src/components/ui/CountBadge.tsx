import type { ElementType, ReactNode } from 'react';

type CountBadgeProps<T extends ElementType = 'span'> = {
  value: ReactNode;
  size?: 'md' | 'sm';
  as?: T;
  className?: string;
};

export function CountBadge<T extends ElementType = 'span'>({
  value,
  size = 'md',
  as,
  className,
}: CountBadgeProps<T>) {
  const Component = (as ?? 'span') as ElementType;
  return (
    <Component
      className={[
        'count-badge',
        size === 'sm' ? 'count-badge--sm' : '',
        className ?? '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {value}
    </Component>
  );
}
