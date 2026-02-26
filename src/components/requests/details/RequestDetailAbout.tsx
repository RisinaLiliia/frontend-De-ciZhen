// src/components/requests/details/RequestDetailAbout.tsx
import * as React from 'react';
import { cn } from '@/lib/utils/cn';

type RequestDetailAboutProps = {
  title: string;
  description: string;
  className?: string;
  textClassName?: string;
  clampLines?: number;
  expandLabel?: string;
  collapseLabel?: string;
};

export function RequestDetailAbout({
  title,
  description,
  className,
  textClassName,
  clampLines,
  expandLabel,
  collapseLabel,
}: RequestDetailAboutProps) {
  const [expanded, setExpanded] = React.useState(false);
  const [canExpand, setCanExpand] = React.useState(false);
  const textId = React.useId();
  const textRef = React.useRef<HTMLParagraphElement | null>(null);

  React.useEffect(() => {
    setExpanded(false);
  }, [description, clampLines]);

  React.useEffect(() => {
    if (!clampLines || expanded) {
      if (!clampLines) setCanExpand(false);
      return;
    }

    const el = textRef.current;
    if (!el) return;

    const checkOverflow = () => {
      setCanExpand(el.scrollHeight - el.clientHeight > 1);
    };

    checkOverflow();
    const observer = new ResizeObserver(checkOverflow);
    observer.observe(el);
    window.addEventListener('resize', checkOverflow);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', checkOverflow);
    };
  }, [clampLines, expanded, description]);

  const clamped = Boolean(clampLines) && !expanded;

  return (
    <div className={cn('request-detail__section request-detail__section--grow', className)}>
      <h2 className="request-detail__section-title">{title}</h2>
      <p
        id={textId}
        ref={textRef}
        className={cn('request-detail__text', clamped ? 'request-detail__text--clamped' : null, textClassName)}
        style={
          clampLines
            ? ({ '--request-detail-text-lines': String(clampLines) } as React.CSSProperties)
            : undefined
        }
      >
        {description}
      </p>
      {canExpand ? (
        <button
          type="button"
          className="request-detail__text-toggle"
          aria-expanded={expanded}
          aria-controls={textId}
          onClick={() => setExpanded((prev) => !prev)}
        >
          {expanded ? collapseLabel : expandLabel}
        </button>
      ) : null}
    </div>
  );
}
