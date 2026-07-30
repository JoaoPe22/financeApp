import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { admin } from 'better-auth/plugins'

import { db } from '@/database'
import { env } from '@/lib/env'

import { ac, ADMIN, AUXILIAR, SUPERVISOR } from './permissions'

const auth = betterAuth({
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  database: drizzleAdapter(db, {
    provider: 'pg',
  }),
  plugins: [
    admin({
      defaultRole: 'AUXILIAR',
      ac,
      roles: {
        ADMIN,
        SUPERVISOR,
        AUXILIAR,
      },
    }),
  ],
})

export { auth }
