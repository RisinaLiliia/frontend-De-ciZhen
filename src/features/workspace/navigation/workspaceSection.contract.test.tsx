import { describe, expect, it } from 'vitest';

import {
  buildWorkspaceSectionRenderModel,
  getWorkspaceSectionContract,
  resolveWorkspacePublicIntroDecorations,
} from '@/features/workspace/navigation/workspaceSection.contract';

describe('workspaceSection.contract', () => {
  it('builds requests section with custom rail policy when aiRail is provided', () => {
    const model = buildWorkspaceSectionRenderModel({
      section: 'requests',
      content: null,
      aiRail: 'rail',
    });

    expect(model.layout).toBe('withRail');
    expect(model.railPolicy).toBe('custom');
    expect(model.filterPolicy).toBe('sharedContext');
  });

  it('resolves desktop intro decorations from section contract', () => {
    expect(resolveWorkspacePublicIntroDecorations({ section: 'providers', isDesktop: true })).toEqual({
      showDemandMap: false,
      showQuickAction: false,
    });
    expect(resolveWorkspacePublicIntroDecorations({ section: 'requests', isDesktop: true })).toEqual({
      showDemandMap: true,
      showQuickAction: true,
    });
  });

  it('keeps providers and profile intros free from legacy quick actions on mobile too', () => {
    expect(resolveWorkspacePublicIntroDecorations({ section: 'providers', isDesktop: false })).toEqual({
      showDemandMap: false,
      showQuickAction: false,
    });
    expect(resolveWorkspacePublicIntroDecorations({ section: 'profile', isDesktop: false })).toEqual({
      showDemandMap: false,
      showQuickAction: false,
    });
  });

  it('keeps stats on the shared with-rail layout contract', () => {
    const contract = getWorkspaceSectionContract('stats');

    expect(contract.defaultLayout).toBe('withRail');
    expect(contract.railPolicy).toBe('none');
  });

  it('keeps overview and actions inside the shared canonical section registry', () => {
    const overview = getWorkspaceSectionContract('overview');
    const actions = getWorkspaceSectionContract('actions');

    expect(overview.defaultLayout).toBe('withRail');
    expect(overview.railPolicy).toBe('contextual');
    expect(actions.defaultLayout).toBe('withRail');
    expect(actions.headerPolicy).toBe('workspace');
    expect(actions.filterPolicy).toBe('none');
  });

  it('keeps chat on the shared workspace section contract', () => {
    const contract = getWorkspaceSectionContract('chat');

    expect(contract.defaultLayout).toBe('withRail');
    expect(contract.headerPolicy).toBe('workspace');
    expect(contract.railPolicy).toBe('none');
    expect(contract.filterPolicy).toBe('sharedContext');
  });

  it('keeps help as a single-column custom-header support section', () => {
    const contract = getWorkspaceSectionContract('help');

    expect(contract.defaultLayout).toBe('singleColumn');
    expect(contract.headerPolicy).toBe('custom');
    expect(contract.filterPolicy).toBe('none');
  });

  it('keeps legal sections inside the single-column support contract too', () => {
    const privacy = getWorkspaceSectionContract('privacy');
    const cookies = getWorkspaceSectionContract('cookies');

    expect(privacy.defaultLayout).toBe('singleColumn');
    expect(privacy.headerPolicy).toBe('custom');
    expect(privacy.filterPolicy).toBe('none');
    expect(cookies.defaultLayout).toBe('singleColumn');
    expect(cookies.headerPolicy).toBe('custom');
    expect(cookies.filterPolicy).toBe('none');
  });
});
