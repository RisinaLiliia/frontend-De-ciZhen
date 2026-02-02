// src/app/layout.tsx
import "../styles/globals.css";
import { AppThemeProvider } from "@/lib/theme/ThemeProvider";
import { QueryProvider } from "@/lib/query/QueryProvider";
import { AppToaster } from "@/components/ui/Toaster";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" suppressHydrationWarning>
      <body>
        <AppThemeProvider>
          <QueryProvider>
            {children}
            <AppToaster />
          </QueryProvider>
        </AppThemeProvider>
      </body>
    </html>
  );
}
