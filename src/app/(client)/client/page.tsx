import { redirect } from 'next/navigation';

export default function ClientHomeLegacyPage() {
  redirect('/requests?tab=new-orders');
}
