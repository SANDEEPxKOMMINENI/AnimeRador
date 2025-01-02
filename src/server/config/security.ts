import { HelmetOptions } from 'helmet';

export const helmetOptions: HelmetOptions = {
  contentSecurityPolicy: process.env.NODE_ENV === 'production',
  crossOriginEmbedder: process.env.NODE_ENV === 'production',
  crossOriginOpener: process.env.NODE_ENV === 'production',
  crossOriginResourcePolicy: process.env.NODE_ENV === 'production',
};