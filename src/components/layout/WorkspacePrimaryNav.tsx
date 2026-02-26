'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { IconBriefcase, IconChat, IconSearch } from '@/components/ui/icons/icons';
import { useAuthStatus } from '@/hooks/useAuthSnapshot';
import { useT } from '@/lib/i18n/useT';
import { I18N_KEYS } from '@/lib/i18n/keys';

type TopNavItem = {
  key: string;
  href: string;
  label: string;
  icon: ReactNode;
  isActive: (pathname: string, searchParams: URLSearchParams) => boolean;
};

const isPathPrefix = (pathname: string, prefix: string) =>
  pathname === prefix || pathname.startsWith(`${prefix}/`);

const DEFAULT_PUBLIC_REQUESTS_URL = '/requests?sort=date_desc&page=1&limit=10';
const WORKSPACE_PREVIEW_URL = '/?view=orders&section=orders';
const LOGIN_CHAT_URL = '/auth/login?next=%2Fchat';

function useTopNavItems(isAuthenticated: boolean): TopNavItem[] {
  const t = useT();

  const workspaceHref = isAuthenticated ? '/profile/workspace' : WORKSPACE_PREVIEW_URL;
  const ordersHref = isAuthenticated ? '/orders' : DEFAULT_PUBLIC_REQUESTS_URL;
  const chatHref = isAuthenticated ? '/chat' : LOGIN_CHAT_URL;

  return [
    {
      key: 'workspace',
      href: workspaceHref,
      label: t(I18N_KEYS.auth.workspaceLabel),
      icon: <IconBriefcase />,
      isActive: (pathname, searchParams) =>
        isAuthenticated
          ? isPathPrefix(pathname, '/profile')
          : pathname === '/' && searchParams.get('view') === 'orders',
    },
    {
      key: 'orders',
      href: ordersHref,
      label: t(I18N_KEYS.auth.ordersLabel),
      icon: <IconSearch />,
      isActive: (pathname, searchParams) =>
        (isPathPrefix(pathname, '/orders') ||
          isPathPrefix(pathname, '/requests') ||
          isPathPrefix(pathname, '/offers')) &&
        !(pathname === '/' && searchParams.get('view') === 'orders'),
    },
    {
      key: 'chat',
      href: chatHref,
      label: t(I18N_KEYS.requestsPage.navChat),
      icon: <IconChat />,
      isActive: (pathname) => isPathPrefix(pathname, '/chat'),
    },
  ];
}

function WorkspacePrimaryNav({
  className,
  itemClassName,
}: {
  className: string;
  itemClassName: string;
}) {
  const status = useAuthStatus();
  const pathname = usePathname() ?? '/';
  const searchParams = useSearchParams();
  const t = useT();
  const isAuthenticated = status === 'authenticated';
  const items = useTopNavItems(isAuthenticated);
  const params = new URLSearchParams(searchParams?.toString());

  return (
    <nav className={className} aria-label={t(I18N_KEYS.auth.navigationLabel)}>
      {items.map((item) => {
        const active = item.isActive(pathname, params);
        return (
          <Link
            key={item.key}
            href={item.href}
            aria-current={active ? 'page' : undefined}
            className={`${itemClassName} ${active ? 'is-active' : ''}`.trim()}
          >
            <span className="topbar-nav__icon" aria-hidden="true">
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
    />
  );
}
