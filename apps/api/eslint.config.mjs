import nestConfig from '@petnalia/eslint-config/nest';

export default [
  { ignores: ['dist/**', 'coverage/**', 'prisma/**', 'eslint.config.mjs'] },
  ...nestConfig,
  {
    languageOptions: {
      parserOptions: {
        // tsconfig.eslint.json also covers test/ and *.int.spec.ts, which the build tsconfig excludes.
        project: './tsconfig.eslint.json',
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    // The one place allowed to extend PrismaClient (see nest.mjs).
    files: ['src/shared/prisma/prisma.service.ts'],
    rules: { 'no-restricted-imports': 'off' },
  },
  {
    files: ['**/*.spec.ts', 'test/**/*.ts'],
    rules: {
      // `expect(mock.method).toHaveBeenCalled()` is the idiomatic Vitest assertion.
      '@typescript-eslint/unbound-method': 'off',
      // Supertest responses and vi.fn() mocks are `any`-typed by design.
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
    },
  },
  {
    // Testcontainers helpers talk to the throwaway database directly.
    files: ['test/helpers/**/*.ts', 'src/**/*.int.spec.ts'],
    rules: { 'no-restricted-imports': 'off' },
  },
];
