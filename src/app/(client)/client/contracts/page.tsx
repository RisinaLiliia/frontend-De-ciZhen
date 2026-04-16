import { redirect } from 'next/navigation';

export default function ClientContractsLegacyPage() {
  redirect('/workspace?section=requests&scope=my&period=90d&range=90d');
}
