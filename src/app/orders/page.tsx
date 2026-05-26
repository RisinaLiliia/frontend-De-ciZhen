import { redirect } from 'next/navigation';

export default function RequestsAliasPage() {
  redirect('/workspace?section=requests');
}
