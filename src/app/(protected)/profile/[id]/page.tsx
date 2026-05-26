import { redirect } from 'next/navigation';

type ProfileLegacyPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ProfileLegacyPage({ searchParams }: ProfileLegacyPageProps) {
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

  const base = '/workspace?section=settings';
  redirect(next.toString() ? `${base}&${next.toString()}` : base);
}
