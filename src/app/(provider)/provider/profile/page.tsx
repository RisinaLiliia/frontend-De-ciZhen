import { redirect } from 'next/navigation';

export default function ProviderProfileLegacyPage() {
  redirect('/workspace?section=settings');
}
