import { HomePageShell } from '@/components/layout/HomePageShell';
import { HomePageContentContainer } from '@/features/home/HomePageContent.container';

export default function HomePage() {
  return (
    <HomePageShell>
      <HomePageContentContainer />
    </HomePageShell>
  );
}
