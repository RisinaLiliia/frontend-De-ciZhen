// src/app/layout.tsx
import '../styles/globals.css';
import { AppThemeProvider } from '@/lib/theme/ThemeProvider';
import { QueryProvider } from '@/lib/query/QueryProvider';
import { AppToaster } from '@/components/ui/Toaster';
import { I18nProvider } from '@/lib/i18n/I18nProvider';
import { AuthProvider } from '@/lib/auth/AuthProvider';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" suppressHydrationWarning>
      <body>
        <AppThemeProvider>
          <I18nProvider>
            <QueryProvider>
              <AuthProvider>{children}</AuthProvider>
              <AppToaster />
            </QueryProvider>
          </I18nProvider>
        </AppThemeProvider>
      </body>
    </html>
  );
}
