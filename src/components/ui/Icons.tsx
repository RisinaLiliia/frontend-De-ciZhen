// src/components/ui/Icons.tsx
import { cn } from '@/lib/utils/cn';

type IconProps = React.SVGProps<SVGSVGElement> & {
  className?: string;
};

function IconBase({ className, children, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn('h-5 w-5', className)}
      aria-hidden
      {...props}
    >
      {children}
    </svg>
  );
}

export function IconUser(props: IconProps) {
  return (
    <IconBase {...props}>
      <circle cx="12" cy="8" r="3.2" />
      <path d="M4.5 20c1.6-3.3 5-5 7.5-5s5.9 1.7 7.5 5" />
    </IconBase>
  );
}

export function IconBriefcase(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M7 7h10a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2Z" />
      <path d="M9 7V6a3 3 0 0 1 3-3h0a3 3 0 0 1 3 3v1" />
      <path d="M5 12h14" />
    </IconBase>
  );
}

export function IconBox(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M3.5 8 12 3l8.5 5" />
      <path d="M4 8.5V19h16V8.5" />
      <path d="M12 3v16" />
    </IconBase>
  );
}

export function IconCheck(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="m5 12 4 4 10-10" />
    </IconBase>
  );
}

export function IconClock(props: IconProps) {
  return (
    <IconBase {...props}>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 7v5l3 2" />
    </IconBase>
  );
}

export function IconStar(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M12 4.5 14.6 9l5 .7-3.6 3.5.9 5-4.3-2.3-4.3 2.3.9-5L4.4 9l5-.7L12 4.5Z" />
    </IconBase>
  );
}

export function IconSparkles(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="m6 12 2-4 2 4-2 4-2-4Z" />
      <path d="m15 6 1.5-3 1.5 3-3 1.5L15 6Z" />
      <path d="m16 16 2-4 2 4-2 4-2-4Z" />
    </IconBase>
  );
}

export function IconCoins(props: IconProps) {
  return (
    <IconBase {...props}>
      <ellipse cx="8" cy="7.5" rx="4" ry="2.5" />
      <path d="M4 7.5v4.5c0 1.4 2 2.5 4 2.5s4-1.1 4-2.5V7.5" />
      <path d="M12 10.5c.7-.3 1.6-.5 2.5-.5 2.2 0 4 1 4 2.5s-1.8 2.5-4 2.5-4-1-4-2.5" />
      <path d="M10.5 13v3.5c0 1.4 1.8 2.5 4 2.5s4-1.1 4-2.5V13" />
    </IconBase>
  );
}

export function IconBolt(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M13 2 6 13h5l-1 9 7-11h-5l1-9Z" />
    </IconBase>
  );
}

export function IconDroplet(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M12 3c4 5 6 7.5 6 10a6 6 0 0 1-12 0c0-2.5 2-5 6-10Z" />
    </IconBase>
  );
}

export function IconFaucet(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M3 10h14" />
      <path d="M7 10V6h6v4" />
      <path d="M15 10h4v3h-4" />
      <path d="M12 13v3" />
      <path d="M12 18a1.8 1.8 0 0 0 0 3" />
    </IconBase>
  );
}

export function IconWrench(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M14 7a4 4 0 0 0-5 5l-6 6 2 2 6-6a4 4 0 0 0 5-5Z" />
      <circle cx="7" cy="17" r="1.2" />
    </IconBase>
  );
}

export function IconBucket(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M6 9h12l-1 10a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L6 9Z" />
      <path d="M8 9a4 4 0 0 1 8 0" />
      <path d="M9.5 14h5" />
    </IconBase>
  );
}

export function IconTruck(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M3 7h11v8H3z" />
      <path d="M14 10h4l3 3v2h-7z" />
      <circle cx="7" cy="17" r="1.5" />
      <circle cx="17" cy="17" r="1.5" />
    </IconBase>
  );
}
