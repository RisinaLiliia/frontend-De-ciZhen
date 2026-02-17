import { redirect } from 'next/navigation';

export default function ProviderHomeLegacyPage() {
  redirect('/requests?tab=my-offers');
}
