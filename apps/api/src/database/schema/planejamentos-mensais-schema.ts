import { relations, sql } from 'drizzle-orm'
import {
  check,
  numeric,
  pgTable,
  smallint,
  text,
  timestamp,
  unique,
  uuid,
} from 'drizzle-orm/pg-core'
import { v7 as uuidv7 } from 'uuid'

import { user } from './auth-schema'
import { StatusPlanejamento } from './enums'

const planejamentoMensal = pgTable(
  'planejamento_mensal',
  {
    id: uuid()
      .primaryKey()
      .$defaultFn(() => uuidv7()),
    userId: text()
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    mes: smallint().notNull(),
    ano: smallint().notNull(),
    salarioPrevisto: numeric({ precision: 10, scale: 2 }),
    salarioRecebido: numeric({ precision: 10, scale: 2 }),
    status: text().$type<StatusPlanejamento>().notNull().default('ABERTO'),
    createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp({ withTimezone: true })
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    // Só um planejamento por usuário/mês/ano
    unique('planejamento_mensal_user_mes_ano_unique').on(
      table.userId,
      table.mes,
      table.ano,
    ),
    check('planejamento_mensal_mes_check', sql`${table.mes} BETWEEN 1 AND 12`),
  ],
)

const planejamentoMensalRelations = relations(
  planejamentoMensal,
  ({ one }) => ({
    user: one(user, {
      fields: [planejamentoMensal.userId],
      references: [user.id],
    }),
  }),
)

export { planejamentoMensal, planejamentoMensalRelations }
