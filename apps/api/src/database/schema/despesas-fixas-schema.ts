import { relations, sql } from 'drizzle-orm'
import {
  boolean,
  check,
  index,
  numeric,
  pgTable,
  smallint,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core'
import { v7 as uuidv7 } from 'uuid'

import { user } from './auth-schema'
import { categoria } from './categorias-schema'

// Modelo de conta fixa reutilizado todo mês (o mês/ano concreto só existe em
// despesa_mensal); por isso o vencimento aqui é só o dia do mês, não uma data cheia
const despesaFixa = pgTable(
  'despesa_fixa',
  {
    id: uuid()
      .primaryKey()
      .$defaultFn(() => uuidv7()),
    userId: text()
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    categoriaId: uuid()
      .notNull()
      .references(() => categoria.id, { onDelete: 'cascade' }),
    descricao: text().notNull(),
    valor: numeric({ precision: 10, scale: 2 }).notNull(),
    diaVencimento: smallint().notNull(),
    obrigatoria: boolean().notNull().default(true),
    ativa: boolean().notNull().default(true),
    createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp({ withTimezone: true })
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index('despesa_fixa_user_idx').on(table.userId),
    check('despesa_fixa_valor_check', sql`${table.valor} >= 0`),
    check(
      'despesa_fixa_dia_vencimento_check',
      sql`${table.diaVencimento} BETWEEN 1 AND 31`,
    ),
  ],
)

const despesaFixaRelations = relations(despesaFixa, ({ one }) => ({
  user: one(user, {
    fields: [despesaFixa.userId],
    references: [user.id],
  }),
  categoria: one(categoria, {
    fields: [despesaFixa.categoriaId],
    references: [categoria.id],
  }),
}))

export { despesaFixa, despesaFixaRelations }
