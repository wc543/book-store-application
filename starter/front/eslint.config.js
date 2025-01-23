import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['dist'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      "prefer-const": "off", // let is fine who cares
      // note that you can also avoid getting warned for unused variables
      // when destructuring arrays by just using commas in cases like this:
      // e.g. let [, x] = [1, 2, 3]; console.log(x);
      "@typescript-eslint/no-unused-vars": "off", // annoying when developing
      "@typescript-eslint/no-explicit-any": "off", // sometimes it really can be anything, dude
    },
  },
)
