import { redirect } from 'next/navigation';

export default function ProviderHomeLegacyPage() {
  redirect('/workspace?tab=my-offers');
}
