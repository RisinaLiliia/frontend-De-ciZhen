import { redirect } from 'next/navigation';

import { buildWorkspaceCreateRequestHref } from '@/features/workspace/requests/workspaceRequestRoute.model';

type RequestCreatePageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function toSearchParams(input: Record<string, string | string[] | undefined>) {
  const searchParams = new URLSearchParams();

  Object.entries(input).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (typeof item === 'string' && item.trim()) {
          searchParams.append(key, item);
        }
      });
      return;
    }

    if (typeof value === 'string' && value.trim()) {
      searchParams.set(key, value);
    }
  });

  return searchParams;
}

export default async function RequestCreatePage({
  searchParams,
}: RequestCreatePageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  redirect(
    buildWorkspaceCreateRequestHref({
      currentSearch: toSearchParams(resolvedSearchParams),
    }),
  );
}
