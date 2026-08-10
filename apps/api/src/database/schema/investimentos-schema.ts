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

const investimento = pgTable(
  'investimento',
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
    instituicaoFinanceira: text().notNull(),
    descricao: text().notNull(),
    valorAplicado: numeric({ precision: 10, scale: 2 }).notNull(),
    // Mais casas decimais que os demais valores monetários: indexadores como
    // "% do CDI" costumam precisar de mais precisão (ex.: 105.3456)
    rentabilidade: numeric({ precision: 8, scale: 4 }).notNull(),
    indexador: text().notNull(),
    liquidez: text().notNull(),
    dataAplicacao: date().notNull(),
    dataVencimento: date().notNull(),
    createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp({ withTimezone: true })
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index('investimento_user_idx').on(table.userId),
    check(
      'investimento_valor_aplicado_check',
      sql`${table.valorAplicado} >= 0`,
    ),
  ],
)

const investimentoRelations = relations(investimento, ({ one }) => ({
  user: one(user, {
    fields: [investimento.userId],
    references: [user.id],
  }),
  categoria: one(categoria, {
    fields: [investimento.categoriaId],
    references: [categoria.id],
  }),
}))

export { investimento, investimentoRelations }
