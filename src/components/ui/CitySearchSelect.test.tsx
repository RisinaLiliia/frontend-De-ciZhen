/** @vitest-environment happy-dom */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';

import type { City } from '@/features/catalog/model';
import { CitySearchSelect } from './CitySearchSelect';

const { useCitiesMock } = vi.hoisted(() => ({
  useCitiesMock: vi.fn(),
}));

vi.mock('@/features/catalog/queries', () => ({
  useCities: (...args: unknown[]) => useCitiesMock(...args),
}));

const BROWSE_CITIES: City[] = [
  { id: 'ber', key: 'berlin', i18n: { en: 'Berlin' }, countryCode: 'DE', isActive: true, sortOrder: 1 },
  { id: 'muc', key: 'munich', i18n: { en: 'Munich' }, countryCode: 'DE', isActive: true, sortOrder: 2 },
];

function mockUseCities({
  browseCities = BROWSE_CITIES,
  selectedCities = [],
  isBrowseError = false,
  isSelectedError = false,
}: {
  browseCities?: City[];
  selectedCities?: City[];
  isBrowseError?: boolean;
  isSelectedError?: boolean;
} = {}) {
  useCitiesMock.mockImplementation((_countryCode: string, options?: { ids?: string[] }) => {
    if (options?.ids?.length) {
      return {
        data: selectedCities,
        isLoading: false,
        isError: isSelectedError,
      };
    }

    return {
      data: browseCities,
      isLoading: false,
      isError: isBrowseError,
    };
  });
}

describe('CitySearchSelect', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseCities();
  });

  afterEach(() => {
    cleanup();
  });

  it('supports keyboard navigation and selection', async () => {
    const onChange = vi.fn();
    const onSelectOption = vi.fn();

    render(
      <CitySearchSelect
        locale="en"
        value=""
        onChange={onChange}
        onSelectOption={onSelectOption}
        placeholder="Select city"
        ariaLabel="City"
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Select city' }));

    const input = await screen.findByRole('combobox', { name: 'City' });
    await waitFor(() => {
      expect(screen.getByRole('option', { name: 'Berlin' }).className).toContain('is-active');
    });

    fireEvent.keyDown(input, { key: 'ArrowDown' });

    await waitFor(() => {
      expect(screen.getByRole('option', { name: 'Munich' }).className).toContain('is-active');
    });

    fireEvent.keyDown(input, { key: 'Enter' });

    expect(onChange).toHaveBeenCalledWith('muc');
    expect(onSelectOption).toHaveBeenCalledWith({ value: 'muc', label: 'Munich' });
    await waitFor(() => {
      expect(screen.queryByRole('combobox', { name: 'City' })).toBeNull();
    });
  });

  it('renders empty state separately from load errors', async () => {
    mockUseCities({ browseCities: [] });

    render(
      <CitySearchSelect
        locale="en"
        value=""
        onChange={vi.fn()}
        placeholder="Select city"
        ariaLabel="City"
        emptyLabel="No results"
        errorLabel="Load failed"
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Select city' }));

    expect(await screen.findByText('No results')).toBeTruthy();
    expect(screen.queryByText('Load failed')).toBeNull();
  });

  it('renders load error state when city query fails', async () => {
    mockUseCities({ isBrowseError: true });

    render(
      <CitySearchSelect
        locale="en"
        value=""
        onChange={vi.fn()}
        placeholder="Select city"
        ariaLabel="City"
        emptyLabel="No results"
        errorLabel="Load failed"
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Select city' }));

    expect(await screen.findByText('Load failed')).toBeTruthy();
    expect(screen.queryByText('No results')).toBeNull();
  });
});
