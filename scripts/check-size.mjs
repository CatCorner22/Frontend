// Bundle-size budget. The Studio ships as one script that carries thirteen font files, so the budget is generous but fixed.
import { statSync } from 'node:fs';

const BUDGET_KB = 1600;
const size = statSync(new URL('../apps/studio/dist/assets/app.js', import.meta.url)).size / 1024;
console.log(`app.js: ${size.toFixed(0)} KB (budget ${BUDGET_KB} KB)`);
if (size > BUDGET_KB) {
  console.error('The Studio script is over its size budget. Find what grew before raising the budget.');
  process.exit(1);
}
