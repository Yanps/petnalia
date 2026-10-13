import nextConfig from '@petnalia/eslint-config/next';

export default [
  {
    ignores: [
      '.next/**',
      'playwright-report/**',
      'test-results/**',
      'next-env.d.ts',
      'eslint.config.mjs',
      'postcss.config.js',
    ],
  },
  ...nextConfig,
  {
    languageOptions: {
      parserOptions: {
        // tsconfig.eslint.json also covers e2e/ and root config files.
        project: './tsconfig.eslint.json',
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // `role` is a prop on our own components (e.g. <AppointmentsList role="tutor">), not ARIA.
      'jsx-a11y/aria-role': ['error', { ignoreNonDOM: true }],

      // Pre-existing a11y debt, surfaced when lint was first wired up (2026-10).
      // Kept visible as warnings until the affected components are fixed; flip back to errors then.
      'jsx-a11y/label-has-associated-control': 'warn',
      'jsx-a11y/click-events-have-key-events': 'warn',
      'jsx-a11y/no-static-element-interactions': 'warn',
      'jsx-a11y/interactive-supports-focus': 'warn',
      'jsx-a11y/no-noninteractive-tabindex': 'warn',
    },
  },
  {
    // Playwright fixtures call `use(...)`, which is not a React hook.
    files: ['e2e/**/*.ts'],
    rules: { 'react-hooks/rules-of-hooks': 'off' },
  },
];
