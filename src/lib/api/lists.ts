import { UserList } from '@/server/models/UserList';
import { connectDB } from '@/lib/db';

export async function getUserLists(userId: string) {
  await connectDB();
  
  const [watching, completed, planToWatch, dropped, favorites] = await Promise.all([
    UserList.find({ userId, status: 'watching' }).lean(),
    UserList.find({ userId, status: 'completed' }).lean(),
    UserList.find({ userId, status: 'planToWatch' }).lean(),
    UserList.find({ userId, status: 'dropped' }).lean(),
    UserList.find({ userId, isFavorite: true }).lean()
  ]);

  return {
    watching,
    completed,
    planToWatch,
    dropped,
    favorites
  };
}

export async function updateAnimeStatus(
  userId: string,
  animeId: string,
  data: {
    status?: string;
    progress?: number;
    rating?: number;
    isFavorite?: boolean;
  }
) {
  await connectDB();
  return UserList.upsertAnimeStatus(userId, animeId, data);
}

export async function removeFromList(userId: string, animeId: string) {
  await connectDB();
  return UserList.deleteOne({ userId, animeId });
}