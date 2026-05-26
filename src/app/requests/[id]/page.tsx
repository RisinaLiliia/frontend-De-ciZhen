import { redirect } from 'next/navigation';

import { buildWorkspaceRequestOverlayHref } from '@/features/workspace/requests/workspaceRequestRoute.model';

type RequestDetailsPageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function resolveQueryValue(
  value: string | string[] | undefined,
) {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return typeof value === 'string' ? value : null;
}

export default async function RequestDetailsPage({
  params,
  searchParams,
}: RequestDetailsPageProps) {
  const { id } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const shouldOpenOfferSheet = resolveQueryValue(resolvedSearchParams.offer) === '1';
  const shouldPreferOwnerEdit = resolveQueryValue(resolvedSearchParams.edit) === '1';

  redirect(
    buildWorkspaceRequestOverlayHref({
      currentSearch: new URLSearchParams(),
      requestId: id,
      scope: shouldPreferOwnerEdit ? 'my' : 'market',
      intent: shouldPreferOwnerEdit ? 'edit' : 'view',
      panel: shouldOpenOfferSheet ? 'offer' : 'detail',
    }),
  );
}
