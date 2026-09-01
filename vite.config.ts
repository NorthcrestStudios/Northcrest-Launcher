import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Le renderer est buildé vers app/dist, chargé par electron/main.js.
// base './' est indispensable pour le chargement en file:// dans Electron.
export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: 'app/dist',
    emptyOutDir: true,
    target: 'chrome120',
  },
  server: { port: 5173, strictPort: true },
});
