import baseConfig from './base.mjs';
import reactPlugin from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import nextPlugin from '@next/eslint-plugin-next';
import tseslint from 'typescript-eslint';

/** @type {import('typescript-eslint').Config} */
export default tseslint.config(
  ...baseConfig,
  {
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooks,
      'jsx-a11y': jsxA11y,
      '@next/next': nextPlugin,
    },
    settings: { react: { version: 'detect' } },
    rules: {
      ...reactPlugin.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      ...jsxA11y.configs.recommended.rules,
      ...nextPlugin.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off', // not needed with React 19 / Next.js
      'react/prop-types': 'off',         // TS covers this

      // Server Components: no client-side APIs at page level
      '@next/next/no-html-link-for-pages': 'error',

      // No business logic in components (CLAUDE.md)
      'no-restricted-syntax': [
        'warn',
        {
          selector: "CallExpression[callee.name='fetch']",
          message: 'Direct fetch in components is discouraged — use TanStack Query or Server Actions.',
        },
      ],
    },
  },
);
