// Only the check "Outside validators" on GitHub uses this file (decision D64). The repository's own tests (`npm test`) do not
// look in this folder, so the two outside programs never run on a developer's machine.
import { defineConfig } from 'vitest/config';

export default defineConfig({ test: { include: ['validators/**/*.test.mjs'], environment: 'node', testTimeout: 120_000 } });
