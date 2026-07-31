// Rota para listar usuarios
// Responsabilidades:
// - Retornar dados basicos
// - Ordenar por data de criacao
// - Exigir autenticacao

import { desc } from 'drizzle-orm'
import { createSelectSchema } from 'drizzle-zod'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'

import { db } from '@/database'
import { user } from '@/database/schema'
import { auth } from '@/http/middlewares/auth'

const obterUsuarios = async (app: FastifyInstance) => {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      '/usuarios',
      {
        schema: {
          summary: 'Obter usuários',
          description: 'Rota para obter a lista de usuários',
          tags: ['usuarios'],
          response: {
            200: createSelectSchema(user)
              .pick({ id: true, name: true, email: true, role: true })
              .array(),
          },
        },
      },
      async (_, reply) => {
        // Busca a lista de usuarios ordenando os mais recentes
        const usuarios = await db
          .select({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
          })
          .from(user)
          .orderBy(desc(user.createdAt))

        // Retorna a lista encontrada
        return reply.status(200).send(usuarios)
      },
    )
}

export { obterUsuarios }
