import { redirect } from 'next/navigation';

export default function ClientContractsLegacyPage() {
  redirect('/requests?tab=completed-jobs');
}
