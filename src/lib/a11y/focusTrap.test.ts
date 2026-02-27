import { describe, expect, it, vi } from 'vitest';
import { focusIfPresent, getTrapFocusTarget, resolveInitialFocusTarget, type FocusableLike } from './focusTrap';

type FakeFocusable = FocusableLike & {
  id: string;
};

function makeFocusable(id: string): FakeFocusable {
  return {
    id,
    focus: vi.fn(),
  };
}

describe('focusTrap helpers', () => {
  it('prefers close button as initial focus target', () => {
    const closeButton = makeFocusable('close');
    const firstField = makeFocusable('field');

    const target = resolveInitialFocusTarget(closeButton, [firstField]);

    expect(target).toBe(closeButton);
  });

  it('falls back to first focusable when close button is missing', () => {
    const firstField = makeFocusable('field');

    const target = resolveInitialFocusTarget(null, [firstField]);

    expect(target).toBe(firstField);
  });

  it('returns null when there is no initial focus target', () => {
    expect(resolveInitialFocusTarget(null, [])).toBeNull();
  });

  it('cycles focus forward from the last element to the first', () => {
    const first = makeFocusable('first');
    const middle = makeFocusable('middle');
    const last = makeFocusable('last');
    const focusable = [first, middle, last];

    const target = getTrapFocusTarget({
      focusable,
      activeElement: last as unknown as Node,
      container: {
        contains: (node) => focusable.includes(node as unknown as FakeFocusable),
      },
      shiftKey: false,
    });

    expect(target).toBe(first);
  });

  it('cycles focus backward from the first element to the last', () => {
    const first = makeFocusable('first');
    const middle = makeFocusable('middle');
    const last = makeFocusable('last');
    const focusable = [first, middle, last];

    const target = getTrapFocusTarget({
      focusable,
      activeElement: first as unknown as Node,
      container: {
        contains: (node) => focusable.includes(node as unknown as FakeFocusable),
      },
      shiftKey: true,
    });

    expect(target).toBe(last);
  });

  it('moves focus inside modal when active element is outside', () => {
    const first = makeFocusable('first');
    const last = makeFocusable('last');
    const outside = makeFocusable('outside');
    const focusable = [first, last];

    const forwardTarget = getTrapFocusTarget({
      focusable,
      activeElement: outside as unknown as Node,
      container: {
        contains: (node) => focusable.includes(node as unknown as FakeFocusable),
      },
      shiftKey: false,
    });

    const backwardTarget = getTrapFocusTarget({
      focusable,
      activeElement: outside as unknown as Node,
      container: {
        contains: (node) => focusable.includes(node as unknown as FakeFocusable),
      },
      shiftKey: true,
    });

    expect(forwardTarget).toBe(first);
    expect(backwardTarget).toBe(last);
  });

  it('does not trap when focus stays within middle element', () => {
    const first = makeFocusable('first');
    const middle = makeFocusable('middle');
    const last = makeFocusable('last');
    const focusable = [first, middle, last];

    const target = getTrapFocusTarget({
      focusable,
      activeElement: middle as unknown as Node,
      container: {
        contains: (node) => focusable.includes(node as unknown as FakeFocusable),
      },
      shiftKey: false,
    });

    expect(target).toBeNull();
  });

  it('restores focus when target exists', () => {
    const element = makeFocusable('restore-target');

    focusIfPresent(element);

    expect(element.focus).toHaveBeenCalledTimes(1);
  });
});
