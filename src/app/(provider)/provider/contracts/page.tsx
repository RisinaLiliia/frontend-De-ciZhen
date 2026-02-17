import { redirect } from 'next/navigation';

export default function ProviderContractsLegacyPage() {
  redirect('/orders?tab=completed-jobs');
}
