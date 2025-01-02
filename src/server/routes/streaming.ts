import express from 'express';
import { corsMiddleware } from '../middleware/cors';
import { getAnimeEpisodesList, getEpisodeStreamingData } from '../controllers/streaming';

const router = express.Router();

// Apply CORS middleware
router.use(corsMiddleware);

// Routes
router.get('/episodes/:animeId', getAnimeEpisodesList);
router.get('/watch/:episodeId', getEpisodeStreamingData);

export default router;