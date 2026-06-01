import { describe, expect, it } from 'vitest';

import { buildLinkedWorkspaceRailModel } from './workspaceUnifiedRail.model';

describe('workspaceUnifiedRail.model', () => {
  it('caps queue and recommendation items to keep the rail compact', () => {
    const model = buildLinkedWorkspaceRailModel({
      locale: 'de',
      contextLabel: '45 Anbieter im aktuellen Markt',
      panel: {
        eyebrow: 'Decision Panel',
        title: 'Anbieter im aktuellen Markt',
        text: '5 Anbieter brauchen Aufmerksamkeit',
        totalValue: 45,
        visualization: 'donut',
        queueTitle: 'Action Queue',
        emptyText: 'Keine offenen Aufgaben.',
        queue: [
          {
            id: '1',
            title: 'Angebot beantworten',
            actionLabel: '2 überfällig',
            actionPriorityLevel: 'high',
            action: { kind: 'link', label: 'Öffnen', href: '/one' },
          },
          {
            id: '2',
            title: 'Vertrag bestätigen',
            actionLabel: 'heute',
            actionPriorityLevel: 'medium',
            action: { kind: 'link', label: 'Öffnen', href: '/two' },
          },
          {
            id: '3',
            title: 'Anfrage prüfen',
            actionLabel: 'offen',
            actionPriorityLevel: 'low',
            action: { kind: 'link', label: 'Öffnen', href: '/three' },
          },
          {
            id: '4',
            title: 'Nachfassen',
            actionLabel: 'morgen',
            actionPriorityLevel: 'low',
            action: { kind: 'link', label: 'Öffnen', href: '/four' },
          },
        ],
        overview: [
          { key: 'available', label: 'Verfügbar', value: 0 },
          { key: 'top', label: 'Top bewertet', value: 17 },
          { key: 'refs', label: 'Mit Referenzen', value: 42 },
        ],
      },
      recommendations: [
        { id: 'r1', title: 'A', description: 'A', metric: '+1' },
        { id: 'r2', title: 'B', description: 'B', metric: '+2' },
        { id: 'r3', title: 'C', description: 'C', metric: '+3' },
        { id: 'r4', title: 'D', description: 'D', metric: '+4' },
      ],
    });

    expect(model?.actionQueue.items).toHaveLength(3);
    expect(model?.recommendations.items).toHaveLength(3);
    expect(model?.actionQueue.items.map((item) => item.id)).toEqual(['1', '2', '3']);
    expect(model?.recommendations.items.map((item) => item.id)).toEqual(['r1', 'r2', 'r3']);
  });

  it('allows a section-specific queue count template override', () => {
    const model = buildLinkedWorkspaceRailModel({
      locale: 'de',
      contextLabel: '',
      queueCountTemplate: '{count} Vorgänge brauchen Aufmerksamkeit',
      panel: {
        eyebrow: 'Decision Panel',
        title: 'Anbieter im aktuellen Markt',
        text: '',
        totalValue: 45,
        visualization: 'donut',
        queueTitle: 'Action Queue',
        emptyText: 'Keine offenen Aufgaben.',
        queue: [
          {
            id: '1',
            title: 'Angebot beantworten',
            actionLabel: '2 überfällig',
            actionPriorityLevel: 'high',
            action: { kind: 'link', label: 'Öffnen', href: '/one' },
          },
        ],
        overview: [],
      },
    });

    expect(model?.actionQueue.title).toBe('1 Vorgänge brauchen Aufmerksamkeit');
  });
});
