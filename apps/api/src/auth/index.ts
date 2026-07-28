import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'

import { db } from '@/database'
import { env } from '@/lib/env'

const auth = betterAuth({
  secret: env.BETTER_AUTH_SECRET,
  baseUrl: env.BETTER_AUTH_URL,
  database: drizzleAdapter(db, {
    provider: 'pg',
  }),
  emailAndPassword: {
    enabled: true,
    resetPasswordTokenExpiresIn: 3600,
    sendResetPassword: async ({ user, url }) => {
      const resetUrl = url.replace(
        `${env.BETTER_AUTH_URL}/reset-password`,
        `${env.FRONTEND_URL}/redefinir-senha?token`,
      )
      console.log(`Enviar email para ${user.email} com o link: ${resetUrl}`)
    },
  },
})

export { auth }
