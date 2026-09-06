// Configuração de lint do projeto: regras base do Next.js + neostandard (estilo)
// + ordenação automática de imports (simple-import-sort).
import eslint from '@eslint/js'
import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'
import prettierConfig from 'eslint-config-prettier/flat'
import simpleImportSort from 'eslint-plugin-simple-import-sort'
import globals from 'globals'
import neostandard, { resolveIgnoresFromGitignore } from 'neostandard'

const eslintConfig = defineConfig([
  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    ...resolveIgnoresFromGitignore(),
  ]),
  ...nextVitals,
  ...nextTs,
  eslint.configs.recommended,
  ...neostandard(),
  {
    plugins: {
      'simple-import-sort': simpleImportSort,
    },
    rules: {
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'error',
      'simple-import-sort/imports': 'error',
      'no-useless-constructor': 'off',
      '@stylistic/space-before-function-paren': [
        'error',
        {
          anonymous: 'always',
          asyncArrow: 'always',
          named: 'never',
        },
      ],
      '@stylistic/jsx-quotes': ['error', 'prefer-double'],
      '@stylistic/comma-dangle': ['error', 'always-multiline'],
      '@stylistic/multiline-ternary': ['error', 'always-multiline'],
      'react/jsx-handler-names': 'off',
    },
    languageOptions: {
      globals: {
        ...globals.browser,
        React: 'readonly',
      },
      parserOptions: {
        projectService: {
          allowDefaultProject: [
            'eslint.config.mjs',
            'ecosystem.config.js',
            'postcss.config.mjs',
          ],
        },
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    // Hooks custom (ex.: useUsuarios) expõem métodos como `list`/`create` que chamam
    // useQuery/useMutation internamente; a regra padrão barraria esse padrão por nome.
    files: ['src/hooks/**/*.ts'],
    rules: {
      'react-hooks/rules-of-hooks': 'off',
    },
  },
  // Por último: desliga as regras de formatação do ESLint (@stylistic/*) que
  // brigam com o Prettier. Formatação é responsabilidade só do Prettier.
  prettierConfig,
])

export default eslintConfig
