import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { getEpisodes, getStreamingSources } from '../services/streaming.service';
import { logger } from '@/lib/logger';

export const getAnimeEpisodesList = asyncHandler(async (req: Request, res: Response) => {
  const { animeId } = req.params;

  try {
    const result = await getEpisodes(animeId);
    res.json(result);
  } catch (error) {
    logger.error('Failed to fetch episodes:', error);
    res.status(503).json({
      status: 'error',
      message: 'Failed to fetch episodes. Please try again later.',
      code: 'STREAMING_ERROR'
    });
  }
});

export const getEpisodeStreamingData = asyncHandler(async (req: Request, res: Response) => {
  const { episodeId } = req.params;

  try {
    const result = await getStreamingSources(episodeId);
    res.json(result);
  } catch (error) {
    logger.error('Failed to fetch streaming sources:', error);
    res.status(503).json({
      status: 'error',
      message: 'Failed to fetch streaming sources. Please try again later.',
      code: 'STREAMING_ERROR'
    });
  }
});