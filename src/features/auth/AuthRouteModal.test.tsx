/** @vitest-environment jsdom */

import * as React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';

import { AuthRouteModal } from './AuthRouteModal';

const { routerMock } = vi.hoisted(() => ({
  routerMock: {
    back: vi.fn(),
    replace: vi.fn(),
  },
}));

vi.mock('next/navigation', () => ({
  useRouter: () => routerMock,
}));

function renderHarness(open: boolean) {
  return render(
    <div>
      <button type="button" data-testid="outside-focus">
        Outside focus
      </button>
      {open ? (
        <AuthRouteModal title="Auth modal" closeLabel="Close auth modal">
          <input aria-label="Email" />
          <button type="button">Save</button>
        </AuthRouteModal>
      ) : null}
    </div>,
  );
}

describe('AuthRouteModal', () => {
  beforeEach(() => {
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      callback(0);
      return 0;
    });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
    vi.unstubAllGlobals();
  });

  it('focuses close button on open', () => {
    renderHarness(true);

    const active = document.activeElement as HTMLElement | null;
    expect(active?.classList.contains('auth-route-modal__close')).toBe(true);
  });

  it('traps focus with Tab/Shift+Tab inside modal', () => {
    renderHarness(true);

    const closeButton = document.querySelector('.auth-route-modal__close') as HTMLButtonElement | null;
    const saveButton = screen.getByRole('button', { name: 'Save' });
    expect(closeButton).not.toBeNull();

    saveButton.focus();
    fireEvent.keyDown(document, { key: 'Tab' });
    expect(document.activeElement).toBe(closeButton);

    closeButton?.focus();
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true });
    expect(document.activeElement).toBe(saveButton);
  });

  it('restores previous focus on close', () => {
    const view = renderHarness(false);
    const outsideButton = screen.getByTestId('outside-focus') as HTMLButtonElement;

    outsideButton.focus();
    expect(document.activeElement).toBe(outsideButton);

    view.rerender(
      <div>
        <button type="button" data-testid="outside-focus">
          Outside focus
        </button>
        <AuthRouteModal title="Auth modal" closeLabel="Close auth modal">
          <input aria-label="Email" />
          <button type="button">Save</button>
        </AuthRouteModal>
      </div>,
    );

    view.rerender(
      <div>
        <button type="button" data-testid="outside-focus">
          Outside focus
        </button>
      </div>,
    );

    expect(document.activeElement).toBe(screen.getByTestId('outside-focus'));
  });
});

