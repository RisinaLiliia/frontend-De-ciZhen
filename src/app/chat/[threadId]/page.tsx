import { redirect } from 'next/navigation';

export default async function LegacyChatThreadPage({
  params,
}: {
  params: Promise<{ threadId: string }> | { threadId: string };
}) {
  const resolved = await params;
  redirect(`/chat?conversation=${encodeURIComponent(resolved.threadId)}`);
}
