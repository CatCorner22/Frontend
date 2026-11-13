import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['**/dist/**', '**/node_modules/**', 'phase0/**', '**/*.cjs'] },
  ...tseslint.configs.recommended,
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      // Render text as text: these are the script-injection doors, so they stay shut.
      'no-restricted-properties': ['error',
        { property: 'innerHTML', message: 'Do not write innerHTML. Render text as text.' },
        { property: 'outerHTML', message: 'Do not write outerHTML.' },
        { property: 'insertAdjacentHTML', message: 'Do not use insertAdjacentHTML.' },
        { object: 'document', property: 'write', message: 'Do not use document.write.' },
      ],
      'no-restricted-syntax': ['error',
        { selector: "JSXAttribute[name.name='dangerouslySetInnerHTML']", message: 'Do not use dangerouslySetInnerHTML.' },
      ],
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      eqeqeq: 'error',
    },
  },
);
