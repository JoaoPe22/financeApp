import { and, eq } from 'drizzle-orm'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { db } from '@/database'
import { despesaFixa, despesaMensal, log } from '@/database/schema'
import { authenticate } from '@/http/middlewares/auth'
import { encontrarOuCriarPlanejamentoMensal } from '@/lib/planejamento-mensal'

import { abrirPlanejamentoMensalBodySchema } from './schema'

const ultimoDiaDoMes = (ano: number, mes: number) =>
  new Date(ano, mes, 0).getDate()

const abrirPlanejamentoMensal = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/planejamentos-mensais/abrir',
    {
      preHandler: authenticate,
      schema: {
        tags: ['Planejamentos Mensais'],
        summary: 'Abrir planejamento mensal',
        description:
          'Cria (se ainda não existir) o planejamento do mês e puxa as despesas fixas ativas ainda não puxadas como despesas do mês. Idempotente: pode ser chamado de novo (ex.: após cadastrar uma nova despesa fixa) sem duplicar as já puxadas.',
        body: abrirPlanejamentoMensalBodySchema,
        response: {
          201: z.object({ id: z.uuid() }),
        },
      },
    },
    async (request, reply) => {
      const { mes, ano } = request.body
      const userId = request.user!.id

      const planejamentoId = await db.transaction(async (tx) => {
        const planejamentoId = await encontrarOuCriarPlanejamentoMensal(
          tx,
          userId,
          mes,
          ano,
        )

        const despesasFixasAtivas = await tx
          .select()
          .from(despesaFixa)
          .where(
            and(eq(despesaFixa.userId, userId), eq(despesaFixa.ativa, true)),
          )

        const despesasFixasJaPuxadas = await tx
          .select({ despesaFixaId: despesaMensal.despesaFixaId })
          .from(despesaMensal)
          .where(eq(despesaMensal.planejamentoMensalId, planejamentoId))

        const idsJaPuxados = new Set(
          despesasFixasJaPuxadas.map((d) => d.despesaFixaId),
        )
        const despesasFixasParaPuxar = despesasFixasAtivas.filter(
          (despesa) => !idsJaPuxados.has(despesa.id),
        )

        if (despesasFixasParaPuxar.length > 0) {
          const ultimoDia = ultimoDiaDoMes(ano, mes)

          await tx.insert(despesaMensal).values(
            despesasFixasParaPuxar.map((despesa) => {
              const dia = Math.min(despesa.diaVencimento, ultimoDia)
              const dataVencimento = `${ano}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`

              return {
                planejamentoMensalId: planejamentoId,
                categoriaId: despesa.categoriaId,
                despesaFixaId: despesa.id,
                descricao: despesa.descricao,
                valor: despesa.valor,
                dataVencimento,
              }
            }),
          )
        }

        return planejamentoId
      })

      await db.insert(log).values({
        usuarioId: userId,
        entidade: 'planejamento_mensal',
        entidadeId: planejamentoId,
        acao: 'CADASTRAR',
        descricao: `Planejamento mensal ${mes}/${ano} aberto/atualizado com sucesso`,
      })

      return reply.status(201).send({ id: planejamentoId })
    },
  )
}

export { abrirPlanejamentoMensal }
