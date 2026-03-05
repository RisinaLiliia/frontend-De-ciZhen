import * as React from 'react';
import { Button } from '@/components/ui/Button';
import { I18N_KEYS, type I18nKey } from '@/lib/i18n/keys';

type Translate = (key: I18nKey) => string;

type CreateRequestActionsProps = {
  t: Translate;
  isSubmitting: boolean;
  activeSubmitIntent: 'draft' | 'publish' | null;
};

export function CreateRequestActions({
  t,
  isSubmitting,
  activeSubmitIntent,
}: CreateRequestActionsProps) {
  return (
    <div className="request-actions">
      <p className="typo-small text-center">{t(I18N_KEYS.request.hint)}</p>
      <div className="request-form__row is-2">
        <Button
          type="submit"
          variant="ghost"
          value="draft"
          loading={isSubmitting && activeSubmitIntent === 'draft'}
        >
          {t(I18N_KEYS.request.submitDraft)}
        </Button>
        <Button
          type="submit"
          value="publish"
          loading={isSubmitting && activeSubmitIntent === 'publish'}
        >
          {t(I18N_KEYS.request.submitPublish)}
        </Button>
      </div>
    </div>
  );
}

