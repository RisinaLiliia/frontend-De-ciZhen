// src/features/location/store.ts
'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type LocationMode = 'ip' | 'gps' | 'manual';
export type LocationSource = 'ip' | 'gps' | 'geocode' | 'city';

export type LocationState = {
  mode: LocationMode;
  label: string;
  cityId?: string;
  lat?: number;
  lng?: number;
  radiusKm: number;
  source: LocationSource;
  updatedAt: string;
  setIp: (payload?: { label?: string; cityId?: string }) => void;
  setGps: (payload: { lat: number; lng: number }) => void;
  setManual: (payload: {
    label: string;
    cityId?: string;
    lat?: number;
    lng?: number;
    source?: LocationSource;
  }) => void;
  setRadius: (radiusKm: number) => void;
  reset: () => void;
};

const DEFAULT_RADIUS_KM = 10;

const now = () => new Date().toISOString();

export const useLocationStore = create<LocationState>()(
  persist(
    (set, get) => ({
      mode: 'ip',
      label: '',
      cityId: undefined,
      lat: undefined,
      lng: undefined,
      radiusKm: DEFAULT_RADIUS_KM,
      source: 'ip',
      updatedAt: now(),
      setIp: (payload) =>
        set((state) => ({
          mode: 'ip',
          label: payload?.label ?? state.label ?? '',
          cityId: payload?.cityId,
          lat: undefined,
          lng: undefined,
          source: 'ip',
          updatedAt: now(),
        })),
      setGps: ({ lat, lng }) =>
        set((state) => ({
          mode: 'gps',
          label: '',
          cityId: undefined,
          lat,
          lng,
          radiusKm: state.radiusKm ?? DEFAULT_RADIUS_KM,
          source: 'gps',
          updatedAt: now(),
        })),
      setManual: ({ label, cityId, lat, lng, source }) =>
        set((state) => ({
          mode: 'manual',
          label,
          cityId,
          lat,
          lng,
          radiusKm: state.radiusKm ?? DEFAULT_RADIUS_KM,
          source: source ?? (lat != null && lng != null ? 'geocode' : 'city'),
          updatedAt: now(),
        })),
      setRadius: (radiusKm) => set(() => ({ radiusKm, updatedAt: now() })),
      reset: () =>
        set(() => ({
          mode: 'ip',
          label: '',
          cityId: undefined,
          lat: undefined,
          lng: undefined,
          radiusKm: DEFAULT_RADIUS_KM,
          source: 'ip',
          updatedAt: now(),
        })),
    }),
    {
      name: 'dc_location_state',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        mode: state.mode,
        label: state.label,
        cityId: state.cityId,
        lat: state.lat,
        lng: state.lng,
        radiusKm: state.radiusKm,
        source: state.source,
        updatedAt: state.updatedAt,
      }),
    },
  ),
);

export const DEFAULT_LOCATION_RADIUS_KM = DEFAULT_RADIUS_KM;
