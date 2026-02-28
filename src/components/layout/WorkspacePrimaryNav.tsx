'use client';

import type { CSSProperties, ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { IconBriefcase, IconChat, IconPlus, IconUser } from '@/components/ui/icons/icons';
import { useAuthStatus, useAuthUser } from '@/hooks/useAuthSnapshot';
import { useT } from '@/lib/i18n/useT';
import { I18N_KEYS } from '@/lib/i18n/keys';

type TopNavItem = {
  key: string;
  href: string;
  label: string;
  icon: ReactNode;
  variant?: 'default' | 'create';
  iconPosition?: 'leading' | 'trailing';
  isActive: (pathname: string, searchParams: URLSearchParams) => boolean;
};

const isPathPrefix = (pathname: string, prefix: string) =>
  pathname === prefix || pathname.startsWith(`${prefix}/`);

const WORKSPACE_PREVIEW_URL = '/workspace?section=orders';
const AUTH_WORKSPACE_URL = '/workspace?section=orders';
const REQUEST_CREATE_URL = '/request/create';
const LOGIN_CHAT_URL = '/auth/login?next=%2Fchat';
const AUTH_PROFILE_FALLBACK_URL = '/profile';

function useTopNavItems(isAuthenticated: boolean, profileHref: string): TopNavItem[] {
  const t = useT();

  const workspaceHref = isAuthenticated ? AUTH_WORKSPACE_URL : WORKSPACE_PREVIEW_URL;
  const chatHref = isAuthenticated ? '/chat' : LOGIN_CHAT_URL;

  const items: TopNavItem[] = [
    {
      key: 'workspace',
      href: workspaceHref,
      label: t(I18N_KEYS.auth.workspaceLabel),
      icon: <IconBriefcase />,
      isActive: (pathname) =>
        isAuthenticated
          ? isPathPrefix(pathname, '/workspace')
          : pathname === '/workspace',
    },
    {
      key: 'request-create',
      href: REQUEST_CREATE_URL,
      label: t(I18N_KEYS.auth.requestLabel),
      icon: <IconPlus />,
      variant: 'create',
      iconPosition: 'trailing',
      isActive: (pathname) => isPathPrefix(pathname, '/request/create'),
    },
    {
      key: 'chat',
      href: chatHref,
      label: t(I18N_KEYS.requestsPage.navChat),
      icon: <IconChat />,
      isActive: (pathname) => isPathPrefix(pathname, '/chat'),
    },
  ];

  if (isAuthenticated) {
    items.push({
      key: 'profile',
      href: profileHref,
      label: t(I18N_KEYS.auth.profileLabel),
      icon: <IconUser />,
      isActive: (pathname) => isPathPrefix(pathname, '/profile'),
    });
  }

  return items;
}

function WorkspacePrimaryNav({
  className,
  itemClassName,
  mobile = false,
}: {
  className: string;
  itemClassName: string;
  mobile?: boolean;
}) {
  const status = useAuthStatus();
  const pathname = usePathname() ?? '/';
  const searchParams = useSearchParams();
  const t = useT();
  const user = useAuthUser();
  const isAuthenticated = status === 'authenticated';
  const profileHref =
    isAuthenticated && typeof user?.id === 'string' && user.id.trim().length > 0
      ? `/profile/${encodeURIComponent(user.id)}`
      : AUTH_PROFILE_FALLBACK_URL;
  const items = useTopNavItems(isAuthenticated, profileHref);
  const params = new URLSearchParams(searchParams?.toString());
  const navStyle = mobile
    ? ({ '--topbar-mobile-columns': String(items.length) } as CSSProperties)
    : undefined;

  return (
    <nav className={className} aria-label={t(I18N_KEYS.auth.navigationLabel)} style={navStyle}>
      {items.map((item) => {
        const active = item.isActive(pathname, params);
        const iconClassName = item.iconPosition === 'trailing' ? 'topbar-nav__icon topbar-nav__icon--trailing' : 'topbar-nav__icon';
        const itemClasses = [
          itemClassName,
          item.variant === 'create' ? `${itemClassName}--create` : null,
          active ? 'is-active' : null,
        ]
          .filter(Boolean)
          .join(' ');

        return (
          <Link
            key={item.key}
            href={item.href}
            aria-current={active ? 'page' : undefined}
            aria-label={item.label}
            className={itemClasses}
          >
            <span className={iconClassName} aria-hidden="true">
              {item.icon}
            </span>
            <span className="topbar-nav__label">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function WorkspacePrimaryNavDesktop() {
  return (
    <WorkspacePrimaryNav
      className="topbar-nav topbar-nav--desktop"
      itemClassName="topbar-nav__item"
    />
  );
}

export function WorkspacePrimaryNavMobile() {
  return (
    <WorkspacePrimaryNav
      className="topbar-nav topbar-nav--mobile"
      itemClassName="topbar-nav__mobile-item"
      mobile
    />
  );
}
