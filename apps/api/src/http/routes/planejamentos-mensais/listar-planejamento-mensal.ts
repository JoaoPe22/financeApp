import { and, eq } from 'drizzle-orm'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { db } from '@/database'
import {
  categoria,
  despesaMensal,
  parcela,
  parcelamento,
  planejamentoMensal,
  receita,
} from '@/database/schema'
import { authenticate } from '@/http/middlewares/auth'

const planejamentoResponseSchema = z.object({
  id: z.uuid(),
  mes: z.number(),
  ano: z.number(),
  salarioPrevisto: z.number().nullable(),
  salarioRecebido: z.number().nullable(),
  status: z.string(),
})

const despesaMensalResponseSchema = z.object({
  id: z.uuid(),
  categoriaId: z.uuid(),
  categoriaNome: z.string(),
  categoriaCor: z.string(),
  despesaFixaId: z.uuid().nullable(),
  descricao: z.string(),
  valor: z.number(),
  dataVencimento: z.string(),
  status: z.string(),
  dataPagamento: z.string().nullable(),
  observacao: z.string().nullable(),
})

const receitaResponseSchema = z.object({
  id: z.uuid(),
  categoriaId: z.uuid(),
  categoriaNome: z.string(),
  categoriaCor: z.string(),
  descricao: z.string(),
  valorBruto: z.number().nullable(),
  valorLiquido: z.number(),
  dataRecebimento: z.string(),
  observacao: z.string().nullable(),
})

const parcelaResponseSchema = z.object({
  id: z.uuid(),
  parcelamentoId: z.uuid(),
  categoriaId: z.uuid(),
  categoriaNome: z.string(),
  categoriaCor: z.string(),
  descricao: z.string(),
  numero: z.number(),
  quantidadeParcelas: z.number(),
  valor: z.number(),
  dataVencimento: z.string(),
  status: z.string(),
  dataPagamento: z.string().nullable(),
})

const listarPlanejamentoMensal = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/planejamentos-mensais/:mes/:ano',
    {
      preHandler: authenticate,
      schema: {
        tags: ['Planejamentos Mensais'],
        summary: 'Buscar planejamento mensal',
        description:
          'Retorna o planejamento de um mês/ano e suas despesas, ou planejamento null se o mês ainda não foi aberto.',
        params: z.object({
          mes: z.coerce.number().int().min(1).max(12),
          ano: z.coerce.number().int().min(2000).max(2100),
        }),
        response: {
          200: z.object({
            planejamento: planejamentoResponseSchema.nullable(),
            despesas: z.array(despesaMensalResponseSchema),
            receitas: z.array(receitaResponseSchema),
            parcelas: z.array(parcelaResponseSchema),
          }),
        },
      },
    },
    async (request) => {
      const { mes, ano } = request.params
      const userId = request.user!.id

      const [planejamento] = await db
        .select()
        .from(planejamentoMensal)
        .where(
          and(
            eq(planejamentoMensal.userId, userId),
            eq(planejamentoMensal.mes, mes),
            eq(planejamentoMensal.ano, ano),
          ),
        )
        .limit(1)

      if (!planejamento) {
        return { planejamento: null, despesas: [], receitas: [], parcelas: [] }
      }

      const despesas = await db
        .select({
          id: despesaMensal.id,
          categoriaId: despesaMensal.categoriaId,
          categoriaNome: categoria.nome,
          categoriaCor: categoria.cor,
          despesaFixaId: despesaMensal.despesaFixaId,
          descricao: despesaMensal.descricao,
          valor: despesaMensal.valor,
          dataVencimento: despesaMensal.dataVencimento,
          status: despesaMensal.status,
          dataPagamento: despesaMensal.dataPagamento,
          observacao: despesaMensal.observacao,
        })
        .from(despesaMensal)
        .innerJoin(categoria, eq(categoria.id, despesaMensal.categoriaId))
        .where(eq(despesaMensal.planejamentoMensalId, planejamento.id))
        .orderBy(despesaMensal.dataVencimento)

      const receitas = await db
        .select({
          id: receita.id,
          categoriaId: receita.categoriaId,
          categoriaNome: categoria.nome,
          categoriaCor: categoria.cor,
          descricao: receita.descricao,
          valorBruto: receita.valorBruto,
          valorLiquido: receita.valorLiquido,
          dataRecebimento: receita.dataRecebimento,
          observacao: receita.observacao,
        })
        .from(receita)
        .innerJoin(categoria, eq(categoria.id, receita.categoriaId))
        .where(eq(receita.planejamentoMensalId, planejamento.id))
        .orderBy(receita.dataRecebimento)

      const parcelas = await db
        .select({
          id: parcela.id,
          parcelamentoId: parcela.parcelamentoId,
          categoriaId: parcelamento.categoriaId,
          categoriaNome: categoria.nome,
          categoriaCor: categoria.cor,
          descricao: parcelamento.descricao,
          numero: parcela.numero,
          quantidadeParcelas: parcelamento.quantidadeParcelas,
          valor: parcela.valor,
          dataVencimento: parcela.dataVencimento,
          status: parcela.status,
          dataPagamento: parcela.dataPagamento,
        })
        .from(parcela)
        .innerJoin(parcelamento, eq(parcelamento.id, parcela.parcelamentoId))
        .innerJoin(categoria, eq(categoria.id, parcelamento.categoriaId))
        .where(eq(parcela.planejamentoMensalId, planejamento.id))
        .orderBy(parcela.dataVencimento)

      return {
        planejamento: {
          id: planejamento.id,
          mes: planejamento.mes,
          ano: planejamento.ano,
          salarioPrevisto: planejamento.salarioPrevisto
            ? Number(planejamento.salarioPrevisto)
            : null,
          salarioRecebido: planejamento.salarioRecebido
            ? Number(planejamento.salarioRecebido)
            : null,
          status: planejamento.status,
        },
        despesas: despesas.map((despesa) => ({
          ...despesa,
          valor: Number(despesa.valor),
        })),
        receitas: receitas.map((receitaItem) => ({
          ...receitaItem,
          valorBruto: receitaItem.valorBruto ? Number(receitaItem.valorBruto) : null,
          valorLiquido: Number(receitaItem.valorLiquido),
        })),
        parcelas: parcelas.map((parcelaItem) => ({
          ...parcelaItem,
          valor: Number(parcelaItem.valor),
        })),
      }
    },
  )
}

export { listarPlanejamentoMensal }
