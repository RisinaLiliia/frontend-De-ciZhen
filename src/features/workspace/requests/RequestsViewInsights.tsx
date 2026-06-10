import { buildPrivateRequestCardChrome } from '@/features/workspace/requests/requestsPrivateCard.model';
import type { WorkspaceRequestsViewVariant } from '@/features/workspace/requests/workspaceRequestsView.model';
import type { WorkspaceRequestsViewCard } from '@/features/workspace/requests/workspaceRequestsView.model';
import { I18N_KEYS, type I18nKey } from '@/lib/i18n/keys';
import { t as translate, type Locale } from '@/lib/i18n/t';

function tx(locale: Locale, key: I18nKey) {
  return translate(key, locale);
}

export function RequestSignalPills({
  chrome,
}: {
  chrome: ReturnType<typeof buildPrivateRequestCardChrome>;
}) {
  if (chrome.signalPills.length === 0) return null;

  return (
    <div className="my-request-card__signals">
      {chrome.signalPills.map((signal) => (
        <span key={signal.key} className={`my-request-card__signal is-${signal.tone}`.trim()}>
          {signal.label}
        </span>
      ))}
    </div>
  );
}

export function RequestOwnerInsights({
  chrome,
  includeSignals = true,
}: {
  chrome: ReturnType<typeof buildPrivateRequestCardChrome>;
  includeSignals?: boolean;
}) {
  if ((!includeSignals || chrome.signalPills.length === 0) && chrome.insights.length === 0)
    return null;

  return (
    <div className="my-request-card__owner-content">
      {includeSignals ? <RequestSignalPills chrome={chrome} /> : null}
      {chrome.insights.length > 0 ? (
        <div
          className={`my-request-card__insights my-request-card__insights--${Math.min(chrome.insights.length, 2)}`.trim()}
        >
          {chrome.insights.map((item) => (
            <article key={item.key} className={`my-request-card__insight is-${item.tone}`.trim()}>
              <strong className="my-request-card__insight-title">{item.title}</strong>
              <p className="my-request-card__insight-copy">{item.description}</p>
            </article>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function RequestOwnerFooterNote({
  chrome,
  card,
  locale,
  workspaceVariant,
}: {
  chrome: ReturnType<typeof buildPrivateRequestCardChrome>;
  card: WorkspaceRequestsViewCard;
  locale: Locale;
  workspaceVariant: WorkspaceRequestsViewVariant;
}) {
  const noteFromInsights = chrome.insights.map((item) => item.description.trim()).find(Boolean);
  const noteFromDecision = card.decision.actionReason?.trim();
  const noteFromActivity = card.activity?.label?.trim();

  let fallbackNote: string;
  if (workspaceVariant === 'market') {
    fallbackNote = tx(locale, I18N_KEYS.requestsPage.workspaceFooterNoteMarket);
  } else if (card.decision.actionType === 'review_offers') {
    fallbackNote = tx(locale, I18N_KEYS.requestsPage.workspaceFooterNoteReviewOffers);
  } else if (card.decision.actionType === 'confirm_contract') {
    fallbackNote = tx(locale, I18N_KEYS.requestsPage.workspaceFooterNoteConfirmContract);
  } else if (card.decision.actionType === 'reply_required') {
    fallbackNote = tx(locale, I18N_KEYS.requestsPage.workspaceFooterNoteReplyRequired);
  } else if (card.decision.actionType === 'confirm_completion') {
    fallbackNote = tx(locale, I18N_KEYS.requestsPage.workspaceFooterNoteConfirmCompletion);
  } else if (card.decision.actionType === 'review_completion') {
    fallbackNote = tx(locale, I18N_KEYS.requestsPage.workspaceFooterNoteReviewCompletion);
  } else {
    fallbackNote = tx(locale, I18N_KEYS.requestsPage.workspaceFooterNoteDefault);
  }

  const note = noteFromInsights || noteFromDecision || noteFromActivity || fallbackNote;

  if (!note) return null;

  return (
    <div
      className={`my-request-card__footer-note is-${chrome.insights[0]?.tone ?? 'neutral'}`.trim()}
    >
      <span className="my-request-card__footer-note-icon" aria-hidden="true">
        i
      </span>
      <p className="my-request-card__footer-note-copy">{note}</p>
    </div>
  );
}
