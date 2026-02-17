import { redirect } from 'next/navigation';

export default function ProviderRequestsLegacyPage() {
  redirect('/orders?tab=new-orders');
}
