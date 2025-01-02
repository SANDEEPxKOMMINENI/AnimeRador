import mongoose from 'mongoose';

const userListSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  animeId: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['watching', 'completed', 'planToWatch', 'dropped'],
    required: true
  },
  progress: {
    type: Number,
    default: 0,
    min: 0
  },
  rating: {
    type: Number,
    min: 0,
    max: 10
  },
  isFavorite: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  // Create a compound index for faster queries
  indexes: [
    { userId: 1, animeId: 1 },
    { userId: 1, status: 1 },
    { userId: 1, isFavorite: 1 }
  ]
});

// Add method to handle updates efficiently
userListSchema.statics.upsertAnimeStatus = async function(
  userId: string,
  animeId: string,
  data: Partial<{
    status: string;
    progress: number;
    rating: number;
    isFavorite: boolean;
  }>
) {
  return this.findOneAndUpdate(
    { userId, animeId },
    { $set: { ...data, updatedAt: new Date() } },
    { upsert: true, new: true }
  );
};

export const UserList = mongoose.models.UserList || mongoose.model('UserList', userListSchema);