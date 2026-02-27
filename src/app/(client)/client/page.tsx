import { redirect } from 'next/navigation';

export default function ClientHomeLegacyPage() {
  redirect('/workspace?section=orders');
}
