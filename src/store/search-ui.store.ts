import { create } from 'zustand';

interface SearchUIState {
  isSticky: boolean;
  transitionActive: boolean;
  searchBarMode: 'origin' | 'sidebar';
  sidebarPosition: { top: number; left: number; width: number };
  stickyOpacity: number;

  setTransition: (value: boolean) => void;
  setSearchBarMode: (mode: 'origin' | 'sidebar') => void;
  setSidebarPosition: (position: { top: number; left: number; width: number }) => void;
  setStickyOpacity: (value: number) => void;
}

export const useSearchUIStore = create<SearchUIState>(set => ({
  isSticky: false,
  transitionActive: false,
  searchBarMode: 'origin',
  sidebarPosition: { top: 0, left: 0, width: 0 },
  stickyOpacity: 0,

  setTransition: value =>
    set(state => {
      if (state.transitionActive !== value) {
        return { transitionActive: value };
      }
      return state;
    }),
  setSearchBarMode: mode =>
    set(state => {
      if (state.searchBarMode !== mode) {
        return {
          searchBarMode: mode,
          isSticky: mode === 'sidebar',
        };
      }
      return state;
    }),
  setSidebarPosition: position => set({ sidebarPosition: position }),
  setStickyOpacity: value => set({ stickyOpacity: value }),
}));
