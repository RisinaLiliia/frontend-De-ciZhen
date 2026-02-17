import { redirect } from 'next/navigation';

export default function ClientContractsLegacyPage() {
  redirect('/orders?tab=completed-jobs');
}
