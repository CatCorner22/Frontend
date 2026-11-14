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
        { object: 'document', property: 'writeln', message: 'Do not use document.writeln.' },
        { property: 'setHTMLUnsafe', message: 'Do not use setHTMLUnsafe. Render text as text.' },
        { property: 'parseHTMLUnsafe', message: 'Do not use parseHTMLUnsafe.' },
        { property: 'createContextualFragment', message: 'Do not turn text into markup.' },
        // A frame's document text. The Studio sets it in three places only (two locked preview frames and one fixed test
        // frame); each of them carries a comment that switches this rule off for one line and says why.
        { property: 'srcdoc', message: 'Do not set a frame’s document text, except where a comment explains why it is safe.' },
      ],
      'no-restricted-globals': ['error', { name: 'DOMParser', message: 'Do not turn text into markup.' }],
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
