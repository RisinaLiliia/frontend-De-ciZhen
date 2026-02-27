/** @vitest-environment jsdom */

import * as React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';

import { RequestOfferSheet } from './RequestOfferSheet';

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

function createProps(overrides?: Partial<React.ComponentProps<typeof RequestOfferSheet>>) {
  return {
    isOpen: true,
    mode: 'form' as const,
    title: 'Offer title',
    previewTitle: 'Preview title',
    previewCity: 'Berlin',
    previewDate: '2026-03-10',
    previewPrice: '€100',
    amountLabel: 'Amount',
    amountValue: '100',
    amountPlaceholder: 'Amount placeholder',
    commentLabel: 'Comment',
    commentValue: 'Comment text',
    commentPlaceholder: 'Comment placeholder',
    availabilityLabel: 'Availability',
    availabilityValue: 'Tomorrow',
    availabilityPlaceholder: 'Availability placeholder',
    submitLabel: 'Submit',
    submitKind: 'submit' as const,
    cancelLabel: 'Cancel',
    cancelKind: 'back' as const,
    closeLabel: 'Close offer sheet',
    successTitle: 'Success',
    successBody: 'Success body',
    successSubline: 'Success subline',
    successTipTitle: 'Tip title',
    successTipCardTitle: 'Tip card title',
    successTipCardBody: 'Tip card body',
    successProfileCta: 'Open profile',
    successContinueCta: 'Continue',
    successProfileHref: '/profile/test',
    showProfileAdvice: false,
    profileStatusLabel: 'Offline',
    isSubmitting: false,
    onAmountChange: vi.fn(),
    onCommentChange: vi.fn(),
    onAvailabilityChange: vi.fn(),
    onClose: vi.fn(),
    onCancel: vi.fn(),
    onSuccessBack: vi.fn(),
    onSubmit: vi.fn(),
    ...overrides,
  };
}

function renderHarness(open: boolean, overrides?: Partial<React.ComponentProps<typeof RequestOfferSheet>>) {
  return render(
    <div>
      <button type="button" data-testid="outside-focus">
        Outside focus
      </button>
      <RequestOfferSheet {...createProps({ isOpen: open, ...overrides })} />
    </div>,
  );
}

describe('RequestOfferSheet', () => {
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
    expect(active?.classList.contains('request-offer-sheet__close')).toBe(true);
  });

  it('traps focus with Tab/Shift+Tab inside sheet', () => {
    renderHarness(true);

    const closeButton = document.querySelector('.request-offer-sheet__close') as HTMLButtonElement | null;
    const submitButton = screen.getByRole('button', { name: 'Submit' });
    expect(closeButton).not.toBeNull();

    submitButton.focus();
    fireEvent.keyDown(document, { key: 'Tab' });
    expect(document.activeElement).toBe(closeButton);

    closeButton?.focus();
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true });
    expect(document.activeElement).toBe(submitButton);
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
        <RequestOfferSheet {...createProps({ isOpen: true })} />
      </div>,
    );

    view.rerender(
      <div>
        <button type="button" data-testid="outside-focus">
          Outside focus
        </button>
        <RequestOfferSheet {...createProps({ isOpen: false })} />
      </div>,
    );

    expect(document.activeElement).toBe(screen.getByTestId('outside-focus'));
  });
});

