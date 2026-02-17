import { redirect } from 'next/navigation';

export default function ProviderHomeLegacyPage() {
  redirect('/orders?tab=my-offers');
}
