// src/app/layout.tsx
import type { Metadata } from 'next';
import '../styles/globals.css';
import { AppThemeProvider } from '@/lib/theme/ThemeProvider';
import { QueryProvider } from '@/lib/query/QueryProvider';
import { AppToaster } from '@/components/ui/Toaster';
import { I18nProvider } from '@/lib/i18n/I18nProvider';
import { AuthProvider } from '@/lib/auth/AuthProvider';
import { PresenceProvider } from '@/lib/presence/PresenceProvider';

export const metadata: Metadata = {
  title: {
    default: 'De’ciZhen | Dienstleistungen finden und anbieten',
    template: '%s | De’ciZhen',
  },
  description:
    'De’ciZhen ist ein lokaler Service-Marktplatz: Aufträge veröffentlichen, Anbieter vergleichen, chatten und Aufträge sicher abschließen.',
  manifest: '/favicon/site.webmanifest',
  icons: {
    icon: [
      { url: '/favicon/favicon.ico' },
      { url: '/favicon/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
    ],
    shortcut: [{ url: '/favicon/favicon.ico' }],
    apple: [{ url: '/favicon/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
};

export default function RootLayout({
  children,
  authModal,
}: {
  children: React.ReactNode;
  authModal: React.ReactNode;
}) {
  return (
    <html lang="de" suppressHydrationWarning>
      <body>
        <AppThemeProvider>
          <I18nProvider>
            <QueryProvider>
              <AuthProvider>
                <PresenceProvider />
                {children}
                {authModal}
              </AuthProvider>
              <AppToaster />
            </QueryProvider>
          </I18nProvider>
        </AppThemeProvider>
      </body>
    </html>
  );
}
