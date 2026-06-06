import { redirect } from 'next/navigation';

import { buildWorkspaceRequestResponsesHref } from '@/features/workspace/requests/workspaceRequestRoute.model';

type RequestOffersRedirectPageProps = {
  params: Promise<{
    requestId: string;
  }>;
};

export default async function RequestOffersRedirectPage({
  params,
}: RequestOffersRedirectPageProps) {
  const { requestId } = await params;

  redirect(
    buildWorkspaceRequestResponsesHref({
      currentSearch: new URLSearchParams(),
      requestId,
    }),
  );
}
