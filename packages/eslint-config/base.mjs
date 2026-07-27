import eslint from "@eslint/js";
import importPlugin from "eslint-plugin-import";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import globals from "globals";
import neostandard, { resolveIgnoresFromGitignore } from "neostandard";
import tseslint from "typescript-eslint";

export default [
  {
    ignores: [
      "**/dist/**",
      "**/coverage/**",
      "**/.next/**",
      "**/node_modules/**",
    ],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  ...neostandard({
    ignores: resolveIgnoresFromGitignore(),
  }),
  {
    plugins: {
      import: importPlugin,
      "simple-import-sort": simpleImportSort,
    },
    languageOptions: {
      globals: {
        ...globals.node,
      },
      parserOptions: {
        projectService: {
          allowDefaultProject: ["eslint.config.mjs"],
        },
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      "simple-import-sort/imports": "error",
      "import/no-duplicates": ["error", { "prefer-inline": true }],
      "no-useless-constructor": "off",
      "@stylistic/space-before-function-paren": [
        "error",
        {
          anonymous: "always",
          asyncArrow: "always",
          named: "never",
        },
      ],
      "@stylistic/jsx-quotes": ["error", "prefer-double"],
      "@stylistic/comma-dangle": ["error", "always-multiline"],
      "@stylistic/multiline-ternary": ["error", "always"],
      "react/jsx-handler-names": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          args: "all",
          argsIgnorePattern: "^_",
          caughtErrors: "all",
          caughtErrorsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],
    },
  },
];
