export const CHAT_ROLE = {
  USER: 'USER',
  ASSISTANT: 'ASSISTANT',
} as const

export type ChatRole = (typeof CHAT_ROLE)[keyof typeof CHAT_ROLE]

export interface ChatMensagem {
  id: string
  role: ChatRole
  conteudo: string
  createdAt: string
}
