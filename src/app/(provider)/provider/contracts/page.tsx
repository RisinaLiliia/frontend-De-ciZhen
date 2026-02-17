import { redirect } from 'next/navigation';

export default function ProviderContractsLegacyPage() {
  redirect('/requests?tab=completed-jobs');
}
