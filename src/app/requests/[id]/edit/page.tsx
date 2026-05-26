import { redirect } from 'next/navigation';

import { buildWorkspaceRequestOverlayHref } from '@/features/workspace/requests/workspaceRequestRoute.model';

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function RequestEditRedirectPage({ params }: Props) {
  const { id } = await params;
  redirect(
    buildWorkspaceRequestOverlayHref({
      currentSearch: new URLSearchParams(),
      requestId: id,
      scope: 'my',
      intent: 'edit',
      panel: 'detail',
    }),
  );
}
