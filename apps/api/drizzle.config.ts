import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  out: './src/database/migrations',
  schema: './src/database/schema/index.ts',
  casing: 'camelCase',
})
