import { relations, sql } from 'drizzle-orm'
import {
  check,
  date,
  index,
  integer,
  numeric,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from 'drizzle-orm/pg-core'
import { v7 as uuidv7 } from 'uuid'

import { StatusParcela } from './enums'
import { parcelamento } from './parcelamentos-schema'
import { planejamentoMensal } from './planejamentos-mensais-schema'

const parcela = pgTable('parcela', {
  id: uuid()
    .primaryKey()
    .$defaultFn(() => uuidv7()),
  parcelamentoId: uuid()
    .notNull()
    .references(() => parcelamento.id, { onDelete: 'cascade' }),
  // Em qual mês de planejamento essa parcela cai, pra entrar na avaliação do mês
  planejamentoMensalId: uuid()
    .notNull()
    .references(() => planejamentoMensal.id, { onDelete: 'cascade' }),
  numero: integer().notNull(),
  valor: numeric({ precision: 10, scale: 2 }).notNull(),
  status: text().$type<StatusParcela>().notNull().default('PENDENTE'),
  dataVencimento: date().notNull(),
  dataPagamento: date(),
  createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp({ withTimezone: true })
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
}, (table) => [
  index('parcela_planejamento_mensal_idx').on(table.planejamentoMensalId),
  unique('parcela_parcelamento_numero_unique').on(table.parcelamentoId, table.numero),
  check('parcela_numero_check', sql`${table.numero} > 0`),
  check('parcela_valor_check', sql`${table.valor} >= 0`),
])

const parcelaRelations = relations(parcela, ({ one }) => ({
  parcelamento: one(parcelamento, {
    fields: [parcela.parcelamentoId],
    references: [parcelamento.id],
  }),
  planejamentoMensal: one(planejamentoMensal, {
    fields: [parcela.planejamentoMensalId],
    references: [planejamentoMensal.id],
  }),
}))

export { parcela, parcelaRelations }
