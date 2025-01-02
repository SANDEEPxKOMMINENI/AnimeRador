import { connectDB } from '@/lib/db';
import { User } from '@/lib/db';
import type { WatchStatus } from '@/types';

export async function getUserLists(userId: string) {
  await connectDB();
  
  const user = await User.findById(userId).lean();
  if (!user) throw new Error('User not found');

  // Group watchlist items by status
  const lists = {
    watching: [],
    completed: [],
    planToWatch: [],
    dropped: [],
    favorites: user.favorites || []
  };

  user.watchlist?.forEach((item: any) => {
    if (lists[item.status]) {
      lists[item.status].push({
        animeId: item.animeId,
        progress: item.progress,
        rating: item.rating,
        updatedAt: item.updatedAt
      });
    }
  });

  return lists;
}

export async function updateAnimeStatus(
  userId: string,
  animeId: string,
  data: {
    status?: WatchStatus;
    progress?: number;
    rating?: number;
  }
) {
  await connectDB();

  const update: any = {
    $set: {
      'watchlist.$.updatedAt': new Date()
    }
  };

  if (data.status) update.$set['watchlist.$.status'] = data.status;
  if (typeof data.progress === 'number') update.$set['watchlist.$.progress'] = data.progress;
  if (typeof data.rating === 'number') update.$set['watchlist.$.rating'] = data.rating;

  const user = await User.findOneAndUpdate(
    {
      _id: userId,
      'watchlist.animeId': animeId
    },
    update,
    { new: true }
  );

  if (!user) {
    // If anime not in watchlist, add it
    return User.findByIdAndUpdate(
      userId,
      {
        $push: {
          watchlist: {
            animeId,
            status: data.status || 'planToWatch',
            progress: data.progress || 0,
            rating: data.rating,
            updatedAt: new Date()
          }
        }
      },
      { new: true }
    );
  }

  return user;
}

export async function toggleFavorite(userId: string, animeId: string) {
  await connectDB();

  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  const isFavorite = user.favorites.includes(animeId);

  if (isFavorite) {
    user.favorites = user.favorites.filter((id: string) => id !== animeId);
  } else {
    user.favorites.push(animeId);
  }

  await user.save();
  return !isFavorite;
}

export async function removeFromList(userId: string, animeId: string) {
  await connectDB();

  return User.findByIdAndUpdate(
    userId,
    {
      $pull: {
        watchlist: { animeId }
      }
    },
    { new: true }
  );
}