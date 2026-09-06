import { and, eq } from 'drizzle-orm'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { db } from '@/database'
import { log, objetivo, objetivoHistorico } from '@/database/schema'
import { authenticate } from '@/http/middlewares/auth'

import { BadRequestError } from '../_errors/bad-request-error'
import { objetivoHistoricoBodySchema } from './schema'

const registrarHistoricoObjetivo = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/objetivos/:id/historico',
    {
      preHandler: authenticate,
      schema: {
        tags: ['Objetivos'],
        summary: 'Registrar atualização de estado do objetivo',
        description:
          'Salva o novo valor acumulado do objetivo com data e observação, mantendo o histórico de evolução.',
        params: z.object({ id: z.uuid() }),
        body: objetivoHistoricoBodySchema,
        response: {
          201: z.object({ id: z.uuid() }),
        },
      },
    },
    async (request, reply) => {
      const { body, params } = request
      const userId = request.user!.id

      const [objetivoExistente] = await db
        .select({
          id: objetivo.id,
          titulo: objetivo.titulo,
          valorAtual: objetivo.valorAtual,
        })
        .from(objetivo)
        .where(and(eq(objetivo.id, params.id), eq(objetivo.userId, userId)))
        .limit(1)

      if (!objetivoExistente) {
        throw new BadRequestError('Objetivo não encontrado')
      }

      const variacao = body.valorAtual - Number(objetivoExistente.valorAtual)

      const [registro] = await db
        .insert(objetivoHistorico)
        .values({
          objetivoId: params.id,
          valorAtual: body.valorAtual.toString(),
          variacao: variacao.toFixed(2),
          observacao: body.observacao ?? null,
          data: body.data,
        })
        .returning({ id: objetivoHistorico.id })

      await db
        .update(objetivo)
        .set({ valorAtual: body.valorAtual.toString() })
        .where(eq(objetivo.id, params.id))

      await db.insert(log).values({
        usuarioId: userId,
        entidade: 'objetivo',
        entidadeId: params.id,
        acao: 'ATUALIZAR',
        descricao: `Estado do objetivo "${objetivoExistente.titulo}" atualizado para ${body.valorAtual}`,
      })

      return reply.status(201).send({ id: registro.id })
    },
  )
}

export { registrarHistoricoObjetivo }
