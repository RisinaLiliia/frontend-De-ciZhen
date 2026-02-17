import { redirect } from 'next/navigation';

export default function ClientOffersLegacyPage() {
  redirect('/requests?tab=my-requests');
}
