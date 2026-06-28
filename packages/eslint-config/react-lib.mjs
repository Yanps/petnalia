import baseConfig from './base.mjs';
import reactPlugin from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import tseslint from 'typescript-eslint';

/** @type {import('typescript-eslint').Config} */
export default tseslint.config(
  ...baseConfig,
  {
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooks,
      'jsx-a11y': jsxA11y,
    },
    settings: { react: { version: 'detect' } },
    rules: {
      ...reactPlugin.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      ...jsxA11y.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',

      // UI lib must never import from apps or use server-only modules
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            { group: ['apps/*', '../../apps/*'], message: 'packages/ui must not import from apps' },
            { group: ['server-only'], message: 'packages/ui is a client-compatible lib — no server-only modules' },
            { group: ['next/navigation', 'next/headers'], message: 'packages/ui must not depend on Next.js internals' },
          ],
        },
      ],
    },
  },
);
