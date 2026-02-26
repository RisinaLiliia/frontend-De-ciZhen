import { redirect } from 'next/navigation';

export default function ClientOffersLegacyPage() {
  redirect('/workspace?tab=my-requests');
}
