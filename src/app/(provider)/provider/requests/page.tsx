import { redirect } from 'next/navigation';

export default function ProviderRequestsLegacyPage() {
  redirect('/requests?tab=new-orders');
}
