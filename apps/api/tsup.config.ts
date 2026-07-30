import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/**/*.ts', '!src/tests/**', '!src/**/*.test.ts'],
  splitting: false,
  format: ['esm'],
  outExtension: () => ({ js: '.js' }),
  sourcemap: true,
  clean: true,
  loader: {
    '.sql': 'copy',
  },
})
