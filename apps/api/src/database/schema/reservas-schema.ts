import { relations, sql } from 'drizzle-orm'
import {
  check,
  index,
  numeric,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core'
import { v7 as uuidv7 } from 'uuid'

import { user } from './auth-schema'
import { planejamentoMensal } from './planejamentos-mensais-schema'

const reserva = pgTable(
  'reserva',
  {
    id: uuid()
      .primaryKey()
      .$defaultFn(() => uuidv7()),
    userId: text()
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    // Opcional: preenchido quando o valor informado é o aporte daquele mês
    // específico (permite acompanhar a evolução mês a mês, não só o total atual)
    planejamentoMensalId: uuid().references(() => planejamentoMensal.id, {
      onDelete: 'set null',
    }),
    instituicao: text().notNull(),
    valor: numeric({ precision: 10, scale: 2 }).notNull(),
    rentabilidade: numeric({ precision: 8, scale: 4 }).notNull(),
    createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp({ withTimezone: true })
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index('reserva_user_idx').on(table.userId),
    check('reserva_valor_check', sql`${table.valor} >= 0`),
  ],
)

const reservaRelations = relations(reserva, ({ one }) => ({
  user: one(user, {
    fields: [reserva.userId],
    references: [user.id],
  }),
  planejamentoMensal: one(planejamentoMensal, {
    fields: [reserva.planejamentoMensalId],
    references: [planejamentoMensal.id],
  }),
}))

export { reserva, reservaRelations }
