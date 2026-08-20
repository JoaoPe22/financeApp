import { asc, eq } from 'drizzle-orm'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { db } from '@/database'
import { chatMensagem } from '@/database/schema'
import { authenticate } from '@/http/middlewares/auth'

const mensagemResponseSchema = z.object({
  id: z.uuid(),
  role: z.enum(['USER', 'ASSISTANT']),
  conteudo: z.string(),
  createdAt: z.date(),
})

const listarMensagens = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/chat-financeiro/mensagens',
    {
      preHandler: authenticate,
      schema: {
        tags: ['Chat Financeiro'],
        summary: 'Listar histórico do chat',
        description: 'Lista o histórico de mensagens do chat financeiro do usuário autenticado.',
        response: {
          200: z.object({ mensagens: z.array(mensagemResponseSchema) }),
        },
      },
    },
    async (request) => {
      const userId = request.user!.id

      const mensagens = await db
        .select({
          id: chatMensagem.id,
          role: chatMensagem.role,
          conteudo: chatMensagem.conteudo,
          createdAt: chatMensagem.createdAt,
        })
        .from(chatMensagem)
        .where(eq(chatMensagem.userId, userId))
        .orderBy(asc(chatMensagem.createdAt))
        .limit(100)

      return { mensagens }
    },
  )
}

export { listarMensagens }
