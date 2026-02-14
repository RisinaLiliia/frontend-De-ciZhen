import { IconCalendar, IconPin } from '@/components/ui/icons/icons';

type RequestMetaInlineProps = {
  title: string;
  city: string;
  date: string;
  price?: string | null;
  className?: string;
};

export function RequestMetaInline({ title, city, date, price, className }: RequestMetaInlineProps) {
  return (
    <div className={`request-meta-inline ${className ?? ''}`.trim()}>
      <div className="request-meta-inline__top">
        <span className="request-meta-inline__title">{title}</span>
        {price ? <span className="request-meta-inline__price">{price}</span> : null}
      </div>
      <div className="request-meta-inline__row">
        <span className="request-meta-inline__item">
          <IconPin />
          <span>{city}</span>
        </span>
        <span className="request-meta-inline__item">
          <IconCalendar />
          <span>{date}</span>
        </span>
      </div>
    </div>
  );
}

