/** @vitest-environment happy-dom */

import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { WorkspacePageFrame } from './WorkspacePageFrame';

describe('WorkspacePageFrame', () => {
  it('renders the page header inside the content column above filters', () => {
    render(
      <WorkspacePageFrame
        topBar={<div>Topbar</div>}
        intro={<div data-testid="workspace-page-header">Header</div>}
        filters={<div data-testid="workspace-page-filters">Filters</div>}
        main={<div data-testid="workspace-page-main">Main</div>}
        aiRail={<div data-testid="workspace-page-rail">Rail</div>}
        sidebar={<div>Sidebar</div>}
      />,
    );

    const content = screen.getByTestId('workspace-page-main').closest('.workspace-page-frame__content');
    expect(content).toBeTruthy();
    const controls = content?.firstElementChild;
    expect(controls).toBeTruthy();
    expect(controls?.classList.contains('workspace-page-frame__controls')).toBe(true);
    expect(controls?.firstElementChild).toBe(screen.getByTestId('workspace-page-header').parentElement);
    expect(controls?.children.item(1)).toBe(screen.getByTestId('workspace-page-filters').parentElement);
  });
});
