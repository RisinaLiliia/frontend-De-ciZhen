import { Suspense } from 'react';
import { ProvidersCatalogClient } from '@/app/providers/ProvidersCatalogClient';
import { LoadingScreen } from '@/components/ui/LoadingScreen';

export default function ProvidersCatalogPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <ProvidersCatalogClient />
    </Suspense>
  );
}
