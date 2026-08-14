import { eq } from 'drizzle-orm'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { db } from '@/database'
import { log, perfil } from '@/database/schema'
import { authenticate } from '@/http/middlewares/auth'

import { BadRequestError } from '../_errors/bad-request-error'
import { perfilBodySchema } from './schema'

const atualizarPerfil = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().patch(
    '/perfil',
    {
      preHandler: authenticate,
      schema: {
        tags: ['Perfil'],
        summary: 'Atualizar perfil',
        description:
          'Endpoint para atualizar o perfil já cadastrado do usuário.',
        body: perfilBodySchema,
        response: {
          200: z.void(),
        },
      },
    },
    async (request, reply) => {
      const { body } = request
      const userId = request.user!.id

      const [perfilExistente] = await db
        .select({ id: perfil.id })
        .from(perfil)
        .where(eq(perfil.userId, userId))
        .limit(1)

      if (!perfilExistente) {
        throw new BadRequestError('Usuário ainda não possui perfil cadastrado')
      }

      await db
        .update(perfil)
        .set({
          dataNascimento: body.dataNascimento,
          cep: body.cep,
          estado: body.estado,
          cidade: body.cidade,
          bairro: body.bairro,
          logradouro: body.logradouro,
          numero: body.numero,
          complemento: body.complemento ?? null,
          tipoRenda: body.tipoRenda,
          salarioFixo: body.salarioFixo?.toString() ?? null,
        })
        .where(eq(perfil.userId, userId))

      await db.insert(log).values({
        usuarioId: userId,
        entidade: 'perfil',
        entidadeId: perfilExistente.id,
        acao: 'ATUALIZAR',
        descricao: 'Perfil atualizado com sucesso',
      })

      return reply.status(200).send()
    },
  )
}

export { atualizarPerfil }
