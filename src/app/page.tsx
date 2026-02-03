// src/app/page.tsx
'use client';

import { TopBar } from '@/components/layout/TopBar';
import { RequestForm } from '@/features/request/RequestForm';
import { LanguageToggle } from '@/components/ui/LanguageToggle';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useT } from '@/lib/i18n/useT';
import { I18N_KEYS } from '@/lib/i18n/keys';

export default function HomePage() {
  const t = useT();

  return (
    <div className="min-h-dvh">
      <TopBar
        right={
          <div className="flex items-center gap-2">
            <LanguageToggle />
            <ThemeToggle />
          </div>
        }
      />

      <main className="container-mobile min-h-[calc(100dvh-56px)] py-8 flex flex-col">
        <div className="stack-lg">
          <section className="text-center stack-sm">
            <h1 className="typo-h1">{t(I18N_KEYS.home.title)}</h1>
            <p className="typo-muted">{t(I18N_KEYS.home.subtitle)}</p>
          </section>

          <RequestForm />
        </div>

        <div className="flex-1" />
      </main>
    </div>
  );
}
