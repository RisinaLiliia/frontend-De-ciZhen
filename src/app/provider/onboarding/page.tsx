// src/app/provider/onboarding/page.tsx
import { Suspense } from 'react';
import { AuthActions } from '@/components/layout/AuthActions';
import { PageShell } from '@/components/layout/PageShell';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { ProviderOnboardingContainer } from '@/features/provider/onboarding/ProviderOnboarding.container';
import { RequireAuth } from '@/lib/auth/RequireAuth';

export default function ProviderOnboardingPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <RequireAuth>
        <PageShell right={<AuthActions />}>
          <ProviderOnboardingContainer />
        </PageShell>
      </RequireAuth>
    </Suspense>
  );
}
