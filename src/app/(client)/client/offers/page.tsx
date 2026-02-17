import { redirect } from 'next/navigation';

export default function ClientOffersLegacyPage() {
  redirect('/orders?tab=my-requests');
}
