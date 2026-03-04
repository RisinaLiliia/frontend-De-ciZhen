// src/app/page.tsx
'use client';

import { PageShell } from '@/components/layout/PageShell';
import { AuthActions } from '@/components/layout/AuthActions';
import { HomePageContentContainer } from '@/features/home/HomePageContent.container';

export default function HomePage() {
  return (
    <PageShell
      right={<AuthActions />}
      showBack
      topbarOverlay={true}
      mainClassName="pb-6 home-screen"
      withSpacer={true}
    >
      <HomePageContentContainer />
    </PageShell>
  );
}
