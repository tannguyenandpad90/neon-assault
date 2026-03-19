import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@game': path.resolve(__dirname, 'src/game'),
      '@ui': path.resolve(__dirname, 'src/ui'),
      '@app': path.resolve(__dirname, 'src/app'),
    },
  },
  server: {
    port: 4000,
  },
});
