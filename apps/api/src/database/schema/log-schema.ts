import { relations } from 'drizzle-orm'
import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { v7 as uuidv7 } from 'uuid'

import { user } from './auth-schema'

const log = pgTable('log', {
  id: uuid()
    .primaryKey()
    .$defaultFn(() => uuidv7()),
  usuarioId: text().references(() => user.id),
  entidade: text().notNull(),
  entidadeId: text().notNull(),
  descricao: text().notNull(),
  createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp({ withTimezone: true })
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
})

const logRelations = relations(log, ({ one }) => ({
  usuario: one(user, {
    fields: [log.usuarioId],
    references: [user.id],
  }),
}))

export { log, logRelations }
