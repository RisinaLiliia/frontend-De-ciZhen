import { redirect } from 'next/navigation';

import { buildWorkspaceProviderDetailHref } from '@/features/workspace/providers/workspaceProviderRoute.model';

type ProviderPublicProfileRedirectPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ProviderPublicProfileRedirectPage({
  params,
}: ProviderPublicProfileRedirectPageProps) {
  const { id } = await params;

  redirect(
    buildWorkspaceProviderDetailHref({
      currentSearch: new URLSearchParams(),
      providerId: id,
    }),
  );
}
