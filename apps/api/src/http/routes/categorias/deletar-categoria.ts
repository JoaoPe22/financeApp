import { and, eq } from 'drizzle-orm'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { db } from '@/database'
import {
  categoria,
  despesaFixa,
  despesaMensal,
  investimento,
  log,
  parcelamento,
  receita,
} from '@/database/schema'
import { authenticate } from '@/http/middlewares/auth'

import { BadRequestError } from '../_errors/bad-request-error'

// Todas as FKs que apontam para categoria são ON DELETE CASCADE: apagar uma
// categoria em uso apagaria junto os lançamentos do usuário, silenciosamente.
const TABELAS_VINCULADAS = [
  { tabela: despesaFixa, coluna: despesaFixa.categoriaId, rotulo: 'despesa(s) fixa(s)' },
  { tabela: despesaMensal, coluna: despesaMensal.categoriaId, rotulo: 'despesa(s) do mês' },
  { tabela: receita, coluna: receita.categoriaId, rotulo: 'receita(s)' },
  { tabela: parcelamento, coluna: parcelamento.categoriaId, rotulo: 'parcelamento(s)' },
  { tabela: investimento, coluna: investimento.categoriaId, rotulo: 'investimento(s)' },
]

const deletarCategoria = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().delete(
    '/categorias/:id',
    {
      preHandler: authenticate,
      schema: {
        tags: ['Categorias'],
        summary: 'Deletar categoria',
        description:
          'Deleta uma categoria. Bloqueado com 400 se houver qualquer lançamento vinculado, para não apagar dados em cascata.',
        params: z.object({ id: z.uuid() }),
        response: {
          200: z.void(),
        },
      },
    },
    async (request, reply) => {
      const { params } = request
      const userId = request.user!.id

      const [categoriaExistente] = await db
        .select({ id: categoria.id, nome: categoria.nome })
        .from(categoria)
        .where(and(eq(categoria.id, params.id), eq(categoria.userId, userId)))
        .limit(1)

      if (!categoriaExistente) {
        throw new BadRequestError('Categoria não encontrada')
      }

      const vinculos = await Promise.all(
        TABELAS_VINCULADAS.map(async ({ tabela, coluna, rotulo }) => {
          const [registro] = await db
            .select({ id: coluna })
            .from(tabela)
            .where(eq(coluna, params.id))
            .limit(1)

          return registro ? rotulo : null
        }),
      )

      const emUso = vinculos.filter((item): item is string => item !== null)

      if (emUso.length > 0) {
        throw new BadRequestError(
          `A categoria "${categoriaExistente.nome}" está em uso por ${emUso.join(', ')}. Remova ou troque a categoria desses lançamentos antes de deletar.`,
        )
      }

      await db.delete(categoria).where(eq(categoria.id, params.id))

      await db.insert(log).values({
        usuarioId: userId,
        entidade: 'categoria',
        entidadeId: params.id,
        acao: 'DELETAR',
        descricao: `Categoria "${categoriaExistente.nome}" deletada com sucesso`,
      })

      return reply.status(200).send()
    },
  )
}

export { deletarCategoria }
