import * as React from 'react';
import { useT } from '@/lib/i18n/useT';
import { I18N_KEYS } from '@/lib/i18n/keys';
import { buildApiUrl } from '@/lib/api/url';
import { IconBrandApple, IconBrandGoogle } from '@/components/ui/icons/icons';

type Props = {
  nextPath: string;
};

export function SocialAuthButtons({ nextPath }: Props) {
  const t = useT();
  const [activeProvider, setActiveProvider] = React.useState<'google' | 'apple' | null>(null);

  const goToProvider = React.useCallback((provider: 'google' | 'apple') => {
    setActiveProvider(provider);
    const startUrl = buildApiUrl(`/auth/oauth/${provider}/start?next=${encodeURIComponent(nextPath)}`);
    window.location.assign(startUrl);
  }, [nextPath]);

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
          onClick={() => goToProvider('apple')}
          disabled={activeProvider !== null}
        >
          <span className="auth-social__icon" aria-hidden="true"><IconBrandApple /></span>
          <span className="auth-social__label">{t(I18N_KEYS.auth.continueWithApple)}</span>
        </button>
      </div>
    </div>
  );
}
