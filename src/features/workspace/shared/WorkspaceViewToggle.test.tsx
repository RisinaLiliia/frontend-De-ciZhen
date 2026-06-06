/** @vitest-environment happy-dom */

import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { WorkspaceViewToggle } from './WorkspaceViewToggle';

describe('WorkspaceViewToggle', () => {
  it('renders a single toggle button with next-action tooltip and flips density on click', () => {
    const onChange = vi.fn();
    const t = (key: string) => {
      if (key === 'requestsPage.viewModeLabel') return 'Ansicht';
      if (key === 'requestsPage.viewModeSingle') return 'Eine Karte pro Zeile';
      if (key === 'requestsPage.viewModeDouble') return 'Zwei Karten pro Zeile';
      return key;
    };

    render(<WorkspaceViewToggle t={t} listDensity="double" onChange={onChange} />);

    const button = screen.getByRole('button', { name: 'Eine Karte pro Zeile' });
    expect(button.getAttribute('title')).toBe('Eine Karte pro Zeile');
    expect(button.getAttribute('data-current-density')).toBe('double');

    fireEvent.click(button);

    expect(onChange).toHaveBeenCalledWith('single');
  });
});
