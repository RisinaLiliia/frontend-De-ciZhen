import { redirect } from 'next/navigation';

export default function RequestNewLegacyPage() {
  redirect('/request/create');
}
