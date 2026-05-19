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

  it('keeps stats as single-column and rail-free by default', () => {
    const contract = getWorkspaceSectionContract('stats');

    expect(contract.defaultLayout).toBe('singleColumn');
    expect(contract.railPolicy).toBe('none');
  });

  it('keeps chat as a custom-header rail section', () => {
    const contract = getWorkspaceSectionContract('chat');

    expect(contract.defaultLayout).toBe('withRail');
    expect(contract.headerPolicy).toBe('custom');
    expect(contract.railPolicy).toBe('custom');
  });

  it('keeps help as a single-column custom-header support section', () => {
    const contract = getWorkspaceSectionContract('help');

    expect(contract.defaultLayout).toBe('singleColumn');
    expect(contract.headerPolicy).toBe('custom');
    expect(contract.filterPolicy).toBe('none');
  });
});
