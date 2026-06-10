import type { WorkspaceBadgeVariant } from '@/features/workspace/shared/WorkspaceBadge';
import { buildLinkedWorkspaceRailModel } from '@/features/workspace/shared/workspaceUnifiedRail.model';

type ProductEntryFlowItem = {
  label: string;
  tone: 'demand' | 'supply' | 'opportunity' | 'action' | 'neutral';
  badgeVariant: WorkspaceBadgeVariant;
};

export const productEntryFlowItems: ProductEntryFlowItem[] = [
  {
    label: 'Anfrage erstellen',
    tone: 'demand',
    badgeVariant: 'info',
  },
  {
    label: 'Angebote erhalten',
    tone: 'supply',
    badgeVariant: 'warning',
  },
  {
    label: 'Vergleichen',
    tone: 'opportunity',
    badgeVariant: 'success',
  },
  {
    label: 'Entscheiden',
    tone: 'action',
    badgeVariant: 'warning',
  },
  {
    label: 'Umsetzen',
    tone: 'neutral',
    badgeVariant: 'neutral',
  },
];

export const productEntryRailModel = buildLinkedWorkspaceRailModel({
  locale: 'de',
  contextLabel: 'Workspace Vorschau',
  panel: {
    eyebrow: 'Decision Panel',
    title: 'Offene Entscheidungen',
    text: 'Deine Angebote sind gesammelt, bewertet und bereit für die nächste Entscheidung.',
    totalValue: 2,
    visualization: 'donut',
    queueTitle: 'Nächste Schritte',
    emptyText: 'Alles ist im Blick.',
    primaryAction: {
      kind: 'link',
      label: 'Workspace ansehen',
      href: '/workspace',
    },
    overview: [
      {
        key: 'new-offers',
        label: 'Neue Angebote',
        value: 12,
        tone: 'supply',
      },
      {
        key: 'recommended-providers',
        label: 'Empfohlene Anbieter',
        value: 4,
        tone: 'opportunity',
      },
      {
        key: 'open-decisions',
        label: 'Offene Entscheidungen',
        value: 2,
        tone: 'action',
      },
    ],
    queue: [
      {
        id: 'provider-a',
        title: 'Anbieter A priorisieren',
        actionLabel: 'KI Empfehlung',
        actionPriorityLevel: 'high',
        priorityLabel: 'KI Empfehlung',
        action: {
          kind: 'link',
          label: 'Ansehen',
          href: '/workspace',
        },
      },
      {
        id: 'compare-offers',
        title: '3 Angebote vergleichen',
        actionLabel: 'In Bewertung',
        actionPriorityLevel: 'medium',
        priorityLabel: 'In Bewertung',
        action: {
          kind: 'link',
          label: 'Vergleichen',
          href: '/workspace',
        },
      },
    ],
  },
  recommendations: [
    {
      id: 'ai-recommendation',
      title: 'Anbieter A priorisieren.',
      description: 'Hohe Bewertung, schnelle Antwortzeit und passender Preis für deine Anfrage.',
      tone: 'positive',
    },
  ],
  analysisHref: '/workspace?section=stats',
  queueFooterHref: '/workspace?section=requests',
  recommendationsFooterHref: '/workspace?section=stats',
});
