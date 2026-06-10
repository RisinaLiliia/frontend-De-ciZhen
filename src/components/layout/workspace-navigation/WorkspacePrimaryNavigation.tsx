'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';

import { IconBriefcase, IconChat, IconPlus, IconUser } from '@/components/ui/icons/icons';
import { useAuthStatus } from '@/hooks/useAuthSnapshot';
import { useSlidingIndicator } from '@/hooks/useSlidingIndicator';
import { I18N_KEYS } from '@/lib/i18n/keys';
import { useT } from '@/lib/i18n/useT';
import { WORKSPACE_MOBILE_NAV_OPEN_EVENT } from '@/lib/workspaceMobileNavigation';
import { DEFAULT_PRIVATE_WORKSPACE_CREATE_REQUEST_HREF } from '@/features/workspace/requests/workspaceRequestRoute.model';
import { WorkspaceNavigationDock } from './WorkspaceNavigationDock';

type WorkspacePrimaryNavigationItem = {
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

const WORKSPACE_PREVIEW_URL = '/workspace?section=overview';
const AUTH_WORKSPACE_URL = '/workspace?section=overview';
const LOGIN_CHAT_URL = '/auth/login?next=%2Fchat';
const AUTH_PROFILE_FALLBACK_URL = '/workspace?section=profile';

function useWorkspacePrimaryNavigationItems(
  isAuthenticated: boolean,
  profileHref: string,
): WorkspacePrimaryNavigationItem[] {
  const t = useT();
  const workspaceHref = isAuthenticated ? AUTH_WORKSPACE_URL : WORKSPACE_PREVIEW_URL;
  const chatHref = isAuthenticated ? '/chat' : LOGIN_CHAT_URL;

  const items: WorkspacePrimaryNavigationItem[] = [
    {
      key: 'workspace',
      href: workspaceHref,
      label: t(I18N_KEYS.auth.workspaceLabel),
      icon: <IconBriefcase />,
      isActive: (pathname) =>
        isAuthenticated ? isPathPrefix(pathname, '/workspace') : pathname === '/workspace',
    },
    {
      key: 'request-create',
      href: DEFAULT_PRIVATE_WORKSPACE_CREATE_REQUEST_HREF,
      label: t(I18N_KEYS.auth.requestLabel),
      icon: <IconPlus />,
      variant: 'create',
      iconPosition: 'trailing',
      isActive: (pathname, searchParams) =>
        pathname === '/workspace' &&
        searchParams.get('section') === 'requests' &&
        searchParams.get('mode') === 'create',
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
      isActive: (pathname, searchParams) =>
        pathname === '/workspace' && searchParams.get('section') === 'profile',
    });
  }

  return items;
}

function WorkspacePrimaryNavigation({
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
  const profileHref = isAuthenticated ? '/workspace?section=profile' : AUTH_PROFILE_FALLBACK_URL;
  const items = useWorkspacePrimaryNavigationItems(isAuthenticated, profileHref);
  const params = new URLSearchParams(searchParams?.toString());
  const activeItemKey = items.find((item) => item.isActive(pathname, params))?.key ?? '';
  const { containerRef, indicatorStyle } = useSlidingIndicator<HTMLElement>({
    activeSelector: '.topbar-nav__item.is-active',
    enabled: true,
    watchKey: `${pathname}|${activeItemKey}|${items.length}`,
  });

  return (
    <nav className={className} aria-label={t(I18N_KEYS.auth.navigationLabel)} ref={containerRef}>
      {indicatorStyle ? (
        <span className="topbar-nav__indicator" aria-hidden="true" style={indicatorStyle} />
      ) : null}
      {items.map((item) => {
        const active = item.isActive(pathname, params);
        const iconClassName =
          item.iconPosition === 'trailing'
            ? 'topbar-nav__icon topbar-nav__icon--trailing'
            : 'topbar-nav__icon';
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
            prefetch={false}
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

export function WorkspacePrimaryNavigationDesktop() {
  return (
    <WorkspacePrimaryNavigation
      className="topbar-nav topbar-nav--desktop"
      itemClassName="topbar-nav__item"
    />
  );
}

export function WorkspacePrimaryNavigationMobile() {
  const status = useAuthStatus();
  const pathname = usePathname() ?? '/';
  const searchParams = useSearchParams();
  const t = useT();
  const isAuthenticated = status === 'authenticated';
  const profileHref = isAuthenticated ? '/workspace?section=profile' : AUTH_PROFILE_FALLBACK_URL;
  const items = useWorkspacePrimaryNavigationItems(isAuthenticated, profileHref)
    .filter((item) => item.key !== 'profile')
    .map((item) => ({
      key: item.key,
      label: item.label,
      icon: item.icon,
      href: item.href,
      active: item.isActive(pathname, new URLSearchParams(searchParams?.toString())),
      onClick:
        item.key === 'workspace' && isPathPrefix(pathname, '/workspace')
          ? () => window.dispatchEvent(new Event(WORKSPACE_MOBILE_NAV_OPEN_EVENT))
          : undefined,
      variant: item.variant === 'create' ? ('primary' as const) : ('default' as const),
    }));

  return <WorkspaceNavigationDock items={items} ariaLabel={t(I18N_KEYS.auth.navigationLabel)} />;
}
