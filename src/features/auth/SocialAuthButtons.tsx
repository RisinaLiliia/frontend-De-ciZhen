import * as React from 'react';
import { useT } from '@/lib/i18n/useT';
import { I18N_KEYS } from '@/lib/i18n/keys';
import { buildApiUrl } from '@/lib/api/url';
import { IconBrandApple, IconBrandGoogle } from '@/components/ui/icons/icons';
import { DEFAULT_AUTH_NEXT } from '@/features/auth/constants';

export function SocialAuthButtons() {
  const t = useT();
  const [activeProvider, setActiveProvider] = React.useState<'google' | 'apple' | null>(null);
  const isAppleEnabled = process.env.NEXT_PUBLIC_ENABLE_APPLE_AUTH === 'true';

  const goToProvider = React.useCallback((provider: 'google' | 'apple') => {
    setActiveProvider(provider);
    const startUrl = buildApiUrl(
      `/auth/oauth/${provider}/start?next=${encodeURIComponent(DEFAULT_AUTH_NEXT)}`,
    );
    window.location.assign(startUrl);
  }, []);

  return (
    <div className="auth-social stack-xs">
      <p className="auth-social__divider">{t(I18N_KEYS.auth.socialDivider)}</p>
      <div className="auth-social__row">
        <button
          type="button"
          className="auth-social__btn auth-social__btn--google"
          onClick={() => goToProvider('google')}
          disabled={activeProvider !== null}
        >
          <span className="auth-social__icon" aria-hidden="true"><IconBrandGoogle /></span>
          <span className="auth-social__label">{t(I18N_KEYS.auth.continueWithGoogle)}</span>
        </button>
        <button
          type="button"
          className="auth-social__btn auth-social__btn--apple"
          onClick={() => {
            if (!isAppleEnabled) return;
            goToProvider('apple');
          }}
          disabled={activeProvider !== null || !isAppleEnabled}
          aria-disabled={!isAppleEnabled}
        >
          <span className="auth-social__icon" aria-hidden="true"><IconBrandApple /></span>
          <span className="auth-social__label">{t(I18N_KEYS.auth.continueWithApple)}</span>
        </button>
      </div>
    </div>
  );
}
