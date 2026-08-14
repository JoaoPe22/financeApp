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

import { categoria } from './categorias-schema'
import { despesaFixa } from './despesas-fixas-schema'
import { StatusParcela } from './enums'
import { planejamentoMensal } from './planejamentos-mensais-schema'

const despesaMensal = pgTable(
  'despesa_mensal',
  {
    id: uuid()
      .primaryKey()
      .$defaultFn(() => uuidv7()),
    planejamentoMensalId: uuid()
      .notNull()
      .references(() => planejamentoMensal.id, { onDelete: 'cascade' }),
    categoriaId: uuid()
      .notNull()
      .references(() => categoria.id, { onDelete: 'cascade' }),
    // Se veio de uma conta fixa "puxada" naquele mês (nulo quando o usuário
    // adiciona uma despesa avulsa, ex.: salgado, presente)
    despesaFixaId: uuid().references(() => despesaFixa.id, {
      onDelete: 'set null',
    }),
    descricao: text().notNull(),
    valor: numeric({ precision: 10, scale: 2 }).notNull(),
    // Data de vencimento daquele mês específico (dia salvo em despesa_fixa +
    // mês/ano do planejamento, ou informado manualmente para despesas avulsas)
    dataVencimento: date().notNull(),
    status: text().$type<StatusParcela>().notNull().default('PENDENTE'),
    dataPagamento: date(),
    observacao: text(),
    createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp({ withTimezone: true })
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index('despesa_mensal_planejamento_idx').on(table.planejamentoMensalId),
    check('despesa_mensal_valor_check', sql`${table.valor} >= 0`),
  ],
)

const despesaMensalRelations = relations(despesaMensal, ({ one }) => ({
  planejamentoMensal: one(planejamentoMensal, {
    fields: [despesaMensal.planejamentoMensalId],
    references: [planejamentoMensal.id],
  }),
  categoria: one(categoria, {
    fields: [despesaMensal.categoriaId],
    references: [categoria.id],
  }),
  despesaFixa: one(despesaFixa, {
    fields: [despesaMensal.despesaFixaId],
    references: [despesaFixa.id],
  }),
}))

export { despesaMensal, despesaMensalRelations }
