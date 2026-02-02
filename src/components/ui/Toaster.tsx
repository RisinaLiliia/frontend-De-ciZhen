// src/components/ui/Toaster.tsx
"use client";

import { Toaster } from "sonner";

export function AppToaster() {
  return (
    <Toaster
      position="top-center"
      richColors
      closeButton
      toastOptions={{
        style: {
          background: "var(--c-surface)",
          color: "var(--c-text)",
          border: "1px solid var(--c-border)",
        },
      }}
    />
  );
}
