import { count, eq } from 'drizzle-orm'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { db } from '@/database'
import { categoria, parcela, parcelamento } from '@/database/schema'
import { authenticate } from '@/http/middlewares/auth'

const parcelamentoResponseSchema = z.object({
  id: z.uuid(),
  categoriaId: z.uuid(),
  categoriaNome: z.string(),
  categoriaCor: z.string(),
  descricao: z.string(),
  valorTotal: z.number(),
  valorEntrada: z.number().nullable(),
  quantidadeParcelas: z.number(),
  parcelasPagas: z.number(),
  dataPrimeiraParcela: z.string(),
})

const listarParcelamentos = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/parcelamentos',
    {
      preHandler: authenticate,
      schema: {
        tags: ['Parcelamentos'],
        summary: 'Listar parcelamentos',
        description:
          'Lista os parcelamentos do usuário autenticado com o progresso de parcelas pagas.',
        response: {
          200: z.array(parcelamentoResponseSchema),
        },
      },
    },
    async (request) => {
      const userId = request.user!.id

      const parcelamentos = await db
        .select({
          id: parcelamento.id,
          categoriaId: parcelamento.categoriaId,
          categoriaNome: categoria.nome,
          categoriaCor: categoria.cor,
          descricao: parcelamento.descricao,
          valorTotal: parcelamento.valorTotal,
          valorEntrada: parcelamento.valorEntrada,
          quantidadeParcelas: parcelamento.quantidadeParcelas,
          dataPrimeiraParcela: parcelamento.dataPrimeiraParcela,
        })
        .from(parcelamento)
        .innerJoin(categoria, eq(categoria.id, parcelamento.categoriaId))
        .where(eq(parcelamento.userId, userId))
        .orderBy(parcelamento.dataPrimeiraParcela)

      const parcelasPagasPorParcelamento = await db
        .select({
          parcelamentoId: parcela.parcelamentoId,
          total: count(),
        })
        .from(parcela)
        .where(eq(parcela.status, 'PAGA'))
        .groupBy(parcela.parcelamentoId)

      const parcelasPagasMap = new Map(
        parcelasPagasPorParcelamento.map((item) => [item.parcelamentoId, item.total]),
      )

      return parcelamentos.map((item) => ({
        ...item,
        valorTotal: Number(item.valorTotal),
        valorEntrada: item.valorEntrada ? Number(item.valorEntrada) : null,
        parcelasPagas: parcelasPagasMap.get(item.id) ?? 0,
      }))
    },
  )
}

export { listarParcelamentos }
