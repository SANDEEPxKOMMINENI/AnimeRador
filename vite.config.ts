import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { proxyConfig } from './src/lib/proxy/config';
import { handleProxyError } from './src/lib/proxy/error-handler';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: true, // Add this to expose network access
    proxy: {
      '/api': {
        target: proxyConfig.target,
        changeOrigin: true,
        secure: false,
        timeout: proxyConfig.timeout,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, res) => {
            const { status, message } = handleProxyError(err);
            res.writeHead(status, {
              'Content-Type': 'application/json',
            });
            res.end(JSON.stringify({ status: 'error', message }));
          });
        },
      },
    },
  },
});