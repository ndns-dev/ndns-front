import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface LocationData {
  lat: number;
  lng: number;
  accuracy: number;
  address?: string;
  region?: string;
}

interface LocationStore {
  location: LocationData | null;
  setLocation: (location: LocationData | null) => void;
  clearLocation: () => void;
  hasLocation: () => boolean;
}

export const useLocationStore = create<LocationStore>()(
  persist(
    (set, get) => ({
      location: null,

      setLocation: location => {
        set({ location });
      },

      clearLocation: () => {
        set({ location: null });
      },

      hasLocation: () => {
        return get().location !== null;
      },
    }),
    {
      name: 'location-storage',
    }
  )
);
