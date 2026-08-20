import dayjs from 'dayjs'
import { and, eq } from 'drizzle-orm'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { db } from '@/database'
import { categoria, log, parcela, parcelamento } from '@/database/schema'
import { authenticate } from '@/http/middlewares/auth'
import { encontrarOuCriarPlanejamentoMensal } from '@/lib/planejamento-mensal'

import { BadRequestError } from '../_errors/bad-request-error'
import { dividirEmParcelas } from './dividir-em-parcelas'
import { parcelamentoBodySchema } from './schema'

const cadastrarParcelamento = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/parcelamentos',
    {
      preHandler: authenticate,
      schema: {
        tags: ['Parcelamentos'],
        summary: 'Cadastrar parcelamento',
        description:
          'Cria um parcelamento e gera automaticamente todas as parcelas, uma por mês a partir da data da primeira parcela. Cria o planejamento mensal de cada mês envolvido, se ainda não existir.',
        body: parcelamentoBodySchema,
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
            eq(categoria.id, body.categoriaId),
            eq(categoria.userId, userId),
            eq(categoria.tipo, 'DESPESA'),
          ),
        )
        .limit(1)

      if (!categoriaExistente) {
        throw new BadRequestError('Categoria de despesa inválida')
      }

      const valorFinanciado = body.valorTotal - (body.valorEntrada ?? 0)
      const valoresDasParcelas = dividirEmParcelas(
        valorFinanciado,
        body.quantidadeParcelas,
      )

      const novoParcelamento = await db.transaction(async (tx) => {
        const [parcelamentoCriado] = await tx
          .insert(parcelamento)
          .values({
            userId,
            categoriaId: body.categoriaId,
            descricao: body.descricao,
            valorTotal: body.valorTotal.toString(),
            valorEntrada:
              body.valorEntrada != null ? body.valorEntrada.toString() : null,
            quantidadeParcelas: body.quantidadeParcelas,
            dataPrimeiraParcela: body.dataPrimeiraParcela,
          })
          .returning({ id: parcelamento.id })

        const dataPrimeiraParcela = dayjs(body.dataPrimeiraParcela)

        for (let numero = 1; numero <= body.quantidadeParcelas; numero++) {
          const dataVencimento = dataPrimeiraParcela.add(numero - 1, 'month')
          const planejamentoMensalId = await encontrarOuCriarPlanejamentoMensal(
            tx,
            userId,
            dataVencimento.month() + 1,
            dataVencimento.year(),
          )

          await tx.insert(parcela).values({
            parcelamentoId: parcelamentoCriado.id,
            planejamentoMensalId,
            numero,
            valor: valoresDasParcelas[numero - 1].toString(),
            dataVencimento: dataVencimento.format('YYYY-MM-DD'),
          })
        }

        return parcelamentoCriado
      })

      await db.insert(log).values({
        usuarioId: userId,
        entidade: 'parcelamento',
        entidadeId: novoParcelamento.id,
        acao: 'CADASTRAR',
        descricao: `Parcelamento "${body.descricao}" cadastrado com ${body.quantidadeParcelas} parcelas`,
      })

      return reply.status(201).send({ id: novoParcelamento.id })
    },
  )
}

export { cadastrarParcelamento }
