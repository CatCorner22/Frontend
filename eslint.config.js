import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['.claude/**', '**/dist/**', '**/node_modules/**', 'phase0/**', '**/*.cjs'] },
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
      // A name that starts with an underscore marks a value that is taken out on purpose and not used.
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_', ignoreRestSiblings: true }],
    },
  },
  {
    // The tests damage project files on purpose (a string where a number belongs), which needs loosely typed data.
    files: ['**/test/**/*.ts'],
    rules: { '@typescript-eslint/no-explicit-any': 'off' },
  },
);
