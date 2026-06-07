import { redirect } from 'next/navigation';

export default async function ChatPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = await searchParams;
  const next = new URLSearchParams();

  next.set('section', 'chat');

  Object.entries(resolvedSearchParams).forEach(([key, value]) => {
    if (key === 'section') return;
    const normalized = Array.isArray(value) ? value[0] : value;
    if (!normalized) return;
    next.set(key, normalized);
  });

  redirect(`/workspace?${next.toString()}`);
}
