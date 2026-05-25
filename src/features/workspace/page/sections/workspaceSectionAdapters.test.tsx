/** @vitest-environment happy-dom */

import { describe, expect, it } from 'vitest';

import {
  buildWorkspaceHelpSectionModel,
  buildWorkspaceExploreSectionModel,
  buildWorkspaceOverviewSectionModel,
  buildWorkspacePublicRequestsSectionModel,
  buildWorkspaceStandardSectionModel,
  resolveWorkspaceExploreSection,
  resolveWorkspaceStandardSection,
} from '@/features/workspace/page/sections/workspaceSectionAdapters';

describe('workspaceSectionAdapters', () => {
  it('builds public requests section with rail layout', () => {
    const model = buildWorkspacePublicRequestsSectionModel({
      content: <div>requests</div>,
      aiRail: <aside>rail</aside>,
    });

    expect(model.section).toBe('requests');
    expect(model.layout).toBe('withRail');
    expect(model.railPolicy).toBe('custom');
  });

  it('builds explore section for providers with explicit content and rail layout', () => {
    const model = buildWorkspaceExploreSectionModel({
      branch: {
        isWorkspaceAuthed: true,
        locale: 'de',
        t: (key) => String(key),
      },
      section: 'providers',
      explore: {
        exploreListDensity: 'single',
        setExploreListDensity: () => undefined,
        sidebarNearbyLimit: 2,
        sidebarTopProvidersLimit: 2,
        sidebarProofCases: [],
        proofIndex: 0,
      },
    });

    expect(model.section).toBe('providers');
    expect(model.layout).toBe('withRail');
    expect(model.railPolicy).toBe('custom');
    expect(model.aiRail).toBeTruthy();
  });

  it('builds profile section through dedicated workspace profile ownership', () => {
    const model = buildWorkspaceExploreSectionModel({
      branch: {
        isWorkspaceAuthed: true,
        locale: 'de',
        t: (key) => String(key),
      },
      section: 'profile',
      explore: {
        exploreListDensity: 'single',
        setExploreListDensity: () => undefined,
        sidebarNearbyLimit: 2,
        sidebarTopProvidersLimit: 2,
        sidebarProofCases: [],
        proofIndex: 0,
      },
    });

    expect(model.section).toBe('profile');
    expect(model.layout).toBe('withRail');
    expect(model.railPolicy).toBe('custom');
    expect(model.aiRail).toBeTruthy();
  });

  it('builds stats section through the same explicit content and rail contract', () => {
    const model = buildWorkspaceExploreSectionModel({
      branch: {
        isWorkspaceAuthed: true,
        locale: 'de',
        t: (key) => String(key),
      },
      section: 'stats',
      explore: {
        exploreListDensity: 'single',
        setExploreListDensity: () => undefined,
        sidebarNearbyLimit: 2,
        sidebarTopProvidersLimit: 2,
        sidebarProofCases: [],
        proofIndex: 0,
      },
    });

    expect(model.section).toBe('stats');
    expect(model.layout).toBe('withRail');
    expect(model.railPolicy).toBe('custom');
    expect(model.aiRail).toBeTruthy();
  });

  it('builds overview and standard sections through dedicated adapters', () => {
    const overview = buildWorkspaceOverviewSectionModel({
      content: <div>overview</div>,
      aiRail: <aside>rail</aside>,
    });
    const requests = buildWorkspaceStandardSectionModel({
      section: 'requests',
      content: <div>private requests</div>,
    });

    expect(overview.section).toBe('overview');
    expect(requests.section).toBe('requests');
  });

  it('builds chat through the standard section render model', () => {
    const chat = buildWorkspaceStandardSectionModel({
      section: 'chat',
      content: <div>chat</div>,
      aiRail: <aside>chat rail</aside>,
    });

    expect(chat.section).toBe('chat');
    expect(chat.headerPolicy).toBe('workspace');
    expect(chat.railPolicy).toBe('custom');
    expect(chat.layout).toBe('withRail');
  });

  it('builds help section as a single-column support page', () => {
    const help = buildWorkspaceHelpSectionModel({
      content: <div>help</div>,
    });

    expect(help.section).toBe('help');
    expect(help.layout).toBe('singleColumn');
    expect(help.filterPolicy).toBe('none');
  });

  it('resolves explore and standard section fallbacks from nullable route state', () => {
    expect(resolveWorkspaceExploreSection(null)).toBe('providers');
    expect(resolveWorkspaceExploreSection('requests')).toBe('providers');
    expect(resolveWorkspaceExploreSection('profile')).toBe('profile');
    expect(resolveWorkspaceStandardSection(null)).toBe('requests');
    expect(resolveWorkspaceStandardSection('stats')).toBe('stats');
  });
});
