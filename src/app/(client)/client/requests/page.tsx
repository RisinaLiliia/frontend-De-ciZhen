import { redirect } from 'next/navigation';

export default function ClientRequestsLegacyPage() {
  redirect('/requests?tab=my-requests');
}
