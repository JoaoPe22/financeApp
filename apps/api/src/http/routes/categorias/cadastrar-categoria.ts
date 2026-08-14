import { and, eq } from 'drizzle-orm'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { db } from '@/database'
import { categoria, log } from '@/database/schema'
import { authenticate } from '@/http/middlewares/auth'

import { BadRequestError } from '../_errors/bad-request-error'
import { categoriaBodySchema } from './schema'

const cadastrarCategoria = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/categorias',
    {
      preHandler: authenticate,
      schema: {
        tags: ['Categorias'],
        summary: 'Cadastrar categoria',
        description: 'Endpoint para cadastrar uma nova categoria.',
        body: categoriaBodySchema,
        response: {
          201: z.object({ id: z.uuid() }),
        },
      },
    },
    async (request, reply) => {
      const { body } = request
      const userId = request.user!.id

      const [categoriaExistente] = await db
        .select({ id: categoria.id })
        .from(categoria)
        .where(
          and(
            eq(categoria.userId, userId),
            eq(categoria.nome, body.nome),
            eq(categoria.tipo, body.tipo),
          ),
        )
        .limit(1)

      if (categoriaExistente) {
        throw new BadRequestError(
          'Já existe uma categoria com esse nome para esse tipo',
        )
      }

      const [novaCategoria] = await db
        .insert(categoria)
        .values({
          userId,
          nome: body.nome,
          tipo: body.tipo,
          cor: body.cor,
          icone: body.icone,
        })
        .returning({ id: categoria.id })

      await db.insert(log).values({
        usuarioId: userId,
        entidade: 'categoria',
        entidadeId: novaCategoria.id,
        acao: 'CADASTRAR',
        descricao: `Categoria "${body.nome}" cadastrada com sucesso`,
      })

      return reply.status(201).send({ id: novaCategoria.id })
    },
  )
}

export { cadastrarCategoria }
