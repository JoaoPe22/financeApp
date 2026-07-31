// Aumenta a tipagem do FastifyRequest com os campos que o middleware de auth
// (src/http/middlewares/auth.ts) injeta em toda rota que registrar esse middleware.
import 'fastify'

import type { Role } from '@/@types/enums'

declare module 'fastify' {
  interface FastifyRequest {
    // Lê a sessão do better-auth e retorna o id do usuário logado (lança se não houver sessão)
    getCurrentUserId(): Promise<string>
    // Atalho para a role do usuário já carregado em `currentUser`
    getCurrentUserRole(): Promise<Role>
    // Dados do usuário logado, carregados uma vez por requisição pelo middleware de auth
    currentUser?: {
      id: string
      role: Role
      banned: boolean | null
      banReason: string | null
      banExpires: Date | null
      email: string
      name: string
    }
  }
}
