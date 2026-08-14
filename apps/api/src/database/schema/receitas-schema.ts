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
import { categoria } from './categorias-schema'
import { planejamentoMensal } from './planejamentos-mensais-schema'

const receita = pgTable(
  'receita',
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
    // Vínculo direto com o mês de planejamento (mesmo padrão de despesa_mensal e
    // parcela), pra não depender só da dataRecebimento na hora de somar o mês
    planejamentoMensalId: uuid()
      .notNull()
      .references(() => planejamentoMensal.id, { onDelete: 'cascade' }),
    descricao: text().notNull(),
    // Nem toda receita tem um "valor bruto" claro (autônomos costumam só saber o líquido)
    valorBruto: numeric({ precision: 10, scale: 2 }),
    valorLiquido: numeric({ precision: 10, scale: 2 }).notNull(),
    dataRecebimento: date().notNull(),
    observacao: text(),
    createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp({ withTimezone: true })
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index('receita_user_idx').on(table.userId),
    index('receita_planejamento_mensal_idx').on(table.planejamentoMensalId),
    check(
      'receita_valores_check',
      sql`${table.valorLiquido} >= 0 AND (${table.valorBruto} IS NULL OR ${table.valorBruto} >= 0)`,
    ),
  ],
)

const receitaRelations = relations(receita, ({ one }) => ({
  user: one(user, {
    fields: [receita.userId],
    references: [user.id],
  }),
  categoria: one(categoria, {
    fields: [receita.categoriaId],
    references: [categoria.id],
  }),
  planejamentoMensal: one(planejamentoMensal, {
    fields: [receita.planejamentoMensalId],
    references: [planejamentoMensal.id],
  }),
}))

export { receita, receitaRelations }
