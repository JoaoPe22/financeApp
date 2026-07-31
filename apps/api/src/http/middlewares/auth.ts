// Plugin do Fastify que protege uma rota: registre-o com `app.register(auth)`
// antes dos handlers (ver src/http/routes/usuarios/*) para exigir sessão válida.
// Fluxo do preHandler (roda antes do handler da rota):
// 1. Lê o cookie de sessão e valida via better-auth (getCurrentUserId)
// 2. Busca o usuário no banco para checar se ele ainda existe e não está banido
// 3. Deixa os dados em request.currentUser, prontos para o handler usar
import { eq } from 'drizzle-orm'
import type { FastifyInstance } from 'fastify'
import fastifyPlugin from 'fastify-plugin'

import { auth as betterAuth } from '@/auth'
import { db } from '@/database'
import { user } from '@/database/schema'
import { UnauthorizedError } from '@/http/routes/_errors/unauthorized-error'

const auth = fastifyPlugin(async (app: FastifyInstance) => {
  app.addHook('preHandler', async (request) => {
    // Valida a sessão (mesmo cookie criado pelo login no Next.js) e retorna o id do usuário
    request.getCurrentUserId = async () => {
      const session = await betterAuth.api.getSession({
        headers: request.headers,
      })

      if (!session) {
        throw new UnauthorizedError('Session inválida ou expirada')
      }
      return session.user.id
    }

    // Só funciona depois que currentUser já foi carregado abaixo neste mesmo preHandler
    request.getCurrentUserRole = async () => {
      if (!request.currentUser) {
        throw new UnauthorizedError('Session inválida ou expirada')
      }

      return request.currentUser.role
    }

    const userId = await request.getCurrentUserId()

    // Recarrega o usuário do banco (não confia só no que está no cookie/sessão)
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

    // Mesmo com sessão válida, usuário banido não pode usar a API
    if (currentUser.banned) {
      throw new UnauthorizedError(
        `Usuário banido${currentUser.banReason ? `: ${currentUser.banReason}` : ''}`,
      )
    }

    request.currentUser = currentUser
  })
})

export { auth }
