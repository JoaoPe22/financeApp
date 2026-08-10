import { relations } from 'drizzle-orm'
import { pgTable, text, timestamp, unique, uuid } from 'drizzle-orm/pg-core'
import { v7 as uuidv7 } from 'uuid'

import { user } from './auth-schema'
import { TipoCategoria } from './enums'

const categoria = pgTable('categoria', {
  id: uuid().primaryKey().$defaultFn(() => uuidv7()),
  userId: text()
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  nome: text().notNull(),
  tipo: text().$type<TipoCategoria>().notNull(),
  cor: text().notNull(),
  icone: text().notNull(),
  createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp({ withTimezone: true })
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
}, (table) => [
  // Evita duas categorias com o mesmo nome e tipo para o mesmo usuário
  unique('categoria_user_nome_tipo_unique').on(table.userId, table.nome, table.tipo),
])

const categoriaRelations = relations(categoria, ({ one }) => ({
  user: one(user, {
    fields: [categoria.userId],
    references: [user.id],
  }),
}))

export { categoria, categoriaRelations }
