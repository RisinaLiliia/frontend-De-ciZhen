import { redirect } from 'next/navigation';

export default function ClientHomeLegacyPage() {
  redirect('/workspace?tab=new-orders');
}
