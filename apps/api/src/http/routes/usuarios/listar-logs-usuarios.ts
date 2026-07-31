// Rota para listar logs de usuarios
// Responsabilidades:
// - Filtrar e paginar logs da entidade 'usuarios'
// - Retornar resposta tipada
// - Exigir autenticacao

import { and, count, desc, eq } from 'drizzle-orm'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { db } from '@/database'
import { user } from '@/database/schema'
import { log } from '@/database/schema/log-schema'
import { auth } from '@/http/middlewares/auth'

const listarLogsUsuarios = async (app: FastifyInstance) => {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      '/logs/usuarios',
      {
        schema: {
          summary: 'Listar logs de usuários',
          description:
            'Rota para listar os logs de ações realizadas por ou sobre usuários',
          tags: ['logs', 'usuarios'],
          querystring: z.object({
            page: z.coerce.number().min(1).default(1),
            perPage: z.coerce.number().min(1).max(100).default(10),
            usuarioId: z.uuid().optional(),
          }),
          response: {
            200: z.object({
              logs: z.array(
                z.object({
                  id: z.uuid(),
                  descricao: z.string(),
                  usuario: z.string(),
                  createdAt: z.date(),
                }),
              ),
              total: z.number(),
              totalPages: z.number(),
              currentPage: z.number(),
            }),
          },
        },
      },
      async (request, reply) => {
        // Extrai parametros de paginacao e filtro
        const { page, perPage, usuarioId } = request.query

        // Calcula o offset de paginacao
        const offset = (page - 1) * perPage

        // Filtra por entidade 'usuarios' e opcionalmente pelo ID do usuario
        const whereCondition = usuarioId ? and(eq(log.entidade, 'usuarios'), eq(log.entidadeId, usuarioId)) : eq(log.entidade, 'usuarios')

        // Executa a busca paginada e a contagem total
        const [logs, [{ total }]] = await Promise.all([
          db
            .select({
              id: log.id,
              descricao: log.descricao,
              createdAt: log.createdAt,
              userName: user.name,
            })
            .from(log)
            .leftJoin(user, eq(log.usuarioId, user.id))
            .where(whereCondition)
            .orderBy(desc(log.createdAt))
            .limit(perPage)
            .offset(offset),
          db.select({ total: count() }).from(log).where(whereCondition),
        ])

        // Calcula o numero total de paginas
        const totalPages = Math.ceil(total / perPage)

        // Retorna logs com metadados de paginacao
        return reply.status(200).send({
          logs: logs.map((logItem) => ({
            id: logItem.id,
            descricao: logItem.descricao,
            usuario: logItem.userName || 'Sistema',
            createdAt: logItem.createdAt,
          })),
          total,
          totalPages,
          currentPage: page,
        })
      },
    )
}

export { listarLogsUsuarios }
