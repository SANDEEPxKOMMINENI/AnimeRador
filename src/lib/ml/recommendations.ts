import { Anime } from '@/types';
import * as tf from '@tensorflow/tfjs';

// Cosine similarity calculation
function cosineSimilarity(a: number[], b: number[]) {
  const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return dotProduct / (magnitudeA * magnitudeB);
}

// Convert anime features to vector
function getAnimeFeatureVector(anime: Anime): number[] {
  const genreVector = Array(20).fill(0); // Assuming 20 possible genres
  const tagVector = Array(50).fill(0);   // Assuming 50 possible tags
  
  // Encode genres
  anime.genres.forEach(genre => {
    const genreIndex = GENRE_MAP[genre];
    if (genreIndex !== undefined) {
      genreVector[genreIndex] = 1;
    }
  });

  // Encode tags with their rank weights
  anime.tags?.forEach(tag => {
    const tagIndex = TAG_MAP[tag.name];
    if (tagIndex !== undefined) {
      tagVector[tagIndex] = tag.rank / 100; // Normalize rank to 0-1
    }
  });

  // Combine features
  return [
    ...genreVector,
    ...tagVector,
    anime.rating / 10,           // Normalize rating to 0-1
    anime.popularity / 10000,    // Normalize popularity
    anime.releaseYear / 2024,    // Normalize year
  ];
}

// Genre and tag mapping (extend as needed)
const GENRE_MAP: Record<string, number> = {
  'Action': 0,
  'Adventure': 1,
  'Comedy': 2,
  'Drama': 3,
  'Fantasy': 4,
  'Horror': 5,
  'Mecha': 6,
  'Mystery': 7,
  'Romance': 8,
  'Sci-Fi': 9,
  'Slice of Life': 10,
  'Sports': 11,
  'Supernatural': 12,
  'Thriller': 13
};

const TAG_MAP: Record<string, number> = {
  'Shounen': 0,
  'Magic': 1,
  'School': 2,
  'Martial Arts': 3,
  'Super Power': 4,
  'Military': 5,
  'Historical': 6,
  'Demons': 7,
  'Space': 8,
  'Time Travel': 9
};

// Get recommendations using ML
export async function getEnhancedRecommendations(
  currentAnime: Anime,
  allAnime: Anime[],
  limit: number = 10
): Promise<Anime[]> {
  // Convert current anime to feature vector
  const currentVector = getAnimeFeatureVector(currentAnime);

  // Calculate similarities using TensorFlow.js
  const similarities = await tf.tidy(() => {
    const currentTensor = tf.tensor2d([currentVector]);
    const allVectors = allAnime.map(anime => getAnimeFeatureVector(anime));
    const allTensor = tf.tensor2d(allVectors);
    
    // Calculate cosine similarity using matrix operations
    const normalized = tf.div(
      tf.matMul(currentTensor, allTensor.transpose()),
      tf.mul(
        tf.norm(currentTensor),
        tf.norm(allTensor, 2, 1)
      )
    );
    
    return normalized.dataSync();
  });

  // Sort anime by similarity
  const recommendations = allAnime
    .map((anime, index) => ({
      anime,
      similarity: similarities[index]
    }))
    .filter(item => item.anime.id !== currentAnime.id)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit)
    .map(item => item.anime);

  return recommendations;
}