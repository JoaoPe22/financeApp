import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { db } from '@/database'
import { log, objetivo } from '@/database/schema'
import { authenticate } from '@/http/middlewares/auth'

import { objetivoBodySchema } from './schema'

const cadastrarObjetivo = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/objetivos',
    {
      preHandler: authenticate,
      schema: {
        tags: ['Objetivos'],
        summary: 'Cadastrar objetivo',
        description: 'Endpoint para cadastrar um novo objetivo financeiro.',
        body: objetivoBodySchema,
        response: {
          201: z.object({ id: z.uuid() }),
        },
      },
    },
    async (request, reply) => {
      const { body } = request
      const userId = request.user!.id

      const [novoObjetivo] = await db
        .insert(objetivo)
        .values({
          userId,
          titulo: body.titulo,
          descricao: body.descricao ?? null,
          valorMeta: body.valorMeta.toString(),
          valorAtual: body.valorAtual.toString(),
          prazo: body.prazo,
          status: body.status,
        })
        .returning({ id: objetivo.id })

      await db.insert(log).values({
        usuarioId: userId,
        entidade: 'objetivo',
        entidadeId: novoObjetivo.id,
        acao: 'CADASTRAR',
        descricao: `Objetivo "${body.titulo}" cadastrado com sucesso`,
      })

      return reply.status(201).send({ id: novoObjetivo.id })
    },
  )
}

export { cadastrarObjetivo }
