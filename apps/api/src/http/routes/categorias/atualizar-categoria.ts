import { and, eq } from 'drizzle-orm'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { db } from '@/database'
import { categoria, log } from '@/database/schema'
import { authenticate } from '@/http/middlewares/auth'

import { BadRequestError } from '../_errors/bad-request-error'
import { categoriaBodySchema } from './schema'

const atualizarCategoria = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().patch(
    '/categorias/:id',
    {
      preHandler: authenticate,
      schema: {
        tags: ['Categorias'],
        summary: 'Atualizar categoria',
        description:
          'Endpoint para atualizar uma categoria já cadastrada. O tipo não muda: lançamentos já vinculados deixariam de bater com ele.',
        params: z.object({ id: z.uuid() }),
        body: categoriaBodySchema.omit({ tipo: true }),
        response: {
          200: z.void(),
        },
      },
    },
    async (request, reply) => {
      const { body, params } = request
      const userId = request.user!.id

      const [categoriaExistente] = await db
        .select({ id: categoria.id })
        .from(categoria)
        .where(and(eq(categoria.id, params.id), eq(categoria.userId, userId)))
        .limit(1)

      if (!categoriaExistente) {
        throw new BadRequestError('Categoria não encontrada')
      }

      await db
        .update(categoria)
        .set({ nome: body.nome, cor: body.cor, icone: body.icone })
        .where(eq(categoria.id, params.id))

      await db.insert(log).values({
        usuarioId: userId,
        entidade: 'categoria',
        entidadeId: params.id,
        acao: 'ATUALIZAR',
        descricao: `Categoria "${body.nome}" atualizada com sucesso`,
      })

      return reply.status(200).send()
    },
  )
}

export { atualizarCategoria }
