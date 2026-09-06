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

import { reserva } from './reservas-schema'

// Cada linha é uma "foto" da reserva num momento: o valor que ela passou a ter
// naquela data, mais a observação do que foi feito (aporte, resgate, etc).
const reservaHistorico = pgTable(
  'reserva_historico',
  {
    id: uuid()
      .primaryKey()
      .$defaultFn(() => uuidv7()),
    reservaId: uuid()
      .notNull()
      .references(() => reserva.id, { onDelete: 'cascade' }),
    valor: numeric({ precision: 10, scale: 2 }).notNull(),
    // Quanto entrou (positivo) ou saiu (negativo) em relação ao registro anterior
    variacao: numeric({ precision: 10, scale: 2 }).notNull(),
    observacao: text(),
    data: date().notNull(),
    createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('reserva_historico_reserva_idx').on(table.reservaId),
    check('reserva_historico_valor_check', sql`${table.valor} >= 0`),
  ],
)

const reservaHistoricoRelations = relations(reservaHistorico, ({ one }) => ({
  reserva: one(reserva, {
    fields: [reservaHistorico.reservaId],
    references: [reserva.id],
  }),
}))

export { reservaHistorico, reservaHistoricoRelations }
