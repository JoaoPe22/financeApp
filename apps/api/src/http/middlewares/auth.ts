import { eq } from 'drizzle-orm'
import type { FastifyInstance } from 'fastify'
import fastifyPlugin from 'fastify-plugin'

import { auth as betterAuth } from '@/auth'
import { db } from '@/database'
import { user } from '@/database/schema'
import { UnauthorizedError } from '@/http/routes/_errors/unauthorized-error'

const auth = fastifyPlugin(async (app: FastifyInstance) => {
  app.addHook('preHandler', async (request) => {
    request.getCurrentUserId = async () => {
      const session = await betterAuth.api.getSession({
        headers: request.headers,
      })

      if (!session) {
        throw new UnauthorizedError('Session inválida ou expirada')
      }
      return session.user.id
    }

    request.getCurrentUserRole = async () => {
      if (!request.currentUser) {
        throw new UnauthorizedError('Session inválida ou expirada')
      }

      return request.currentUser.role
    }

    const userId = await request.getCurrentUserId()

    const [currentUser] = await db
      .select({
        id: user.id,
        role: user.role,
        banned: user.banned,
        banReason: user.banReason,
        banExpires: user.banExpires,
        email: user.email,
        name: user.name,
      })
      .from(user)
      .where(eq(user.id, userId))
      .limit(1)

    if (!currentUser) {
      throw new UnauthorizedError('Usuário não encontrado.')
    }

    if (currentUser.banned) {
      throw new UnauthorizedError(
        // eslint-disable-next-line @stylistic/multiline-ternary
        `Usuário banido${currentUser.banReason ? `: ${currentUser.banReason}` : ''}`
      )
    }

    request.currentUser = currentUser
  })
})

export { auth }
