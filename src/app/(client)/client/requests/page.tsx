import { redirect } from 'next/navigation';

export default function ClientRequestsLegacyPage() {
  redirect('/workspace?tab=my-requests');
}
