/** @vitest-environment happy-dom */

import { describe, expect, it } from 'vitest';

import {
  buildWorkspaceChatSectionModel,
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

  it('builds explore section for providers as single column', () => {
    const model = buildWorkspaceExploreSectionModel({
      branch: {
        isWorkspaceAuthed: true,
        locale: 'de',
        t: (key) => String(key),
      },
      section: 'providers',
      explore: null,
    });

    expect(model.section).toBe('providers');
    expect(model.layout).toBe('singleColumn');
    expect(model.railPolicy).toBe('none');
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

  it('builds chat section with custom header and custom rail policy', () => {
    const chat = buildWorkspaceChatSectionModel({
      content: <div>chat</div>,
      aiRail: <aside>chat rail</aside>,
    });

    expect(chat.section).toBe('chat');
    expect(chat.headerPolicy).toBe('custom');
    expect(chat.railPolicy).toBe('custom');
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
