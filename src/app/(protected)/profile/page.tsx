import { redirect } from 'next/navigation';

type ProfileIndexPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ProfileIndexPage({ searchParams }: ProfileIndexPageProps) {
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

  const base = '/workspace?section=profile';
  redirect(next.toString() ? `${base}&${next.toString()}` : base);
}
