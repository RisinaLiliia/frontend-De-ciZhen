'use client';

import {
  LegalDocumentContent,
  type LegalDocumentType,
} from '@/features/legal/LegalDocumentContent';

type WorkspaceLegalSectionProps = {
  type: LegalDocumentType;
};

const WORKSPACE_LEGAL_TITLES: Record<LegalDocumentType, string> = {
  privacy: 'Datenschutzerklaerung',
  cookies: 'Cookie-Richtlinie',
};

export function WorkspaceLegalSection({ type }: WorkspaceLegalSectionProps) {
  return <LegalDocumentContent title={WORKSPACE_LEGAL_TITLES[type]} type={type} />;
}
