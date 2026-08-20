import { desc, eq } from 'drizzle-orm'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { db } from '@/database'
import { chatMensagem } from '@/database/schema'
import { authenticate } from '@/http/middlewares/auth'

import { mensagemResponseSchema } from './schema'

const LIMITE_LISTAGEM = 100

const listarMensagens = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/chat-financeiro/mensagens',
    {
      preHandler: authenticate,
      schema: {
        tags: ['Chat Financeiro'],
        summary: 'Listar histórico do chat',
        description: 'Lista as mensagens mais recentes do chat financeiro do usuário autenticado.',
        response: {
          200: z.object({ mensagens: z.array(mensagemResponseSchema) }),
        },
      },
    },
    async (request) => {
      const userId = request.user!.id

      // Busca as MAIS RECENTES (desc + limit) e devolve em ordem cronológica.
      // Com asc + limit o usuário parava de ver as mensagens novas ao passar do limite.
      const mensagens = await db
        .select({
          id: chatMensagem.id,
          role: chatMensagem.role,
          conteudo: chatMensagem.conteudo,
          createdAt: chatMensagem.createdAt,
        })
        .from(chatMensagem)
        .where(eq(chatMensagem.userId, userId))
        .orderBy(desc(chatMensagem.createdAt))
        .limit(LIMITE_LISTAGEM)

      return { mensagens: mensagens.reverse() }
    },
  )
}

export { listarMensagens }
