import { LegalDocumentPage } from '@/features/legal/LegalDocumentPage';

export const dynamic = 'force-dynamic';

export default function PrivacyPolicyPage() {
  return <LegalDocumentPage title="Datenschutzerklärung" type="privacy" />;
}
