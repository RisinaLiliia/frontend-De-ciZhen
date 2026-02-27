export type FocusableLike = {
  focus: () => void;
};

type TrapFocusParams<T extends FocusableLike> = {
  focusable: T[];
  activeElement: Node | null;
  container: {
    contains: (node: Node | null) => boolean;
  };
  shiftKey: boolean;
};

export function resolveInitialFocusTarget<T extends FocusableLike>(
  closeButton: T | null,
  focusable: T[],
): T | null {
  if (closeButton) return closeButton;
  return focusable[0] ?? null;
}

export function getTrapFocusTarget<T extends FocusableLike>({
  focusable,
  activeElement,
  container,
  shiftKey,
}: TrapFocusParams<T>): T | null {
  if (focusable.length === 0) return null;

  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  const isInside = container.contains(activeElement);
  const activeAsComparable = activeElement as unknown;
  const firstAsComparable = first as unknown;
  const lastAsComparable = last as unknown;

  if (shiftKey) {
    if (activeAsComparable === firstAsComparable || !isInside) return last;
    return null;
  }

  if (activeAsComparable === lastAsComparable || !isInside) return first;
  return null;
}

export function focusIfPresent(target: FocusableLike | null | undefined) {
  target?.focus();
}
