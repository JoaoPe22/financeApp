import { relations } from 'drizzle-orm'
import { index, pgTable, text, timestamp } from 'drizzle-orm/pg-core'

import { user } from './auth-schema'

export const logsUsuarios = pgTable(
  'logs_usuarios',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    acao: text('acao').notNull(),
    usuarioAfetadoId: text('usuario_afetado_id'),
    usuarioAfetadoEmail: text('usuario_afetado_email'),
    usuarioExecutorId: text('usuario_executor_id'),
    usuarioExecutorEmail: text('usuario_executor_email'),
    detalhes: text('detalhes'),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index('logs_usuarios_usuarioAfetado_idx').on(table.usuarioAfetadoId),
    index('logs_usuarios_usuarioExecutor_idx').on(table.usuarioExecutorId),
    index('logs_usuarios_createdAt_idx').on(table.createdAt),
  ],
)

export const logsUsuariosRelations = relations(logsUsuarios, ({ one }) => ({
  usuarioAfetado: one(user, {
    fields: [logsUsuarios.usuarioAfetadoId],
    references: [user.id],
    relationName: 'logsUsuariosAfetado',
  }),
  usuarioExecutor: one(user, {
    fields: [logsUsuarios.usuarioExecutorId],
    references: [user.id],
    relationName: 'logsUsuariosExecutor',
  }),
}))
