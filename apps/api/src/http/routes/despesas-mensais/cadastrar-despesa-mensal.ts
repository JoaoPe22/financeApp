import { and, eq } from 'drizzle-orm'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { db } from '@/database'
import {
  categoria,
  despesaMensal,
  log,
  planejamentoMensal,
} from '@/database/schema'
import { authenticate } from '@/http/middlewares/auth'

import { BadRequestError } from '../_errors/bad-request-error'
import { resolverContaBancaria } from './resolver-conta-bancaria'
import { despesaMensalBodySchema } from './schema'

const cadastrarDespesaMensalBodySchema = despesaMensalBodySchema.extend({
  planejamentoMensalId: z.uuid(),
})

const cadastrarDespesaMensal = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/despesas-mensais',
    {
      preHandler: authenticate,
      schema: {
        tags: ['Despesas Mensais'],
        summary: 'Cadastrar despesa mensal avulsa',
        description:
          'Endpoint para adicionar uma despesa avulsa a um mês já aberto.',
        body: cadastrarDespesaMensalBodySchema,
        response: {
          201: z.object({ id: z.uuid() }),
        },
      },
    },
    async (request, reply) => {
      const { body } = request
      const userId = request.user!.id

      const [planejamentoExistente] = await db
        .select({ id: planejamentoMensal.id })
        .from(planejamentoMensal)
        .where(
          and(
            eq(planejamentoMensal.id, body.planejamentoMensalId),
            eq(planejamentoMensal.userId, userId),
          ),
        )
        .limit(1)

      if (!planejamentoExistente) {
        throw new BadRequestError('Planejamento mensal não encontrado')
      }

      const [categoriaExistente] = await db
        .select({ id: categoria.id })
        .from(categoria)
        .where(
          and(
            eq(categoria.id, body.categoriaId),
            eq(categoria.userId, userId),
            eq(categoria.tipo, 'DESPESA'),
          ),
        )
        .limit(1)

      if (!categoriaExistente) {
        throw new BadRequestError('Categoria de despesa inválida')
      }

      const contaBancariaId = await resolverContaBancaria(
        userId,
        body.formaPagamento,
        body.contaBancariaId,
      )

      const [novaDespesaMensal] = await db
        .insert(despesaMensal)
        .values({
          planejamentoMensalId: body.planejamentoMensalId,
          categoriaId: body.categoriaId,
          despesaFixaId: null,
          descricao: body.descricao,
          valor: body.valor.toString(),
          dataVencimento: body.dataVencimento,
          formaPagamento: body.formaPagamento ?? null,
          contaBancariaId,
          observacao: body.observacao ?? null,
        })
        .returning({ id: despesaMensal.id })

      await db.insert(log).values({
        usuarioId: userId,
        entidade: 'despesa_mensal',
        entidadeId: novaDespesaMensal.id,
        acao: 'CADASTRAR',
        descricao: `Despesa mensal avulsa "${body.descricao}" cadastrada com sucesso`,
      })

      return reply.status(201).send({ id: novaDespesaMensal.id })
    },
  )
}

export { cadastrarDespesaMensal }
