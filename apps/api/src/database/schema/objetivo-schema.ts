import { relations, sql } from 'drizzle-orm'
import {
  check,
  date,
  index,
  numeric,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core'
import { v7 as uuidv7 } from 'uuid'

import { user } from './auth-schema'
import { StatusObjetivo } from './enums'

const objetivo = pgTable(
  'objetivo',
  {
    id: uuid()
      .primaryKey()
      .$defaultFn(() => uuidv7()),
    userId: text()
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    titulo: text().notNull(),
    descricao: text(),
    valorMeta: numeric({ precision: 10, scale: 2 }).notNull(),
    valorAtual: numeric({ precision: 10, scale: 2 }).notNull().default('0'),
    // Único campo de prazo (o antigo `dataLimite` era um timestamp redundante com este)
    prazo: date().notNull(),
    status: text().$type<StatusObjetivo>().notNull().default('ATIVO'),
    createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp({ withTimezone: true })
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index('objetivo_user_idx').on(table.userId),
    check(
      'objetivo_valores_check',
      sql`${table.valorMeta} >= 0 AND ${table.valorAtual} >= 0`,
    ),
  ],
)

const objetivoRelations = relations(objetivo, ({ one }) => ({
  user: one(user, {
    fields: [objetivo.userId],
    references: [user.id],
  }),
}))

export { objetivo, objetivoRelations }
