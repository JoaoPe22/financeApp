import { relations } from 'drizzle-orm'
import { index, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { v7 as uuidv7 } from 'uuid'

import { user } from './auth-schema'

// Cadastro de onde o cartão de crédito está vinculado: banco + agência (e conta,
// se o usuário quiser detalhar). É o que a despesa paga no crédito referencia.
const contaBancaria = pgTable(
  'conta_bancaria',
  {
    id: uuid()
      .primaryKey()
      .$defaultFn(() => uuidv7()),
    userId: text()
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    banco: text().notNull(),
    agencia: text(),
    conta: text(),
    // Nome curto do cartão/conta pra facilitar a escolha na hora de lançar
    // a despesa (ex.: "Nubank roxinho", "Inter final 4321")
    apelido: text(),
    createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp({ withTimezone: true })
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index('conta_bancaria_user_idx').on(table.userId)],
)

const contaBancariaRelations = relations(contaBancaria, ({ one }) => ({
  user: one(user, {
    fields: [contaBancaria.userId],
    references: [user.id],
  }),
}))

export { contaBancaria, contaBancariaRelations }
