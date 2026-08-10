import type { auth } from '@/auth'

type BetterAuthSession = typeof auth.$Infer.Session

declare module 'fastify' {
  interface FastifyRequest {
    user?: BetterAuthSession['user']
    session?: BetterAuthSession['session']
  }
}
