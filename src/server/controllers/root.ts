import { Request, Response } from 'express';

export const welcomeHandler = (req: Request, res: Response) => {
  res.json({
    status: 'success',
    message: 'Welcome to AnimeRadar API',
    version: process.env.npm_package_version,
    docs: '/api/docs',
  });
};