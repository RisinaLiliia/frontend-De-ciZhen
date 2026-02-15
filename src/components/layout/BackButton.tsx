// src/components/layout/BackButton.tsx
'use client';

import { useRouter } from 'next/navigation';
import { useT } from '@/lib/i18n/useT';
import { I18N_KEYS } from '@/lib/i18n/keys';

type Props = {
  fallbackHref?: string;
  forceFallback?: boolean;
  ariaLabel?: string;
  label?: string;
};

export function BackButton({ fallbackHref = '/', forceFallback = false, ariaLabel, label }: Props) {
  const router = useRouter();
  const t = useT();
  const text = label ?? t(I18N_KEYS.common.back);

  const handleClick = () => {
    if (forceFallback) {
      router.push(fallbackHref);
      return;
    }
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
      return;
    }
    router.push(fallbackHref);
  };

  return (
    <button
      type="button"
      className="icon-button back-button"
      onClick={handleClick}
      aria-label={ariaLabel ?? text}
    >
      <span aria-hidden>←</span>
      <span className="back-button__label">{text}</span>
    </button>
  );
}
