// Conexão única do Drizzle com o Postgres, usada por toda a API (rotas e middleware de auth).
import { drizzle } from 'drizzle-orm/postgres-js'

import { env } from '@/lib/env'

import * as schema from './schema'

const db = drizzle(env.DATABASE_URL, {
  schema,
  casing: 'camelCase',
  logger: env.NODE_ENV === 'development' && true,
})

export { db }
