import axios, { AxiosInstance } from 'axios';
import { PROVIDER_CONFIG } from '../config/providers';
import { logger } from '@/lib/logger';

export function createHttpClient(baseURL: string): AxiosInstance {
  const client = axios.create({
    baseURL,
    timeout: PROVIDER_CONFIG.timeout,
    headers: PROVIDER_CONFIG.headers,
  });

  // Add response interceptor for error handling
  client.interceptors.response.use(
    response => response,
    async error => {
      logger.error('HTTP request failed:', {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
      });
      throw error;
    }
  );

  return client;
}