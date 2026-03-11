import Link from 'next/link';

type MoreDotsBaseProps = {
  label: string;
  className?: string;
};

type MoreDotsLinkHrefProps = MoreDotsBaseProps & {
  href: string;
  onClick?: never;
  disabled?: never;
};

type MoreDotsLinkButtonProps = MoreDotsBaseProps & {
  href?: never;
  onClick: () => void;
  disabled?: boolean;
};

type MoreDotsLinkProps = MoreDotsLinkHrefProps | MoreDotsLinkButtonProps;

export function MoreDotsLink(props: MoreDotsLinkProps) {
  const content = (
    <>
      <span className="nearby-dot-item" />
      <span className="nearby-dot-item" />
      <span className="nearby-dot-item" />
    </>
  );

  if ('onClick' in props) {
    const { label, className, onClick, disabled } = props;
    return (
      <button
        type="button"
        className={`nearby-more ${className ?? ''}`.trim()}
        aria-label={label}
        title={label}
        onClick={onClick}
        disabled={disabled}
      >
        {content}
      </button>
    );
  }

  const { href, label, className } = props;
  return (
    <Link href={href} prefetch={false} className={`nearby-more ${className ?? ''}`.trim()} aria-label={label} title={label}>
      {content}
    </Link>
  );
}
