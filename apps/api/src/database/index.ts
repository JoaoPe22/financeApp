// Conexão única do Drizzle com o Postgres, usada por toda a API (rotas e middleware de auth).
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

import { env } from '@/lib/env'

import * as schema from './schema'

const client = postgres(env.DATABASE_URL)

const db = drizzle(client, {
  schema,
  casing: 'camelCase',
})

export { db }
