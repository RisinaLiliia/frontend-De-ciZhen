import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getUserIdFromRefreshToken } from '@/lib/auth/serverUserId';

type ProfileIndexPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ProfileIndexPage({ searchParams }: ProfileIndexPageProps) {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get('refreshToken')?.value ?? null;
  const userId = getUserIdFromRefreshToken(refreshToken);
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

  const base = userId ? `/profile/${encodeURIComponent(userId)}` : '/profile/workspace';
  redirect(next.toString() ? `${base}?${next.toString()}` : base);
}
