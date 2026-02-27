'use client';

import * as React from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { useAuthStatus } from '@/hooks/useAuthSnapshot';
import HomePage from '../page';
import OrdersPageClient from '../orders/OrdersPageClient';

export default function WorkspaceRouteClient() {
  const status = useAuthStatus();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  React.useEffect(() => {
    if (status !== 'unauthenticated') return;
    const section = searchParams.get('section');
    if (section === 'orders' || section === 'providers' || section === 'stats') return;

    const next = new URLSearchParams(searchParams.toString());
    next.delete('tab');
    next.delete('status');
    next.delete('fav');
    next.delete('reviewRole');
    next.set('section', 'orders');

    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  }, [pathname, router, searchParams, status]);

  if (status === 'loading' || status === 'idle') {
    return <LoadingScreen />;
  }

  if (status === 'authenticated') {
    return <OrdersPageClient />;
  }

  return <HomePage />;
}
