/** Boundary rules. `core` is pure: no React, no browser code, and it never imports from an app. */
module.exports = {
  forbidden: [
    { name: 'core-stays-pure', severity: 'error', comment: 'packages/core must not import React or anything from apps/ or plugin/.', from: { path: '^packages/core' }, to: { path: '(^apps/|^plugin/|node_modules/react|node_modules/react-dom|node_modules/@fontsource)' } },
    { name: 'no-circular', severity: 'error', from: {}, to: { circular: true } },
    { name: 'no-orphans-in-core', severity: 'warn', from: { orphan: true, path: '^packages/core/src' }, to: {} },
  ],
  options: { doNotFollow: { path: 'node_modules' }, tsPreCompilationDeps: true, tsConfig: { fileName: 'tsconfig.base.json' }, exclude: { path: '(dist|phase0)' } },
};
