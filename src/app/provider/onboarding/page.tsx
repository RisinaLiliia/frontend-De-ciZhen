import { redirect } from 'next/navigation';

export default function ProviderOnboardingPage() {
  redirect('/workspace?section=profile');
}
