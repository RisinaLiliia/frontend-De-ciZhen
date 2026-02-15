import { describe, expect, it } from 'vitest';
import { resolveOfferCardState } from './uiState';

describe('resolveOfferCardState', () => {
  it('returns none when offer is missing', () => {
    expect(resolveOfferCardState()).toBe('none');
    expect(resolveOfferCardState(null)).toBe('none');
  });

  it('returns none for withdrawn offer', () => {
    expect(resolveOfferCardState({ status: 'withdrawn' } as const)).toBe('none');
  });

  it('returns sent for sent offer', () => {
    expect(resolveOfferCardState({ status: 'sent' } as const)).toBe('sent');
  });

  it('returns accepted for accepted offer', () => {
    expect(resolveOfferCardState({ status: 'accepted' } as const)).toBe('accepted');
  });

  it('returns declined for declined offer', () => {
    expect(resolveOfferCardState({ status: 'declined' } as const)).toBe('declined');
  });
});

