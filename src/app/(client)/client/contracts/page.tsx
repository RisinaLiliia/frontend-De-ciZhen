import { redirect } from 'next/navigation';

export default function ClientContractsLegacyPage() {
  redirect('/workspace?tab=completed-jobs');
}
