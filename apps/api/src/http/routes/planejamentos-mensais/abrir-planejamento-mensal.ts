import { and, eq } from 'drizzle-orm'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { db } from '@/database'
import {
  despesaFixa,
  despesaMensal,
  log,
  perfil,
  planejamentoMensal,
} from '@/database/schema'
import { authenticate } from '@/http/middlewares/auth'

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
          'Cria (se ainda não existir) o planejamento do mês e puxa as despesas fixas ativas como despesas do mês. Idempotente: se o planejamento já existir, apenas retorna o existente sem puxar novamente.',
        body: abrirPlanejamentoMensalBodySchema,
        response: {
          201: z.object({ id: z.uuid() }),
        },
      },
    },
    async (request, reply) => {
      const { mes, ano } = request.body
      const userId = request.user!.id

      const [planejamentoExistente] = await db
        .select({ id: planejamentoMensal.id })
        .from(planejamentoMensal)
        .where(
          and(
            eq(planejamentoMensal.userId, userId),
            eq(planejamentoMensal.mes, mes),
            eq(planejamentoMensal.ano, ano),
          ),
        )
        .limit(1)

      if (planejamentoExistente) {
        return reply.status(201).send({ id: planejamentoExistente.id })
      }

      const [perfilUsuario] = await db
        .select({ salarioFixo: perfil.salarioFixo })
        .from(perfil)
        .where(eq(perfil.userId, userId))
        .limit(1)

      const novoPlanejamento = await db.transaction(async (tx) => {
        const [planejamento] = await tx
          .insert(planejamentoMensal)
          .values({
            userId,
            mes,
            ano,
            salarioPrevisto: perfilUsuario?.salarioFixo ?? null,
          })
          .returning({ id: planejamentoMensal.id })

        const despesasFixasAtivas = await tx
          .select()
          .from(despesaFixa)
          .where(
            and(eq(despesaFixa.userId, userId), eq(despesaFixa.ativa, true)),
          )

        if (despesasFixasAtivas.length > 0) {
          const ultimoDia = ultimoDiaDoMes(ano, mes)

          await tx.insert(despesaMensal).values(
            despesasFixasAtivas.map((despesa) => {
              const dia = Math.min(despesa.diaVencimento, ultimoDia)
              const dataVencimento = `${ano}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`

              return {
                planejamentoMensalId: planejamento.id,
                categoriaId: despesa.categoriaId,
                despesaFixaId: despesa.id,
                descricao: despesa.descricao,
                valor: despesa.valor,
                dataVencimento,
              }
            }),
          )
        }

        return planejamento
      })

      await db.insert(log).values({
        usuarioId: userId,
        entidade: 'planejamento_mensal',
        entidadeId: novoPlanejamento.id,
        acao: 'CADASTRAR',
        descricao: `Planejamento mensal ${mes}/${ano} aberto com sucesso`,
      })

      return reply.status(201).send({ id: novoPlanejamento.id })
    },
  )
}

export { abrirPlanejamentoMensal }
