import type { IUser } from '../models/User';

export function sanitizeUser(user: IUser) {
  return {
    id: user._id,
    username: user.username,
    email: user.email,
    favorites: user.favorites,
    watchlist: user.watchlist,
    lastLogin: user.lastLogin,
    createdAt: user.createdAt,
  };
}