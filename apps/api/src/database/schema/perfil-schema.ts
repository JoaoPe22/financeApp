import { relations, sql } from 'drizzle-orm'
import {
  check,
  date,
  numeric,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core'
import { v7 as uuidv7 } from 'uuid'

import { user } from './auth-schema'
import { TipoRenda } from './enums'

const perfil = pgTable(
  'perfil',
  {
    id: uuid()
      .primaryKey()
      .$defaultFn(() => uuidv7()),
    userId: text()
      .notNull()
      .unique()
      .references(() => user.id, { onDelete: 'cascade' }),
    dataNascimento: date().notNull(),
    cep: text().notNull(),
    estado: text().notNull(),
    cidade: text().notNull(),
    bairro: text().notNull(),
    logradouro: text().notNull(),
    numero: text().notNull(),
    complemento: text(),
    tipoRenda: text().$type<TipoRenda>().notNull(),
    salarioFixo: numeric({ precision: 10, scale: 2 }),
    createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp({ withTimezone: true })
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    check(
      'perfil_salario_fixo_check',
      sql`${table.salarioFixo} IS NULL OR ${table.salarioFixo} >= 0`,
    ),
  ],
)

const perfilRelations = relations(perfil, ({ one }) => ({
  user: one(user, {
    fields: [perfil.userId],
    references: [user.id],
  }),
}))

export { perfil, perfilRelations }
