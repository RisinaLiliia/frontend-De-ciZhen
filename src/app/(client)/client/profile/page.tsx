import { redirect } from 'next/navigation';

export default function ClientProfileLegacyPage() {
  redirect('/workspace?section=settings');
}
