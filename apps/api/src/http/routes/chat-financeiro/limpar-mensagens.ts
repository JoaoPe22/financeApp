import { eq } from 'drizzle-orm'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { db } from '@/database'
import { chatMensagem, log } from '@/database/schema'
import { authenticate } from '@/http/middlewares/auth'

const limparMensagens = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().delete(
    '/chat-financeiro/mensagens',
    {
      preHandler: authenticate,
      schema: {
        tags: ['Chat Financeiro'],
        summary: 'Limpar histórico do chat',
        description:
          'Apaga todo o histórico de mensagens do chat financeiro do usuário autenticado. Também é o caminho para o usuário remover o que contou à IA.',
        response: {
          200: z.void(),
        },
      },
    },
    async (request, reply) => {
      const userId = request.user!.id

      await db.delete(chatMensagem).where(eq(chatMensagem.userId, userId))

      await db.insert(log).values({
        usuarioId: userId,
        entidade: 'chat_mensagem',
        entidadeId: userId,
        acao: 'DELETAR',
        descricao: 'Histórico do chat financeiro apagado pelo usuário',
      })

      return reply.status(200).send()
    },
  )
}

export { limparMensagens }
