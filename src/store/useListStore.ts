import { create } from 'zustand';
import { getUserLists, updateAnimeStatus, removeFromList } from '@/lib/api/lists';
import { useAuthStore } from './useAuthStore';
import type { Anime } from '@/types';

export type WatchStatus = 'watching' | 'completed' | 'planToWatch' | 'dropped';

interface ListItem {
  animeId: string;
  status: WatchStatus;
  progress: number;
  rating?: number;
  isFavorite: boolean;
  updatedAt: Date;
}

interface ListStore {
  lists: {
    watching: ListItem[];
    completed: ListItem[];
    planToWatch: ListItem[];
    dropped: ListItem[];
    favorites: ListItem[];
  };
  isLoading: boolean;
  error: string | null;
  fetchUserLists: () => Promise<void>;
  addToList: (anime: Anime, status: WatchStatus) => Promise<void>;
  removeFromList: (animeId: string) => Promise<void>;
  updateStatus: (animeId: string, status: WatchStatus) => Promise<void>;
  updateProgress: (animeId: string, progress: number) => Promise<void>;
  updateRating: (animeId: string, rating: number) => Promise<void>;
  toggleFavorite: (animeId: string) => Promise<void>;
  getListItem: (animeId: string) => ListItem | undefined;
  isFavorite: (animeId: string) => boolean;
}

export const useListStore = create<ListStore>((set, get) => ({
  lists: {
    watching: [],
    completed: [],
    planToWatch: [],
    dropped: [],
    favorites: []
  },
  isLoading: false,
  error: null,

  fetchUserLists: async () => {
    const userId = useAuthStore.getState().user?.id;
    if (!userId) return;

    set({ isLoading: true, error: null });
    try {
      const lists = await getUserLists(userId);
      set({ lists, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to fetch lists', isLoading: false });
    }
  },

  addToList: async (anime, status) => {
    const userId = useAuthStore.getState().user?.id;
    if (!userId) return;

    try {
      await updateAnimeStatus(userId, anime.id, { status });
      await get().fetchUserLists();
    } catch (error) {
      set({ error: 'Failed to add to list' });
    }
  },

  removeFromList: async (animeId) => {
    const userId = useAuthStore.getState().user?.id;
    if (!userId) return;

    try {
      await removeFromList(userId, animeId);
      await get().fetchUserLists();
    } catch (error) {
      set({ error: 'Failed to remove from list' });
    }
  },

  updateStatus: async (animeId, status) => {
    const userId = useAuthStore.getState().user?.id;
    if (!userId) return;

    try {
      await updateAnimeStatus(userId, animeId, { status });
      await get().fetchUserLists();
    } catch (error) {
      set({ error: 'Failed to update status' });
    }
  },

  updateProgress: async (animeId, progress) => {
    const userId = useAuthStore.getState().user?.id;
    if (!userId) return;

    try {
      await updateAnimeStatus(userId, animeId, { progress });
      await get().fetchUserLists();
    } catch (error) {
      set({ error: 'Failed to update progress' });
    }
  },

  updateRating: async (animeId, rating) => {
    const userId = useAuthStore.getState().user?.id;
    if (!userId) return;

    try {
      await updateAnimeStatus(userId, animeId, { rating });
      await get().fetchUserLists();
    } catch (error) {
      set({ error: 'Failed to update rating' });
    }
  },

  toggleFavorite: async (animeId) => {
    const userId = useAuthStore.getState().user?.id;
    if (!userId) return;

    const isFavorite = get().isFavorite(animeId);
    try {
      await updateAnimeStatus(userId, animeId, { isFavorite: !isFavorite });
      await get().fetchUserLists();
    } catch (error) {
      set({ error: 'Failed to update favorites' });
    }
  },

  getListItem: (animeId) => {
    const { lists } = get();
    return Object.values(lists)
      .flat()
      .find(item => item.animeId === animeId);
  },

  isFavorite: (animeId) => {
    return get().lists.favorites.some(item => item.animeId === animeId);
  }
}));