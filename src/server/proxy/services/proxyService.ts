import axios, { AxiosError } from 'axios';
import { proxyConfig } from '../config';
import { logger } from '../../config/logger';

const proxyClient = axios.create({
  baseURL: proxyConfig.targetApi,
  timeout: proxyConfig.timeout,
  headers: {
    'Accept': 'application/json',
    'User-Agent': 'AnimeRadar/1.0',
  },
});

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

export class ProxyService {
  static async forwardRequest(path: string, method: string, data?: any, headers?: any) {
    let retries = 0;

    while (retries < MAX_RETRIES) {
      try {
        const response = await proxyClient.request({
          url: path,
          method,
          data,
          headers: {
            ...headers,
            host: new URL(proxyConfig.targetApi).host,
          },
          validateStatus: (status) => status < 500, // Only retry on 5xx errors
        });

        // Log successful requests
        logger.info('Proxy request successful:', {
          path,
          method,
          status: response.status,
        });

        return {
          status: response.status,
          data: response.data,
          headers: response.headers,
        };
      } catch (error) {
        retries++;
        
        logger.error('Proxy request failed:', {
          path,
          method,
          attempt: retries,
          error: error instanceof Error ? error.message : 'Unknown error',
        });

        if (error instanceof AxiosError) {
          // Don't retry on 4xx errors
          if (error.response?.status && error.response.status < 500) {
            throw {
              status: error.response.status,
              message: error.response.data?.message || 'Request failed',
              code: error.code,
            };
          }

          // Wait before retrying
          if (retries < MAX_RETRIES) {
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * retries));
            continue;
          }
        }

        throw {
          status: 500,
          message: 'Internal proxy server error',
          code: 'PROXY_ERROR',
        };
      }
    }
  }
}