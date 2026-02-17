import { redirect } from 'next/navigation';

export default function ClientHomeLegacyPage() {
  redirect('/orders?tab=new-orders');
}
