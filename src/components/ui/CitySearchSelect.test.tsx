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
  {
    id: 'ber',
    key: 'berlin',
    name: 'Berlin',
    i18n: { en: 'Berlin' },
    countryCode: 'DE',
    stateName: 'Berlin',
    districtName: null,
    postalCodes: ['10115'],
    isActive: true,
    sortOrder: 1,
  },
  {
    id: 'muc',
    key: 'munich',
    name: 'Munich',
    i18n: { en: 'Munich' },
    countryCode: 'DE',
    stateName: 'Bavaria',
    districtName: null,
    postalCodes: ['80331'],
    isActive: true,
    sortOrder: 2,
  },
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
      expect(screen.getByRole('option', { name: /Berlin/ }).className).toContain('is-active');
    });

    fireEvent.keyDown(input, { key: 'ArrowDown' });

    await waitFor(() => {
      expect(screen.getByRole('option', { name: /Munich/ }).className).toContain('is-active');
    });

    fireEvent.keyDown(input, { key: 'Enter' });

    expect(onChange).toHaveBeenCalledWith('muc');
    expect(onSelectOption).toHaveBeenCalledWith({ value: 'muc', label: 'Munich', meta: '80331 · Bavaria' });
    await waitFor(() => {
      expect(screen.queryByRole('combobox', { name: 'City' })).toBeNull();
    });
  });

  it('renders postal code and region metadata for matched cities', async () => {
    render(
      <CitySearchSelect
        locale="en"
        value=""
        onChange={vi.fn()}
        placeholder="Select city"
        ariaLabel="City"
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Select city' }));

    expect(await screen.findByText('10115 · Berlin')).toBeTruthy();
    expect(screen.getByText('80331 · Bavaria')).toBeTruthy();
  });

  it('supports inline input mode for direct typing in shell filters', async () => {
    render(
      <CitySearchSelect
        mode="inline"
        locale="en"
        value=""
        onChange={vi.fn()}
        placeholder="City or ZIP"
        ariaLabel="City"
      />,
    );

    const input = screen.getByRole('combobox', { name: 'City' });
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: '10115' } });

    expect((input as HTMLInputElement).value).toBe('10115');
    expect(await screen.findByText('10115 · Berlin')).toBeTruthy();
  });

  it('keeps auto inline search separate from committed selection until confirm', async () => {
    const onChange = vi.fn();
    const onSelectOption = vi.fn();

    render(
      <CitySearchSelect
        mode="inline"
        inlineBehavior="auto"
        locale="en"
        value=""
        onChange={onChange}
        onSelectOption={onSelectOption}
        placeholder="City or ZIP"
        ariaLabel="City"
      />,
    );

    const input = screen.getByLabelText('City');
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: '10115' } });

    expect(onChange).not.toHaveBeenCalled();
    expect(onSelectOption).not.toHaveBeenCalled();
    expect(await screen.findByText('10115 · Berlin')).toBeTruthy();

    fireEvent.keyDown(input, { key: 'Enter' });

    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith('ber');
    });
    expect(onSelectOption).toHaveBeenCalledWith({ value: 'ber', label: 'Berlin', meta: '10115 · Berlin' });
    expect(screen.queryByRole('option')).toBeNull();
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
