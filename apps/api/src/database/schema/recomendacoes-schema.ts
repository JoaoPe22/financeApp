import { relations } from 'drizzle-orm'
import { boolean, index, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { v7 as uuidv7 } from 'uuid'

import { user } from './auth-schema'

const recomendacao = pgTable('recomendacao', {
  id: uuid()
    .primaryKey()
    .$defaultFn(() => uuidv7()),
  userId: text()
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  tipo: text().notNull(),
  titulo: text().notNull(),
  descricao: text().notNull(),
  lida: boolean().default(false).notNull(),
  createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp({ withTimezone: true })
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
}, (table) => [
  index('recomendacao_user_idx').on(table.userId),
])

const recomendacaoRelations = relations(recomendacao, ({ one }) => ({
  user: one(user, {
    fields: [recomendacao.userId],
    references: [user.id],
  }),
}))

export { recomendacao, recomendacaoRelations }
