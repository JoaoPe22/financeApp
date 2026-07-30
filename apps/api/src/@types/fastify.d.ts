import 'fastify'

import type { Role } from '@/@types/enums'

declare module 'fastify' {
  interface FastifyRequest {
    getCurrentUserId(): Promise<string>
    getCurrentUserRole(): Promise<Role>
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
