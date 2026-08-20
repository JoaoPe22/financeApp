import { relations } from 'drizzle-orm'
import { index, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { v7 as uuidv7 } from 'uuid'

import { user } from './auth-schema'
import type { ChatRole } from './enums'

// Histórico plano por usuário (sem conceito de "conversas" separadas).
// Mensagem é imutável depois de criada — por isso não tem updatedAt,
// diferente do restante do schema.
const chatMensagem = pgTable(
  'chat_mensagem',
  {
    id: uuid()
      .primaryKey()
      .$defaultFn(() => uuidv7()),
    userId: text()
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    role: text().$type<ChatRole>().notNull(),
    conteudo: text().notNull(),
    createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index('chat_mensagem_user_idx').on(table.userId)],
)

const chatMensagemRelations = relations(chatMensagem, ({ one }) => ({
  user: one(user, {
    fields: [chatMensagem.userId],
    references: [user.id],
  }),
}))

export { chatMensagem, chatMensagemRelations }
