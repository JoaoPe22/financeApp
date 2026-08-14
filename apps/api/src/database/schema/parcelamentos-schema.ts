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
  uuid,
} from 'drizzle-orm/pg-core'
import { v7 as uuidv7 } from 'uuid'

import { user } from './auth-schema'
import { categoria } from './categorias-schema'

const parcelamento = pgTable(
  'parcelamento',
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
    valorTotal: numeric({ precision: 10, scale: 2 }).notNull(),
    valorEntrada: numeric({ precision: 10, scale: 2 }),
    quantidadeParcelas: integer().notNull(),
    dataPrimeiraParcela: date().notNull(),
    createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp({ withTimezone: true })
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index('parcelamento_user_idx').on(table.userId),
    check(
      'parcelamento_quantidade_parcelas_check',
      sql`${table.quantidadeParcelas} > 0`,
    ),
    check(
      'parcelamento_valores_check',
      sql`${table.valorTotal} >= 0 AND (${table.valorEntrada} IS NULL OR ${table.valorEntrada} >= 0)`,
    ),
  ],
)

const parcelamentoRelations = relations(parcelamento, ({ one }) => ({
  user: one(user, {
    fields: [parcelamento.userId],
    references: [user.id],
  }),
  categoria: one(categoria, {
    fields: [parcelamento.categoriaId],
    references: [categoria.id],
  }),
}))

export { parcelamento, parcelamentoRelations }
