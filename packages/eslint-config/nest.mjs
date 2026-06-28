import baseConfig from './base.mjs';
import tseslint from 'typescript-eslint';

/** @type {import('typescript-eslint').Config} */
export default tseslint.config(
  ...baseConfig,
  {
    rules: {
      // NestJS: decorators are fine; controllers must be thin
      '@typescript-eslint/no-extraneous-class': 'off',

      // Enforce: no Prisma outside repositories
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@prisma/client'],
              importNames: ['PrismaClient'],
              message: 'PrismaClient must only be used inside PrismaService (shared/prisma). Repositories inject PrismaService.',
            },
            { group: ['apps/*', '../../apps/*'], message: 'packages must not import from apps' },
          ],
        },
      ],

      // No console in production NestJS code (use structured logger)
      'no-console': 'error',
    },
  },
);
