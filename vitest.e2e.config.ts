import { defineConfig } from 'vitest/config';

// End-to-end tests drive the built Studio in a real browser. Run `npm run e2e` (it builds the page first).
export default defineConfig({
  test: { include: ['apps/studio/e2e/**/*.e2e.ts'], environment: 'node', testTimeout: 90_000, hookTimeout: 90_000, fileParallelism: false },
});
