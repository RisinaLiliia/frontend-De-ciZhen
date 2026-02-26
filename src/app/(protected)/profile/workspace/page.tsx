import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import ProfileWorkspacePage from '@/features/profile/ProfileWorkspacePage';
import { getUserIdFromRefreshToken } from '@/lib/auth/serverUserId';

type ProfileWorkspaceAliasPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ProfileWorkspaceAliasPage({ searchParams }: ProfileWorkspaceAliasPageProps) {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get('refreshToken')?.value ?? null;
  const userId = getUserIdFromRefreshToken(refreshToken);

  if (!userId) {
    return <ProfileWorkspacePage />;
  }

  const params = await searchParams;
  const next = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (typeof value === 'string') {
      next.set(key, value);
      return;
    }
    if (Array.isArray(value) && value.length > 0) {
      next.set(key, value[0]);
    }
  });

  redirect(next.toString() ? `/profile/${encodeURIComponent(userId)}?${next.toString()}` : `/profile/${encodeURIComponent(userId)}`);
}
