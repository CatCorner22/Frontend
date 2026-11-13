import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// One JavaScript file and one CSS file, so that the private-page build can inline both into a single document.
export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2022',
    cssCodeSplit: false,
    assetsInlineLimit: 0,
    // The page is one file and preloads nothing. Leaving the helper out removes the only `fetch` call from the bundle (finding S2-10).
    modulePreload: { polyfill: false },
    rollupOptions: { output: { inlineDynamicImports: true, entryFileNames: 'assets/app.js', assetFileNames: 'assets/[name][extname]' } },
  },
});
