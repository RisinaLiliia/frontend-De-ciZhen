import { redirect } from 'next/navigation';

export default function ClientRequestsLegacyPage() {
  redirect('/orders?tab=my-requests');
}
