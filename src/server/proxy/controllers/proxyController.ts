import { Request, Response } from 'express';
import { ProxyService } from '../services/proxyService';
import { logger } from '../../config/logger';

export class ProxyController {
  static async handleRequest(req: Request, res: Response) {
    const { path } = req.params;
    const method = req.method;

    try {
      logger.info(`Proxying request: ${method} ${path}`);

      const response = await ProxyService.forwardRequest(
        path,
        method,
        req.body,
        req.headers
      );

      res.status(response.status).json(response.data);
    } catch (error: any) {
      logger.error('Proxy request failed:', {
        path,
        method,
        error: error.message,
      });

      res.status(error.status || 500).json({
        status: 'error',
        message: error.message || 'Internal proxy server error',
        code: error.code,
      });
    }
  }
}