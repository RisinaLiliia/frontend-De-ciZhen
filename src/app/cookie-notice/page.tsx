import { LegalDocumentPage } from '@/features/legal/LegalDocumentPage';

export const dynamic = 'force-dynamic';

export default function CookieNoticePage() {
  return <LegalDocumentPage title="Cookie-Richtlinie" type="cookies" />;
}
