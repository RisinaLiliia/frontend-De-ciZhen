import type { WorkspaceStatisticsModel } from '../statistics.model';

export type StatisticsOpportunityItem = {
  key: string;
  title: string;
  body: string;
  tone: 'risk' | 'action' | 'signal' | 'chance';
};

const OPPORTUNITY_PREFIX_PATTERN = /^(Risiko|Risk|Aktion|Action|Signal|Chance|Trend):\s*/i;

function mapHintPrefixToTone(
  hint: string,
  fallbackTone: WorkspaceStatisticsModel['activitySignals'][number]['tone'],
): StatisticsOpportunityItem['tone'] {
  const prefix = hint.match(OPPORTUNITY_PREFIX_PATTERN)?.[1]?.toLowerCase();

  if (prefix === 'risiko' || prefix === 'risk') return 'risk';
  if (prefix === 'aktion' || prefix === 'action') return 'action';
  if (prefix === 'chance') return 'chance';
  if (prefix === 'signal' || prefix === 'trend') return 'signal';
  if (fallbackTone === 'warning') return 'risk';
  if (fallbackTone === 'positive') return 'chance';
  return 'signal';
}

export function mapActivitySignalsToOpportunities(
  activitySignals: WorkspaceStatisticsModel['activitySignals'],
): StatisticsOpportunityItem[] {
  return activitySignals
    .filter((item) => Boolean(item.hint))
    .map((item) => {
      const hint = item.hint ?? '';

      return {
        key: item.key,
        title: hint.replace(OPPORTUNITY_PREFIX_PATTERN, '').trim(),
        body: item.label,
        tone: mapHintPrefixToTone(hint, item.tone),
      };
    });
}
