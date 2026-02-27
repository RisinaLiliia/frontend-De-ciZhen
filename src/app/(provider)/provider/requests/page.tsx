import { redirect } from 'next/navigation';

export default function ProviderRequestsLegacyPage() {
  redirect('/workspace?section=orders');
}
