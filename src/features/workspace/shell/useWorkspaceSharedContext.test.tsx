/** @vitest-environment happy-dom */

import * as React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';

import { buildSharedContextControlsProps, type WorkspaceSharedContext } from '@/features/workspace/shell/useWorkspaceSharedContext';
import { getWorkspaceModeCopy } from '@/features/workspace/shell/workspaceEnvironment.copy';

afterEach(() => {
  cleanup();
});

function createModel(
  overrides: Partial<WorkspaceSharedContext> = {},
): WorkspaceSharedContext {
  const copy = getWorkspaceModeCopy('de');

  return {
    activeMode: 'profile',
    activePublicSection: null,
    activeWorkspaceTab: 'my-requests',
    requestsScope: 'market',
    scopeSwitch: null,
    modeItems: [],
    title: copy.modes.profile.title,
    description: copy.modes.profile.description,
    railDescription: copy.modes.profile.railDescription,
    scope: copy.modes.profile.scope,
    activeModeHref: '/workspace?section=profile',
    chips: [
      { key: 'city', label: 'Ort', value: 'Alle Staedte', icon: <span /> },
      { key: 'category', label: 'Kategorie', value: 'Alle Kategorien', icon: <span /> },
      { key: 'service', label: 'Service', value: 'Alle Services', icon: <span /> },
      { key: 'range', label: 'Zeitraum', value: '30 Tage', icon: <span /> },
    ],
    requestsListDensity: null,
    onRequestsListDensityChange: null,
    copy,
    controls: {
      cityOptions: [{ value: 'all', label: 'Alle Staedte' }],
      categoryOptions: [{ value: 'all', label: 'Alle Kategorien' }],
      serviceOptions: [{ value: 'all', label: 'Alle Services' }],
      sortOptions: [{ value: 'date_desc', label: 'Neueste zuerst' }],
      cityId: 'all',
      categoryKey: 'all',
      subcategoryKey: 'all',
      sortBy: 'date_desc',
      range: '30d',
      role: 'customer',
      state: 'all',
      viewerMode: 'provider',
      onCityChange: vi.fn(),
      onCategoryChange: vi.fn(),
      onSubcategoryChange: vi.fn(),
      onSortChange: vi.fn(),
      onRangeChange: vi.fn(),
      onRoleChange: vi.fn(),
      onStateChange: vi.fn(),
      onViewerModeChange: vi.fn(),
      onReset: vi.fn(),
      closeLabel: 'Schliessen',
    },
    ...overrides,
  };
}

describe('buildSharedContextControlsProps', () => {
  it('renders viewer mode toggle for public actions section', () => {
    const props = buildSharedContextControlsProps({
      model: createModel({ activePublicSection: 'profile' }),
      t: (key) => String(key),
      locale: 'de',
    });

    render(<>{props.inlineControl}</>);

    expect(screen.getByRole('button', { name: 'Für Anbieter' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Für Auftraggeber' })).toBeTruthy();
  });

  it('maps profile labels to inverted audience semantics without changing canonical viewerMode', () => {
    const props = buildSharedContextControlsProps({
      model: createModel({ activePublicSection: 'profile' }),
      t: (key) => String(key),
      locale: 'de',
    });

    render(<>{props.inlineControl}</>);

    expect(screen.getByRole('button', { name: 'Für Anbieter' }).getAttribute('aria-pressed')).toBe('false');
    expect(screen.getByRole('button', { name: 'Für Auftraggeber' }).getAttribute('aria-pressed')).toBe('true');
  });
});
