// src/app/provider/onboarding/page.tsx
import { Suspense } from 'react';
import { ProviderOnboardingClient } from './ProviderOnboardingClient';
import { LoadingScreen } from '@/components/ui/LoadingScreen';

export default function ProviderOnboardingPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <ProviderOnboardingClient />
    </Suspense>
  );
}
