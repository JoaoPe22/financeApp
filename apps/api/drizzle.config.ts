// Configuração do drizzle-kit (CLI usada pelos scripts db:generate e db:migrate).
// Não é código de runtime da API — só orienta a geração/aplicação das migrations
// a partir do schema em src/database/schema.
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
