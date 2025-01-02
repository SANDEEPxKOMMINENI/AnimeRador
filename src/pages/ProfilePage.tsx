import { useState } from 'react';
import { useQuery } from 'react-query';
import { Loader, Heart, Settings, History } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { Button } from '@/components/ui/Button';
import { AnimeGrid } from '@/components/anime/AnimeGrid';
import { useAuthStore } from '@/store/useAuthStore';
import { getAnimeById, mapAnimeResponse } from '@/lib/api';
import type { Anime } from '@/types';

export function ProfilePage() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('favorites');

  const { data: favorites, isLoading } = useQuery(
    ['favorites', user?.favorites],
    async () => {
      if (!user?.favorites?.length) return [];
      const animeList = await Promise.all(
        user.favorites.map(async (id) => {
          const anime = await getAnimeById(id);
          return mapAnimeResponse(anime as any);
        })
      );
      return animeList;
    },
    {
      enabled: !!user?.favorites?.length,
    }
  );

  if (!user) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold">
          Please log in to view your profile
        </h1>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold">{user.username}'s Profile</h1>
          <p className="text-muted-foreground">
            Manage your anime lists and preferences
          </p>
        </div>
        <Button variant="outline" size="sm">
          <Settings className="mr-2 h-4 w-4" />
          Settings
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="favorites" className="flex items-center gap-2">
            <Heart className="h-4 w-4" />
            Favorites
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            Watch History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="favorites" className="space-y-6">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : favorites?.length ? (
            <AnimeGrid animes={favorites} />
          ) : (
            <div className="text-center py-8">
              <Heart className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-semibold">No favorites yet</h3>
              <p className="text-muted-foreground">
                Start adding anime to your favorites list!
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="history">
          <div className="text-center py-8">
            <History className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold">Watch History</h3>
            <p className="text-muted-foreground">
              Coming soon! Track your watched episodes and progress.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
