import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { v7 as uuidv7 } from 'uuid'

import { db } from '@/database'
import { env } from '@/lib/env'

const auth = betterAuth({
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  database: drizzleAdapter(db, {
    provider: 'pg',
  }),
  session: {
    expiresIn: 60 * 60 * 4,
    updateAge: 60 * 5,
  },
  advanced: {
    database: {
      generateId: () => uuidv7(),
    },
  },
})

export { auth }
