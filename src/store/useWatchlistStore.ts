import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Anime } from '@/types';

export type WatchStatus = 'watching' | 'completed' | 'planToWatch' | 'dropped';

interface WatchlistItem {
  animeId: string;
  status: WatchStatus;
  progress: number;
  rating?: number;
  addedAt: number;
  updatedAt: number;
}

interface WatchlistStore {
  items: Record<string, WatchlistItem>;
  favorites: Set<string>;
  addToWatchlist: (anime: Anime, status: WatchStatus) => void;
  removeFromWatchlist: (animeId: string) => void;
  updateStatus: (animeId: string, status: WatchStatus) => void;
  updateProgress: (animeId: string, progress: number) => void;
  updateRating: (animeId: string, rating: number) => void;
  toggleFavorite: (animeId: string) => void;
  getWatchlistItem: (animeId: string) => WatchlistItem | undefined;
  isFavorite: (animeId: string) => boolean;
}

export const useWatchlistStore = create<WatchlistStore>()(
  persist(
    (set, get) => ({
      items: {},
      favorites: new Set(),

      addToWatchlist: (anime, status) => set((state) => ({
        items: {
          ...state.items,
          [anime.id]: {
            animeId: anime.id,
            status,
            progress: 0,
            addedAt: Date.now(),
            updatedAt: Date.now(),
          },
        },
      })),

      removeFromWatchlist: (animeId) => set((state) => {
        const { [animeId]: _, ...rest } = state.items;
        return { items: rest };
      }),

      updateStatus: (animeId, status) => set((state) => ({
        items: {
          ...state.items,
          [animeId]: {
            ...state.items[animeId],
            status,
            updatedAt: Date.now(),
          },
        },
      })),

      updateProgress: (animeId, progress) => set((state) => ({
        items: {
          ...state.items,
          [animeId]: {
            ...state.items[animeId],
            progress,
            updatedAt: Date.now(),
          },
        },
      })),

      updateRating: (animeId, rating) => set((state) => ({
        items: {
          ...state.items,
          [animeId]: {
            ...state.items[animeId],
            rating,
            updatedAt: Date.now(),
          },
        },
      })),

      toggleFavorite: (animeId) => set((state) => {
        const newFavorites = new Set(state.favorites);
        if (newFavorites.has(animeId)) {
          newFavorites.delete(animeId);
        } else {
          newFavorites.add(animeId);
        }
        return { favorites: newFavorites };
      }),

      getWatchlistItem: (animeId) => get().items[animeId],
      
      isFavorite: (animeId) => get().favorites.has(animeId),
    }),
    {
      name: 'watchlist-storage',
      partialize: (state) => ({
        items: state.items,
        favorites: Array.from(state.favorites),
      }),
      merge: (persisted: any, current) => ({
        ...current,
        ...persisted,
        favorites: new Set(persisted.favorites),
      }),
    }
  )
);