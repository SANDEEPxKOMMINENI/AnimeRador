import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get current file's directory in ESM
const currentDir = dirname(fileURLToPath(import.meta.url));

// Project root is two levels up from config directory
const projectRoot = join(currentDir, '../../..');

export const paths = {
  root: projectRoot,
  public: join(projectRoot, 'public'),
  logs: join(projectRoot, 'logs'),
  uploads: join(projectRoot, 'uploads'),
  favicon: join(projectRoot, 'public/favicon.ico'),
} as const;