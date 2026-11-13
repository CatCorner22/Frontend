import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// One JavaScript file and one CSS file, so that the private-page build can inline both into a single document.
export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2022',
    cssCodeSplit: false,
    assetsInlineLimit: 0,
    rollupOptions: { output: { inlineDynamicImports: true, entryFileNames: 'assets/app.js', assetFileNames: 'assets/[name][extname]' } },
  },
});
