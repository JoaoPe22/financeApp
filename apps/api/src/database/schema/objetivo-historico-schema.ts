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

import { objetivo } from './objetivo-schema'

// Cada linha é uma "foto" do objetivo num momento: o valor que ele passou a ter
// naquela data, mais a observação do que foi feito (aporte, retirada, etc).
const objetivoHistorico = pgTable(
  'objetivo_historico',
  {
    id: uuid()
      .primaryKey()
      .$defaultFn(() => uuidv7()),
    objetivoId: uuid()
      .notNull()
      .references(() => objetivo.id, { onDelete: 'cascade' }),
    valorAtual: numeric({ precision: 10, scale: 2 }).notNull(),
    // Quanto entrou (positivo) ou saiu (negativo) em relação ao registro anterior
    variacao: numeric({ precision: 10, scale: 2 }).notNull(),
    observacao: text(),
    data: date().notNull(),
    createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('objetivo_historico_objetivo_idx').on(table.objetivoId),
    check('objetivo_historico_valor_check', sql`${table.valorAtual} >= 0`),
  ],
)

const objetivoHistoricoRelations = relations(objetivoHistorico, ({ one }) => ({
  objetivo: one(objetivo, {
    fields: [objetivoHistorico.objetivoId],
    references: [objetivo.id],
  }),
}))

export { objetivoHistorico, objetivoHistoricoRelations }
