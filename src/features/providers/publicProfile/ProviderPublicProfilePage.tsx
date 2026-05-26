'use client';

import { PageShell } from '@/components/layout/PageShell';
import { AuthActions } from '@/components/layout/AuthActions';
import { ProviderPublicProfileContent } from '@/features/providers/publicProfile/ProviderPublicProfileContent';

export function ProviderPublicProfilePage() {
  return (
    <PageShell
      right={<AuthActions />}
      showBack
      backHref="/workspace?section=providers"
      mainClassName="provider-public-main pb-6"
    >
      <ProviderPublicProfileContent />
    </PageShell>
  );
}
