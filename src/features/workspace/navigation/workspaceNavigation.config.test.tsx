import { describe, expect, it } from 'vitest';

import {
  resolveVisibleWorkspaceNavigationItems,
  workspaceChatHref,
  workspaceNavigationItems,
} from '@/features/workspace/navigation/workspaceNavigation.config';

describe('workspaceNavigationItems', () => {
  it('routes Analyse sidebar item to the canonical stats section', () => {
    const analysisItem = workspaceNavigationItems.find((item) => item.label === 'Analyse');

    expect(analysisItem).toBeDefined();
    expect(analysisItem?.section).toBe('stats');
    expect(analysisItem?.href).toBe('/workspace?section=stats');
  });

  it('routes Nachrichten sidebar item to the canonical workspace chat section', () => {
    const chatItem = workspaceNavigationItems.find((item) => item.label === 'Nachrichten');

    expect(chatItem).toBeDefined();
    expect(chatItem?.section).toBe('chat');
    expect(chatItem?.href).toBe(workspaceChatHref);
  });

  it('routes Angebote and Aufträge through canonical private requests state', () => {
    const offersItem = workspaceNavigationItems.find((item) => item.label === 'Angebote');
    const contractsItem = workspaceNavigationItems.find((item) => item.label === 'Aufträge');

    expect(offersItem).toBeDefined();
    expect(offersItem?.section).toBe('offers');
    expect(offersItem?.href).toBe('/workspace?section=requests&scope=my&role=provider&period=90d&range=90d');

    expect(contractsItem).toBeDefined();
    expect(contractsItem?.section).toBe('contracts');
    expect(contractsItem?.href).toBe('/workspace?section=requests&scope=my&state=execution&period=90d&range=90d');
  });

  it('hides Angebote and Aufträge from guest navigation and restores them for authenticated users', () => {
    const guestLabels = resolveVisibleWorkspaceNavigationItems({ isAuthed: false }).map((item) => item.label);
    const providerLabels = resolveVisibleWorkspaceNavigationItems({
      isAuthed: true,
      role: 'provider',
    }).map((item) => item.label);
    const clientLabels = resolveVisibleWorkspaceNavigationItems({
      isAuthed: true,
      role: 'client',
    }).map((item) => item.label);

    expect(guestLabels).not.toContain('Angebote');
    expect(guestLabels).not.toContain('Aufträge');
    expect(providerLabels).toContain('Angebote');
    expect(providerLabels).toContain('Aufträge');
    expect(clientLabels).not.toContain('Angebote');
    expect(clientLabels).toContain('Aufträge');
  });

  it('routes Profil sidebar item to the canonical profile section', () => {
    const profileItem = workspaceNavigationItems.find((item) => item.label === 'Profil');

    expect(profileItem).toBeDefined();
    expect(profileItem?.section).toBe('profile');
    expect(profileItem?.href).toBe('/workspace?section=profile');
  });

  it('routes Hilfe sidebar item to the canonical workspace help section', () => {
    const helpItem = workspaceNavigationItems.find((item) => item.label === 'Hilfe');

    expect(helpItem).toBeDefined();
    expect(helpItem?.section).toBe('help');
    expect(helpItem?.href).toBe('/workspace?section=help');
  });
});
